import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CategoriesService } from '../categories/categories.service';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { PaginatedResult } from '../common/interfaces/paginated-result.interface';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import {
  ProductsRepository,
  ProductWithCategory,
  UpdateProductData,
} from './products.repository';
import { CacheService } from '../common/cache/cache.service';
import { CACHE_PREFIX, CACHE_TTL } from '../common/cache/cache-keys.constants';
import { AuditLogService } from '../common/audit-log/audit-log.service';

@Injectable()
export class ProductsService {
  constructor(
    private readonly productsRepository: ProductsRepository,
    private readonly categoriesService: CategoriesService,
    private readonly cache: CacheService,
    private readonly auditLog: AuditLogService,
  ) {}

  async findAll(): Promise<ProductWithCategory[]> {
    return this.productsRepository.findAll();
  }

  async findAllPaginated(
    query: PaginationQueryDto,
  ): Promise<PaginatedResult<ProductWithCategory>> {
    const cacheKey = `${CACHE_PREFIX.PRODUCTS_LIST}${JSON.stringify(query)}`;
    return this.cache.getOrSet(cacheKey, CACHE_TTL.LIST, () =>
      this.productsRepository.findAllPaginated(query),
    );
  }

  async findOne(id: string): Promise<ProductWithCategory> {
    const product = await this.productsRepository.findById(id);

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async create(
    dto: CreateProductDto,
    actorId?: string,
  ): Promise<ProductWithCategory> {
    await this.ensureSkuAvailable(dto.sku);
    // Throws NotFoundException if the category doesn't exist.
    await this.categoriesService.findOne(dto.categoryId);

    const product = await this.productsRepository.create({
      sku: dto.sku.trim(),
      name: dto.name.trim(),
      description: dto.description?.trim(),
      categoryId: dto.categoryId,
      costPrice: dto.costPrice,
      sellPrice: dto.sellPrice,
      reorderLevel: dto.reorderLevel,
      isActive: dto.isActive ?? true,
    });
    void this.auditLog.log({
      action: 'PRODUCT_CREATED',
      entityType: 'Product',
      entityId: product.id,
      userId: actorId,
      metadata: { sku: product.sku, name: product.name },
    });
    this.invalidateProductCaches();
    return product;
  }

  async update(
    id: string,
    dto: UpdateProductDto,
    actorId?: string,
  ): Promise<ProductWithCategory> {
    await this.findOne(id);

    if (dto.sku) {
      await this.ensureSkuAvailable(dto.sku, id);
    }

    if (dto.categoryId) {
      await this.categoriesService.findOne(dto.categoryId);
    }

    const data: UpdateProductData = {
      ...(dto.sku !== undefined ? { sku: dto.sku.trim() } : {}),
      ...(dto.name !== undefined ? { name: dto.name.trim() } : {}),
      ...(dto.description !== undefined
        ? { description: dto.description.trim() }
        : {}),
      ...(dto.categoryId !== undefined ? { categoryId: dto.categoryId } : {}),
      ...(dto.costPrice !== undefined ? { costPrice: dto.costPrice } : {}),
      ...(dto.sellPrice !== undefined ? { sellPrice: dto.sellPrice } : {}),
      ...(dto.reorderLevel !== undefined
        ? { reorderLevel: dto.reorderLevel }
        : {}),
      ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
    };

    const updated = await this.productsRepository.update(id, data);
    void this.auditLog.log({
      action: 'PRODUCT_UPDATED',
      entityType: 'Product',
      entityId: id,
      userId: actorId,
      metadata: { changes: data },
    });
    this.invalidateProductCaches();
    return updated;
  }

  async remove(id: string, actorId?: string): Promise<ProductWithCategory> {
    const product = await this.findOne(id);
    await this.productsRepository.delete(id);
    void this.auditLog.log({
      action: 'PRODUCT_DELETED',
      entityType: 'Product',
      entityId: id,
      userId: actorId,
      metadata: { sku: product.sku, name: product.name },
    });
    this.invalidateProductCaches();
    return product;
  }

  /** A product write can also change stock/reorder data reports rely on. */
  private invalidateProductCaches(): void {
    this.cache.invalidatePrefix(CACHE_PREFIX.PRODUCTS_LIST);
    this.cache.invalidate(CACHE_PREFIX.REPORTS_INVENTORY);
    this.cache.invalidatePrefix(CACHE_PREFIX.DASHBOARD_OVERVIEW);
  }

  private async ensureSkuAvailable(
    sku: string,
    currentProductId?: string,
  ): Promise<void> {
    const existing = await this.productsRepository.findBySku(sku.trim());

    if (existing && existing.id !== currentProductId) {
      throw new ConflictException('This SKU is already in use');
    }
  }
}
