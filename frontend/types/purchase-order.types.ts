export type PurchaseOrderStatus = "PENDING" | "RECEIVED" | "CANCELLED";

export interface PurchaseOrderSupplierRef {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
}

export interface PurchaseOrderProductRef {
  id: string;
  name: string;
  sku: string;
}

export interface PurchaseOrderCreatedByRef {
  id: string;
  name: string;
  email: string;
}

export interface PurchaseOrderItem {
  id: string;
  productId: string;
  product: PurchaseOrderProductRef;
  quantity: number;
  unitCost: string;
}

export interface PurchaseOrderListItem {
  id: string;
  poNumber: string;
  supplierId: string;
  supplier: PurchaseOrderSupplierRef;
  status: PurchaseOrderStatus;
  totalAmount: string;
  createdAt: string;
  receivedAt: string | null;
  _count: { items: number };
}

export interface PurchaseOrderDetail {
  id: string;
  poNumber: string;
  supplierId: string;
  supplier: PurchaseOrderSupplierRef;
  status: PurchaseOrderStatus;
  totalAmount: string;
  createdById: string;
  createdBy: PurchaseOrderCreatedByRef;
  createdAt: string;
  receivedAt: string | null;
  items: PurchaseOrderItem[];
}
