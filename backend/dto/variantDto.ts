export interface ExistingImageDTO {
  id: number;
  url: string;
  displayOrder: number;
  isPrimary: boolean;
}

export interface CreateVariantDTO {
  productId: number;
  sku?: string;
  barcode?: string;
  purchasePrice?: number;
  price: number;
  discountPrice?: number;
  stock: number;
  expiryDate?: string;

  attributes?: number[];

  images?: string[];

  existingImages?: ExistingImageDTO[]; // ✅ آرایه
}

export interface UpdateVariantDTO extends Partial<CreateVariantDTO> {}