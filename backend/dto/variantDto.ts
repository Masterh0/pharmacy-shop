export interface CreateVariantDTO {
  productId: number;
  packageQuantity: number;
  packageType?: string;
  price: number;
  discountPrice?: number;
  stock: number;
  expiryDate?: string;
  flavor?: string;
  images?: string[];
  existingImages?: string[]; // ✅ optional
}

export interface UpdateVariantDTO extends Partial<CreateVariantDTO> {}
