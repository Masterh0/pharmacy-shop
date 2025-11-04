"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

type Category = {
  id: number;
  name: string;
  slug: string;
  parentId?: number;
  createdAt: string;
  updatedAt: string;
};
interface Variant {
  id: number;
  price: number | string;
  discountPrice?: number | string;
}

interface Product {
  id: number;
  name: string;
  category: Category;
  variants?: Variant[];
  imageUrl?: string;
}

export default function ProductsGrid({ products }: { products: Product[] }) {
  const BASE_URL = "http://localhost:5000";
  const [cartCount, setCartCount] = useState<{ [id: number]: number }>({});

  // 👇 توابع کنترل سبد خرید
  const handleAdd = (id: number) => {
    setCartCount((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  const handleRemove = (id: number) => {
    setCartCount((prev) => {
      const current = (prev[id] || 0) - 1;
      if (current <= 0) {
        const { [id]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [id]: current };
    });
  };

  const handleDelete = (id: number) => {
    setCartCount((prev) => {
      const { [id]: _, ...rest } = prev;
      return rest;
    });
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 w-[85%] mx-auto mt-8">
      {products.map((p) => {
        // 🧮 انتخاب کمترین قیمت و بررسی تخفیف
        const variant = p.variants?.[0];
        const price = Number(variant?.price ?? 0);
        const discount = Number(variant?.discountPrice ?? 0);
        const hasDiscount = discount > 0 && discount < price;
        const discountPercent = hasDiscount
          ? Math.round(((price - discount) / price) * 100)
          : null;

        const imageSrc = !p.imageUrl
          ? "/no-image.png"
          : p.imageUrl.startsWith("http")
          ? p.imageUrl
          : `${BASE_URL}${
              p.imageUrl.startsWith("/") ? p.imageUrl : `/${p.imageUrl}`
            }`;

        const count = cartCount[p.id] || 0;

        return (
          <div
            key={p.id}
            className="relative flex flex-col justify-between items-center bg-white 
             border border-[#CBCBCB] rounded-[16px] p-4 
             h-[480px] min-h-[480px] shadow-sm hover:shadow-md 
             transition-all duration-200"
          >
            {/* 🏷️ درصد تخفیف گوشه بالا سمت راست */}
            {hasDiscount && (
              <div
                className="absolute z-20 top-0 right-0 w-[50px] h-[50px] bg-[#E63946] 
                 text-white font-bold flex items-center justify-center 
                 rounded-bl-[80%] pr-2 pt-1 shadow-md text-[20px] pl-2"
              >
                %{discountPercent}
              </div>
            )}

            {/* ✅ تصویر محصول */}
            <div className="w-[256px] h-[256px] flex items-center justify-center p-1 relative shrink-0">
              <Image
                src={imageSrc}
                alt={p.name}
                width={256}
                height={256}
                className="object-contain rounded-md transition-transform duration-300 hover:scale-[1.03]"
                sizes="256px"
              />
            </div>

            {/* ✅ متن‌ها (نام و دسته) و قیمت با فاصله منظم */}
            <div className="flex flex-col justify-between items-start w-full h-full mt-2 text-right">
              <div dir="ltr" className="flex flex-col items-end gap-1">
                <h3
                  className="text-[#000000] font-bold text-[18px] leading-[25px] max-w-[256px]"
                  style={{ wordBreak: "break-word" }}
                >
                  {p.name}
                </h3>
                {p.category?.name && (
                  <Link
                    href={`/categories/${p.category.slug}?id=${p.category.id}`}
                    className="text-[#6E6E6E] text-[14px] font-normal leading-[22px] opacity-75 hover:text-[#0077B6] transition"
                  >
                    {p.category.name}
                  </Link>
                )}
              </div>

              {/* 💰 قیمت */}
              <div className="flex flex-col justify-end items-end w-full mt-2 grow">
                {!hasDiscount ? (
                  <span
                    dir="rtl"
                    className="text-[#000000] font-bold text-[20px] leading-[28px]"
                  >
                    {price ? price.toLocaleString("fa-IR") + " تومان" : "—"}
                  </span>
                ) : (
                  <div className="flex flex-col items-end">
                    <span className="text-red-500 line-through text-[16px]">
                      {price.toLocaleString("fa-IR")} تومان
                    </span>
                    <span className="text-[#000000] font-bold text-[20px]">
                      {discount.toLocaleString("fa-IR")} تومان
                    </span>
                  </div>
                )}
              </div>

              {/* ➕🗑 دکمه‌های سبد خرید */}
              <div className="mt-3 flex items-center justify-center w-full gap-3">
                {count === 0 ? (
                  <button
                    className="bg-[#00B4D8] text-white text-[16px] w-[80%] py-2 rounded-full hover:bg-[#0077B6] transition"
                    onClick={() => handleAdd(p.id)}
                  >
                    +
                  </button>
                ) : (
                  <div className="flex items-center justify-between w-[80%]">
                    <button
                      onClick={() =>
                        count % 2 === 1
                          ? handleDelete(p.id)
                          : handleRemove(p.id)
                      }
                      className="bg-[#FF6B6B] text-white rounded-full p-2 text-[18px] hover:bg-red-600 transition"
                      title="حذف از سبد"
                    >
                      {count % 2 === 1 ? "🗑" : "➖"}
                    </button>
                    <span className="text-[16px] font-bold">{count}</span>
                    <button
                      onClick={() =>
                        count % 2 === 1 ? handleRemove(p.id) : handleAdd(p.id)
                      }
                      className="bg-[#00B4D8] text-white rounded-full p-2 text-[18px] hover:bg-[#0077B6] transition"
                      title="اضافه"
                    >
                      {count % 2 === 1 ? "+" : "🗑"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
