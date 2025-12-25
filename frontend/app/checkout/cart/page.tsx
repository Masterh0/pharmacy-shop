// app/checkout/cart/page.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { TruckFast } from "iconsax-react";
import { useCart } from "@/lib/hooks/useAddToCart";
import { useState, useEffect, useRef } from "react";
import type { CartItem } from "@/lib/types/cart";
import { useLoginRequired } from "@/lib/hooks/useLoginRequired";
import LoginRequiredModal from "@/src/components/modals/LoginRequiredModal";

export default function CartPage() {
  const {
    user,
    isLoading: isAuthLoading,
    showModal,
    requireLogin,
    goToLogin,
    goToSignup,
    closeModal,
  } = useLoginRequired();

  const { cart, isLoading: isCartLoading, removeItem, updateItem } = useCart();

  const [qtyMap, setQtyMap] = useState<Record<number, number>>({});
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // 🔐 چک لاگین به محض لود
  useEffect(() => {
    if (!isAuthLoading) {
      requireLogin("/checkout/cart");
    }
  }, [isAuthLoading, requireLogin]);

  // بارگذاری مقادیر اولیه
  useEffect(() => {
    if (cart?.items) {
      const initial: Record<number, number> = {};
      cart.items.forEach((item) => {
        initial[item.id] = item.quantity;
      });
      setQtyMap(initial);
    }
  }, [cart]);

  const debounceUpdate = (itemId: number, quantity: number) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      updateItem({ itemId, quantity });
    }, 1500);
  };

  // 🔄 لودینگ تا چک شدن لاگین
  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#00B4D8] border-t-transparent"></div>
      </div>
    );
  }

  // ❌ اگر لاگین نیست، فقط مودال
  if (!user) {
    return (
      <>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-[#00B4D8] to-[#0077B6] rounded-full flex items-center justify-center shadow-xl">
              <Image
                src="/pic/headersPic/shopping-cart.svg"
                alt="سبد خرید"
                width={48}
                height={48}
                className="brightness-0 invert"
              />
            </div>
            <h1 className="text-2xl font-bold text-[#242424] mb-2 font-IRANYekanX">
              سبد خرید شما
            </h1>
            <p className="text-[#666] font-IRANYekanX">
              لطفاً برای مشاهده سبد خرید وارد شوید
            </p>
          </div>
        </div>
        <LoginRequiredModal
          isOpen={showModal}
          onClose={closeModal}
          onLogin={goToLogin}
          onSignup={goToSignup}
        />
      </>
    );
  }

  // 🔄 لودینگ سبد خرید
  if (isCartLoading) {
    return (
      <div className="w-full flex justify-center py-20 text-gray-500">
        در حال بارگذاری...
      </div>
    );
  }

  // ❌ خطای سبد خرید
  if (!cart) {
    return (
      <div className="w-full flex justify-center py-20 text-red-500">
        خطا در دریافت سبد خرید
      </div>
    );
  }

  const items = cart.items ?? [];
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  const calcOriginalPrice = (item: CartItem) =>
    Number(item.variant?.price ?? item.priceAtAdd);

  const calcFinalPrice = (item: CartItem) =>
    Number(
      item.variant?.discountPrice ?? item.variant?.price ?? item.priceAtAdd
    );

  const totalBeforeDiscount = items.reduce(
    (sum, item) => sum + calcOriginalPrice(item) * item.quantity,
    0
  );

  const totalAfterDiscount = items.reduce(
    (sum, item) => sum + calcFinalPrice(item) * item.quantity,
    0
  );

  const discountAmount = totalBeforeDiscount - totalAfterDiscount;
  const payable = totalAfterDiscount;

  return (
    <div className="w-full flex justify-center bg-white pt-[40px] pb-[80px]">
      <div className="w-[1440px] flex justify-center relative">
        {/* Title */}
        <div
          dir="ltr"
          className="absolute top-0 left-[524px] w-[808px] h-[48px] flex items-center justify-end border-b border-[#D6D6D6] pr-[24px]"
        >
          <span className="text-[#434343] text-[16px] font-IRANYekanX">
            سبد خرید
          </span>
        </div>

        <div className="flex gap-[32px] mt-[80px]">
          {/* Left */}
          <div className="flex flex-col w-[808px]">
            {items.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-gray-500 mb-4">سبد خرید شما خالی است</p>
                <Link
                  href="/"
                  className="inline-block px-6 py-3 bg-[#00B4D8] text-white rounded-lg hover:bg-[#0096c7] transition"
                >
                  بازگشت به فروشگاه
                </Link>
              </div>
            ) : (
              items.map((item: CartItem) => {
                const originalPrice = item.quantity * calcOriginalPrice(item);
                const finalPrice = item.quantity * calcFinalPrice(item);

                return (
                  <div
                    key={item.id}
                    className="relative w-full border-b border-[#D6D6D6] h-[160px] flex justify-between items-center px-[24px]"
                  >
                    {/* ارسال */}
                    <div className="absolute left-[24px] bottom-[2px] flex items-center gap-1">
                      <TruckFast size="20" variant="Outline" color="#434343" />
                      <span className="text-[#434343] text-[12px]">
                        ارسال از ۳ روز آینده
                      </span>
                    </div>

                    {/* حذف */}
                    <button
                      onClick={() => removeItem(item.id)}
                      className="absolute right-[1px] top-[30px] w-[34px] h-[34px] border border-[#D6D6D6] rounded-[6px] flex items-center justify-center hover:bg-red-50 hover:border-red-300 transition"
                    >
                      <span className="text-[#434343] text-[26px] leading-none">
                        ×
                      </span>
                    </button>

                    {/* تصویر */}
                    <div className="w-[80px] h-[80px] rounded-md overflow-hidden mt-[30px]">
                      <Image
                        src={
                          item.product?.imageUrl
                            ? item.product.imageUrl.startsWith("http")
                              ? item.product.imageUrl
                              : `${baseUrl}/${item.product.imageUrl.replace(
                                  /^\/+/,
                                  ""
                                )}`
                            : "/pic/placeholder-product.png"
                        }
                        alt={item.product?.name ?? "product"}
                        width={80}
                        height={80}
                        className="object-cover"
                        unoptimized
                      />
                    </div>

                    {/* عنوان */}
                    <div className="w-[260px] mt-[30px] text-right text-[#242424] text-[14px]">
                      {item.product?.name}
                      {item.variant?.flavor && (
                        <div className="text-[12px] text-gray-500 mt-1">
                          طعم: {item.variant.flavor}
                        </div>
                      )}
                      {item.variant?.packageQuantity &&
                        item.variant.packageQuantity > 2 && (
                          <div className="text-[12px] text-gray-500 mt-1">
                            تعداد در بسته: {item.variant.packageQuantity}
                          </div>
                        )}
                    </div>

                    {/* تعداد */}
                    <div className="flex items-center h-[32px] w-[101px] border border-[#D6D6D6] rounded-[8px] overflow-hidden mt-[30px]">
                      <button
                        onClick={() => {
                          const newQty = (qtyMap[item.id] ?? item.quantity) + 1;
                          setQtyMap((p) => ({ ...p, [item.id]: newQty }));
                          updateItem({ itemId: item.id, quantity: newQty });
                        }}
                        className="w-[32px] h-full flex items-center justify-center text-[20px] text-[#434343] border-l border-[#D6D6D6] hover:bg-gray-50 transition"
                      >
                        +
                      </button>

                      <input
                        type="number"
                        min={1}
                        value={qtyMap[item.id] ?? item.quantity}
                        onChange={(e) => {
                          const val = Math.max(1, Number(e.target.value));
                          setQtyMap((p) => ({ ...p, [item.id]: val }));
                          debounceUpdate(item.id, val);
                        }}
                        className="w-full h-full text-center text-[14px] text-[#242424] outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />

                      <button
                        onClick={() => {
                          const newQty = Math.max(
                            1,
                            (qtyMap[item.id] ?? item.quantity) - 1
                          );
                          setQtyMap((p) => ({ ...p, [item.id]: newQty }));
                          updateItem({ itemId: item.id, quantity: newQty });
                        }}
                        className="w-[32px] h-full flex items-center justify-center text-[20px] text-[#434343] border-r border-[#D6D6D6] hover:bg-gray-50 transition"
                      >
                        -
                      </button>
                    </div>

                    {/* قیمت */}
                    <div className="flex flex-col items-end w-[120px] mt-[30px]">
                      {finalPrice < originalPrice && (
                        <div className="flex items-center gap-1 line-through text-[#be1919] text-[12px]">
                          {originalPrice.toLocaleString("fa-IR")} تومان
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <span className="text-[#434343] text-[14px]">
                          {finalPrice.toLocaleString("fa-IR")}
                        </span>
                        <span className="text-[#434343] text-[12px]">تومان</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Right Summary */}
          {items.length > 0 && (
            <div className="w-[392px] flex flex-col gap-[16px]">
              <div className="border border-[#D6D6D6] rounded-[8px] p-[24px] flex flex-col gap-[16px] bg-white">
                <div className="flex justify-between text-[14px] leading-[20px] text-[#434343]">
                  <span>قیمت کالاها</span>
                  <span>{totalBeforeDiscount.toLocaleString("fa-IR")} تومان</span>
                </div>

                <div className="flex justify-between text-[14px] leading-[20px] text-[#434343]">
                  <span>سود شما از خرید</span>
                  <div className="flex items-center gap-1">
                    <span className="text-red-500 font-medium">
                      {discountAmount.toLocaleString("fa-IR")}
                    </span>
                    <span className="text-[#434343]">تومان</span>
                  </div>
                </div>

                <div className="flex justify-between text-[16px] leading-[24px] text-[#242424] font-semibold">
                  <span>جمع سبد خرید</span>
                  <span>{payable.toLocaleString("fa-IR")} تومان</span>
                </div>

                <Link href="/checkout/address">
                  <button className="w-full h-[40px] bg-[#00B4D8] text-white rounded-[8px] text-[14px] font-medium hover:bg-[#0096c7] transition">
                    ادامه فرآیند خرید
                  </button>
                </Link>
              </div>

              <div className="border border-[#D6D6D6] rounded-[8px] p-[24px] bg-white">
                <div className="flex items-center gap-2 text-[#434343] text-[14px] leading-[22px] mb-[8px]">
                  <div className="w-[8px] h-[8px] bg-[#656565] rounded-full" />
                  در صورت اتمام موجودی کالا، از سبد خرید حذف می‌شود.
                </div>

                <div className="flex items-center gap-2 text-[#434343] text-[14px] leading-[22px]">
                  <div className="w-[8px] h-[8px] bg-[#656565] rounded-full" />
                  لطفاً هنگام خرید، فیلتر شکن خود را خاموش کنید.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
