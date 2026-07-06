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

@Injectable()
export class ProductsService {
  constructor(
    private readonly productsRepository: ProductsRepository,
    private readonly categoriesService: CategoriesService,
  ) {}

  async findAll(): Promise<ProductWithCategory[]> {
    return this.productsRepository.findAll();
  }

  async findAllPaginated(
    query: PaginationQueryDto,
  ): Promise<PaginatedResult<ProductWithCategory>> {
    return this.productsRepository.findAllPaginated(query);
  }

  async findOne(id: string): Promise<ProductWithCategory> {
    const product = await this.productsRepository.findById(id);

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async create(dto: CreateProductDto): Promise<ProductWithCategory> {
    await this.ensureSkuAvailable(dto.sku);
    // Throws NotFoundException if the category doesn't exist.
    await this.categoriesService.findOne(dto.categoryId);

    return this.productsRepository.create({
      sku: dto.sku.trim(),
      name: dto.name.trim(),
      description: dto.description?.trim(),
      categoryId: dto.categoryId,
      costPrice: dto.costPrice,
      sellPrice: dto.sellPrice,
      reorderLevel: dto.reorderLevel,
      isActive: dto.isActive ?? true,
    });
  }

  async update(
    id: string,
    dto: UpdateProductDto,
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

    return this.productsRepository.update(id, data);
  }

  async remove(id: string): Promise<ProductWithCategory> {
    const product = await this.findOne(id);
    await this.productsRepository.delete(id);
    return product;
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
