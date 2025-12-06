export interface CartItem {
  id: number;
  cartId: number;
  productId: number;
  variantId: number;
  quantity: number;
  priceAtAdd: string; // Decimal → string in JSON

  product: {
    id: number;
    name: string;
    imageUrl: string | null;
    price: string | null; // Product.price (Decimal?) 
    brandId: number;
    categoryId: number;
  };

  variant: {
    id: number;
    productId: number;
    packageQuantity: number;
    packageType: string | null;
    price: string;              // Decimal(12,2)
    discountPrice: string | null; // Decimal?
    stock: number;
    expiryDate: string | null;
    flavor: string | null;
  };
}