"use client";
import {
  useCategories,
  useCreateCategory,
} from "../../../lib/hooks/useCategories";
import { useCategoryStore } from "../../../lib/stores/categoryStore";
import type { Category } from "../../../lib/types/category";

export default function AddCategoryForm() {
  const { formData, setField, resetForm } = useCategoryStore();
  const { data: categories = [] } = useCategories(); // جلوگیری از undefined
  const createMutation = useCreateCategory();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData, {
      onSuccess: () => resetForm(),
    });
  };

  // تابع بازگشتی برای ساخت optionهای سلسله‌مراتبی
  const renderCategoryOptions = (
    cats: Category[],
    level = 0
  ): React.ReactNode[] => {
    return cats.flatMap((cat) => {
      const indent = "—".repeat(level); // ایجاد تورفتگی برای نمایش درختی

      return [
        <option key={cat.id} value={cat.id}>
          {indent} {cat.name}
        </option>,
        // اگر زیر‌دسته دارد، بازگشتی ادامه بده
        ...(cat.subCategories
          ? renderCategoryOptions(cat.subCategories, level + 1)
          : []),
      ];
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md p-4 bg-white rounded shadow space-y-4"
    >
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

      <div>
        <label className="block mb-1 text-sm font-medium">دسته والد</label>
        <select
          value={formData.parentId ?? ""}
          onChange={(e) =>
            setField("parentId", e.target.value ? Number(e.target.value) : null)
          }
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
        >
          <option value="">— بدون والد —</option>
          {renderCategoryOptions(categories)}
        </select>
      </div>

      <button
        type="submit"
        disabled={createMutation.isPending}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
      >
        {createMutation.isPending ? "در حال ذخیره..." : "افزودن دسته"}
      </button>
    </form>
  );
}
