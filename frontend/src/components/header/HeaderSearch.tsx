"use client";
import { Search } from "lucide-react";

export default function HeaderSearch() {
  return (
    <div dir="rtl" className="flex justify-center flex-1">
      <div
        className="
      flex flex-row-reverse items-center justify-between
      w-[596px] h-[48px]
      px-6 py-[11px]
      border border-[#D6D6D6] rounded-[16px]
      bg-[#FFFFFF]
    "
      >
        <Search className="w-[24px] h-[24px] text-[#00B4D8]" />
        <input
          type="text"
          placeholder="جستجو"
          className="
        flex-1 bg-transparent outline-none
        text-[#00B4D8] placeholder:text-[#00B4D8]
         text-[14px]
      "
        />
      </div>
    </div>
  );
}
