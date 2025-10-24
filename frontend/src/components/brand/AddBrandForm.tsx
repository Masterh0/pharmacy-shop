"use client";

import React from "react";
import { useBrandStore } from "@/lib/stores/useBrandStore";
import { useCreateBrand } from "@/lib/hooks/brandHooks";

export default function AddBrandForm() {
  const { name, slug, setField, reset } = useBrandStore();
  const { mutate, isPending } = useCreateBrand();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    mutate({ name, slug: slug || undefined });
    reset();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-4 rounded shadow-md w-full max-w-sm space-y-4"
    >
      <div>
        <label className="text-sm font-medium block">نام برند</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setField("name", e.target.value)}
          className="border p-2 w-full rounded"
          placeholder="مثلاً سامسونگ"
        />
      </div>

      <div>
        <label className="text-sm font-medium block">اسلاگ (اختیاری)</label>
        <input
          type="text"
          value={slug}
          onChange={(e) => setField("slug", e.target.value)}
          className="border p-2 w-full rounded"
          placeholder="مثلاً samsung"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
      >
        {isPending ? "در حال افزودن..." : "افزودن برند"}
      </button>
    </form>
  );
}
