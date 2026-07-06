export interface Category {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  _count?: { products: number };
}

export interface ProductCategoryRef {
  id: string;
  name: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  categoryId: string;
  category: ProductCategoryRef;
  costPrice: string;
  sellPrice: string;
  quantityInStock: number;
  reorderLevel: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
