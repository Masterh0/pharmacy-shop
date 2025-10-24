"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";
import MegaMenu from "./MegaMenu";
import { useQuery } from "@tanstack/react-query";
import { categoryApi, Category } from "@/lib/api/category";
import Link from "next/link";
export default function HeaderMenu() {
  const [activeId, setActiveId] = useState<number | null>(null);

  // 🟢 دریافت داده واقعی
  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["menu-categories"],
    queryFn: categoryApi.getAllWithChildren,
  });

  if (isLoading) {
    return (
      <div
        className="absolute left-1/2 -translate-x-1/2 top-[152px]
        flex items-center justify-center w-[1180px] h-[52px] text-gray-500"
      >
        در حال بارگذاری...
      </div>
    );
  }

  return (
    <div
      className="
        absolute left-1/2 -translate-x-1/2 top-[152px]
        flex flex-row justify-center items-start gap-[8px]
        w-[1180px] h-[52px]
      "
    >
      {categories.map((item: Category) => {
        const isActive = activeId === item.id;

        return (
          <div
            key={item.id}
            className="relative"
            onMouseEnter={() => setActiveId(item.id)}
            onMouseLeave={() => setActiveId(null)}
          >
            <Link
            href={`/categories/${item.id}`}
              className={`
                flex items-center justify-center gap-[8px]
                px-[8px] py-[8px] w-[165px] h-[52px]
                rounded-[8px]
                transition-colors duration-200
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
                {item.name}
              </span>
            </Link>

            {/* Dropdown سطح دوم/سوم */}
            {isActive &&
              item.subCategories &&
              item.subCategories.length > 0 && (
                <MegaMenu categories={item.subCategories ?? []} />
              )}
          </div>
        );
      })}
    </div>
  );
}
