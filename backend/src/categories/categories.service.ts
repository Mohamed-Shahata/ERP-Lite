import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Category } from '../../generated/prisma/client';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { PaginatedResult } from '../common/interfaces/paginated-result.interface';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import {
  CategoriesRepository,
  CategoryWithProductCount,
} from './categories.repository';

import { CacheService } from '../common/cache/cache.service';
import { CACHE_PREFIX, CACHE_TTL } from '../common/cache/cache-keys.constants';

@Injectable()
export class CategoriesService {
  constructor(
    private readonly categoriesRepository: CategoriesRepository,
    private readonly cache: CacheService,
  ) {}

  async findAll(): Promise<CategoryWithProductCount[]> {
    return this.categoriesRepository.findAll();
  }

  async findAllPaginated(
    query: PaginationQueryDto,
  ): Promise<PaginatedResult<CategoryWithProductCount>> {
    const cacheKey = `${CACHE_PREFIX.CATEGORIES_LIST}${JSON.stringify(query)}`;
    return this.cache.getOrSet(cacheKey, CACHE_TTL.LIST, () =>
      this.categoriesRepository.findAllPaginated(query),
    );
  }

  async findOne(id: string): Promise<CategoryWithProductCount> {
    const category = await this.categoriesRepository.findById(id);

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async create(dto: CreateCategoryDto): Promise<Category> {
    await this.ensureNameAvailable(dto.name);

    const category = await this.categoriesRepository.create({
      name: dto.name.trim(),
      description: dto.description?.trim(),
    });
    this.cache.invalidatePrefix(CACHE_PREFIX.CATEGORIES_LIST);
    return category;
  }

  async update(id: string, dto: UpdateCategoryDto): Promise<Category> {
    await this.findOne(id);

    if (dto.name) {
      await this.ensureNameAvailable(dto.name, id);
    }

    const updated = await this.categoriesRepository.update(id, {
      ...(dto.name !== undefined ? { name: dto.name.trim() } : {}),
      ...(dto.description !== undefined
        ? { description: dto.description.trim() }
        : {}),
    });
    this.cache.invalidatePrefix(CACHE_PREFIX.CATEGORIES_LIST);
    return updated;
  }

  async remove(id: string): Promise<Category> {
    await this.findOne(id);

    const productsCount = await this.categoriesRepository.countProducts(id);
    if (productsCount > 0) {
      throw new ConflictException(
        'Cannot delete a category that still has products assigned to it',
      );
    }

    const deleted = await this.categoriesRepository.delete(id);
    this.cache.invalidatePrefix(CACHE_PREFIX.CATEGORIES_LIST);
    return deleted;
  }

  private async ensureNameAvailable(
    name: string,
    currentCategoryId?: string,
  ): Promise<void> {
    const existing = await this.categoriesRepository.findByName(name.trim());

    if (existing && existing.id !== currentCategoryId) {
      throw new ConflictException('This category name is already in use');
    }
  }
}
