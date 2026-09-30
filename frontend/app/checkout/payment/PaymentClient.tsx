"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { TruckFast } from "iconsax-react";

import { addressApi } from "@/lib/api/address";
import { useCart } from "@/lib/hooks/useAddToCart";
import { useShippingCost } from "@/lib/hooks/useShippingCost";
import { useOrders } from "@/lib/hooks/useOrders";
import type { CartItem } from "@/lib/types/cart";
import { useCheckout } from "@/lib/context/CheckoutContext";
export default function PaymentClient() {
  const router = useRouter();
  const { addressId, hydrated } = useCheckout();
  const [address, setAddress] = useState<any>(null);
  const [addressLoading, setAddressLoading] = useState(true);
  const removingItemsRef = useRef<Set<number>>(new Set());
  const { cart, isLoading: isCartLoading, removeItem, updateItem } = useCart();
  const { data: shipping, isLoading: isShippingLoading } = useShippingCost(
    addressId ? Number(addressId) : undefined,
  );
  const { createOrder, isCreating } = useOrders();
  const priceChangedNotifiedRef = useRef<Set<number>>(new Set());
  const [orderPlaced, setOrderPlaced] = useState(false);

  useEffect(() => {
    if (orderPlaced) return;
    if (!cart?.items?.length) return;

    cart.items.forEach((item) => {
      if (removingItemsRef.current.has(item.id)) return;
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
          `مشتری عزیز، قیمت «${item.product?.name ?? "این محصول"}» از ${oldPrice} به ${newPrice} تومان تغییر کرده است.`,
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

      if (
        item.quantityExceedsStock &&
        typeof item.stock === "number" &&
        item.stock > 0
      ) {
        removingItemsRef.current.add(item.id);
        toast.warning(
          `موجودی ${item.product?.name ?? "این محصول"} به ${item.stock} عدد کاهش یافت`,
        );
        updateItem({ itemId: item.id, quantity: item.stock, silent: true });
        setTimeout(() => removingItemsRef.current.delete(item.id), 3000);
      }
    });
  }, [cart?.items, removeItem, updateItem, orderPlaced]);
  const redirectingRef = useRef(false);

  useEffect(() => {
    // هنوز CheckoutContext از sessionStorage بازیابی نشده
    if (!hydrated) return;

    // آدرس داریم؛ ادامه بده
    if (addressId) {
      async function loadAddress() {
        try {
          setAddressLoading(true);

          const addr = await addressApi.get(addressId);

          setAddress(addr);
        } catch {
          toast.error("خطا در بارگذاری آدرس");

          if (!redirectingRef.current) {
            redirectingRef.current = true;
            router.replace("/checkout/address");
          }
        } finally {
          setAddressLoading(false);
        }
      }

      loadAddress();

      return;
    }

    // آدرس نداریم
    if (redirectingRef.current) return;

    redirectingRef.current = true;

    toast.error("آدرس انتخاب نشده است");
    router.replace("/checkout/address");
  }, [hydrated, addressId, router]);

  const calcOriginalPrice = (item: CartItem) =>
    Number(item.variant?.price ?? item.priceAtAdd);

  const calcFinalPrice = (item: CartItem) => {
    const price = Number(item.variant?.price ?? item.priceAtAdd);
    const discountPrice = Number(item.variant?.discountPrice ?? 0);

    return discountPrice > 0 ? discountPrice : price;
  };

  const items = cart?.items ?? [];
  const itemsTotal = items.reduce(
    (sum, item) => sum + calcFinalPrice(item) * item.quantity,
    0,
  );
  const totalDiscount = items.reduce(
    (sum, item) =>
      sum + (calcOriginalPrice(item) - calcFinalPrice(item)) * item.quantity,
    0,
  );
  const shippingCost = shipping?.shippingCost || 0;
  const finalPayable = itemsTotal + shippingCost;
  const loading =
    !hydrated || addressLoading || isCartLoading || isShippingLoading;
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#00B4D8] border-t-transparent" />
      </div>
    );
  }
  if (orderPlaced) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-white">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-[#00B4D8]/20" />
          <div className="absolute inset-0 rounded-full border-4 border-[#00B4D8] border-t-transparent animate-spin" />
        </div>
        <div className="flex flex-col items-center gap-2">
          <p className="text-[#242424] text-[16px] font-medium">
            سفارش شما با موفقیت ثبت شد 🎉
          </p>
          <p className="text-[#656565] text-[13px]">
            در حال انتقال به سفارش‌های شما...
          </p>
        </div>
      </div>
    );
  }

  if (!cart || items.length === 0) {
    return (
      <div className="w-full flex justify-center py-20 text-gray-500">
        سبد خرید شما خالی است
      </div>
    );
  }

  const handlePay = async () => {
    if (!addressId) {
      toast.error("آدرس انتخاب نشده است");
      return;
    }
    const toastId = toast.loading("در حال ثبت سفارش...");
    createOrder(
      { addressId: Number(addressId), shippingCost },
      {
        onSuccess: () => {
          toast.dismiss(toastId);
          toast.success("سفارش با موفقیت ثبت شد!");
          setOrderPlaced(true);
          setTimeout(() => router.push(`/profile/orders`), 1500);
        },
        onError: (err: any) => {
          toast.dismiss(toastId);
          toast.error(err?.response?.data?.message || "خطا در ثبت سفارش");
        },
      },
    );
  };

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  return (
    <div className="w-full flex justify-center bg-white pt-6 lg:pt-[40px] pb-[80px]">
      <div className="w-full lg:w-[1440px] flex justify-center relative px-3 sm:px-4 lg:px-0">
        {/* Title */}
        <div
          dir="ltr"
          className="
          absolute
          top-0
          right-3 left-3
          lg:left-[392px] lg:right-auto
          w-auto lg:w-[808px]
          h-[48px]
          flex items-center justify-end
          border-b border-[#D6D6D6]
          pr-2 lg:pr-[24px]
        "
        >
          <span className="text-[#434343] text-[14px] lg:text-[16px] font-IRANYekanX">
            نهایی کردن سفارش
          </span>
        </div>

        {/* Main */}
        <div
          className="
          w-full
          flex flex-col
          lg:flex-row
          lg:justify-center
          gap-6 lg:gap-[32px]
          mt-[72px] lg:mt-[80px]
          items-stretch lg:items-start
        "
        >
          {/* =========================
            Products / Address
        ========================== */}
          <div className="flex flex-col w-full lg:w-[808px]">
            {/* آدرس تحویل */}
            {address && (
              <div
                className="
                border border-[#D6D6D6]
                rounded-[8px]
                p-4 lg:p-[20px]
                mb-5 lg:mb-[24px]
                flex flex-col gap-2
              "
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[#242424] text-[14px] font-semibold">
                    آدرس تحویل
                  </span>

                  <button
                    onClick={() => router.push("/checkout/address")}
                    className="text-[#00B4D8] text-[12px] hover:underline"
                  >
                    تغییر آدرس
                  </button>
                </div>

                <p className="text-[#242424] text-[14px] font-medium">
                  {address.fullName}
                </p>

                <p className="text-[#434343] text-[13px] leading-6">
                  {address.province}، {address.city}، {address.street}
                </p>

                <p className="text-[#656565] text-[12px]">
                  کد پستی: {address.postalCode}
                </p>
              </div>
            )}

            {/* آیتم‌های سبد */}
            {items.map((item: CartItem) => {
              const original = calcOriginalPrice(item) * item.quantity;
              const final = calcFinalPrice(item) * item.quantity;

              return (
                <div
                  key={item.id}
                  className="
                  relative
                  w-full
                  border-b border-[#D6D6D6]

                  min-h-[190px]
                  grid
                  grid-cols-[72px_minmax(0,1fr)]
                  gap-x-3
                  px-2 py-5

                  lg:h-[140px]
                  lg:min-h-0
                  lg:flex
                  lg:grid-cols-none
                  lg:gap-0
                  lg:justify-between
                  lg:items-center
                  lg:px-[24px]
                  lg:py-0
                "
                >
                  {/* ارسال */}
                  <div
                    className="
                    absolute
                    right-2 bottom-2

                    lg:left-[24px]
                    lg:right-auto
                    lg:bottom-[6px]

                    flex items-center gap-1
                  "
                  >
                    <TruckFast size="18" variant="Outline" color="#434343" />

                    <span className="text-[#434343] text-[12px] whitespace-nowrap">
                      ارسال از ۳ روز آینده
                    </span>
                  </div>

                  {/* تصویر */}
                  <div
                    className="
                    w-[72px] h-[72px]
                    rounded-md
                    overflow-hidden
                    mt-2
                    lg:mt-[20px]
                    flex-shrink-0
                  "
                  >
                    <img
                      src={
                        item.product?.imageUrl
                          ? item.product.imageUrl.startsWith("http")
                            ? item.product.imageUrl
                            : `${baseUrl}/${item.product.imageUrl.replace(/^\/+/, "")}`
                          : "/pic/placeholder-product.png"
                      }
                      alt={item.product?.name ?? "product"}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* نام */}
                  <div
                    className="
                    min-w-0
                    w-auto
                    lg:w-[300px]

                    mt-2
                    lg:mt-[20px]

                    text-right
                    text-[#242424]
                    text-[14px]

                    pr-1
                    lg:px-[12px]
                  "
                  >
                    <div className="break-words">{item.product?.name}</div>

                    {item.variant?.attributes &&
                      item.variant.attributes.length > 0 && (
                        <div className="text-[12px] text-gray-500 mt-1 leading-6 break-words">
                          {item.variant.attributes
                            .map(
                              (a: any) =>
                                `${a.value.attribute.name}: ${a.value.value}`,
                            )
                            .join(" | ")}
                        </div>
                      )}
                  </div>

                  {/* تعداد */}
                  <div
                    className="
                    absolute
                    left-2 bottom-[45px]

                    lg:static
                    mt-2 lg:mt-[20px]

                    text-[#434343]
                    text-[13px]
                    whitespace-nowrap
                  "
                  >
                    × {item.quantity}
                  </div>

                  {/* قیمت */}
                  <div
                    className="
                    absolute
                    right-2 bottom-[42px]

                    w-[calc(100%-100px)]
                    max-w-[190px]

                    lg:static
                    lg:w-[120px]
                    lg:max-w-none
                    lg:mt-[20px]

                    flex flex-col
                    items-end
                    text-right
                  "
                  >
                    {final < original && (
                      <span className="line-through text-[#be1919] text-[12px] whitespace-nowrap">
                        {original.toLocaleString("fa-IR")} تومان
                      </span>
                    )}

                    <div className="flex items-center gap-1 whitespace-nowrap">
                      <span className="text-[#434343] text-[14px]">
                        {final.toLocaleString("fa-IR")}
                      </span>

                      <span className="text-[#434343] text-[12px]">تومان</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* =========================
            Payment Summary
        ========================== */}
          <div
            className="
    w-full
    lg:w-[392px]
    flex flex-col
    gap-[16px]
    lg:sticky
    lg:top-[24px]
    lg:self-start
  "
          >
            <div className="border border-[#D6D6D6] rounded-[8px] p-4 lg:p-[24px] flex flex-col gap-[16px] bg-white">
              <div className="flex justify-between gap-4 text-[14px] text-[#434343]">
                <span>قیمت کالاها</span>

                <span className="whitespace-nowrap">
                  {itemsTotal.toLocaleString("fa-IR")} تومان
                </span>
              </div>

              {totalDiscount > 0 && (
                <div className="flex justify-between gap-4 text-[14px] text-[#434343]">
                  <span>سود شما از خرید</span>

                  <div className="flex items-center gap-1 whitespace-nowrap">
                    <span className="text-red-500 font-medium">
                      {totalDiscount.toLocaleString("fa-IR")}
                    </span>

                    <span>تومان</span>
                  </div>
                </div>
              )}

              <div className="flex justify-between gap-4 text-[14px] text-[#434343]">
                <span>هزینه ارسال</span>

                <span className="whitespace-nowrap">
                  {shippingCost.toLocaleString("fa-IR")} تومان
                </span>
              </div>

              <div className="w-full h-[1px] bg-[#D6D6D6]" />

              <div className="flex justify-between gap-4 text-[16px] text-[#242424] font-semibold">
                <span>مبلغ قابل پرداخت</span>

                <span className="whitespace-nowrap">
                  {finalPayable.toLocaleString("fa-IR")} تومان
                </span>
              </div>

              <button
                onClick={handlePay}
                disabled={isCreating}
                className="
                w-full
                h-[44px]
                lg:h-[40px]
                bg-[#00B4D8]
                text-white
                rounded-[8px]
                text-[14px]
                font-medium
                hover:bg-[#0096c7]
                transition
                disabled:opacity-60
                flex items-center
                justify-center
                gap-2
              "
              >
                {isCreating ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                ) : (
                  "تأیید و پرداخت"
                )}
              </button>
            </div>

            {/* توضیحات */}
            <div className="border border-[#D6D6D6] rounded-[8px] p-4 lg:p-[24px] bg-white flex flex-col gap-[8px]">
              <div className="flex items-start gap-2 text-[#434343] text-[13px] leading-6">
                <div className="w-[7px] h-[7px] mt-2 bg-[#656565] rounded-full flex-shrink-0" />

                <span>پس از تأیید، سفارش شما ثبت و پردازش می‌شود.</span>
              </div>

              <div className="flex items-start gap-2 text-[#434343] text-[13px] leading-6">
                <div className="w-[7px] h-[7px] mt-2 bg-[#656565] rounded-full flex-shrink-0" />

                <span>لطفاً هنگام خرید، فیلتر شکن خود را خاموش کنید.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
