// /lib/types/productInput.ts
export interface CreateProductVariantInput {
  packageQuantity: number;
  packageType?: string | null;
  price: string | number; // می‌تواند string یا number باشد (در FormData به string تبدیل می‌شود)
  discountPrice?: string | number | null;
  stock: number;
  expiryDate?: string | null;
  flavor?: string | null; // فیلد flavor از schema
}

export interface CreateProductDTO {
  sku: string;
  slug: string;
  name: string;
  description?: string;
  expiryDate?: string | null;
  brandId: number;
  categoryId: number;
  isBlock: boolean;
  image?: File | null;
  variants: CreateProductVariantInput[];
}
