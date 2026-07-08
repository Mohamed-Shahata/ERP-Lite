import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Supplier } from '../../generated/prisma/client';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { PaginatedResult } from '../common/interfaces/paginated-result.interface';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { SuppliersRepository } from './suppliers.repository';

import { CacheService } from '../common/cache/cache.service';
import { CACHE_PREFIX, CACHE_TTL } from '../common/cache/cache-keys.constants';

@Injectable()
export class SuppliersService {
  constructor(
    private readonly suppliersRepository: SuppliersRepository,
    private readonly cache: CacheService,
  ) {}

  async findAll(): Promise<Supplier[]> {
    return this.suppliersRepository.findAll();
  }

  async findAllPaginated(
    query: PaginationQueryDto,
  ): Promise<PaginatedResult<Supplier>> {
    const cacheKey = `${CACHE_PREFIX.SUPPLIERS_LIST}${JSON.stringify(query)}`;
    return this.cache.getOrSet(cacheKey, CACHE_TTL.LIST, () =>
      this.suppliersRepository.findAllPaginated(query),
    );
  }

  async findOne(id: string): Promise<Supplier> {
    const supplier = await this.suppliersRepository.findById(id);

    if (!supplier) {
      throw new NotFoundException('Supplier not found');
    }

    return supplier;
  }

  async create(dto: CreateSupplierDto): Promise<Supplier> {
    if (dto.email) {
      await this.ensureEmailAvailable(dto.email);
    }

    const supplier = await this.suppliersRepository.create({
      name: dto.name.trim(),
      email: dto.email?.toLowerCase().trim(),
      phone: dto.phone?.trim(),
      address: dto.address?.trim(),
    });
    this.cache.invalidatePrefix(CACHE_PREFIX.SUPPLIERS_LIST);
    return supplier;
  }

  async update(id: string, dto: UpdateSupplierDto): Promise<Supplier> {
    await this.findOne(id);

    if (dto.email) {
      await this.ensureEmailAvailable(dto.email, id);
    }

    const updated = await this.suppliersRepository.update(id, {
      ...(dto.name !== undefined ? { name: dto.name.trim() } : {}),
      ...(dto.email !== undefined
        ? { email: dto.email.toLowerCase().trim() }
        : {}),
      ...(dto.phone !== undefined ? { phone: dto.phone.trim() } : {}),
      ...(dto.address !== undefined ? { address: dto.address.trim() } : {}),
    });
    this.cache.invalidatePrefix(CACHE_PREFIX.SUPPLIERS_LIST);
    return updated;
  }

  async remove(id: string): Promise<Supplier> {
    await this.findOne(id);

    const purchaseOrdersCount =
      await this.suppliersRepository.countPurchaseOrders(id);
    if (purchaseOrdersCount > 0) {
      throw new ConflictException(
        'Cannot delete a supplier that still has purchase orders linked to it',
      );
    }

    const deleted = await this.suppliersRepository.delete(id);
    this.cache.invalidatePrefix(CACHE_PREFIX.SUPPLIERS_LIST);
    return deleted;
  }

  private async ensureEmailAvailable(
    email: string,
    currentSupplierId?: string,
  ): Promise<void> {
    const existing = await this.suppliersRepository.findByEmail(
      email.toLowerCase().trim(),
    );

    if (existing && existing.id !== currentSupplierId) {
      throw new ConflictException('This email is already in use');
    }
  }
}
