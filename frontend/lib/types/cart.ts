// lib/types/cart.ts

export interface CartItemVariant {
  id: number;
  sku: string | null;
  price: number;
  discountPrice: number | null;
  stock: number;
  images: {
    id: number;
    url: string;
    displayOrder: number;
    isPrimary: boolean;
  }[];
  attributes: {
    valueId: number;
    value: {
      id: number;
      value: string;
      attribute: { id: number; name: string; slug: string };
    };
  }[];
}

export interface CartItemProduct {
  id: number;
  name: string;
  imageUrl: string | null;
  price: string | null;
  brandId: number;
  categoryId: number;
}

export interface CartItem {
  id: number;
  cartId: number;
  productId: number;
  variantId: number;
  quantity: number;
  priceAtAdd: number;
  
  product: CartItemProduct;
  variant: CartItemVariant;
}

export interface Cart {
  id: number;
  userId?: number | null;
  sessionId?: string | null;
  items: CartItem[];
}
