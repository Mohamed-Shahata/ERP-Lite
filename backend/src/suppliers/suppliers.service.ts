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

@Injectable()
export class SuppliersService {
  constructor(private readonly suppliersRepository: SuppliersRepository) {}

  async findAll(): Promise<Supplier[]> {
    return this.suppliersRepository.findAll();
  }

  async findAllPaginated(
    query: PaginationQueryDto,
  ): Promise<PaginatedResult<Supplier>> {
    return this.suppliersRepository.findAllPaginated(query);
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

    return this.suppliersRepository.create({
      name: dto.name.trim(),
      email: dto.email?.toLowerCase().trim(),
      phone: dto.phone?.trim(),
      address: dto.address?.trim(),
    });
  }

  async update(id: string, dto: UpdateSupplierDto): Promise<Supplier> {
    await this.findOne(id);

    if (dto.email) {
      await this.ensureEmailAvailable(dto.email, id);
    }

    return this.suppliersRepository.update(id, {
      ...(dto.name !== undefined ? { name: dto.name.trim() } : {}),
      ...(dto.email !== undefined
        ? { email: dto.email.toLowerCase().trim() }
        : {}),
      ...(dto.phone !== undefined ? { phone: dto.phone.trim() } : {}),
      ...(dto.address !== undefined ? { address: dto.address.trim() } : {}),
    });
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

    return this.suppliersRepository.delete(id);
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
