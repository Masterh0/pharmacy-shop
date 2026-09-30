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
import { toast } from "sonner"; // یا هر کتابخانه toast که در پروژه استفاده می‌شود

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
  const removingItemsRef = useRef<Set<number>>(new Set());

  const { cart, isLoading: isCartLoading, removeItem, updateItem } = useCart();

  const outOfStockNotifiedRef = useRef<Set<number>>(new Set());
  const [qtyMap, setQtyMap] = useState<Record<number, number>>({});
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const priceChangedNotifiedRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    if (!isAuthLoading) requireLogin("/checkout/cart");
  }, [isAuthLoading, requireLogin]);

  useEffect(() => {
    if (!cart?.items?.length) return;

    cart.items.forEach((item) => {
      if (
        item.priceChanged &&
        item.isAvailable &&
        !priceChangedNotifiedRef.current.has(item.id)
      ) {
        priceChangedNotifiedRef.current.add(item.id);
        const oldPrice = Number(item.priceAtAdd).toLocaleString("fa-IR");
        const newPrice = (
          item.currentPrice ??
          Number(item.variant?.discountPrice ?? item.variant?.price)
        ).toLocaleString("fa-IR");
        toast.warning(
          `مشتری عزیز، قیمت «${item.product?.name ?? "این محصول"}» از ${oldPrice} به ${newPrice} تومان تغییر کرده است. لطفاً سبد خرید را بررسی کنید.`,
          { duration: 7000 },
        );
      }
      if (removingItemsRef.current.has(item.id)) return;
      const shouldRemove =
        item.unavailableReason === "OUT_OF_STOCK" ||
        item.unavailableReason === "PRODUCT_BLOCKED" ||
        item.unavailableReason === "PRODUCT_DELETED" ||
        item.unavailableReason === "VARIANT_DELETED" ||
        !item.isAvailable;

      if (shouldRemove) {
        removingItemsRef.current.add(item.id);
        const reason =
          item.unavailableReason === "OUT_OF_STOCK"
            ? "موجودیش تمام شده"
            : "دیگر قابل خرید نیست";
        toast.error(
          `${item.product?.name ?? "این محصول"} ${reason} و از سبد حذف شد`,
        );
        removeItem({ itemId: item.id, silent: true });
        return;
      }

      // auto-adjust: quantity بیشتر از stock
      if (
        item.quantityExceedsStock &&
        typeof item.stock === "number" &&
        item.stock > 0
      ) {
        if (removingItemsRef.current.has(item.id)) return;
        removingItemsRef.current.add(item.id);
        toast.warning(
          `موجودی ${item.product?.name ?? "این محصول"} به ${item.stock} عدد کاهش یافت`,
        );
        updateItem({ itemId: item.id, quantity: item.stock, silent: true });
        // بعد از settle، ref رو پاک کن تا اگه دوباره تغییر کرد واکنش بده
        setTimeout(() => removingItemsRef.current.delete(item.id), 3000);
      }
    });
  }, [cart?.items, removeItem, updateItem]);

  const debounceUpdate = (itemId: number, quantity: number) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(
      () => updateItem({ itemId, quantity }),
      1500,
    );
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#00B4D8] border-t-transparent" />
      </div>
    );
  }

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

  if (isCartLoading) {
    return (
      <div className="w-full flex justify-center py-20 text-gray-500">
        در حال بارگذاری...
      </div>
    );
  }

  if (!cart) {
    return (
      <div className="w-full flex justify-center py-20 text-red-500">
        خطا در دریافت سبد خرید
      </div>
    );
  }

  const items = cart.items ?? [];
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  // ✅ استفاده از مقادیر بک‌اند — بدون محاسبه مجدد
  const subtotal = cart.subtotal ?? 0;
  const totalBeforeDiscount = items.reduce(
    (sum, item) =>
      sum + Number(item.variant?.price ?? item.priceAtAdd) * item.quantity,
    0,
  );
  const discountAmount = totalBeforeDiscount - subtotal;

  return (
    <div className="w-full flex justify-center bg-white pt-6 lg:pt-[40px] pb-[80px]">
      <div className="w-full lg:w-[1440px] flex justify-center relative px-3 sm:px-4 lg:px-0">
        <div
          dir="ltr"
          className="absolute top-0 right-3 left-3 lg:left-[524px] lg:right-auto w-auto lg:w-[808px] h-[48px] flex items-center justify-end border-b border-[#D6D6D6] pr-2 lg:pr-[24px]"
        >
          <span className="text-[#434343] text-[14px] lg:text-[16px] font-IRANYekanX">
            {" "}
            سبد خرید
          </span>
        </div>

        <div className="w-full flex flex-col lg:flex-row lg:justify-center gap-6 lg:gap-[32px] mt-[72px] lg:mt-[80px] items-stretch lg:items-start">
          {" "}
          {/* Left */}
          <div className="flex flex-col w-full lg:w-[808px]">
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
                // ✅ از currentPrice بک‌اند استفاده می‌کنیم
                const currentPrice =
                  item.currentPrice ??
                  Number(
                    item.variant?.discountPrice ??
                      item.variant?.price ??
                      item.priceAtAdd,
                  );
                const originalPrice = Number(
                  item.variant?.price ?? item.priceAtAdd,
                );
                const finalPrice = currentPrice * item.quantity;
                const origTotal = originalPrice * item.quantity;
                const hasDiscount = currentPrice < originalPrice;
                const buildImageUrl = (path?: string | null) =>
                  path
                    ? path.startsWith("http")
                      ? path
                      : `${baseUrl}/${path.replace(/^\/+/, "")}`
                    : null;

                const imageSrc =
                  buildImageUrl(item.variant?.images?.[0]?.url) ??
                  buildImageUrl(item.product?.imageUrl) ??
                  "/pic/placeholder-product.png";
                return (
                  <div
                    key={item.id}
                    className={`
  relative
  w-full
  border-b border-[#D6D6D6]

  min-h-[230px]
  grid
  grid-cols-[80px_minmax(0,1fr)]
  gap-x-3

  px-2 py-5

  lg:h-[160px]
  lg:min-h-0
  lg:flex
  lg:grid-cols-none
  lg:gap-0
  lg:justify-between
  lg:items-center
  lg:px-[24px]
  lg:py-0

  ${!item.isAvailable ? "opacity-60" : ""}
`}
                  >
                    {/* هشدار ناموجودی */}
                    {!item.isAvailable && (
                      <div className="absolute top-[6px] right-[40px] text-[11px] text-red-500 font-IRANYekanX">
                        {item.unavailableReason === "OUT_OF_STOCK"
                          ? "ناموجود"
                          : item.unavailableReason === "PRODUCT_BLOCKED"
                            ? "غیرفعال"
                            : "حذف شده"}
                      </div>
                    )}

                    {/* هشدار تغییر قیمت */}
                    {item.priceChanged && item.isAvailable && (
                      <div className="absolute top-[6px] right-[40px] text-[11px] text-amber-500 font-IRANYekanX">
                        قیمت تغییر کرده
                      </div>
                    )}

                    {/* هشدار موجودی ناکافی */}
                    {item.quantityExceedsStock && item.isAvailable && (
                      <div className="absolute top-[6px] right-[40px] text-[11px] text-orange-500 font-IRANYekanX">
                        موجودی: {item.stock} عدد
                      </div>
                    )}

                    <div className="absolute right-2 bottom-2 lg:left-[24px] lg:right-auto lg:bottom-[2px] flex items-center gap-1">
                      {" "}
                      <TruckFast size="20" variant="Outline" color="#434343" />
                      <span className="text-[#434343] text-[12px]">
                        ارسال از ۳ روز آینده
                      </span>
                    </div>

                    <button
                      onClick={() => removeItem({ itemId: item.id })}
                      className="absolute right-1 top-2 lg:right-[1px] lg:top-[30px] w-[34px] h-[34px] border border-[#D6D6D6] rounded-[6px] flex items-center justify-center hover:bg-red-50 hover:border-red-300 transition z-10"
                    >
                      <span className="text-[#434343] text-[26px] leading-none">
                        ×
                      </span>
                    </button>

                    <div className="w-[80px] h-[80px] rounded-md overflow-hidden mt-8 lg:mt-[30px]">
                      <Image
                        src={imageSrc}
                        alt={item.product?.name ?? "product"}
                        width={80}
                        height={80}
                        className="object-cover"
                        unoptimized
                      />
                    </div>

                    <div className="min-w-0 w-auto lg:w-[260px] mt-8 lg:mt-[30px] pr-2 lg:pr-0 text-right text-[#242424] text-[14px]">
                      {" "}
                      {item.product?.name}
                      {item.variant?.attributes &&
                        item.variant.attributes.length > 0 && (
                          <div className="text-[12px] text-gray-500 mt-1 flex flex-wrap justify-end gap-x-2">
                            {item.variant.attributes.map((va) => (
                              <span key={va.valueId}>
                                {va.value.attribute.name}: {va.value.value}
                              </span>
                            ))}
                          </div>
                        )}
                    </div>

                    <div className="absolute left-2 bottom-[48px] lg:static flex items-center h-[32px] w-[101px] border border-[#D6D6D6] rounded-[8px] overflow-hidden lg:mt-[30px]">
                      {" "}
                      <button
                        disabled={!item.isAvailable}
                        onClick={() => {
                          const current = qtyMap[item.id] ?? item.quantity;

                          if (
                            typeof item.stock === "number" &&
                            current >= item.stock
                          ) {
                            toast.error(`فقط ${item.stock} عدد موجود است`);
                            return;
                          }

                          if (current >= 99) {
                            toast.error("حداکثر تعداد هر محصول ۹۹ عدد است");
                            return;
                          }

                          const newQty = current + 1;

                          setQtyMap((p) => ({
                            ...p,
                            [item.id]: newQty,
                          }));

                          updateItem(
                            {
                              itemId: item.id,
                              quantity: newQty,
                            },
                            {
                              onError: (err: any) => {
                                setQtyMap((p) => ({
                                  ...p,
                                  [item.id]: current,
                                }));

                                const status = err?.response?.status;
                                const message = err?.response?.data?.message;

                                if (status === 400 && message) {
                                  toast.error(message);
                                  return;
                                }

                                toast.error("خطا در بروزرسانی تعداد");
                              },
                            },
                          );
                        }}
                        className="w-[32px] h-full flex items-center justify-center text-[20px] text-[#434343] border-l border-[#D6D6D6] hover:bg-gray-50 transition disabled:opacity-40"
                      >
                        +
                      </button>
                      <input
                        type="number"
                        min={1}
                        disabled={!item.isAvailable}
                        value={qtyMap[item.id] ?? item.quantity}
                        onChange={(e) => {
                          const serverQty = item.quantity;
                          const val = Math.min(
                            99,
                            Math.max(1, Number(e.target.value)),
                          );
                          setQtyMap((p) => ({ ...p, [item.id]: val }));
                          if (debounceRef.current)
                            clearTimeout(debounceRef.current);
                          debounceRef.current = setTimeout(() => {
                            updateItem(
                              { itemId: item.id, quantity: val },
                              {
                                onError: (err: any) => {
                                  setQtyMap((p) => ({
                                    ...p,
                                    [item.id]: serverQty,
                                  }));
                                  {
                                    toast.error(
                                      `فقط ${item.stock} عدد موجود است`,
                                    );
                                    return;
                                  }
                                },
                              },
                            );
                          }, 1500);
                        }}
                        className="w-full h-full text-center text-[14px] text-[#242424] outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none disabled:opacity-40"
                      />
                      <button
                        disabled={!item.isAvailable}
                        onClick={() => {
                          const current = qtyMap[item.id] ?? item.quantity;
                          const newQty = Math.max(1, current - 1);
                          if (newQty === current) return;
                          setQtyMap((p) => ({ ...p, [item.id]: newQty }));
                          updateItem(
                            { itemId: item.id, quantity: newQty },
                            {
                              onError: (err: any) => {
                                setQtyMap((p) => ({
                                  ...p,
                                  [item.id]: current,
                                }));
                                toast.error(
                                  err?.response?.data?.message ??
                                    "خطا در بروزرسانی",
                                );
                              },
                            },
                          );
                        }}
                        className="w-[32px] h-full flex items-center justify-center text-[20px] text-[#434343] border-r border-[#D6D6D6] hover:bg-gray-50 transition disabled:opacity-40"
                      >
                        -
                      </button>
                    </div>

                    <div
                      className="
    absolute
    right-4
    bottom-[42px]

    w-[calc(100%-100px)]
    max-w-[180px]

    lg:static
    lg:w-[120px]
    lg:max-w-none
    lg:mt-[30px]

    flex
    flex-col
    items-end
    text-right
  "
                    >
                      {" "}
                      {/* قیمت واحد */}
                      <div className="text-[11px] text-[#888] mb-1">
                        هر عدد: {currentPrice.toLocaleString("fa-IR")} تومان
                      </div>
                      {hasDiscount && (
                        <div className="flex items-center gap-1 line-through text-[#be1919] text-[12px]">
                          {origTotal.toLocaleString("fa-IR")} تومان
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <span className="text-[#434343] text-[14px]">
                          {finalPrice.toLocaleString("fa-IR")}
                        </span>
                        <span className="text-[#434343] text-[12px]">
                          تومان
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          {/* Right Summary */}
          {items.length > 0 && (
            <div className="w-full lg:w-[392px] flex flex-col gap-[16px] lg:sticky lg:top-[100px]">
              {" "}
              <div className="border border-[#D6D6D6] rounded-[8px] p-[24px] flex flex-col gap-[16px] bg-white">
                <div className="flex justify-between text-[14px] leading-[20px] text-[#434343]">
                  <span>قیمت کالاها</span>
                  <span>
                    {totalBeforeDiscount.toLocaleString("fa-IR")} تومان
                  </span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-[14px] leading-[20px] text-[#434343]">
                    <span>سود شما از خرید</span>
                    <div className="flex items-center gap-1">
                      <span className="text-red-500 font-medium">
                        {discountAmount.toLocaleString("fa-IR")}
                      </span>
                      <span className="text-[#434343]">تومان</span>
                    </div>
                  </div>
                )}

                <div className="flex justify-between text-[16px] leading-[24px] text-[#242424] font-semibold">
                  <span>جمع سبد خرید</span>
                  <span>{subtotal.toLocaleString("fa-IR")} تومان</span>
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
