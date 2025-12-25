"use client";

import { Category } from "@/lib/types/category";
import Link from "next/link";
import { useCategoryStore } from "@/lib/stores/categoryStore";
import { useEffect, useRef } from "react";

interface MegaMenuProps {
  categories: Category[];
  parentElement?: HTMLDivElement | null;
  parentRect?: DOMRect | undefined;
  onClose: () => void;
}

export default function MegaMenu({
  categories,
  parentElement,
  parentRect,
  onClose,
}: MegaMenuProps) {
  const { setSelectedCategory } = useCategoryStore();
  const menuRef = useRef<HTMLDivElement>(null);

  // بستن مگا منو با کلیک خارج از آن
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  // مرتب‌سازی دسته‌ها بر اساس تعداد زیردسته‌ها (بیشترین اول)
  const sortedCategories = [...categories].sort((a, b) => {
    const aSubCount = a.subCategories?.length || 0;
    const bSubCount = b.subCategories?.length || 0;
    return bSubCount - aSubCount;
  });

  // دسته‌بندی‌ها را به دو ستون تقسیم می‌کنیم
  const firstColumn = sortedCategories.slice(
    0,
    Math.ceil(sortedCategories.length / 2)
  );
  const secondColumn = sortedCategories.slice(
    Math.ceil(sortedCategories.length / 2)
  );

  if (categories.length === 0) return null;

  // محاسبه موقعیت دقیق بر اساس parent
  const getMenuPosition = () => {
    if (!parentRect || !parentElement) return {};

    const menuWidth = 660; // عرض ثابت مگا منو (165 * 4)
    const windowWidth = window.innerWidth;

    // مرکز parent رو پیدا کن
    const parentCenter = parentRect.left + parentRect.width / 2;
    const menuLeft = Math.max(
      0,
      Math.min(parentCenter - menuWidth / 2, windowWidth - menuWidth)
    );

    return {
      left: `${menuLeft}px`,
      top: `${parentRect.bottom + 4}px`, // 4px فاصله از parent
      width: `${menuWidth}px`,
    };
  };

  return (
    <div
      ref={menuRef}
      className="
        absolute bg-white border border-gray-200
        shadow-2xl rounded-[12px] z-[999]
        animate-[megaMenuSlide_0.25s_cubic-bezier(0.25,0.46,0.45,0.94)]
        overflow-hidden
        backdrop-blur-[8px]
        before:absolute before:inset-0 before:bg-white/95
      "
      style={getMenuPosition()}
      onMouseEnter={(e) => e.stopPropagation()}
      onMouseLeave={onClose}
    >
      {/* مثلث اتصال به parent */}
      <div
        className="absolute -top-[8px] w-0 h-0 border-l-[8px] border-r-[8px] border-b-[8px] border-transparent border-b-white z-10 shadow-lg"
        style={{
          left: parentRect ? `${parentRect.width / 2 - 8}px` : "50%",
          transform: parentRect ? "translateX(-50%)" : "none",
        }}
      />

      <div className="relative px-6 py-8">
        <div className="flex gap-12">
          {/* ستون اول */}
          <div className="flex-1 min-w-[300px]">
            {firstColumn.map((category) => (
              <CategorySection
                key={category.id}
                category={category}
                setSelectedCategory={setSelectedCategory}
                onCategoryClick={onClose}
              />
            ))}
          </div>

          {/* ستون دوم */}
          <div className="flex-1 min-w-[300px]">
            {secondColumn.map((category) => (
              <CategorySection
                key={category.id}
                category={category}
                setSelectedCategory={setSelectedCategory}
                onCategoryClick={onClose}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// کامپوننت CategorySection (بدون تغییر)
function CategorySection({
  category,
  setSelectedCategory,
  onCategoryClick,
}: {
  category: Category;
  setSelectedCategory: (category: { id: number; name: string }) => void;
  onCategoryClick: () => void;
}) {
  const hasSubCategories =
    category.subCategories && category.subCategories.length > 0;

  return (
    <div className="mb-8 last:mb-0">
      {/* عنوان دسته اصلی */}
      <Link
        href={`/categories/${category.slug}`}
        onClick={() => {
          setSelectedCategory({ id: category.id, name: category.name });
          onCategoryClick();
        }}
        className="
          block text-[15px] font-bold text-[#242424] 
          mb-4 pb-3 border-b border-gray-100
          hover:text-[#0077B6] transition-all duration-250
          group relative cursor-pointer
        "
      >
        <span className="flex  items-center justify-between">
          {category.name}
          {hasSubCategories && (
            <span className="text-[11px] text-gray-400 bg-gray-100 px-2 py-1 rounded-full font-medium">
              {category.subCategories.length}
            </span>
          )}
        </span>

        {/* خط زیرین hover */}
        <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-[#0077B6] to-[#00A8E8] transition-all duration-300 group-hover:w-full" />
      </Link>

      {/* زیردسته‌ها */}
      {hasSubCategories && (
        <ul className="flex flex-col gap-2">
          {category.subCategories.map((sub) => (
            <li key={sub.id}>
              <Link
                href={`/categories/${sub.slug}`}
                onClick={() => {
                  setSelectedCategory({ id: sub.id, name: sub.name });
                  onCategoryClick();
                }}
                className="
            inline-flex
            bg-gray-100
            text-[#555]
            text-[13px]
            font-medium
            rounded-full
            py-1.5
            px-4
            hover:bg-[#0077B6]
            hover:text-white
            transition-colors
          "
              >
                {sub.name}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
