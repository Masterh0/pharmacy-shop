"use client";

import { ChevronDown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { categoryApi } from "@/lib/api/category";
import { useState, useRef } from "react";
import Link from "next/link";
import MegaMenu from "./MegaMenu";
import { useCategoryStore } from "@/lib/stores/categoryStore";

export default function HeaderMenu() {
  const [activeId, setActiveId] = useState<number | null>(null);
  const { setSelectedCategory } = useCategoryStore();
  const navRef = useRef<HTMLElement>(null);
  const itemRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["header-categories"],
    queryFn: categoryApi.getAllWithChildren,
  });

  if (isLoading) {
    return (
      <div className="absolute left-1/2 -translate-x-1/2 top-[152px] w-[1180px] h-[52px] flex items-center justify-center text-gray-500">
        در حال بارگذاری...
      </div>
    );
  }

  if (!categories.length) {
    return (
      <div className="absolute left-1/2 -translate-x-1/2 top-[152px] w-[1180px] h-[52px] flex items-center justify-center text-gray-400">
        هیچ دسته‌ای یافت نشد
      </div>
    );
  }

  return (
    <nav
      ref={navRef}
      className="
        absolute left-1/2 -translate-x-1/2 top-[122px]
        flex flex-row justify-center items-start gap-[8px]
        w-[1180px] h-[52px]
        z-40
      "
    >
      {categories.map((cat) => {
        const isActive = activeId === cat.id;

        return (
          <div
            key={cat.id}
            ref={(el) => (itemRefs.current[cat.id] = el)}
            className="relative"
            onMouseEnter={() => setActiveId(cat.id)}
            onMouseLeave={() => setActiveId(null)}
          >
            <Link
              href={`/categories/${cat.slug}`}
              onClick={() =>
                setSelectedCategory({ id: cat.id, name: cat.name })
              }
              className={`
                flex items-center justify-center gap-[8px]
                w-[165px] h-[52px]
                rounded-[8px] transition-colors duration-200
                bg-white border border-transparent
                ${
                  isActive
                    ? "text-[#0077B6] border-[#0077B6] bg-blue-50 shadow-md"
                    : "text-[#434343] hover:bg-[#F5F5F5] hover:border-gray-200 hover:shadow-sm"
                }
              `}
            >
              <ChevronDown
                className={`w-[20px] h-[20px] transition-transform duration-200 ${
                  isActive ? "rotate-180" : ""
                }`}
              />

              <span className="font-iranYekan text-[16px] leading-[180%] font-medium">
                {cat.name}
              </span>
            </Link>

            {isActive && cat.subCategories && cat.subCategories.length > 0 && (
              <MegaMenu
                categories={cat.subCategories}
                parentElement={itemRefs.current[cat.id]}
                onClose={() => setActiveId(null)}
              />
            )}
          </div>
        );
      })}
    </nav>
  );
}
