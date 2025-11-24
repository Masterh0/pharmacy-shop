"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/lib/hooks/useAddToCart";

export default function CartPreview() {
  const { cart, isLoading, isError, removeItem, isRemoving } = useCart();

  // 🧱 وضعیت بارگذاری و خطا
  if (isLoading)
    return (
      <div className="p-4 text-center text-sm text-gray-500">
        در حال بارگذاری سبد...
      </div>
    );

  if (isError)
    return (
      <div className="p-4 text-center text-sm text-red-500">
        مشکلی در دریافت داده‌ها رخ داد.
      </div>
    );

  const items = cart?.items ?? [];
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  // ❌ سبد خالی
  if (!items.length)
    return (
      <div className="p-4 text-center text-sm text-gray-500">
        سبد خرید شما خالی است 🙁
      </div>
    );

  // 💰 محاسبه جمع کل
  const totalPrice = items.reduce(
    (sum, item) => sum + Number(item.priceAtAdd) * item.quantity,
    0
  );

  // 🎨 رندر محتوای واقعی سبد
  return (
    <div className="p-4 w-full flex flex-col divide-y divide-gray-100 rounded-xl bg-white shadow-[0_4px_20px_rgba(0,0,0,0.1)]">
      {items.map((item) => (
        <div
          key={item.id}
          className="flex items-center justify-between gap-3 py-3"
        >
          <Image
            src={
              item.product.imageUrl
                ? item.product.imageUrl.startsWith("http")
                  ? item.product.imageUrl
                  : `${baseUrl}/${item.product.imageUrl.replace(/^\/+/, "")}`
                : "/pic/placeholder-product.png"
            }
            alt={item.product.name}
            width={64}
            height={64}
            className="rounded-lg object-cover"
            unoptimized
          />

          <div className="flex-1 text-right">
            <p className="text-[13px] font-medium text-[#242424] mb-[2px]">
              {item.product.name}
            </p>
            <p className="text-[12px] text-gray-500">
              {item.variant.flavor || item.variant.packageType}
            </p>
            <p className="text-[13px] text-[#00B4D8] font-bold mt-[2px]">
              {Number(item.priceAtAdd).toLocaleString("fa-IR")} تومان ×{" "}
              {item.quantity}
            </p>
          </div>

          <button
            onClick={() => removeItem(item.id)}
            disabled={isRemoving}
            className="text-red-500 text-[13px] font-bold hover:text-red-600 disabled:opacity-50 transition-colors"
          >
            ×
          </button>
        </div>
      ))}

      <div className="pt-3 flex justify-between items-center">
        <span className="text-[#242424] text-[13px] font-semibold">
          جمع کل:
        </span>
        <span className="text-[#0077B6] text-[14px] font-bold">
          {totalPrice.toLocaleString("fa-IR")} تومان
        </span>
      </div>

      <Link
        href="/cart"
        className="mt-3 block text-center text-white bg-[#0077B6] rounded-lg py-2 text-[14px] font-medium hover:bg-[#0096C7] transition-all"
      >
        مشاهده سبد خرید
      </Link>
    </div>
  );
}
