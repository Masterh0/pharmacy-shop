"use client";

import Image from "next/image";

interface Variant {
  id: number;
  price: number | string;
}

interface Product {
  id: number;
  name: string;
  variants: Variant[];
  imageUrl?: string;
}

export default function ProductsGrid({ products }: { products: Product[] }) {
  const BASE_URL = "http://localhost:5000";

  // 🧩 لاگ بررسی ساختار داده‌ها
  console.groupCollapsed("🧩 ProductsGrid props:");
  console.table(
    products?.map((p) => ({
      id: p.id,
      name: p.name,
      variantsCount: p.variants?.length ?? 0,
      imageUrl: p.imageUrl,
    }))
  );
  console.groupEnd();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 w-[85%] mt-8 mx-auto">
      {products.map((p) => {
        const minPrice = Math.min(...(p.variants?.map((v) => Number(v.price)) ?? [0]));

        // ✅ ساخت مسیر درست تصویر برای همه حالات
        const imageSrc =
          !p.imageUrl
            ? "/no-image.png"
            : p.imageUrl.startsWith("http")
              ? p.imageUrl // تصویر کامل از سرور
              : `${BASE_URL}${p.imageUrl.startsWith("/") ? p.imageUrl : `/${p.imageUrl}`}`; // تصویر نسبی

        return (
          <div
            key={p.id}
            className="flex flex-col items-center border rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200 bg-white"
          >
            {/* ✅ تصویر محصول */}
            <Image
              src={imageSrc}
              alt={p.name}
              width={180}
              height={180}
              className="object-contain rounded-md"
            />

            {/* ✅ نام محصول */}
            <h3 className="text-[#242424] font-medium text-lg mt-4 text-center">
              {p.name}
            </h3>

            {/* ✅ قیمت حداقل بین واریانت‌ها */}
            <p className="text-black font-bold mt-2">
              {minPrice > 0
                ? `${minPrice.toLocaleString("fa-IR")} تومان`
                : "—"}
            </p>

            {/* ✅ دکمه افزودن به سبد */}
            <button className="mt-3 bg-[#00B4D8] text-white px-6 py-1 rounded-full hover:bg-[#0077B6] transition">
              افزودن به سبد
            </button>
          </div>
        );
      })}
    </div>
  );
}
