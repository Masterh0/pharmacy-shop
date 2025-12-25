"use client";

interface ProductsPaginationProps {
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}

export default function ProductsPagination({
  totalPages,
  currentPage,
  onPageChange,
}: ProductsPaginationProps) {
  if (totalPages <= 1) return null;

  // ✅ تابع کمکی برای تغییر صفحه + اسکرول
  const handlePageChange = (page: number) => {
    onPageChange(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div
      dir="rtl"
      className="flex justify-center items-center gap-4 mt-12"
    >
      {/* دکمه قبلی */}
      <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className={`w-8 h-8 rounded-full border flex items-center justify-center
          font-[IRANYekanX] text-[16px] leading-[180%]
          ${currentPage <= 1
            ? "opacity-40 cursor-not-allowed border-[#D6D6D6]"
            : "hover:bg-[#E0F7FA] hover:border-[#00B4D8] border-[#656565]"
          }`}
      >
        ‹
      </button>

      {/* شماره‌ها */}
      {Array.from({ length: totalPages }).map((_, i) => {
        const pageNumber = i + 1;
        const isActive = pageNumber === currentPage;

        return (
          <button
            key={i}
            onClick={() => handlePageChange(pageNumber)}
            className={`w-8 h-8 rounded-full border flex items-center justify-center
              font-[IRANYekanX] text-[16px] leading-[180%] transition-all duration-200
              ${
                isActive
                  ? "bg-[#90E0EF] border-[#90E0EF] text-black"
                  : "bg-white border-[#656565] text-black hover:bg-[#E0F7FA]"
              }`}
          >
            {pageNumber}
          </button>
        );
      })}

      {/* دکمه بعدی */}
      <button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className={`w-8 h-8 rounded-full border flex items-center justify-center
          font-[IRANYekanX] text-[16px] leading-[180%]
          ${currentPage >= totalPages
            ? "opacity-40 cursor-not-allowed border-[#D6D6D6]"
            : "hover:bg-[#E0F7FA] hover:border-[#00B4D8] border-[#656565]"
          }`}
      >
        ›
      </button>
    </div>
  );
}
