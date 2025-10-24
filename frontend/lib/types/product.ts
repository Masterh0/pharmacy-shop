// /lib/types/product.ts
export interface ProductVariant {
  id: number;
  productId: number;
  packageQuantity: number;
  packageType?: string | null;
  price: string; // Decimal در Prisma => در API معمولا string
  discountPrice?: string | null;
  stock: number;
  expiryDate?: string | null;
}

export interface Product {
  id: number;
  sku: string;
  slug: string;
  name: string;
  description: string;
  expiryDate?: string | null;
  imageUrl: string;
  isBlock: boolean;
  brandId: number;
  categoryId: number;
  brand?: { id: number; name: string };
  category?: { id: number; name: string };
  variants: ProductVariant[];
}
