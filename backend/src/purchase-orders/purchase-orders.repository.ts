import { Injectable } from '@nestjs/common';
import { PrismaService } from '../infrastructure/prisma/prisma.service';
import {
  MovementType,
  PurchaseOrderStatus,
  ReferenceType,
} from '../../generated/prisma/enums';
import { Prisma, PurchaseOrder } from '../../generated/prisma/client';
import { PaginatedResult } from '../common/interfaces/paginated-result.interface';
import { paginate } from '../common/utils/paginate.util';
import { PurchaseOrderQueryDto } from './dto/purchase-order-query.dto';

const listInclude = {
  supplier: { select: { id: true, name: true } },
  _count: { select: { items: true } },
} as const;

const detailInclude = {
  supplier: {
    select: { id: true, name: true, email: true, phone: true },
  },
  createdBy: { select: { id: true, name: true, email: true } },
  items: {
    include: {
      product: { select: { id: true, name: true, sku: true } },
    },
  },
} as const;

export type PurchaseOrderListItem = Prisma.PurchaseOrderGetPayload<{
  include: typeof listInclude;
}>;

export type PurchaseOrderDetail = Prisma.PurchaseOrderGetPayload<{
  include: typeof detailInclude;
}>;

export interface CreatePurchaseOrderItemData {
  productId: string;
  quantity: number;
  unitCost: number;
}

export interface CreatePurchaseOrderData {
  supplierId: string;
  createdById: string;
  items: CreatePurchaseOrderItemData[];
}

export interface UpdatePurchaseOrderData {
  supplierId?: string;
  items?: CreatePurchaseOrderItemData[];
}

function calculateTotal(items: CreatePurchaseOrderItemData[]): number {
  return items.reduce((sum, item) => sum + item.quantity * item.unitCost, 0);
}

@Injectable()
export class PurchaseOrdersRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAllPaginated(
    query: PurchaseOrderQueryDto,
  ): Promise<PaginatedResult<PurchaseOrderListItem>> {
    const where: Prisma.PurchaseOrderWhereInput = {
      ...(query.status ? { status: query.status } : {}),
      ...(query.search
        ? {
            OR: [
              { poNumber: { contains: query.search, mode: 'insensitive' } },
              {
                supplier: {
                  name: { contains: query.search, mode: 'insensitive' },
                },
              },
            ],
          }
        : {}),
    };

    return paginate<PurchaseOrderListItem>({
      page: query.page,
      limit: query.limit,
      findMany: (args) =>
        this.prisma.purchaseOrder.findMany({
          ...args,
          where,
          include: listInclude,
          orderBy: { createdAt: 'desc' },
        }),
      count: () => this.prisma.purchaseOrder.count({ where }),
    });
  }

  findById(id: string): Promise<PurchaseOrderDetail | null> {
    return this.prisma.purchaseOrder.findUnique({
      where: { id },
      include: detailInclude,
    });
  }

  async create(data: CreatePurchaseOrderData): Promise<PurchaseOrderDetail> {
    const totalAmount = calculateTotal(data.items);

    return this.prisma.$transaction(async (tx) => {
      // Recompute the count inside the transaction to minimize (not fully
      // eliminate) the race window on the PO number under heavy concurrency.
      const total = await tx.purchaseOrder.count();
      const poNumber = `PO-${String(total + 1).padStart(4, '0')}`;

      return tx.purchaseOrder.create({
        data: {
          poNumber,
          supplierId: data.supplierId,
          createdById: data.createdById,
          totalAmount,
          status: PurchaseOrderStatus.PENDING,
          items: {
            create: data.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              unitCost: item.unitCost,
            })),
          },
        },
        include: detailInclude,
      });
    });
  }

  async update(
    id: string,
    data: UpdatePurchaseOrderData,
  ): Promise<PurchaseOrderDetail> {
    return this.prisma.$transaction(async (tx) => {
      if (data.items) {
        await tx.purchaseOrderItem.deleteMany({
          where: { purchaseOrderId: id },
        });
      }

      return tx.purchaseOrder.update({
        where: { id },
        data: {
          ...(data.supplierId ? { supplierId: data.supplierId } : {}),
          ...(data.items
            ? {
                totalAmount: calculateTotal(data.items),
                items: {
                  create: data.items.map((item) => ({
                    productId: item.productId,
                    quantity: item.quantity,
                    unitCost: item.unitCost,
                  })),
                },
              }
            : {}),
        },
        include: detailInclude,
      });
    });
  }

  cancel(id: string): Promise<PurchaseOrder> {
    return this.prisma.purchaseOrder.update({
      where: { id },
      data: { status: PurchaseOrderStatus.CANCELLED },
    });
  }

  async delete(id: string): Promise<PurchaseOrder> {
    return this.prisma.$transaction(async (tx) => {
      await tx.purchaseOrderItem.deleteMany({
        where: { purchaseOrderId: id },
      });
      return tx.purchaseOrder.delete({ where: { id } });
    });
  }

  /**
   * The core "Receive Order" business transaction:
   *   1. Flip status PENDING -> RECEIVED and stamp receivedAt.
   *   2. Increment stock for every line item.
   *   3. Write one IN StockMovement per line item for the audit trail.
   * All in a single DB transaction so it's all-or-nothing.
   */
  async receive(
    id: string,
    receivedById: string,
  ): Promise<PurchaseOrderDetail> {
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.purchaseOrder.findUniqueOrThrow({
        where: { id },
        include: { items: true },
      });

      await tx.purchaseOrder.update({
        where: { id },
        data: {
          status: PurchaseOrderStatus.RECEIVED,
          receivedAt: new Date(),
        },
      });

      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { quantityInStock: { increment: item.quantity } },
        });

        await tx.stockMovement.create({
          data: {
            productId: item.productId,
            type: MovementType.IN,
            quantity: item.quantity,
            referenceType: ReferenceType.PURCHASE_ORDER,
            referenceId: order.id,
            note: `Received from ${order.poNumber}`,
            createdById: receivedById,
          },
        });
      }

      return tx.purchaseOrder.findUniqueOrThrow({
        where: { id },
        include: detailInclude,
      });
    });
  }
}
