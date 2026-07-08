export type MovementType = "IN" | "OUT" | "ADJUSTMENT";
export type ReferenceType = "PURCHASE_ORDER" | "SALES_ORDER" | "MANUAL";

export interface StockMovementProductRef {
  id: string;
  sku: string;
  name: string;
}

export interface StockMovementUserRef {
  id: string;
  name: string;
  email: string;
}

export interface StockMovement {
  id: string;
  productId: string;
  product: StockMovementProductRef;
  type: MovementType;
  quantity: number;
  referenceType: ReferenceType;
  referenceId: string | null;
  note: string | null;
  createdById: string;
  createdBy: StockMovementUserRef;
  createdAt: string;
}
