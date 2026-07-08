import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Customer } from '../../generated/prisma/client';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { PaginatedResult } from '../common/interfaces/paginated-result.interface';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { CustomersRepository } from './customers.repository';

import { CacheService } from '../common/cache/cache.service';
import { CACHE_PREFIX, CACHE_TTL } from '../common/cache/cache-keys.constants';

@Injectable()
export class CustomersService {
  constructor(
    private readonly customersRepository: CustomersRepository,
    private readonly cache: CacheService,
  ) {}

  async findAll(): Promise<Customer[]> {
    return this.customersRepository.findAll();
  }

  async findAllPaginated(
    query: PaginationQueryDto,
  ): Promise<PaginatedResult<Customer>> {
    const cacheKey = `${CACHE_PREFIX.CUSTOMERS_LIST}${JSON.stringify(query)}`;
    return this.cache.getOrSet(cacheKey, CACHE_TTL.LIST, () =>
      this.customersRepository.findAllPaginated(query),
    );
  }

  async findOne(id: string): Promise<Customer> {
    const customer = await this.customersRepository.findById(id);

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    return customer;
  }

  async create(dto: CreateCustomerDto): Promise<Customer> {
    if (dto.email) {
      await this.ensureEmailAvailable(dto.email);
    }

    const customer = await this.customersRepository.create({
      name: dto.name.trim(),
      email: dto.email?.toLowerCase().trim(),
      phone: dto.phone?.trim(),
      address: dto.address?.trim(),
    });
    this.cache.invalidatePrefix(CACHE_PREFIX.CUSTOMERS_LIST);
    return customer;
  }

  async update(id: string, dto: UpdateCustomerDto): Promise<Customer> {
    await this.findOne(id);

    if (dto.email) {
      await this.ensureEmailAvailable(dto.email, id);
    }

    const updated = await this.customersRepository.update(id, {
      ...(dto.name !== undefined ? { name: dto.name.trim() } : {}),
      ...(dto.email !== undefined
        ? { email: dto.email.toLowerCase().trim() }
        : {}),
      ...(dto.phone !== undefined ? { phone: dto.phone.trim() } : {}),
      ...(dto.address !== undefined ? { address: dto.address.trim() } : {}),
    });
    this.cache.invalidatePrefix(CACHE_PREFIX.CUSTOMERS_LIST);
    return updated;
  }

  async remove(id: string): Promise<Customer> {
    await this.findOne(id);

    const salesOrdersCount =
      await this.customersRepository.countSalesOrders(id);
    if (salesOrdersCount > 0) {
      throw new ConflictException(
        'Cannot delete a customer that still has sales orders linked to it',
      );
    }

    const deleted = await this.customersRepository.delete(id);
    this.cache.invalidatePrefix(CACHE_PREFIX.CUSTOMERS_LIST);
    return deleted;
  }

  private async ensureEmailAvailable(
    email: string,
    currentCustomerId?: string,
  ): Promise<void> {
    const existing = await this.customersRepository.findByEmail(
      email.toLowerCase().trim(),
    );

    if (existing && existing.id !== currentCustomerId) {
      throw new ConflictException('This email is already in use');
    }
  }
}
