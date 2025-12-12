// lib/api/search.ts
import api from "@/lib/axios";

// این SortType را از همان جایی که در CategoryProductsPage استفاده کرده‌اید، import کنید
// اگر در یک فایل مشترک نیست، می‌توانید آن را در اینجا تعریف کنید، اما بهتر است یک مکان مرکزی برای انواع داشته باشید.
export type SortType =
  | "newest"
  | "bestseller"
  | "cheapest"
  | "expensive"
  | "mostViewed";

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
  isBlock: boolean; // اضافه شده برای فیلتر کردن محصولات بلاک شده در فرانت
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

// تعریف یک اینترفیس برای پارامترهای تابع search
export interface SearchParams {
  q: string;
  page?: number;
  limit?: number;
  sort?: SortType;
}

export const searchApi = {
  /**
   * جستجو در محصولات، دسته‌ها و برندها با پشتیبانی از صفحه‌بندی و مرتب‌سازی.
   *
   * @param params یک شیء شامل q (اجباری)، page (اختیاری)، limit (اختیاری)، sort (اختیاری).
   * @returns یک Promise که به SearchResponse (شامل محصولات، دسته‌ها، برندها و تعداد کل) تبدیل می‌شود.
   */
  async search(params: SearchParams): Promise<SearchResponse> {
    const { data } = await api.get("/search", {
      params: params, // تمامی پارامترها را به بک‌اند ارسال می‌کنیم
    });
    return data;
  },
};
