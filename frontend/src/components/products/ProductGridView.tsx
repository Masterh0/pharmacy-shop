"use client";
import { useEffect } from "react";
import ProductsToolbar from "./ProductsToolbar";
import ProductsGrid from "./ProductsGrid";
import ProductsPagination from "./ProductsPagination";
import ProductsFilterBox from "./ProductsFilterBox";
type Variant = {
  id: number;
  productId: number;
  packageQuantity: number;
  packageType: string;
  price: string; // از API رشته میاد، ولی در UI می‌تونیم با Number() استفاده کنیم
  discountPrice?: string;
  stock: number;
  expiryDate?: string | null;
};

// 🧩 Category (برگشتی از API داخل product)
type Category = {
  id: number;
  name: string;
  slug: string;
  parentId?: number | null;
  createdAt?: string;
  updatedAt?: string;
};

// 🧩 Product (نهایی و منطبق با API)
type Product = {
  id: number;
  name: string;
  slug: string;
  sku?: string | null;
  description?: string;
  imageUrl?: string;
  price: string | number; // server returns string, UI converts to number
  categoryId?: number;
  brandId?: number;
  category?: Category;
  variants?: Variant[]; // ✅ اختیاری چون بعضی‌ها ممکنه نداشته باشن
  soldCount?: number;
  viewCount?: number;
  expiryDate?: string | null;
  isBlock?: boolean;
  createdAt?: string;
  updatedAt?: string;
};
type SortType =
  | "newest"
  | "bestseller"
  | "cheapest"
  | "expensive"
  | "mostViewed";

type ProductGridViewProps = {
  title: string;
  products: Product[];
  sort: SortType;
  setSort: (sort: SortType) => void;
  pagination: {
    totalPages: number;
    currentPage: number;
  };
  setPage?: (page: number) => void;
};

export default function ProductGridView({
  title,
  products,
  sort,
  setSort,
  pagination,
  setPage,
}: ProductGridViewProps) {
  // ✅ ذخیره sort در LocalStorage
  useEffect(() => {
    localStorage.setItem("productSort", sort);
  }, [sort]);

  return (
    <div className="flex flex-row w-full  ">
      {/* ستون فیلتر سمت راست */}
      <ProductsFilterBox />

      {/* ستون محصولات */}
      <div className="flex-1 flex flex-col items-center">
        <h2 className="text-[#0077B6] text-3xl font-bold mb-8">{title}</h2>
        <ProductsToolbar sort={sort} setSort={setSort} />
        <ProductsGrid products={products} />
        {pagination && (
          <ProductsPagination
            totalPages={pagination.totalPages}
            currentPage={pagination.currentPage}
            onPageChange={setPage}
          />
        )}
      </div>
    </div>
  );
}
