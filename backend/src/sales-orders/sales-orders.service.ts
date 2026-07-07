import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SalesOrder } from '../../generated/prisma/client';
import { SalesOrderStatus } from '../../generated/prisma/enums';
import { PaginatedResult } from '../common/interfaces/paginated-result.interface';
import { CustomersService } from '../customers/customers.service';
import { ProductsService } from '../products/products.service';
import { CreateSalesOrderDto } from './dto/create-sales-order.dto';
import { SalesOrderQueryDto } from './dto/sales-order-query.dto';
import { UpdateSalesOrderDto } from './dto/update-sales-order.dto';
import {
  SalesOrderDetail,
  SalesOrderListItem,
  SalesOrdersRepository,
} from './sales-orders.repository';

@Injectable()
export class SalesOrdersService {
  constructor(
    private readonly salesOrdersRepository: SalesOrdersRepository,
    private readonly customersService: CustomersService,
    private readonly productsService: ProductsService,
  ) {}

  async findAllPaginated(
    query: SalesOrderQueryDto,
  ): Promise<PaginatedResult<SalesOrderListItem>> {
    return this.salesOrdersRepository.findAllPaginated(query);
  }

  async findOne(id: string): Promise<SalesOrderDetail> {
    const order = await this.salesOrdersRepository.findById(id);

    if (!order) {
      throw new NotFoundException('Sales order not found');
    }

    return order;
  }

  async create(
    dto: CreateSalesOrderDto,
    createdById: string,
  ): Promise<SalesOrderDetail> {
    await this.customersService.findOne(dto.customerId);
    await this.ensureProductsExist(dto.items.map((item) => item.productId));

    return this.salesOrdersRepository.create({
      customerId: dto.customerId,
      createdById,
      items: dto.items,
    });
  }

  async update(
    id: string,
    dto: UpdateSalesOrderDto,
  ): Promise<SalesOrderDetail> {
    const order = await this.findOne(id);
    this.ensureIsDraft(order, 'edited');

    if (dto.customerId) {
      await this.customersService.findOne(dto.customerId);
    }

    if (dto.items) {
      await this.ensureProductsExist(dto.items.map((item) => item.productId));
    }

    return this.salesOrdersRepository.update(id, {
      customerId: dto.customerId,
      items: dto.items,
    });
  }

  async cancel(id: string): Promise<SalesOrder> {
    const order = await this.findOne(id);
    this.ensureIsDraft(order, 'cancelled');

    return this.salesOrdersRepository.cancel(id);
  }

  async remove(id: string): Promise<SalesOrder> {
    const order = await this.findOne(id);
    this.ensureIsDraft(order, 'deleted');

    return this.salesOrdersRepository.delete(id);
  }

  /**
   * "Confirm Order": the one endpoint that actually moves inventory.
   * Verifies stock, decrements it, writes an OUT StockMovement per item,
   * and flips DRAFT -> CONFIRMED, all inside one DB transaction.
   */
  async confirm(id: string, confirmedById: string): Promise<SalesOrderDetail> {
    const order = await this.findOne(id);

    if (order.status !== SalesOrderStatus.DRAFT) {
      throw new ConflictException('Only draft sales orders can be confirmed');
    }

    return this.salesOrdersRepository.confirm(id, confirmedById);
  }

  private ensureIsDraft(
    order: SalesOrderDetail,
    action: 'edited' | 'cancelled' | 'deleted',
  ): void {
    if (order.status !== SalesOrderStatus.DRAFT) {
      throw new ConflictException(`Only draft sales orders can be ${action}`);
    }
  }

  private async ensureProductsExist(productIds: string[]): Promise<void> {
    await Promise.all(
      productIds.map((productId) => this.productsService.findOne(productId)),
    );
  }
}
