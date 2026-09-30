// lib/types/variant.ts

export interface ProductImage {
  id: number;

  url: string;

  altText?: string | null;

  displayOrder: number;

  isPrimary: boolean;
}

export interface VariantAttribute {
  valueId: number;

  value: {
    id: number;

    value: string;

    attribute: {
      id: number;

      name: string;

      slug: string;
    };
  };
}

export interface ProductVariant {
  id: number;

  productId: number;

  sku?: string | null;

  barcode?: string | null;

  purchasePrice?: string | null;

  price: string;

  discountPrice?: string | null;

  stock: number;

  expiryDate?: string | null;

  images?: ProductImage[];

  attributes?: VariantAttribute[];
}
