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
      className="flex justify-center items-center gap-2 lg:gap-4 mt-8 lg:mt-12 flex-wrap"
    >
      <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className={`w-8 h-8 rounded-full border flex items-center justify-center text-[16px]
        ${
          currentPage <= 1
            ? "opacity-40 cursor-not-allowed border-[#D6D6D6]"
            : "hover:bg-[#E0F7FA] hover:border-[#00B4D8] border-[#656565]"
        }`}
      >
        ‹
      </button>

      {/* در موبایل فقط صفحات نزدیک نمایش بده */}
      {Array.from({ length: totalPages }).map((_, i) => {
        const pageNumber = i + 1;
        const isActive = pageNumber === currentPage;
        // موبایل: فقط ±2 از صفحه فعلی
        const showOnMobile =
          Math.abs(pageNumber - currentPage) <= 1 ||
          pageNumber === 1 ||
          pageNumber === totalPages;

        return (
          <button
            key={i}
            onClick={() => handlePageChange(pageNumber)}
            className={`
            w-8 h-8 rounded-full border flex items-center justify-center text-[14px] lg:text-[16px] transition-all duration-200
            ${!showOnMobile ? "hidden lg:flex" : ""}
            ${
              isActive
                ? "bg-[#90E0EF] border-[#90E0EF] text-black"
                : "bg-white border-[#656565] text-black hover:bg-[#E0F7FA]"
            }
          `}
          >
            {pageNumber}
          </button>
        );
      })}

      <button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className={`w-8 h-8 rounded-full border flex items-center justify-center text-[16px]
        ${
          currentPage >= totalPages
            ? "opacity-40 cursor-not-allowed border-[#D6D6D6]"
            : "hover:bg-[#E0F7FA] hover:border-[#00B4D8] border-[#656565]"
        }`}
      >
        ›
      </button>
    </div>
  );
}
