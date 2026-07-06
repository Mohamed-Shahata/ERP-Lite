import { Injectable } from '@nestjs/common';
import { PrismaService } from '../infrastructure/prisma/prisma.service';
import { Prisma, Supplier } from '../../generated/prisma/client';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { PaginatedResult } from '../common/interfaces/paginated-result.interface';
import { paginate } from '../common/utils/paginate.util';

export interface CreateSupplierData {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface UpdateSupplierData {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
}

@Injectable()
export class SuppliersRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll(): Promise<Supplier[]> {
    return this.prisma.supplier.findMany({
      orderBy: { name: 'asc' },
    });
  }

  findAllPaginated(
    query: PaginationQueryDto,
  ): Promise<PaginatedResult<Supplier>> {
    const where: Prisma.SupplierWhereInput = query.search
      ? {
          OR: [
            { name: { contains: query.search, mode: 'insensitive' } },
            { email: { contains: query.search, mode: 'insensitive' } },
            { phone: { contains: query.search, mode: 'insensitive' } },
          ],
        }
      : {};

    return paginate<Supplier>({
      page: query.page,
      limit: query.limit,
      findMany: (args) =>
        this.prisma.supplier.findMany({
          ...args,
          where,
          orderBy: { name: 'asc' },
        }),
      count: () => this.prisma.supplier.count({ where }),
    });
  }

  findById(id: string): Promise<Supplier | null> {
    return this.prisma.supplier.findUnique({ where: { id } });
  }

  findByEmail(email: string): Promise<Supplier | null> {
    return this.prisma.supplier.findFirst({ where: { email } });
  }

  create(data: CreateSupplierData): Promise<Supplier> {
    return this.prisma.supplier.create({ data });
  }

  update(id: string, data: UpdateSupplierData): Promise<Supplier> {
    return this.prisma.supplier.update({ where: { id }, data });
  }

  delete(id: string): Promise<Supplier> {
    return this.prisma.supplier.delete({ where: { id } });
  }

  countPurchaseOrders(supplierId: string): Promise<number> {
    return this.prisma.purchaseOrder.count({ where: { supplierId } });
  }
}
