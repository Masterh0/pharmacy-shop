export interface CreateVariantDTO {
  productId: number;
  packageQuantity: number;
  packageType?: string;
  price: number;
  discountPrice?: number;
  stock: number;
  expiryDate?: string;
  flavor?: string;
}

export interface UpdateVariantDTO extends Partial<CreateVariantDTO> { }
