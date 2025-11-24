"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/lib/hooks/useAddToCart";

export default function CartPreview() {
  const { cart, isLoading, isError, removeItem, isRemoving } = useCart();
  const items = cart?.items ?? [];
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  if (isLoading)
    return <div className="p-4 text-center">در حال بارگذاری سبد...</div>;
  if (isError)
    return (
      <div className="p-4 text-center text-red-500">مشکل در دریافت اطلاعات</div>
    );

  if (!items.length)
    return (
      <div className="p-4 text-center text-gray-500">
        سبد خرید شما خالی است 🙁
      </div>
    );

  // 💰 محاسبه منطق مجموع‌ها
  const totalBeforeDiscount = items.reduce(
    (sum, item) =>
      sum + Number(item.variant?.price || item.priceAtAdd) * item.quantity,
    0
  );

  const totalAfterDiscount = items.reduce(
    (sum, item) =>
      sum +
      Number(
        item.variant?.discountPrice ?? item.variant?.price ?? item.priceAtAdd
      ) *
        item.quantity,
    0
  );

  const totalDiscount = totalBeforeDiscount - totalAfterDiscount;

  return (
    <div className="p-4 w-[360px] flex flex-col rounded-xl bg-white shadow-[0_4px_20px_rgba(0,0,0,0.1)]">
      {/* 📦 نمایش آیتم‌ها */}
      <div className="max-h-[250px] overflow-y-auto pr-2 divide-y divide-gray-100 scrollbar-thin scrollbar-thumb-gray-300">
        {items.map((item) => {
          const price = Number(item.variant?.price ?? item.priceAtAdd);
          const discountPrice = Number(item.variant?.discountPrice) || price;
          const totalItem = discountPrice * item.quantity;

          return (
            <div
              key={item.id}
              className="flex items-center justify-between gap-3 py-3"
            >
              <Image
                src={
                  item.product.imageUrl
                    ? item.product.imageUrl.startsWith("http")
                      ? item.product.imageUrl
                      : `${baseUrl}/${item.product.imageUrl.replace(
                          /^\/+/,
                          ""
                        )}`
                    : "/pic/placeholder-product.png"
                }
                alt={item.product.name}
                width={64}
                height={64}
                className="rounded-lg object-cover"
                unoptimized
              />

              <div className="flex-1 text-right">
                <p className="text-[13px] font-medium text-[#242424]">
                  {item.product.name}
                </p>

                {(item.variant?.flavor || item.variant?.packageQuantity) && (
                  <p className="text-[12px] text-gray-500">
                    {item.variant?.flavor
                      ? `طعم: ${item.variant.flavor}`
                      : `تعداد در بسته: ${item.variant.packageQuantity}`}
                  </p>
                )}

                {discountPrice < price ? (
                  <div dir="rtl" className="text-[13px] space-y-0.5 mt-[2px]">
                    {/* قیمت قبل از تخفیف */}
                    <p className="line-through text-[#D32F2F]">
                      {price.toLocaleString("fa-IR")} تومان
                    </p>

                    {/* قیمت بعد از تخفیف */}
                    <p className="text-gray-800 font-bold">
                      {item.quantity} × {discountPrice.toLocaleString("fa-IR")}{" "}
                      تومان
                    </p>
                  </div>
                ) : (
                  <p dir="rtl" className="text-[13px] text-gray-800 font-bold mt-[2px]">
                    {item.quantity} × {price.toLocaleString("fa-IR")} تومان
                  </p>
                )}
              </div>

              <button
                onClick={() => removeItem(item.id)}
                disabled={isRemoving}
                className="text-red-500 text-[26px] font-bold hover:text-red-600 disabled:opacity-50"
              >
                ×
              </button>
            </div>
          );
        })}
      </div>

      {/* 📊 بخش پایینی مجموع */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 pt-3 mt-2">
        {totalDiscount > 0 && (
          <div className="flex justify-between items-center text-[13px] text-[#E53935] mb-[2px]">
            <span>سود شما از این خرید:</span>
            <span className="font-bold">
              {totalDiscount.toLocaleString("fa-IR")} تومان
            </span>
          </div>
        )}

        <div className="flex justify-between items-center text-[13px] text-gray-600">
          <span>جمع کل بدون تخفیف:</span>
          <span>{totalBeforeDiscount.toLocaleString("fa-IR")} تومان</span>
        </div>

        <div className="flex justify-between items-center text-[14px] font-bold text-gray-800 mt-1">
          <span>جمع کل نهایی:</span>
          <span>{totalAfterDiscount.toLocaleString("fa-IR")} تومان</span>
        </div>

        <Link
          href="/cart"
          className="block text-center text-white bg-[#0077B6] rounded-lg py-2 text-[14px] font-medium hover:bg-[#0096C7] mt-2 transition-all"
        >
          مشاهده سبد خرید
        </Link>
      </div>
    </div>
  );
}
