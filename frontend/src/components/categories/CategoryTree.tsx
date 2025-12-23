"use client";

import { useState } from "react";
import Link from "next/link";
import { Category } from "@/lib/api/category";
import { useCategories } from "@/lib/hooks/useCategories";

type CategoryItemProps = {
  category: Category;
  depth?: number;
};

function CategoryItem({ category, depth = 0 }: CategoryItemProps) {
  const [open, setOpen] = useState(false);
  const hasChildren = (category.subCategories?.length ?? 0) > 0;

  return (
    <div>
      <div
        className="flex items-center justify-between py-1 rounded hover:bg-gray-100"
        style={{ paddingRight: depth * 16 }}
      >
        {/* toggle + name */}
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => hasChildren && setOpen((prev) => !prev)}
        >
          <span className="text-gray-400 text-sm w-3">
            {hasChildren ? (open ? "▾" : "▸") : "•"}
          </span>

          <span className="text-sm text-gray-800">
            {category.name}
          </span>
        </div>

        {/* view products */}
        <Link
          href={`/manager/products/category/${category.slug}`}
          className="text-xs text-blue-600 hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          مشاهده
        </Link>
      </div>

      {hasChildren && open && (
        <div className="border-r border-gray-200 mr-2 pr-2">
          {category.subCategories!.map((sub) => (
            <CategoryItem
              key={sub.id}
              category={sub}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function CategoryTree() {
  const { data, isPending } = useCategories();

  if (isPending) {
    return (
      <div className="p-4 text-sm text-gray-500">
        در حال بارگذاری دسته‌ها...
      </div>
    );
  }

  return (
    <aside className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      <h2 className="text-base font-semibold mb-3">
        📂 دسته‌بندی‌ها
      </h2>

      <div className="space-y-1">
        {data?.map((cat) => (
          <CategoryItem key={cat.id} category={cat} />
        ))}
      </div>
    </aside>
  );
}
