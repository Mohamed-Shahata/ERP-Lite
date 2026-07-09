import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../infrastructure/prisma/prisma.service';
import { Prisma } from '../../generated/prisma/client';
import { MovementType, ReferenceType } from '../../generated/prisma/enums';
import { PaginatedResult } from '../common/interfaces/paginated-result.interface';
import { paginate } from '../common/utils/paginate.util';
import { CreateAdjustmentDto } from './dto/create-adjustment.dto';
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

  /**
   * Manual stock correction (e.g. stocktake, damage, shrinkage):
   *   1. Verify the product exists and, for a negative delta, that enough
   *      stock is available.
   *   2. Apply the signed quantity delta to quantityInStock.
   *   3. Write an ADJUSTMENT StockMovement (referenceType MANUAL) for the
   *      audit trail.
   * All in a single DB transaction so it's all-or-nothing.
   */
  async createAdjustment(
    dto: CreateAdjustmentDto,
    createdById: string,
  ): Promise<StockMovementDetail> {
    return this.prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({
        where: { id: dto.productId },
      });

      if (!product) {
        throw new NotFoundException('Product not found');
      }

      if (product.quantityInStock + dto.quantity < 0) {
        throw new ConflictException(
          `Adjustment would take "${product.name}" below zero: currently ${product.quantityInStock} in stock`,
        );
      }

      await tx.product.update({
        where: { id: dto.productId },
        data: { quantityInStock: { increment: dto.quantity } },
      });

      return tx.stockMovement.create({
        data: {
          productId: dto.productId,
          type: MovementType.ADJUSTMENT,
          quantity: dto.quantity,
          referenceType: ReferenceType.MANUAL,
          note: dto.note,
          createdById,
        },
        include: detailInclude,
      });
    });
  }
}
