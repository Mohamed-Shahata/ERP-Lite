import { Injectable } from '@nestjs/common';
import { PrismaService } from '../infrastructure/prisma/prisma.service';
import { Product } from '../../generated/prisma/client';

export type ProductWithCategory = Product & {
  category: { id: string; name: string };
};

export interface CreateProductData {
  sku: string;
  name: string;
  description?: string;
  categoryId: string;
  costPrice: number;
  sellPrice: number;
  quantityInStock?: number;
  reorderLevel?: number;
  isActive?: boolean;
}

export interface UpdateProductData {
  sku?: string;
  name?: string;
  description?: string;
  categoryId?: string;
  costPrice?: number;
  sellPrice?: number;
  quantityInStock?: number;
  reorderLevel?: number;
  isActive?: boolean;
}

const withCategory = {
  category: { select: { id: true, name: true } },
} as const;

@Injectable()
export class ProductsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll(): Promise<ProductWithCategory[]> {
    return this.prisma.product.findMany({
      include: withCategory,
      orderBy: { createdAt: 'desc' },
    });
  }

  findById(id: string): Promise<ProductWithCategory | null> {
    return this.prisma.product.findUnique({
      where: { id },
      include: withCategory,
    });
  }

  findBySku(sku: string): Promise<Product | null> {
    return this.prisma.product.findUnique({ where: { sku } });
  }

  create(data: CreateProductData): Promise<ProductWithCategory> {
    return this.prisma.product.create({ data, include: withCategory });
  }

  update(id: string, data: UpdateProductData): Promise<ProductWithCategory> {
    return this.prisma.product.update({
      where: { id },
      data,
      include: withCategory,
    });
  }

  delete(id: string): Promise<Product> {
    return this.prisma.product.delete({ where: { id } });
  }
}
