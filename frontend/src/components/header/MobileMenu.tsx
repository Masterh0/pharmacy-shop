"use client";

import { useState, useEffect, useMemo } from "react";
import { Menu, X, ChevronLeft, ShoppingCart, Headphones } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { categoryApi } from "@/lib/api/category";
import Link from "next/link";
import { useCategoryStore } from "@/lib/stores/categoryStore";
import { useCart } from "@/lib/hooks/useAddToCart";

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  const { setSelectedCategory: setStoreCategory } = useCategoryStore();

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["header-categories"],
    queryFn: categoryApi.getAllWithChildren,
  });

  const { cart } = useCart();

  const itemCount = useMemo(() => {
    return cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  }, [cart]);

  const activeCategory = categories.find((cat) => cat.id === selectedCategory);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const closeMenu = () => {
    setIsOpen(false);
    setSelectedCategory(null);
  };

  const goBackToCategories = () => {
    setSelectedCategory(null);
  };

  const handleCategoryClick = (cat: (typeof categories)[number]) => {
    if (cat.subCategories?.length) {
      setSelectedCategory(cat.id);
      return;
    }

    setStoreCategory({
      id: cat.id,
      name: cat.name,
    });

    closeMenu();
  };

  return (
    <>
      {/* دکمه همبرگری */}
      <button
        onClick={() => setIsOpen(true)}
        aria-label="باز کردن منو"
        className="flex items-center justify-center p-1 text-gray-800 lg:hidden"
      >
        <Menu className="h-7 w-7" />
      </button>

      {/* بک‌دراپ */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[100] bg-black/50 lg:hidden"
          onClick={closeMenu}
          aria-hidden="true"
        />
      )}

      {/* منوی اصلی */}
      <div
        dir="rtl"
        className={`
          fixed right-0 top-0 z-[101] h-full w-[85%] max-w-[320px]
          transform overflow-y-auto bg-white p-5 shadow-2xl
          transition-transform duration-300 ease-in-out
          lg:hidden
          ${isOpen ? "translate-x-0" : "translate-x-full"}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* هدر */}
        <div className="mb-6 flex items-center justify-between border-b pb-4">
          {selectedCategory && activeCategory ? (
            <>
              <button
                type="button"
                onClick={goBackToCategories}
                className="flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-[#0077B6]"
              >
                <ChevronLeft className="h-5 w-5" />
                بازگشت
              </button>

              <span className="font-iranYekan text-lg font-bold text-[#0077B6]">
                {activeCategory.name}
              </span>
            </>
          ) : (
            <>
              <span className="font-iranYekan text-lg font-bold text-[#0077B6]">
                منوی دسترسی سریع
              </span>

              <button
                onClick={closeMenu}
                aria-label="بستن منو"
                className="rounded-full bg-gray-100 p-2 text-gray-500 hover:bg-gray-200"
              >
                <X className="h-5 w-5" />
              </button>
            </>
          )}
        </div>

        {/* ================= دسته اصلی ================= */}
        {!selectedCategory && (
          <>
            <div className="border-b border-gray-100 font-iranYekan">
              <div className="py-3 text-sm font-bold text-gray-800">
                دسته‌بندی محصولات
              </div>

              {isLoading ? (
                <div className="py-6 text-center text-sm text-gray-500">
                  در حال بارگذاری...
                </div>
              ) : categories.length === 0 ? (
                <div className="py-6 text-center text-sm text-gray-500">
                  دسته‌بندی‌ای یافت نشد.
                </div>
              ) : (
                <div className="flex flex-col">
                  {categories.map((cat) => {
                    const hasChildren = Boolean(cat.subCategories?.length);

                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => handleCategoryClick(cat)}
                        className="flex w-full items-center justify-between border-t border-gray-100 py-4 text-right text-sm font-medium text-gray-700 transition-colors hover:text-[#0077B6]"
                      >
                        <span>{cat.name}</span>

                        {hasChildren && (
                          <ChevronLeft className="h-4 w-4 shrink-0 text-gray-400" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* لینک‌های ثابت */}
            <hr className="my-4 border-gray-200" />

            <div className="flex flex-col gap-4 font-iranYekan">
              <Link
                href="/checkout/cart"
                onClick={closeMenu}
                className="flex items-center gap-3 text-gray-700 transition-colors hover:text-[#0077B6]"
              >
                <ShoppingCart className="h-5 w-5 shrink-0" />

                <span className="font-medium">سبد خرید</span>

                {itemCount > 0 && (
                  <span className="mr-auto flex h-6 min-w-6 items-center justify-center rounded-full bg-[#00B4D8] px-1 text-xs font-bold text-white">
                    {itemCount > 99 ? "99+" : itemCount}
                  </span>
                )}
              </Link>

              <Link
                href="/support"
                onClick={closeMenu}
                className="flex items-center gap-3 text-gray-700 transition-colors hover:text-[#0077B6]"
              >
                <Headphones className="h-5 w-5 shrink-0" />

                <span className="font-medium">پشتیبانی و امور مشتریان</span>
              </Link>
            </div>
          </>
        )}

        {/* ================= زیر دسته‌ها ================= */}
        {selectedCategory && activeCategory && (
          <div className="font-iranYekan">
            <div className="mb-4 rounded-xl bg-gray-50 px-4 py-3 text-sm font-medium text-gray-700">
              زیردسته‌های {activeCategory.name}
            </div>

            <div className="flex flex-col">
              {activeCategory.subCategories?.map((sub) => (
                <Link
                  key={sub.id}
                  href={`/categories/${sub.slug}`}
                  onClick={() => {
                    setStoreCategory({
                      id: sub.id,
                      name: sub.name,
                    });

                    closeMenu();
                  }}
                  className="border-b border-gray-100 py-4 text-sm text-gray-600 transition-colors hover:text-[#0077B6]"
                >
                  {sub.name}
                </Link>
              ))}
            </div>

            {/* مشاهده تمام محصولات دسته اصلی */}
            <Link
              href={`/categories/${activeCategory.slug}`}
              onClick={() => {
                setStoreCategory({
                  id: activeCategory.id,
                  name: activeCategory.name,
                });

                closeMenu();
              }}
              className="mt-5 flex items-center justify-center rounded-xl bg-[#0077B6] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#006494]"
            >
              مشاهده همه محصولات {activeCategory.name}
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
