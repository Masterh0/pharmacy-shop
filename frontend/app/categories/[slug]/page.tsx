import { Suspense } from "react";
import CategoryProductsClient from "./CategoryProductsClient";

export default function CategoryProductsPage() {
  return (
    <Suspense fallback={<CategoryProductsLoading />}>
      <CategoryProductsClient />
    </Suspense>
  );
}

function CategoryProductsLoading() {
  return (
    <div dir="rtl" className="w-full px-4">
      
      {/* عنوان صفحه */}
      <div className="flex justify-center mb-6">
        <div className="h-9 w-64 rounded-lg bg-gray-200 relative overflow-hidden">
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
        </div>
      </div>

      {/* تب‌های مرتب‌سازی */}
      <div className="flex justify-center gap-6 mb-6 border-b pb-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-5 w-20 rounded bg-gray-200 relative overflow-hidden">
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
          </div>
        ))}
      </div>

      <div className="flex gap-6">
        
        {/* گرید محصولات */}
        <div className="flex-1 grid grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="border rounded-2xl p-4 flex flex-col gap-3">
              
              {/* بالای کارت: قلب + تصویر */}
              <div className="relative">
                <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-gray-200 overflow-hidden relative">
                  <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
                </div>
                <div className="h-44 w-full rounded-xl bg-gray-200 relative overflow-hidden">
                  <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
                </div>
              </div>

              {/* اسم محصول */}
              <div className="h-5 w-3/4 self-end rounded bg-gray-200 relative overflow-hidden">
                <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
              </div>

              {/* زیر عنوان */}
              <div className="h-4 w-1/2 self-end rounded bg-gray-200 relative overflow-hidden">
                <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
              </div>

              {/* قیمت */}
              <div className="h-6 w-2/5 self-end rounded bg-gray-200 relative overflow-hidden">
                <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
              </div>

              {/* دکمه افزودن به سبد */}
              <div className="h-11 w-full rounded-full bg-gray-200 relative overflow-hidden">
                <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
              </div>
            </div>
          ))}
        </div>

        {/* ستون فیلتر سمت چپ */}
        <div className="w-[220px] shrink-0 border rounded-2xl p-4 flex flex-col gap-5 h-fit">
          
          {/* هدر فیلترها */}
          <div className="flex justify-between">
            <div className="h-5 w-16 rounded bg-gray-200 relative overflow-hidden">
              <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
            </div>
            <div className="h-5 w-20 rounded bg-gray-200 relative overflow-hidden">
              <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
            </div>
          </div>

          {/* برند */}
          <div className="flex flex-col gap-2">
            <div className="h-5 w-14 rounded bg-gray-200 relative overflow-hidden">
              <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
            </div>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-2 justify-end">
                <div className="h-4 w-20 rounded bg-gray-200 relative overflow-hidden">
                  <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
                </div>
                <div className="h-4 w-4 rounded bg-gray-200" />
              </div>
            ))}
          </div>

          {/* تگل تخفیف‌دار */}
          <div className="flex items-center justify-between">
            <div className="h-6 w-10 rounded-full bg-gray-200 relative overflow-hidden">
              <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
            </div>
            <div className="h-5 w-20 rounded bg-gray-200 relative overflow-hidden">
              <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
            </div>
          </div>

          {/* تگل فقط موجود */}
          <div className="flex items-center justify-between">
            <div className="h-6 w-10 rounded-full bg-gray-200 relative overflow-hidden">
              <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
            </div>
            <div className="h-5 w-28 rounded bg-gray-200 relative overflow-hidden">
              <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
            </div>
          </div>

          {/* محدوده قیمت */}
          <div className="flex flex-col gap-2">
            <div className="h-5 w-24 self-end rounded bg-gray-200 relative overflow-hidden">
              <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
            </div>
            <div className="h-2 w-full rounded-full bg-gray-200" />
          </div>

          {/* دکمه اعمال فیلتر */}
          <div className="h-12 w-full rounded-xl bg-gray-200 relative overflow-hidden">
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
          </div>
        </div>
      </div>
    </div>
  );
}

