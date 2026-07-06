import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Category } from '../../generated/prisma/client';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import {
  CategoriesRepository,
  CategoryWithProductCount,
} from './categories.repository';

@Injectable()
export class CategoriesService {
  constructor(private readonly categoriesRepository: CategoriesRepository) {}

  async findAll(): Promise<CategoryWithProductCount[]> {
    return this.categoriesRepository.findAll();
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

    return this.categoriesRepository.create({
      name: dto.name.trim(),
      description: dto.description?.trim(),
    });
  }

  async update(id: string, dto: UpdateCategoryDto): Promise<Category> {
    await this.findOne(id);

    if (dto.name) {
      await this.ensureNameAvailable(dto.name, id);
    }

    return this.categoriesRepository.update(id, {
      ...(dto.name !== undefined ? { name: dto.name.trim() } : {}),
      ...(dto.description !== undefined
        ? { description: dto.description.trim() }
        : {}),
    });
  }

  async remove(id: string): Promise<Category> {
    await this.findOne(id);

    const productsCount = await this.categoriesRepository.countProducts(id);
    if (productsCount > 0) {
      throw new ConflictException(
        'Cannot delete a category that still has products assigned to it',
      );
    }

    return this.categoriesRepository.delete(id);
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
