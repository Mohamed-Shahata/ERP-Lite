import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../infrastructure/prisma/prisma.service';
import {
  MovementType,
  ReferenceType,
  SalesOrderStatus,
} from '../../generated/prisma/enums';
import { Prisma, SalesOrder } from '../../generated/prisma/client';
import { PaginatedResult } from '../common/interfaces/paginated-result.interface';
import { paginate } from '../common/utils/paginate.util';
import { SalesOrderQueryDto } from './dto/sales-order-query.dto';

const listInclude = {
  customer: { select: { id: true, name: true } },
  _count: { select: { items: true } },
} as const;

const detailInclude = {
  customer: {
    select: { id: true, name: true, email: true, phone: true },
  },
  createdBy: { select: { id: true, name: true, email: true } },
  items: {
    include: {
      product: { select: { id: true, name: true, sku: true } },
    },
  },
} as const;

export type SalesOrderListItem = Prisma.SalesOrderGetPayload<{
  include: typeof listInclude;
}>;

export type SalesOrderDetail = Prisma.SalesOrderGetPayload<{
  include: typeof detailInclude;
}>;

export interface CreateSalesOrderItemData {
  productId: string;
  quantity: number;
  unitPrice: number;
}

export interface CreateSalesOrderData {
  customerId: string;
  createdById: string;
  items: CreateSalesOrderItemData[];
}

export interface UpdateSalesOrderData {
  customerId?: string;
  items?: CreateSalesOrderItemData[];
}

function calculateTotal(items: CreateSalesOrderItemData[]): number {
  return items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
}

@Injectable()
export class SalesOrdersRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAllPaginated(
    query: SalesOrderQueryDto,
  ): Promise<PaginatedResult<SalesOrderListItem>> {
    const where: Prisma.SalesOrderWhereInput = {
      ...(query.status ? { status: query.status } : {}),
      ...(query.search
        ? {
            OR: [
              {
                orderNumber: { contains: query.search, mode: 'insensitive' },
              },
              {
                customer: {
                  name: { contains: query.search, mode: 'insensitive' },
                },
              },
            ],
          }
        : {}),
    };

    return paginate<SalesOrderListItem>({
      page: query.page,
      limit: query.limit,
      findMany: (args) =>
        this.prisma.salesOrder.findMany({
          ...args,
          where,
          include: listInclude,
          orderBy: { createdAt: 'desc' },
        }),
      count: () => this.prisma.salesOrder.count({ where }),
    });
  }

  findById(id: string): Promise<SalesOrderDetail | null> {
    return this.prisma.salesOrder.findUnique({
      where: { id },
      include: detailInclude,
    });
  }

  async create(data: CreateSalesOrderData): Promise<SalesOrderDetail> {
    const totalAmount = calculateTotal(data.items);

    return this.prisma.$transaction(async (tx) => {
      // Recompute the count inside the transaction to minimize (not fully
      // eliminate) the race window on the order number under heavy concurrency.
      const total = await tx.salesOrder.count();
      const orderNumber = `SO-${String(total + 1).padStart(4, '0')}`;

      return tx.salesOrder.create({
        data: {
          orderNumber,
          customerId: data.customerId,
          createdById: data.createdById,
          totalAmount,
          status: SalesOrderStatus.DRAFT,
          items: {
            create: data.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
            })),
          },
        },
        include: detailInclude,
      });
    });
  }

  async update(
    id: string,
    data: UpdateSalesOrderData,
  ): Promise<SalesOrderDetail> {
    return this.prisma.$transaction(async (tx) => {
      if (data.items) {
        await tx.salesOrderItem.deleteMany({
          where: { salesOrderId: id },
        });
      }

      return tx.salesOrder.update({
        where: { id },
        data: {
          ...(data.customerId ? { customerId: data.customerId } : {}),
          ...(data.items
            ? {
                totalAmount: calculateTotal(data.items),
                items: {
                  create: data.items.map((item) => ({
                    productId: item.productId,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                  })),
                },
              }
            : {}),
        },
        include: detailInclude,
      });
    });
  }

  cancel(id: string): Promise<SalesOrder> {
    return this.prisma.salesOrder.update({
      where: { id },
      data: { status: SalesOrderStatus.CANCELLED },
    });
  }

  async delete(id: string): Promise<SalesOrder> {
    return this.prisma.$transaction(async (tx) => {
      await tx.salesOrderItem.deleteMany({
        where: { salesOrderId: id },
      });
      return tx.salesOrder.delete({ where: { id } });
    });
  }

  /**
   * The core "Confirm Order" business transaction:
   *   1. Verify every line item has enough quantityInStock (fails fast,
   *      before anything is written, if any single item is short).
   *   2. Flip status DRAFT -> CONFIRMED and stamp confirmedAt.
   *   3. Decrement stock for every line item.
   *   4. Write one OUT StockMovement per line item for the audit trail.
   * All in a single DB transaction so it's all-or-nothing.
   */
  async confirm(id: string, confirmedById: string): Promise<SalesOrderDetail> {
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.salesOrder.findUniqueOrThrow({
        where: { id },
        include: { items: true },
      });

      // 1. Check availability for every item before mutating anything.
      for (const item of order.items) {
        const product = await tx.product.findUniqueOrThrow({
          where: { id: item.productId },
        });

        if (product.quantityInStock < item.quantity) {
          throw new ConflictException(
            `Insufficient stock for "${product.name}": requested ${item.quantity}, only ${product.quantityInStock} in stock`,
          );
        }
      }

      // 2. Flip the order to CONFIRMED.
      await tx.salesOrder.update({
        where: { id },
        data: {
          status: SalesOrderStatus.CONFIRMED,
          confirmedAt: new Date(),
        },
      });

      // 3 & 4. Decrement stock and record an OUT movement per item.
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { quantityInStock: { decrement: item.quantity } },
        });

        await tx.stockMovement.create({
          data: {
            productId: item.productId,
            type: MovementType.OUT,
            quantity: item.quantity,
            referenceType: ReferenceType.SALES_ORDER,
            referenceId: order.id,
            note: `Confirmed sales order ${order.orderNumber}`,
            createdById: confirmedById,
          },
        });
      }

      return tx.salesOrder.findUniqueOrThrow({
        where: { id },
        include: detailInclude,
      });
    });
  }
}
