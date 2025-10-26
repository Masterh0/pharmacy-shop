"use client";

import { ChevronDown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { categoryApi, Category } from "@/lib/api/category";
import { useState } from "react";
import Link from "next/link";
import MegaMenu from "./MegaMenu";

export default function HeaderMenu() {
  const [activeId, setActiveId] = useState<number | null>(null);

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
      className="
        absolute left-1/2 -translate-x-1/2 top-[122px]
        flex flex-row justify-center items-start gap-[8px]
        w-[1180px] h-[52px]
      "
    >
      {categories.map((cat) => {
        const isActive = activeId === cat.id;
        return (
          <div
            key={cat.id}
            className="relative"
            onMouseEnter={() => setActiveId(cat.id)}
            onMouseLeave={() => setActiveId(null)}
          >
            <Link
              href={`/categories/${cat.id}`}
              className={`
                flex items-center justify-center gap-[8px]
                px-[8px] py-[8px] w-[165px] h-[52px]
                rounded-[8px] transition-colors duration-200
                bg-white ${!isActive && "hover:bg-[#F5F5F5]"}
              `}
            >
              <ChevronDown
                className={`w-[20px] h-[20px] ${
                  isActive ? "text-[#0077B6]" : "text-[#434343]"
                }`}
              />
              <span
                className={`font-iranYekan text-[16px] leading-[180%] ${
                  isActive ? "text-[#0077B6]" : "text-[#434343]"
                }`}
              >
                {cat.name}
              </span>
            </Link>

            {/* Dropdown sub-levels */}
            {isActive && cat.subCategories && cat.subCategories.length > 0 && (
              <MegaMenu categories={cat.subCategories} />
            )}
          </div>
        );
      })}
    </nav>
  );
}
