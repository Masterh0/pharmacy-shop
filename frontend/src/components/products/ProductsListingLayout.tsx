"use client";

import type { Product } from "@/lib/types/product";
import type { ProductSort } from "@/lib/types/product-sort";

import ProductsFilterBox from "./ProductsFilterBox";
import ProductsToolbar from "./ProductsToolbar";
import ProductsGrid from "./ProductsGrid";
import ProductsPagination from "./ProductsPagination";

type Props = {
  title: string;
  products: Product[];
  sort: ProductSort;
  setSort: (s: ProductSort) => void;

  pagination: {
    totalPages: number;
    currentPage: number;
  };
  setPage: (p: number) => void;

  brands: {
    id: number;
    name: string;
  }[];
};

export default function ProductsListingLayout({
  title,
  products,
  sort,
  setSort,
  pagination,
  setPage,
  brands, // ✅ THIS WAS MISSING
}: Props) {
  return (
    <main className="w-full max-w-[1400px] mx-auto mt-8">
      <h1 className="text-3xl font-bold text-[#0077B6] mb-8 text-center">
        {title}
      </h1>

      <div className="flex gap-8">
        {/* ✅ URL‑controlled */}
        <ProductsFilterBox brands={brands} />

        <div className="flex-1 flex flex-col">
          <ProductsToolbar sort={sort} setSort={setSort} />

          <ProductsGrid products={products} />

          <ProductsPagination
            totalPages={pagination.totalPages}
            currentPage={pagination.currentPage}
            onPageChange={setPage}
          />
        </div>
      </div>
    </main>
  );
}
