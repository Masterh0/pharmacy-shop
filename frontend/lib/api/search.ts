import api from "@/lib/axios";

export interface SearchProduct {
  id: number;
  name: string;
  slug: string;
  imageUrl: string | null;
  brand: {
    id: number;
    name: string;
    slug: string;
  };
  category: {
    id: number;
    name: string;
    slug: string;
  };
  variants: {
    price: string;
    discountPrice: string | null;
  }[];
}

export interface SearchCategory {
  id: number;
  name: string;
  slug: string;
  parentId: number | null;
}

export interface SearchBrand {
  id: number;
  name: string;
  slug: string;
}

export interface SearchResponse {
  products: SearchProduct[];
  categories: SearchCategory[];
  brands: SearchBrand[];
  total: number;
}

export const searchApi = {
  /** جستجو در محصولات، دسته‌ها و برندها */
  async search(q: string): Promise<SearchResponse> {
    const { data } = await api.get("/search", {
      params: { q }
    });
    return data;
  },
};
