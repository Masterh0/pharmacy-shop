"use client";

import { Search } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useSearchQuery } from "@/lib/hooks/useSearchQuery";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function HeaderSearch() {
  const [value, setValue] = useState("");
  const boxRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const { data, isLoading } = useSearchQuery(value);

  /* ---------------------------------------------------
     Close dropdown when clicking outside
  --------------------------------------------------- */
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setValue("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* ---------------------------------------------------
     Search (Enter + Icon)
  --------------------------------------------------- */
  const handleSearch = () => {
    if (value.trim().length < 2) return;
    router.push(`/search?q=${encodeURIComponent(value.trim())}`);
    setValue("");      // ← بستن dropdown بعد از سرچ
  };

  /* ---------------------------------------------------
     Image helper (local prefix)
  --------------------------------------------------- */
  const getImage = (url?: string | null) => {
    if (!url) return "/images/placeholder.png";
    if (url.startsWith("http")) return url;
    return `${process.env.NEXT_PUBLIC_BASE_URL}${url}`;
  };

  /* ---------------------------------------------------
     Horizontal Scroll (Wheel + Drag Scroll)
  --------------------------------------------------- */
  let isDown = false;
  let startX = 0;
  let scrollLeft = 0;

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (scrollRef.current) scrollRef.current.scrollLeft += e.deltaY;
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    isDown = true;
    startX = e.pageX - (scrollRef.current?.offsetLeft || 0);
    scrollLeft = scrollRef.current?.scrollLeft || 0;
  };

  const handleMouseLeave = () => (isDown = false);
  const handleMouseUp = () => (isDown = false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDown || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  /* ---------------------------------------------------
     Render
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
        "
      >
        <Search
          className="w-[24px] h-[24px] text-[#00B4D8] cursor-pointer"
          onClick={handleSearch}
        />

        <input
          type="text"
          placeholder="جستجو"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          className="
            flex-1 bg-transparent outline-none
            text-[#00B4D8] placeholder:text-[#00B4D8]
            text-[14px]
          "
        />
      </div>

      {/* Dropdown */}
      {value.length >= 2 && (
        <div
          className="
            absolute top-[56px] z-50 w-[596px]
            bg-white border border-gray-200 rounded-xl
            shadow-[0_4px_20px_rgba(0,0,0,0.07)] p-4
          "
        >
          {isLoading ? (
            <div className="text-center py-4 text-gray-500 text-sm">
              در حال جستجو...
            </div>
          ) : data && data.total > 0 ? (
            <>
              {/* PRODUCTS */}
              {data.products.length > 0 && (
                <div className="mb-4">
                  <div className="text-sm text-gray-700 font-medium mb-2">
                    محصولات
                  </div>

                  <div
                    ref={scrollRef}
                    onWheel={handleWheel}
                    onMouseDown={handleMouseDown}
                    onMouseLeave={handleMouseLeave}
                    onMouseUp={handleMouseUp}
                    onMouseMove={handleMouseMove}
                    className="
                      flex gap-3 overflow-x-auto py-2 scrollbar-hide
                      cursor-grab active:cursor-grabbing
                    "
                  >
                    {data.products.map((p) => (
                      <Link
                        key={p.id}
                        href={`/product/${p.slug}?id=${p.id}`}
                        onClick={() => setValue("")}   // ← بستن dropdown
                        className="
                          min-w-[140px] max-w-[140px]
                          bg-gray-50 border border-gray-200 rounded-lg
                          p-2 flex flex-col gap-2
                        "
                      >
                        <img
                          src={getImage(p.imageUrl)}
                          className="w-full h-[110px] object-cover rounded-md"
                        />

                        <div className="text-xs text-gray-700 line-clamp-2">
                          {p.name}
                        </div>

                        {p.variants?.[0] && (
                          <div className="text-xs text-blue-600 font-bold">
                            {Number(
                              p.variants[0].discountPrice ??
                                p.variants[0].price
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
              {data.categories.length > 0 && (
                <div className="mb-4">
                  <div className="text-sm text-gray-700 font-medium mb-2">
                    دسته‌بندی‌ها
                  </div>
                  <div className="flex flex-col gap-2">
                    {data.categories.map((c) => (
                      <Link
                        key={c.id}
                        href={`/categories/${c.slug}?id=${c.id}`}
                        onClick={() => setValue("")}   // ← بستن dropdown
                        className="text-sm text-gray-600 hover:text-blue-600 transition"
                      >
                        {c.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* BRANDS */}
              {data.brands.length > 0 && (
                <div className="mb-2">
                  <div className="text-sm text-gray-700 font-medium mb-2">
                    برندها
                  </div>
                  <div className="flex flex-col gap-2">
                    {data.brands.map((b) => (
                      <Link
                        key={b.id}
                        href={`/brand/${b.slug}`}
                        onClick={() => setValue("")}   // ← بستن dropdown
                        className="text-sm text-gray-600 hover:text-blue-600 transition"
                      >
                        {b.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-4 text-gray-500 text-sm">
              نتیجه‌ای یافت نشد.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
