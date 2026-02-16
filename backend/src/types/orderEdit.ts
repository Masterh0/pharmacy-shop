// src/types/orderEdit.ts

export enum OrderEditAction {
  ITEM_REMOVED = "ITEM_REMOVED",
  ITEM_ADDED = "ITEM_ADDED",
  QUANTITY_CHANGED = "QUANTITY_CHANGED",
  PRICE_ADJUSTED = "PRICE_ADJUSTED",
  SHIPPING_CHANGED = "SHIPPING_CHANGED"
}

export interface OrderItemEditPayload {
  orderId: number;
  itemId?: number;          // برای UPDATE/REMOVE
  productId?: number;       // برای ADD
  action: "ADD" | "UPDATE" | "REMOVE";
  quantity?: number;        // برای ADD/UPDATE
  reason: string;           // دلیل تغییر (اجباری)
}

export interface OrderEditValidation {
  isValid: boolean;
  error?: string;
  requiresCustomerApproval?: boolean;
  refundAmount?: number;
  newTotal?: number;
}

export interface OrderLogEntry {
  id: number;
  action: OrderEditAction;
  description: string;
  performedBy: number;
  adminName?: string;
  oldTotal?: number;
  newTotal?: number;
  amountChanged?: number;
  itemId?: number;
  oldQuantity?: number;
  newQuantity?: number;
  createdAt: Date;
}
