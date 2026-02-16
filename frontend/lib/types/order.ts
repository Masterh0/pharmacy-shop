// lib/types/order.ts

/* =======================
   Order Status
======================= */
export type OrderStatus =
  | "PENDING"
  | "PAID"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELED";

/* =======================
   Refund Status
======================= */
export type RefundStatus = "NONE" | "PARTIALLY_REFUNDED" | "REFUNDED";

/* =======================
   Order Item
======================= */
export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  variantId: number;
  quantity: number;
  unitPrice: number;
  totalPrice: number;

  product: {
    id: number;
    name: string;
    slug: string;
    image: string;
    brand?: {
      name: string;
    };
    category?: {
      name: string;
    };
  };

  variant: {
    id: number;
    flavor?: string;
    size?: string;
    packageQuantity?: number;
  };
}

/* =======================
   Address
======================= */
export interface OrderAddress {
  id: number;
  fullName: string;
  phone: string;
  province: string;
  city: string;
  addressLine: string;
  postalCode: string;
}

/* =======================
   User
======================= */
export interface OrderUser {
  id: number;
  name: string;
  email: string;
  phone: string;
}

/* =======================
   Shipment
======================= */
export interface OrderShipment {
  id: number;
  status: string;
  trackingNumber?: string;
}

/* =======================
   Order
======================= */
export interface Order {
  id: number;
  userId: number;
  addressId: number;

  status: OrderStatus;

  /** 💰 Pricing */
  subtotal: number;
  discountTotal: number;
  taxAmount: number;
  shippingFee: number;
  finalTotal: number;

  discountCode?: string;
}
export interface OrderAddress {
  id: number;
  fullName: string;
  phone: string;
  province: string;
  city: string;
  addressLine: string;
  postalCode: string;
}

/* =======================
   User
======================= */
export interface OrderUser {
  id: number;
  name: string;
  email: string;
  phone: string;
}

/* =======================
   Shipment
======================= */
export interface OrderShipment {
  id: number;
  status: string;
  trackingNumber?: string;
}

/* =======================
   Order
======================= */
export interface Order {
  id: number;
  userId: number;
  addressId: number;

  status: OrderStatus;

  /** 💰 Pricing */
  subtotal: number;
  discountTotal: number;
  taxAmount: number;
  shippingFee: number;
  finalTotal: number;

  discountCode?: string;
  trackingCode?: string;

  /** 💳 Payment */
  paidAt?: string;

  /** 💸 Refund */
  refundStatus: RefundStatus;
  refundedAmount: number;
  refundedAt?: string;
  refundNote?: string;

  /** 🕒 Timestamps */
  createdAt: string;
  updatedAt: string;

  /** 📦 Relations */
  orderItems: OrderItem[];
  address?: OrderAddress;
  user?: OrderUser;
  shipment?: OrderShipment;
}
