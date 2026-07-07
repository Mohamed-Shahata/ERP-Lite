export type SalesOrderStatus = "DRAFT" | "CONFIRMED" | "CANCELLED";

export interface SalesOrderCustomerRef {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
}

export interface SalesOrderProductRef {
  id: string;
  name: string;
  sku: string;
}

export interface SalesOrderCreatedByRef {
  id: string;
  name: string;
  email: string;
}

export interface SalesOrderItem {
  id: string;
  productId: string;
  product: SalesOrderProductRef;
  quantity: number;
  unitPrice: string;
}

export interface SalesOrderListItem {
  id: string;
  orderNumber: string;
  customerId: string;
  customer: SalesOrderCustomerRef;
  status: SalesOrderStatus;
  totalAmount: string;
  createdAt: string;
  confirmedAt: string | null;
  _count: { items: number };
}

export interface SalesOrderDetail {
  id: string;
  orderNumber: string;
  customerId: string;
  customer: SalesOrderCustomerRef;
  status: SalesOrderStatus;
  totalAmount: string;
  createdById: string;
  createdBy: SalesOrderCreatedByRef;
  createdAt: string;
  confirmedAt: string | null;
  items: SalesOrderItem[];
}
