import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PurchaseOrder } from '../../generated/prisma/client';
import { PurchaseOrderStatus } from '../../generated/prisma/enums';
import { PaginatedResult } from '../common/interfaces/paginated-result.interface';
import { ProductsService } from '../products/products.service';
import { SuppliersService } from '../suppliers/suppliers.service';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { PurchaseOrderQueryDto } from './dto/purchase-order-query.dto';
import { UpdatePurchaseOrderDto } from './dto/update-purchase-order.dto';
import {
  PurchaseOrderDetail,
  PurchaseOrderListItem,
  PurchaseOrdersRepository,
} from './purchase-orders.repository';
import { CacheService } from '../common/cache/cache.service';
import { CACHE_PREFIX } from '../common/cache/cache-keys.constants';

@Injectable()
export class PurchaseOrdersService {
  constructor(
    private readonly purchaseOrdersRepository: PurchaseOrdersRepository,
    private readonly suppliersService: SuppliersService,
    private readonly productsService: ProductsService,
    private readonly cache: CacheService,
  ) {}

  async findAllPaginated(
    query: PurchaseOrderQueryDto,
  ): Promise<PaginatedResult<PurchaseOrderListItem>> {
    return this.purchaseOrdersRepository.findAllPaginated(query);
  }

  async findOne(id: string): Promise<PurchaseOrderDetail> {
    const order = await this.purchaseOrdersRepository.findById(id);

    if (!order) {
      throw new NotFoundException('Purchase order not found');
    }

    return order;
  }

  async create(
    dto: CreatePurchaseOrderDto,
    createdById: string,
  ): Promise<PurchaseOrderDetail> {
    await this.suppliersService.findOne(dto.supplierId);
    await this.ensureProductsExist(dto.items.map((item) => item.productId));

    return this.purchaseOrdersRepository.create({
      supplierId: dto.supplierId,
      createdById,
      items: dto.items,
    });
  }

  async update(
    id: string,
    dto: UpdatePurchaseOrderDto,
  ): Promise<PurchaseOrderDetail> {
    const order = await this.findOne(id);
    this.ensureIsPending(order, 'edited');

    if (dto.supplierId) {
      await this.suppliersService.findOne(dto.supplierId);
    }

    if (dto.items) {
      await this.ensureProductsExist(dto.items.map((item) => item.productId));
    }

    return this.purchaseOrdersRepository.update(id, {
      supplierId: dto.supplierId,
      items: dto.items,
    });
  }

  async cancel(id: string): Promise<PurchaseOrder> {
    const order = await this.findOne(id);
    this.ensureIsPending(order, 'cancelled');

    return this.purchaseOrdersRepository.cancel(id);
  }

  async remove(id: string): Promise<PurchaseOrder> {
    const order = await this.findOne(id);
    this.ensureIsPending(order, 'deleted');

    return this.purchaseOrdersRepository.delete(id);
  }

  /**
   * "Receive Order": the one endpoint that actually moves inventory.
   * Sets status -> RECEIVED, increments stock for every line item, and
   * writes a StockMovement per item, all inside one DB transaction.
   */
  async receive(
    id: string,
    receivedById: string,
  ): Promise<PurchaseOrderDetail> {
    const order = await this.findOne(id);

    if (order.status !== PurchaseOrderStatus.PENDING) {
      throw new ConflictException(
        'This purchase order has already been received or cancelled',
      );
    }

    const received = await this.purchaseOrdersRepository.receive(
      id,
      receivedById,
    );
    this.cache.invalidatePrefix(CACHE_PREFIX.DASHBOARD_OVERVIEW);
    this.cache.invalidate(CACHE_PREFIX.REPORTS_INVENTORY);
    return received;
  }

  private ensureIsPending(
    order: PurchaseOrderDetail,
    action: 'edited' | 'cancelled' | 'deleted',
  ): void {
    if (order.status !== PurchaseOrderStatus.PENDING) {
      throw new ConflictException(
        `Only pending purchase orders can be ${action}`,
      );
    }
  }

  private async ensureProductsExist(productIds: string[]): Promise<void> {
    await Promise.all(
      productIds.map((productId) => this.productsService.findOne(productId)),
    );
  }
}
