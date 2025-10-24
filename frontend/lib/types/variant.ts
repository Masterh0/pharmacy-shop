export interface ProductVariant {
  id: number;
  productId: number;
  packageQuantity: number;
  packageType: string;
  price: number;
  discountPrice?: number | null;
  stock: number;
  expiryDate?: string | null;
  createdAt?: string;
  updatedAt?: string;
}
