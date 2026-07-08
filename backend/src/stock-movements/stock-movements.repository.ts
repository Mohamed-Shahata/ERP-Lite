import { Injectable } from '@nestjs/common';
import { PrismaService } from '../infrastructure/prisma/prisma.service';
import { Prisma } from '../../generated/prisma/client';
import { PaginatedResult } from '../common/interfaces/paginated-result.interface';
import { paginate } from '../common/utils/paginate.util';
import { StockMovementQueryDto } from './dto/stock-movement-query.dto';

const detailInclude = {
  product: { select: { id: true, sku: true, name: true } },
  createdBy: { select: { id: true, name: true, email: true } },
} as const;

export type StockMovementDetail = Prisma.StockMovementGetPayload<{
  include: typeof detailInclude;
}>;

@Injectable()
export class StockMovementsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAllPaginated(
    query: StockMovementQueryDto,
  ): Promise<PaginatedResult<StockMovementDetail>> {
    const where: Prisma.StockMovementWhereInput = {
      ...(query.productId ? { productId: query.productId } : {}),
      ...(query.type ? { type: query.type } : {}),
      ...(query.referenceType ? { referenceType: query.referenceType } : {}),
      ...(query.from || query.to
        ? {
            createdAt: {
              ...(query.from ? { gte: new Date(query.from) } : {}),
              ...(query.to ? { lte: new Date(query.to) } : {}),
            },
          }
        : {}),
    };

    return paginate<StockMovementDetail>({
      page: query.page,
      limit: query.limit,
      findMany: (args) =>
        this.prisma.stockMovement.findMany({
          ...args,
          where,
          include: detailInclude,
          orderBy: { createdAt: 'desc' },
        }),
      count: () => this.prisma.stockMovement.count({ where }),
    });
  }
}
