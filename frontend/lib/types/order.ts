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
  productId: number | null;
  variantId: number | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;

  // snapshot fields (مستقیم روی OrderItem ذخیره شده)
  productName: string;
  brandName?: string | null;
  categoryName?: string | null;
  imageUrl?: string | null;
  sku?: string | null;
  variantAttributesSummary?: string | null;

  // روابط (ممکنه null باشن اگه محصول حذف شده)
  product?: {
    id: number;
    name: string;
    slug?: string;
    imageUrl?: string | null;
    brand?: { name: string };
    category?: { name: string };
  } | null;

  variant?: {
    id: number;
    sku?: string | null;
    stock?: number;
  } | null;
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
  street?: string;
  notes?: string;
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
  trackingNumber?: string | null;
  deliveredAt?: string | null;
}

/* =======================
   Order
======================= */
export interface Order {
  id: number;
  userId: number | null;
  addressId: number | null;

  status: OrderStatus;

  /** 💰 Pricing */
  subtotal: number;
  discountTotal: number;
  taxAmount: number;
  shippingFee: number;
  finalTotal: number;

  discountCode?: string | null;
  trackingCode?: string | null;

  /** 🗒️ Admin */
  adminNotes?: string | null;

  /** 💳 Payment */
  paidAt?: string | null;

  /** 💸 Refund */
  refundStatus: RefundStatus;
  refundedAmount: number;
  refundedAt?: string | null;
  refundNote?: string | null;

  /** 🕒 Timestamps */
  createdAt: string;
  updatedAt: string;

  /** 📦 Relations */
  orderItems: OrderItem[];
  address?: OrderAddress | null;
  user?: OrderUser | null;
  shipment?: OrderShipment | null;
}

/* =======================
   API Response Types
======================= */
export interface OrdersApiResponse {
  orders: Order[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
