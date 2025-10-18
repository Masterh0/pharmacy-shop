// dto/product.dto.ts
export interface CreateProductVariantDTO {
  packageQuantity: number;
  packageType?: string;
  price: number;
  discountPrice?: number;
  stock: number;
  expiryDate?: string; // ISO date string
}

export interface CreateProductDTO {
  sku: string;
  slug: string;
  name: string;
  description: string;
  imageUrl?: string;
  categoryId: number;
  brandId: number;
  isPrescriptionRequired?: boolean;
  isBlock: boolean;
  variants: CreateProductVariantDTO[];
}
export interface UpdateProductDTO extends Partial<CreateProductDTO> {}
