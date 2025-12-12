"use client";

import ProductGridView from "@/src/components/products/ProductGridView";
import type { Product } from "@/lib/types/product";
export type SortType =
  | "newest"
  | "bestseller"
  | "cheapest"
  | "expensive"
  | "mostViewed";
type Props = {
  title: string;
  products: Product[];
  sort: SortType;
  setSort: (s: SortType) => void;
  pagination: {
    totalPages: number;
    currentPage: number;
  };
  setPage: (p: number) => void;
};

export default function ProductsListingLayout({
  title,
  products,
  sort,
  setSort,
  pagination,
  setPage,
}: Props) {
  return (
    <main className="w-full flex flex-col items-center mt-8">
      <h1 className="text-3xl font-bold text-[#0077B6] mb-6">{title}</h1>

      <ProductGridView
        title=""
        products={products}
        sort={sort}
        setSort={setSort}
        pagination={pagination}
        setPage={setPage}
      />
    </main>
  );
}
