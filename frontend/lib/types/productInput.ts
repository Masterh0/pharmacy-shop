// /lib/types/productInput.ts
export interface CreateProductVariantInput {
  packageQuantity: number;
  packageType?: string | null;
  price: number;
  discountPrice?: number | null;
  stock: number;
  expiryDate?: string | null;
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
