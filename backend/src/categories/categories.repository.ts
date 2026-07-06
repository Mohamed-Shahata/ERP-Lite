import { Injectable } from '@nestjs/common';
import { PrismaService } from '../infrastructure/prisma/prisma.service';
import { Category, Prisma } from '../../generated/prisma/client';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { PaginatedResult } from '../common/interfaces/paginated-result.interface';
import { paginate } from '../common/utils/paginate.util';

export interface CategoryWithProductCount extends Category {
  _count: { products: number };
}

export interface CreateCategoryData {
  name: string;
  description?: string;
}

export interface UpdateCategoryData {
  name?: string;
  description?: string;
}

@Injectable()
export class CategoriesRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll(): Promise<CategoryWithProductCount[]> {
    return this.prisma.category.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: { name: 'asc' },
    });
  }

  findAllPaginated(
    query: PaginationQueryDto,
  ): Promise<PaginatedResult<CategoryWithProductCount>> {
    const where: Prisma.CategoryWhereInput = query.search
      ? { name: { contains: query.search, mode: 'insensitive' } }
      : {};

    return paginate<CategoryWithProductCount>({
      page: query.page,
      limit: query.limit,
      findMany: (args) =>
        this.prisma.category.findMany({
          ...args,
          where,
          include: { _count: { select: { products: true } } },
          orderBy: { name: 'asc' },
        }),
      count: () => this.prisma.category.count({ where }),
    });
  }

  findById(id: string): Promise<CategoryWithProductCount | null> {
    return this.prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { products: true } } },
    });
  }

  findByName(name: string): Promise<Category | null> {
    return this.prisma.category.findUnique({ where: { name } });
  }

  create(data: CreateCategoryData): Promise<Category> {
    return this.prisma.category.create({ data });
  }

  update(id: string, data: UpdateCategoryData): Promise<Category> {
    return this.prisma.category.update({ where: { id }, data });
  }

  delete(id: string): Promise<Category> {
    return this.prisma.category.delete({ where: { id } });
  }

  countProducts(categoryId: string): Promise<number> {
    return this.prisma.product.count({ where: { categoryId } });
  }
}
