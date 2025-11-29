export interface ProductVariant {
  id: number;
  productId: number;
  packageQuantity: number;
  packageType?: string | null;
  price: string; // Decimal در Prisma → string در JSON
  discountPrice?: string | null; // Decimal در Prisma → string در JSON
  stock: number;
  expiryDate?: string | null;
  flavor?: string | null; // فیلد flavor از schema
  createdAt?: string;
  updatedAt?: string;
}
