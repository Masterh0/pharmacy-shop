"use client";

export default function ProductsFilterBox() {
  return (
    <aside
      className="
        flex flex-col justify-start items-end flex-wrap
        p-5 gap-y-5
        bg-white border border-gray-300 rounded-lg
        w-[288px] h-[272px] mr-12 mt-12
      "
    >
      {/* Header */}
      <div className="flex justify-between items-center w-full border-b border-gray-300 pb-2">
        <span className="text-[16px] font-normal text-[#242424]">فیلترها</span>
        <button className="text-[10px] font-bold text-[#00B4D8]">
          حذف فیلترها
        </button>
      </div>

      {/* 🎚 فیلتر برند (دراپ‌داون شبیه UI Figma) */}
      <div className="flex justify-between items-center w-full border-b border-gray-300 py-1">
        <span className="text-sm text-[#434343]">برند</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 text-gray-900"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M5 8l5 5 5-5H5z" />
        </svg>
      </div>

      {/* 🔘 فیلتر ویژگی‌ها با سوئیچ */}
      <div className="flex justify-between items-center w-full border-b border-gray-300 py-1">
        <span className="text-sm text-[#434343]">محصول ویژه</span>
        <label className="relative inline-flex items-center cursor-pointer">
          <input type="checkbox" className="sr-only peer" />
          <div
            className="
              w-10 h-5 bg-white border border-gray-300 rounded-full
              peer-checked:bg-[#00B4D8]
              transition-colors duration-300
            "
          ></div>
          <span
            className="
              absolute left-[2px] top-[2px] h-4 w-4 bg-gray-500 
              rounded-full transition-transform peer-checked:translate-x-5
            "
          ></span>
        </label>
      </div>

      {/* 🔘 فیلتر دوم مشابه */}
      <div className="flex justify-between items-center w-full border-b border-gray-300 py-1">
        <span className="text-sm text-[#434343]">محصول جدید</span>
        <label className="relative inline-flex items-center cursor-pointer">
          <input type="checkbox" className="sr-only peer" />
          <div
            className="
              w-10 h-5 bg-white border border-gray-300 rounded-full
              peer-checked:bg-[#00B4D8]
              transition-colors duration-300
            "
          ></div>
          <span
            className="
              absolute left-[2px] top-[2px] h-4 w-4 bg-gray-500 
              rounded-full transition-transform peer-checked:translate-x-5
            "
          ></span>
        </label>
      </div>
    </aside>
  );
}
