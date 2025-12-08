export interface Order {
  id: number;
  userId: number;
  addressId: number;
  subtotal: string;
  discountTotal: string;
  shippingFee: string;
  finalTotal: string;
  status: string;
  paidAt?: string;
  createdAt: string;
  orderItems: Array<{
    id: number;
    productId: number;
    variantId: number;
    quantity: number;
    unitPrice: string;
    totalPrice: string;
    product?: {
      name: string;
      imageUrl?: string;
    };
    variant?: {
      flavor?: string;
      packageQuantity?: number;
    };
  }>;
}
