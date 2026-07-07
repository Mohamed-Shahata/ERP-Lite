import { Injectable } from '@nestjs/common';
import { PrismaService } from '../infrastructure/prisma/prisma.service';
import { Customer, Prisma } from '../../generated/prisma/client';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { PaginatedResult } from '../common/interfaces/paginated-result.interface';
import { paginate } from '../common/utils/paginate.util';

export interface CreateCustomerData {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface UpdateCustomerData {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
}

@Injectable()
export class CustomersRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll(): Promise<Customer[]> {
    return this.prisma.customer.findMany({
      orderBy: { name: 'asc' },
    });
  }

  findAllPaginated(
    query: PaginationQueryDto,
  ): Promise<PaginatedResult<Customer>> {
    const where: Prisma.CustomerWhereInput = query.search
      ? {
          OR: [
            { name: { contains: query.search, mode: 'insensitive' } },
            { email: { contains: query.search, mode: 'insensitive' } },
            { phone: { contains: query.search, mode: 'insensitive' } },
          ],
        }
      : {};

    return paginate<Customer>({
      page: query.page,
      limit: query.limit,
      findMany: (args) =>
        this.prisma.customer.findMany({
          ...args,
          where,
          orderBy: { name: 'asc' },
        }),
      count: () => this.prisma.customer.count({ where }),
    });
  }

  findById(id: string): Promise<Customer | null> {
    return this.prisma.customer.findUnique({ where: { id } });
  }

  findByEmail(email: string): Promise<Customer | null> {
    return this.prisma.customer.findFirst({ where: { email } });
  }

  create(data: CreateCustomerData): Promise<Customer> {
    return this.prisma.customer.create({ data });
  }

  update(id: string, data: UpdateCustomerData): Promise<Customer> {
    return this.prisma.customer.update({ where: { id }, data });
  }

  delete(id: string): Promise<Customer> {
    return this.prisma.customer.delete({ where: { id } });
  }

  countSalesOrders(customerId: string): Promise<number> {
    return this.prisma.salesOrder.count({ where: { customerId } });
  }
}
