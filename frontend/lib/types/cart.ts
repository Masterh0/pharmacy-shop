export interface Cart {
  id: number;
  userId?: number;
  sessionId?: string;
  createdAt: string;
  updatedAt: string;
  items: CartItem[];
}

export interface CartItem {
  id: number;
  cartId: number;
  productId: number;
  variantId: number;
  quantity: number;
  priceAtAdd: string; // Decimal در Prisma → string در JSON
  product?: {
    id: number;
    name: string;
    thumbnail: string;
  };
  variant?: {
    id: number;
    title: string;
    stock: number;
  };
}
