// /lib/types/productInput.ts
export interface AttributeValueInput {
  attributeId: number;
  value: string;
}
export interface VariantImageInput {
  id?: number; // فقط برای عکس‌های موجود (edit)
  file?: File; // فقط برای عکس‌های جدید (create/upload)
  url?: string; // فقط برای عکس‌های موجود از سرور (edit)
  isPrimary: boolean;
  displayOrder: number;
}
export interface CreateProductVariantInput {
  sku: string;
  barcode?: string | null;
  purchasePrice?: string | number | null;
  price: string | number; // در FormData به string تبدیل می‌شود
  discountPrice?: string | number | null;
  stock: number;
  expiryDate?: string | null;
  packageQuantity: number;
  packageType?: string | null;
  attributes?: AttributeValueInput[];
  images?: File[]; // فقط فایل‌های جدید (create)
}

export interface CreateProductDTO {
  name: string;
  description?: string;
  shortDescription?: string;
  slug: string;
  metaTitle?: string;
  metaDescription?: string;
  brandId: number;
  categoryId: number;
  isBlock: boolean;
  image?: File | null; // تصویر اصلی محصول
  attributes?: AttributeValueInput[]; // ویژگی‌های سطح Product
  variants: CreateProductVariantInput[];
}
