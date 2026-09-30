// components/skeletonLoading/FilterSkeleton.tsx

export default function FilterSkeleton() {
  return (
    // عرض را روی w-full می‌گذاریم چون کانتینر پدر در Layout از قبل ۲۸۸ پیکسل است
    <div className="flex flex-col gap-4 pt-2 w-full shrink-0">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="h-10 rounded-xl bg-gray-100 relative overflow-hidden"
        >
          <ShimmerBar />
        </div>
      ))}
    </div>
  );
}

export function ToolbarSkeleton() {
  return (
    <div className="flex justify-between items-center mb-4 w-full">
      <div className="h-10 w-48 rounded-xl bg-gray-100 relative overflow-hidden">
        <ShimmerBar />
      </div>
      <div className="h-10 w-40 rounded-xl bg-gray-100 relative overflow-hidden">
        <ShimmerBar />
      </div>
    </div>
  );
}

export function ProductsGridSkeleton() {
  return (
    // کلاس‌های مزاحم w-[85%] و mx-auto حذف شدند تا اسکلتون دقیقاً کل فضای flex-1 را پر کند
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4 w-full">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="border border-gray-100 rounded-[12px] lg:rounded-[16px] p-3 lg:p-4 flex flex-col gap-3 bg-white"
        >
          {/* عکس */}
          <div className="w-full aspect-square rounded-xl bg-gray-100 relative overflow-hidden">
            <ShimmerBar />
          </div>
          {/* عنوان */}
          <div className="h-4 w-full mt-2 rounded-md bg-gray-100 relative overflow-hidden">
            <ShimmerBar />
          </div>
          <div className="h-4 w-2/3 rounded-md bg-gray-100 relative overflow-hidden">
            <ShimmerBar />
          </div>
          <div className="flex-1 mt-2"></div>
          {/* دکمه / قیمت */}
          <div className="h-9 lg:h-11 w-full rounded-xl bg-gray-100 relative overflow-hidden mt-auto">
            <ShimmerBar />
          </div>
        </div>
      ))}
    </div>
  );
}

function ShimmerBar() {
  return (
    <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
  );
}
