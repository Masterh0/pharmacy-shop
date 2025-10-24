"use client";

import React from "react";
import { handleApiError } from "@/lib/utils/handleApiError";
import { useBrands, useDeleteBrand } from "@/lib/hooks/brandHooks";
import { toast } from "react-hot-toast";
import { Trash2, Loader2, ShoppingBag } from "lucide-react";

export default function BrandList() {
  const { data: brands = [], isLoading, isError } = useBrands();
  const { mutate: deleteBrand, isPending } = useDeleteBrand();

  if (isLoading)
    return (
      <div className="flex justify-center items-center py-6 text-gray-500 space-x-2">
        <Loader2 className="animate-spin w-5 h-5" />
        <span>در حال بارگذاری برندها...</span>
      </div>
    );

  if (isError)
    return (
      <div className="text-red-500 bg-red-50 border border-red-200 p-3 rounded text-sm text-center">
        خطا در دریافت لیست برندها. لطفاً دوباره تلاش کنید.
      </div>
    );

  // درصورتی‌که برند وجود نداشته باشد
  if (brands.length === 0)
    return (
      <div className="flex flex-col items-center justify-center py-8 text-gray-400">
        <ShoppingBag className="w-10 h-10 mb-2 opacity-70" />
        <p>هیچ برندی وجود ندارد.</p>
      </div>
    );

  return (
    <div className="mt-6 w-full max-w-md">
      <h2 className="text-lg font-semibold mb-3">لیست برندها</h2>
      <ul className="divide-y border rounded bg-white shadow-sm">
        {brands.map((b) => (
          <li
            key={b.id}
            className="p-3 flex justify-between items-center hover:bg-gray-50 transition-colors"
          >
            <div>
              <p className="font-medium text-gray-800">{b.name}</p>
              <span className="text-xs text-gray-500">/{b.slug}</span>
            </div>

            <button
              onClick={() => {
                toast.loading("در حال حذف برند...", { id: `delete-${b.id}` });
                deleteBrand(b.id, {
                  onSuccess: () => {
                    toast.dismiss(`delete-${b.id}`);
                    toast.success("✅ برند با موفقیت حذف شد");
                  },
                  onError: (err) => {
                    const errorMessage = handleApiError(err);

                    // 🔍 لاگ کامل برای تست و دیباگ
                    console.group("🧩 Error Debug Info");
                    console.log("Full error:", err);
                    console.log("Extracted error message:", errorMessage);
                    console.groupEnd();

                    toast.dismiss(`delete-${b.id}`);

                    // 🧨 نمایش پیام خطا فارسی در Toast
                    toast.error(
                      `❌ حذف برند انجام نشد:\n${
                        errorMessage || "خطایی رخ داده است."
                      }`,
                      {
                        style: {
                          direction: "rtl",
                          fontFamily: "sans-serif",
                          whiteSpace: "pre-line",
                        },
                      }
                    );
                  },
                });
              }}
              className="text-red-500 hover:text-red-700 text-sm flex items-center space-x-1"
              disabled={isPending}
            >
              {isPending ? (
                <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
              <span>{isPending ? "..." : "حذف"}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
