"use client";

import type { Product } from "@/lib/types/product";
import type { ProductSort } from "@/lib/types/product-sort";
import { useState, useEffect } from "react";
import { SlidersHorizontal, ArrowUpDown, X } from "lucide-react";

import ProductsFilterBox from "./ProductsFilterBox";
import ProductsToolbar from "./ProductsToolbar";
import ProductsGrid from "./ProductsGrid";
import ProductsPagination from "./ProductsPagination";
import FilterSkeleton, {
  ProductsGridSkeleton,
  ToolbarSkeleton,
} from "./skeletonLoading/FilterSkeleton";

type Props = {
  title: string;
  products: Product[];
  sort: ProductSort;
  setSort: (s: ProductSort) => void;
  pagination: { totalPages: number; currentPage: number };
  setPage: (p: number) => void;
  brands: { id: number; name: string }[];
  isLoading?: boolean;
  isFiltering?: boolean;
  onClearFilters?: () => void;
  isMobile?: boolean;
};

export default function ProductsListingLayout({
  title,
  products,
  sort,
  setSort,
  pagination,
  setPage,
  brands,
  isLoading = false,
  isFiltering = false,
  onClearFilters,
}: Props) {
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [sortDrawerOpen, setSortDrawerOpen] = useState(false);

  useEffect(() => {
    if (filterDrawerOpen || sortDrawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [filterDrawerOpen, sortDrawerOpen]);

  const sortOptions = [
    { key: "newest", name: "جدیدترین" },
    { key: "bestseller", name: "پرفروش‌ترین" },
    { key: "cheapest", name: "ارزان‌ترین" },
    { key: "expensive", name: "گران‌ترین" },
    { key: "mostViewed", name: "پربازدیدترین" },
  ];

  return (
    <main className="w-full max-w-[1400px] mx-auto mt-4 lg:mt-8 px-3 lg:px-6 min-w-0 overflow-x-hidden">
      <div className="flex flex-col mb-4 lg:mb-8 text-center">
        <h1 className="text-lg lg:text-3xl font-bold text-[#0077B6] min-w-0 truncate">
          {title}
        </h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 relative">
        {/* ======== DESKTOP SIDEBAR ======== */}
        <div className="hidden lg:block w-[288px] shrink-0">
          {isLoading ? (
            <FilterSkeleton />
          ) : (
            <ProductsFilterBox brands={brands} onClear={onClearFilters} />
          )}
        </div>

        {/* ======== MOBILE FILTER BOTTOM SHEET ======== */}
        {filterDrawerOpen && (
          <div
            className="fixed inset-0 z-[100] bg-black/50 lg:hidden transition-opacity"
            onClick={() => setFilterDrawerOpen(false)}
          />
        )}
        <div
          className={`
            fixed bottom-0 right-0 left-0 z-[101] bg-white rounded-t-2xl shadow-2xl
            transition-transform duration-300 ease-out flex flex-col
            h-[85vh] lg:hidden
            ${filterDrawerOpen ? "translate-y-0" : "translate-y-full"}
          `}
        >
          <div className="flex items-center justify-between px-4 py-4 border-b shrink-0">
            <span className="font-bold text-base">فیلتر محصولات</span>
            <button onClick={() => setFilterDrawerOpen(false)} className="p-1">
              <X size={24} className="text-gray-500" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <ProductsFilterBox
              brands={brands}
              onApply={() => setFilterDrawerOpen(false)}
              onClear={onClearFilters}
              isMobile
            />
          </div>
        </div>

        {/* ======== MOBILE SORT BOTTOM SHEET ======== */}
        {sortDrawerOpen && (
          <div
            className="fixed inset-0 z-[100] bg-black/50 lg:hidden transition-opacity"
            onClick={() => setSortDrawerOpen(false)}
          />
        )}
        <div
          className={`
            fixed bottom-0 right-0 left-0 z-[101] bg-white rounded-t-2xl shadow-2xl
            transition-transform duration-300 ease-out flex flex-col
            lg:hidden
            ${sortDrawerOpen ? "translate-y-0" : "translate-y-full"}
          `}
        >
          <div className="flex items-center justify-between px-4 py-4 border-b shrink-0">
            <span className="font-bold text-base">مرتب‌سازی بر اساس</span>
            <button onClick={() => setSortDrawerOpen(false)} className="p-1">
              <X size={24} className="text-gray-500" />
            </button>
          </div>
          <div className="flex flex-col p-2">
            {sortOptions.map((option) => (
              <button
                key={option.key}
                onClick={() => {
                  setSort(option.key as ProductSort);
                  setSortDrawerOpen(false);
                }}
                className={`text-right px-4 py-3 text-sm rounded-lg transition-colors ${
                  sort === option.key
                    ? "bg-[#E0F7FA] text-[#0077B6] font-bold"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                {option.name}
              </button>
            ))}
          </div>
        </div>

        {/* ======== MAIN CONTENT ======== */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* تولبار دسکتاپ */}
          <div className="hidden lg:block mb-4">
            {isLoading ? (
              <ToolbarSkeleton />
            ) : (
              <ProductsToolbar sort={sort} setSort={setSort} />
            )}
          </div>

          {/* دکمه‌های فیلتر و مرتب‌سازی موبایل */}
          <div className="grid grid-cols-2 gap-3 lg:hidden mb-4">
            {isLoading ? (
              // نمایش اسکلتون برای دکمه‌های موبایل هنگام لودینگ اولیه
              <>
                <div className="h-11 bg-gray-100 rounded-xl animate-pulse"></div>
                <div className="h-11 bg-gray-100 rounded-xl animate-pulse"></div>
              </>
            ) : (
              <>
                <button
                  onClick={() => setFilterDrawerOpen(true)}
                  className="flex items-center justify-center gap-2 h-11 bg-white border border-gray-300 rounded-xl text-[13px] font-medium text-gray-700 shadow-sm"
                >
                  <SlidersHorizontal size={18} className="text-[#00B4D8]" />
                  فیلترها
                </button>
                <button
                  onClick={() => setSortDrawerOpen(true)}
                  className="flex items-center justify-center gap-2 h-11 bg-white border border-gray-300 rounded-xl text-[13px] font-medium text-gray-700 shadow-sm"
                >
                  <ArrowUpDown size={18} className="text-[#00B4D8]" />
                  مرتب‌سازی
                </button>
              </>
            )}
          </div>

          {/* شبکه محصولات */}
          {isLoading || isFiltering ? (
            <ProductsGridSkeleton />
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <p className="text-gray-500 mb-4">
                محصولی با این مشخصات یافت نشد.
              </p>
              <button
                onClick={onClearFilters}
                className="text-[#00B4D8] font-bold transition-colors hover:text-[#0077B6]"
              >
                پاک کردن فیلترها
              </button>
            </div>
          ) : (
            <ProductsGrid products={products} />
          )}

          {/* صفحه‌بندی */}
          {!isLoading &&
            !isFiltering &&
            products.length > 0 &&
            pagination.totalPages > 1 && (
              <ProductsPagination
                totalPages={pagination.totalPages}
                currentPage={pagination.currentPage}
                onPageChange={setPage}
              />
            )}
        </div>
      </div>
    </main>
  );
}
