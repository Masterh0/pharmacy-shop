// استفاده از ProductVariant از variant.ts برای جلوگیری از تکرار
import type { ProductVariant } from "./variant";

export interface Product {
  id: number;
  sku: string;
  slug: string;
  name: string;
  description: string;
  expiryDate?: string | null;
  imageUrl?: string | null; // ممکن است null باشد
  isBlock: boolean;
  brandId: number;
  categoryId: number;
  brand?: { id: number; name: string };
  category?: { id: number; name: string; slug?: string }; // slug ممکن است در category باشد
  variants?: ProductVariant[]; // ممکن است variants نداشته باشد
}
export interface ProductImage {
  id: number;
  url: string;
  displayOrder: number;
  isPrimary: boolean;
}
export interface ProductVariant {
  id: number;
  flavor?: string;
  packageQuantity?: number;
  packageType?: string;
  price: number;
  discountPrice?: number;
  stock: number;
  expiryDate?: string;
  images?: ProductImage[];
}
