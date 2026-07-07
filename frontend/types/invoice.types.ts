export type InvoiceStatus = "UNPAID" | "PARTIALLY_PAID" | "PAID";

export interface InvoiceCustomer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
}

export interface InvoiceProduct {
  id: string;
  name: string;
  sku: string;
}

export interface InvoiceSalesOrderItem {
  id: string;
  quantity: number;
  unitPrice: string;
  product: InvoiceProduct;
}

export interface InvoiceSalesOrder {
  id: string;
  orderNumber: string;
  customer: InvoiceCustomer;
  items: InvoiceSalesOrderItem[];
}

export interface InvoicePayment {
  id: string;
  amount: string;
  method: string;
  paidAt: string;
  recordedBy: {
    id: string;
    name: string;
    email: string;
  };
}

export interface InvoiceListItem {
  id: string;
  invoiceNumber: string;
  amount: string;
  amountPaid: string;
  status: InvoiceStatus;
  dueDate: string;
  createdAt: string;
  salesOrder: {
    id: string;
    orderNumber: string;
    customer: InvoiceCustomer;
  };
  _count: {
    payments: number;
  };
}

export interface InvoiceDetail {
  id: string;
  invoiceNumber: string;
  amount: string;
  amountPaid: string;
  status: InvoiceStatus;
  dueDate: string;
  createdAt: string;
  salesOrder: InvoiceSalesOrder;
  payments: InvoicePayment[];
}
