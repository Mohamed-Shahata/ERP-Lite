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

@Injectable()
export class CustomersService {
  constructor(private readonly customersRepository: CustomersRepository) {}

  async findAll(): Promise<Customer[]> {
    return this.customersRepository.findAll();
  }

  async findAllPaginated(
    query: PaginationQueryDto,
  ): Promise<PaginatedResult<Customer>> {
    return this.customersRepository.findAllPaginated(query);
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

    return this.customersRepository.create({
      name: dto.name.trim(),
      email: dto.email?.toLowerCase().trim(),
      phone: dto.phone?.trim(),
      address: dto.address?.trim(),
    });
  }

  async update(id: string, dto: UpdateCustomerDto): Promise<Customer> {
    await this.findOne(id);

    if (dto.email) {
      await this.ensureEmailAvailable(dto.email, id);
    }

    return this.customersRepository.update(id, {
      ...(dto.name !== undefined ? { name: dto.name.trim() } : {}),
      ...(dto.email !== undefined
        ? { email: dto.email.toLowerCase().trim() }
        : {}),
      ...(dto.phone !== undefined ? { phone: dto.phone.trim() } : {}),
      ...(dto.address !== undefined ? { address: dto.address.trim() } : {}),
    });
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

    return this.customersRepository.delete(id);
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
