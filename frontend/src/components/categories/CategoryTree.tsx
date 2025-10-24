"use client";
import { Category } from "@/lib/api/category";
import { useCategories } from "../../../lib/hooks/useCategories";

function CategoryItem({
  category,
  depth = 0,
}: {
  category: Category;
  depth?: number;
}) {
  return (
    <div className="ml-4">
      <div className="py-1" style={{ marginLeft: depth * 16 }}>
        ▸ {category.name}
      </div>
      {category.subCategories?.length && (
        <div>
          {category.subCategories.map((sub) => (
            <CategoryItem key={sub.id} category={sub} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function CategoryTree() {
  const { data, isPending } = useCategories();

  if (isPending) return <div>در حال بارگذاری...</div>;

  return (
    <div className="bg-gray-50 p-4 rounded shadow">
      <h2 className="text-lg font-semibold mb-3">دسته‌ها</h2>
      {data?.map((cat) => (
        <CategoryItem key={cat.id} category={cat} />
      ))}
    </div>
  );
}
