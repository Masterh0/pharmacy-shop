import { Product } from "./product";

export interface Brand {
  id: number;
  name: string;
  slug: string;
  count?: number;
  createdAt: string;
  updatedAt: string;
  products?: Product[];
}

export interface CreateBrandDTO {
  name: string;
  slug?: string;
}
