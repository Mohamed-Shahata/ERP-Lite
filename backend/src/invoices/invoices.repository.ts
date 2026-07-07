import { Injectable } from '@nestjs/common';
import { PrismaService } from '../infrastructure/prisma/prisma.service';
import { Prisma, Invoice } from '../../generated/prisma/client';
import { PaginatedResult } from '../common/interfaces/paginated-result.interface';
import { paginate } from '../common/utils/paginate.util';
import { InvoiceQueryDto } from './dto/invoice-query.dto';

const listInclude = {
  salesOrder: {
    select: {
      id: true,
      orderNumber: true,
      customer: { select: { id: true, name: true } },
    },
  },
  _count: { select: { payments: true } },
} as const;

const detailInclude = {
  salesOrder: {
    include: {
      customer: { select: { id: true, name: true, email: true, phone: true } },
      items: {
        include: {
          product: { select: { id: true, name: true, sku: true } },
        },
      },
    },
  },
  payments: {
    include: {
      recordedBy: { select: { id: true, name: true, email: true } },
    },
  },
} as const;

export type InvoiceListItem = Prisma.InvoiceGetPayload<{
  include: typeof listInclude;
}>;

export type InvoiceDetail = Prisma.InvoiceGetPayload<{
  include: typeof detailInclude;
}>;

@Injectable()
export class InvoicesRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAllPaginated(
    query: InvoiceQueryDto,
  ): Promise<PaginatedResult<InvoiceListItem>> {
    const where: Prisma.InvoiceWhereInput = {
      ...(query.status ? { status: query.status } : {}),
      ...(query.search
        ? {
            OR: [
              {
                invoiceNumber: { contains: query.search, mode: 'insensitive' },
              },
              {
                salesOrder: {
                  customer: {
                    name: { contains: query.search, mode: 'insensitive' },
                  },
                },
              },
            ],
          }
        : {}),
    };

    return paginate<InvoiceListItem>({
      page: query.page,
      limit: query.limit,
      findMany: (args) =>
        this.prisma.invoice.findMany({
          ...args,
          where,
          include: listInclude,
          orderBy: { createdAt: 'desc' },
        }),
      count: () => this.prisma.invoice.count({ where }),
    });
  }

  findById(id: string): Promise<InvoiceDetail | null> {
    return this.prisma.invoice.findUnique({
      where: { id },
      include: detailInclude,
    });
  }

  findByNumber(invoiceNumber: string): Promise<InvoiceDetail | null> {
    return this.prisma.invoice.findUnique({
      where: { invoiceNumber },
      include: detailInclude,
    });
  }

  findBySalesOrderId(salesOrderId: string): Promise<InvoiceDetail | null> {
    return this.prisma.invoice.findUnique({
      where: { salesOrderId },
      include: detailInclude,
    });
  }

  async update(id: string, data: Prisma.InvoiceUpdateInput): Promise<Invoice> {
    return this.prisma.invoice.update({
      where: { id },
      data,
    });
  }
}
