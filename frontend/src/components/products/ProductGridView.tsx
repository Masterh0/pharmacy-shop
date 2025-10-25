"use client";
import ProductsToolbar from "./ProductsToolbar";
import ProductsGrid from "./ProductsGrid";
import ProductsPagination from "./ProductsPagination";

type SortType = "newest" | "bestseller" | "cheapest" | "expensive";

type ProductGridViewProps = {
  title: string;
  products: {
    id: number;
    name: string;
    price?: number;
    image?: string;
  }[];
  sort: SortType;
  setSort: (sort: SortType) => void;
};

export default function ProductGridView({
  title,
  products,
  sort,
  setSort,
}: ProductGridViewProps) {
  return (
    <div className="flex flex-col items-center w-full mt-12 font-iranYekan">
      {/* 🔹 عنوان کتگوری دینامیک */}
      <h2 className="text-[#0077B6] text-3xl font-bold mb-8">{title}</h2>

      {/* 👇 اینجا props درست پاس داده می‌شن */}
      <ProductsToolbar sort={sort} setSort={setSort} />

      <ProductsGrid products={products} />
      <ProductsPagination totalPages={5} currentPage={1} />
    </div>
  );
}
