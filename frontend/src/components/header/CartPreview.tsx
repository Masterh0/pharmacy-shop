"use client";

import Image from "next/image";
import { useState } from "react";
import { useCart } from "@/lib/hooks/useAddToCart";
import clsx from "clsx";
import { CartItem } from "@/lib/types/cart";

interface CartPreviewProps {
  isLoggedIn: boolean;
  onLoginRequired: (path: string) => boolean;
}

export default function CartPreview({ 
  isLoggedIn, 
  onLoginRequired 
}: CartPreviewProps) {
  const { cart, isLoading, isError, removeItem, isRemoving } = useCart();
  const [removingId, setRemovingId] = useState<number | null>(null);

  const items: CartItem[] = cart?.items ?? [];
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";

  if (isLoading)
    return <div className="p-4 text-center">در حال بارگذاری سبد...</div>;

  if (isError)
    return (
      <div className="p-4 text-center text-red-500">
        مشکل در دریافت اطلاعات
      </div>
    );

  if (!items.length)
    return (
      <div className="p-4 text-center text-gray-500">
        سبد خرید شما خالی است 🙁
      </div>
    );

  const totalBeforeDiscount = items.reduce(
    (sum: number, item: CartItem) =>
      sum + Number(item.variant?.price ?? item.priceAtAdd) * item.quantity,
    0
  );

  const totalAfterDiscount = items.reduce(
    (sum: number, item: CartItem) =>
      sum +
      Number(
        item.variant?.discountPrice ?? item.variant?.price ?? item.priceAtAdd
      ) *
        item.quantity,
    0
  );

  const totalDiscount = totalBeforeDiscount - totalAfterDiscount;

  const handleRemove = async (id: number) => {
    setRemovingId(id);
    await new Promise((r) => setTimeout(r, 250));
    await removeItem(id);
    setRemovingId(null);
  };

  const handleViewCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    // ✅ اگر لاگین نیست، مودال نشون میده
    if (!isLoggedIn) {
      onLoginRequired("/checkout/cart");
      return;
    }
    // ✅ اگر لاگین بود، بره به سبد خرید
    window.location.href = "/checkout/cart";
  };

  return (
    <div
      className={clsx(
        "p-4 w-[360px] flex flex-col rounded-xl bg-white shadow-[0_4px_20px_rgba(0,0,0,0.1)]",
        "animate-[fadeIn_0.25s_ease-out]"
      )}
    >
      <div
        className="
          max-h-[250px] overflow-y-auto pr-2 divide-y divide-gray-100
          scrollbar-thin scrollbar-thumb-gray-300
        "
      >
        {items.map((item: CartItem) => {
          const price = Number(item.variant?.price ?? item.priceAtAdd);
          const discountPrice = Number(item.variant?.discountPrice) || price;

          return (
            <div
              key={item.id}
              className={clsx(
                "flex items-center justify-between gap-3 py-3 transition-all duration-300",
                removingId === item.id
                  ? "opacity-0 -translate-x-4"
                  : "opacity-100 translate-x-0"
              )}
            >
              <Image
                src={
                  item.product?.imageUrl
                    ? item.product.imageUrl.startsWith("http")
                      ? item.product.imageUrl
                      : `${baseUrl}/${item.product.imageUrl.replace(/^\/+/, "")}`
                    : "/pic/placeholder-product.png"
                }
                alt={item.product?.name ?? "محصول"}
                width={64}
                height={64}
                className="rounded-lg object-cover"
                unoptimized
              />

              <div className="flex-1 text-right">
                <p className="text-[13px] font-medium text-[#242424]">
                  {item.product?.name}
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
                    <p className="line-through text-[#D32F2F]">
                      {price.toLocaleString("fa-IR")} تومان
                    </p>

                    <p className="text-gray-800 font-bold">
                      {item.quantity} ×{" "}
                      {discountPrice.toLocaleString("fa-IR")} تومان
                    </p>
                  </div>
                ) : (
                  <p
                    dir="rtl"
                    className="text-[13px] text-gray-800 font-bold mt-[2px]"
                  >
                    {item.quantity} × {price.toLocaleString("fa-IR")} تومان
                  </p>
                )}
              </div>

              <button
                onClick={() => handleRemove(item.id)}
                disabled={isRemoving}
                className="text-red-500 text-[26px] font-bold hover:text-red-600 disabled:opacity-50"
              >
                ×
              </button>
            </div>
          );
        })}
      </div>

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

        <button
          onClick={handleViewCart}
          className="
            block w-full text-center text-white bg-[#0077B6] rounded-lg py-2 text-[14px] font-medium 
            hover:bg-[#0096C7] mt-2 transition-all
          "
        >
          مشاهده سبد خرید
        </button>
      </div>
    </div>
  );
}
