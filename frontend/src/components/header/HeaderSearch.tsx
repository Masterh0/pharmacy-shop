"use client";

import { Search, ChevronLeft, Folder, Tag } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useSearchQuery } from "@/lib/hooks/useSearchQuery"; // فرض بر این است که این هوک اینجا قرار دارد
import Link from "next/link";
import { useRouter } from "next/navigation";
// import Image from "next/image";

export default function HeaderSearch() {
  const [value, setValue] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const productsScrollRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // از این هوک استفاده می‌شود
  const { data, isLoading } = useSearchQuery(value);

  // 🐛 خطوط console.log برای عیب‌یابی
  useEffect(() => {
    console.log("HeaderSearch - Current Value:", value);
    console.log("HeaderSearch - Is Open:", isOpen);
    console.log("HeaderSearch - Is Loading:", isLoading);
    console.log("HeaderSearch - Data (from useSearchQuery):", data);
  }, [value, isOpen, isLoading, data]);


  /* ---------------------------------------------------
     بستن Dropdown با کلیک بیرون و کنترل اسکرول بدنه
  --------------------------------------------------- */
  useEffect(() => {
    // باز کردن Dropdown و قفل کردن اسکرول بدنه
    if (value.length >= 2) {
      setIsOpen(true);
      document.body.style.overflow = "hidden"; // جلوگیری از اسکرول کل صفحه
    } else {
      setIsOpen(false);
      document.body.style.overflow = ""; // فعال کردن مجدد اسکرول بدنه
    }

    const handleClickOutside = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        console.log("Clicked outside, clearing value."); // 🐛
        setValue(""); // با خالی کردن value، Dropdown بسته می‌شود
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = ""; // اطمینان از آزاد شدن اسکرول بدنه هنگام unmount
    };
  }, [value]);

  /* ---------------------------------------------------
     جستجو (Enter و آیکون)
  --------------------------------------------------- */
  const handleSearch = () => {
    if (value.trim().length < 2) return;
    router.push(`/search?q=${encodeURIComponent(value.trim())}`);
    setValue(""); // 🐛 با موفقیت به صفحه جستجو رفتیم، value را خالی می‌کنیم
    console.log("Navigating to search page and clearing value.");
  };

  /* ---------------------------------------------------
     کمک‌کننده عکس (افزودن پیشوند لوکال)
  --------------------------------------------------- */
  const getImage = (url?: string | null) => {
    if (!url) return "/images/placeholder.png";
    if (url.startsWith("http")) return url;
    return `${process.env.NEXT_PUBLIC_BASE_URL}${url}`;
  };

  /* ---------------------------------------------------
     اسکرول افقی محصولات (فقط با چرخ ماوس)
  --------------------------------------------------- */
  const handleProductsWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (productsScrollRef.current) {
      productsScrollRef.current.scrollLeft += e.deltaY * 1.5;
    }
  };

  /* ---------------------------------------------------
     حذف تکراری‌ها
  --------------------------------------------------- */
  const uniqueProducts = data?.products
    ? Array.from(new Map(data.products.map((p) => [p.id, p])).values())
    : [];

  const uniqueCategories = data?.categories
    ? Array.from(new Map(data.categories.map((c) => [c.slug, c])).values())
    : [];

  const uniqueBrands = data?.brands
    ? Array.from(new Map(data.brands.map((b) => [b.slug, b])).values())
    : [];

  const hasResults =
    uniqueProducts.length > 0 ||
    uniqueCategories.length > 0 ||
    uniqueBrands.length > 0;

  // 🐛 console.log برای وضعیت نهایی نتایج
  useEffect(() => {
    console.log("HeaderSearch - Has Results:", hasResults);
    if (hasResults) {
      console.log("HeaderSearch - Unique Products Count:", uniqueProducts.length);
      console.log("HeaderSearch - Unique Categories Count:", uniqueCategories.length);
      console.log("HeaderSearch - Unique Brands Count:", uniqueBrands.length);
    }
  }, [hasResults, uniqueProducts.length, uniqueCategories.length, uniqueBrands.length]);

  /* ---------------------------------------------------
     رندر
  --------------------------------------------------- */
  return (
    <div dir="rtl" className="flex justify-center flex-1 relative" ref={boxRef}>
      {/* Search Box */}
      <div
        className="
          flex flex-row-reverse items-center justify-between
          w-[596px] h-[48px]
          px-6 py-[11px]
          border border-[#D6D6D6] rounded-[16px] bg-white
          focus-within:border-[#00B4D8] transition-all // تغییر رنگ Border در حالت فوکوس
        "
      >
        <Search
          className="w-[24px] h-[24px] text-[#00B4D8] cursor-pointer"
          onClick={handleSearch}
        />

        <input
          type="text"
          placeholder="جستجو در داروخانه بهوندی..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          className="
            flex-1 bg-transparent outline-none
            text-gray-900 placeholder:text-[#00B4D8]
            text-[14px]
          "
        />
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div
          className="
            absolute top-[56px] z-50 w-[596px] max-h-[450px]
            bg-white border border-gray-200 rounded-xl
            shadow-xl p-4
            overflow-y-auto
            animate-in slide-in-from-top-4 duration-300
          "
        >
          {isLoading ? (
            <div className="text-center py-4 text-gray-500 text-sm flex items-center justify-center gap-2">
              <svg
                className="animate-spin h-4 w-4 text-[#00B4D8]"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              در حال جستجو...
            </div>
          ) : hasResults ? (
            <>
              {/* PRODUCTS */}
              {uniqueProducts.length > 0 && (
                <div className="mb-4 border-b border-gray-100 pb-4">
                    <div className="text-sm text-gray-700 font-medium mb-2 flex items-center gap-2">
                        <Tag className="w-4 h-4 text-gray-500" />
                        محصولات
                    </div>

                  <div
                    ref={productsScrollRef}
                    onWheel={handleProductsWheel}
                    className="
                      flex gap-3 overflow-x-auto py-2 scrollbar-hide
                    "
                  >
                    {uniqueProducts.map((p) => (
                      <Link
                        key={p.id}
                        href={`/product/${p.slug}?id=${p.id}`}
                        onClick={() => setValue("")}
                        className="
                          min-w-[140px] max-w-[140px]
                          bg-white border border-gray-200 rounded-lg
                          p-2 flex flex-col gap-2
                          hover:shadow-md hover:border-[#00B4D8] transition-all
                        "
                      >
                        <img
                          src={getImage(p.imageUrl)}
                          className="w-full h-[110px] object-cover rounded-md"
                          alt={p.name}
                        />

                        <div className="text-xs text-gray-800 line-clamp-2 min-h-[36px]">
                          {p.name}
                        </div>

                        {/* نمایش قیمت */}
                        {p.variants?.[0] && (
                          <div className="text-xs text-blue-600 font-bold mt-auto">
                            {Number(
                              p.variants[0].discountPrice ?? p.variants[0].price
                            ).toLocaleString("fa-IR")}{" "}
                            تومان
                          </div>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* CATEGORIES */}
              {uniqueCategories.length > 0 && (
                <div className="mb-4 border-b border-gray-100 pb-4">
                  <div className="text-sm text-gray-700 font-medium mb-2 flex items-center gap-2">
                    <Folder className="w-4 h-4 text-gray-500" />
                    دسته‌بندی‌ها
                  </div>

                  <div className="flex flex-col">
                    {uniqueCategories.map((c) => (
                      <Link
                        key={c.slug}
                        href={`/categories/${c.slug}`}
                        onClick={() => setValue("")}
                        className="
                          flex items-center justify-between p-2
                          text-sm text-gray-700
                          rounded-md
                          hover:bg-blue-50/70 hover:text-[#0077B6] transition-all
                        "
                      >
                        <span>{c.name}</span>
                        <ChevronLeft className="w-4 h-4 text-gray-400" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* BRANDS */}
              {uniqueBrands.length > 0 && (
                <div className="mb-2">
                  <div className="text-sm text-gray-700 font-medium mb-2 flex items-center gap-2">
                    <Tag className="w-4 h-4 text-gray-500" />
                    برندها
                  </div>
                  <div className="flex flex-col">
                    {uniqueBrands.map((b) => (
                      <Link
                        key={b.slug}
                        href={`/brand/${b.slug}`}
                        onClick={() => setValue("")}
                        className="
                          flex items-center justify-between p-2
                          text-sm text-gray-700
                          rounded-md
                          hover:bg-blue-50/70 hover:text-[#0077B6] transition-all
                        "
                      >
                        <span>{b.name}</span>
                        <ChevronLeft className="w-4 h-4 text-gray-400" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-4 text-gray-500 text-sm">
              نتیجه‌ای برای `{value}` یافت نشد.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
