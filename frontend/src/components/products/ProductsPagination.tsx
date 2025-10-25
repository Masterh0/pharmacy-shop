interface PaginationProps {
  totalPages: number;
  currentPage: number;
}

export default function ProductsPagination({ totalPages, currentPage }: PaginationProps) {
  return (
    <div className="flex justify-center gap-3 mt-12 text-center">
      {Array.from({ length: totalPages }).map((_, i) => (
        <button
          key={i}
          className={`w-8 h-8 rounded-full border flex items-center justify-center
            ${i + 1 === currentPage ? "bg-[#90E0EF] border-[#90E0EF]" : "border-[#656565]"}`}
        >
          {i + 1}
        </button>
      ))}
    </div>
  );
}
