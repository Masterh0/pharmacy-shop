// lib/types/product.ts

import type { ProductVariant } from "./variant";

export interface ProductAttribute {
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

export interface Product {
  id: number;

  slug: string;
  name: string;

  description: string;
  shortDescription?: string | null;

  metaTitle?: string | null;
  metaDescription?: string | null;

  imageUrl?: string | null;

  isBlock: boolean;

  brandId: number;
  categoryId: number;

  brand?: {
    id: number;
    name: string;
  };

  category?: {
    id: number;
    name: string;
    slug: string;
  };

  soldCount: number;
  viewCount: number;
  wishlistCount: number;

  attributes?: ProductAttribute[];

  variants?: ProductVariant[];

  displayVariant?: ProductVariant;
  effectivePrice?: number;

  createdAt?: string;
  updatedAt?: string;
}