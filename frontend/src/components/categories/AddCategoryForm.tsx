"use client";

import {
  useCategories,
  useCreateCategory,
} from "../../../lib/hooks/useCategories";

import { useCategoryStore } from "../../../lib/stores/categoryStore";

import type { Category } from "../../../lib/types/category";

import { useMemo, useState } from "react";

export default function AddCategoryForm() {
  const { formData, setField, resetForm } = useCategoryStore();

  const { data: categories = [] } = useCategories();

  const createMutation = useCreateCategory();

  const [parentSearch, setParentSearch] = useState("");

  const [showParentResults, setShowParentResults] = useState(false);

  const flattenCategories = (
    cats: Category[],
    level = 0,
  ): { category: Category; level: number }[] => {
    return cats.flatMap((cat) => [
      {
        category: cat,
        level,
      },
      ...(cat.subCategories
        ? flattenCategories(cat.subCategories, level + 1)
        : []),
    ]);
  };

  const categoryOptions = useMemo(
    () => flattenCategories(categories),
    [categories],
  );

  const filteredCategories = useMemo(() => {
    const search = parentSearch.trim().toLowerCase();

    if (!search) {
      return categoryOptions.slice(0, 20);
    }

    return categoryOptions
      .filter(({ category }) => category.name.toLowerCase().includes(search))
      .slice(0, 20);
  }, [categoryOptions, parentSearch]);

  const selectedParent = useMemo(
    () =>
      categoryOptions.find(({ category }) => category.id === formData.parentId)
        ?.category,
    [categoryOptions, formData.parentId],
  );

  const handleSelectParent = (category: Category) => {
    setField("parentId", category.id);

    setParentSearch(category.name);

    setShowParentResults(false);
  };

  const handleClearParent = () => {
    setField("parentId", null);

    setParentSearch("");

    setShowParentResults(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    createMutation.mutate(formData, {
      onSuccess: () => {
        resetForm();
        setParentSearch("");
      },
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md p-4 bg-white rounded shadow space-y-4"
      dir="rtl"
    >
      {/* نام دسته */}
      <div>
        <label className="block mb-1 text-sm font-medium">نام دسته</label>

        <input
          type="text"
          value={formData.name}
          onChange={(e) => setField("name", e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
          required
        />
      </div>

      {/* Slug */}
      <div>
        <label className="block mb-1 text-sm font-medium">Slug</label>

        <input
          type="text"
          value={formData.slug ?? ""}
          onChange={(e) =>
            setField(
              "slug",
              e.target.value
                .toLowerCase()
                .replace(/\s+/g, "-")
                .replace(/[^a-z0-9-]/g, ""),
            )
          }
          placeholder="sports-supplements"
          dir="ltr"
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
          required
        />

        <p className="text-xs text-gray-400 mt-1">
          برای آدرس صفحه دسته استفاده می‌شود.
        </p>
      </div>

      {/* دسته والد */}
      <div className="relative">
        <label className="block mb-1 text-sm font-medium">دسته والد</label>

        <div className="relative">
          <input
            type="text"
            value={parentSearch}
            onChange={(e) => {
              const value = e.target.value;

              setParentSearch(value);

              // اگر کاربر انتخاب قبلی را تغییر داد،
              // parentId قبلی دیگر معتبر نیست.
              if (formData.parentId !== null) {
                setField("parentId", null);
              }

              setShowParentResults(true);
            }}
            onFocus={() => {
              setShowParentResults(true);
            }}
            placeholder="جستجوی دسته والد..."
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm pr-9"
          />

          {/* آیکون سرچ */}
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            🔍
          </span>

          {/* پاک کردن انتخاب */}
          {selectedParent && (
            <button
              type="button"
              onClick={handleClearParent}
              className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500"
              aria-label="حذف دسته والد"
            >
              ×
            </button>
          )}
        </div>

        {/* نتایج سرچ */}
        {showParentResults && (
          <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
            <div className="max-h-60 overflow-y-auto">
              {/* بدون والد */}
              <button
                type="button"
                onClick={handleClearParent}
                className="w-full px-3 py-2 text-right text-sm hover:bg-gray-50 border-b border-gray-100"
              >
                — بدون والد —
              </button>

              {filteredCategories.map(({ category, level }) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => handleSelectParent(category)}
                  className="w-full px-3 py-2 text-right text-sm hover:bg-gray-50 transition"
                >
                  <span className="text-gray-400">{"—".repeat(level)}</span>{" "}
                  {category.name}
                </button>
              ))}

              {filteredCategories.length === 0 && (
                <div className="px-3 py-4 text-center text-sm text-gray-400">
                  دسته‌ای پیدا نشد
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* افزودن */}
      <button
        type="submit"
        disabled={createMutation.isPending}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm disabled:opacity-50"
      >
        {createMutation.isPending ? "در حال ذخیره..." : "افزودن دسته"}
      </button>
    </form>
  );
}
