"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { addressApi } from "@/lib/api/address";
import { orderApi } from "@/lib/api/order";
import { useCart } from "@/lib/hooks/useAddToCart"; // مسیر هوک useCart شما را اینجا فرض کرده‌ام
import type { CartItem } from "@/lib/types/cart"; // اگر نوع Cart را در جای دیگری تعریف کرده‌اید

export default function PaymentPage() {
  const router = useRouter();
  const params = useSearchParams();

  const addressId = params.get("addressId");

  const [addressLoading, setAddressLoading] = useState(true); // وضعیت بارگذاری آدرس
  const [address, setAddress] = useState<any>(null); // آدرس بارگذاری شده
  const [shippingCost] = useState(20000); // هزینه ارسال (مثال، می‌تواند از API بیاید)
  const [finalPrice, setFinalPrice] = useState(0); // قیمت نهایی

  // استفاده از هوک useCart
  const { 
    cart, 
    isLoading: isCartLoading, // وضعیت بارگذاری سبد خرید از هوک
    clearCart, // تابع خالی کردن سبد خرید از هوک
    isClearing, // وضعیت خالی کردن سبد خرید از هوک
  } = useCart();

  // useEffect برای بارگذاری آدرس
  useEffect(() => {
    if (!addressId) {
      toast.error("آدرس انتخاب نشده است");
      router.push("/checkout/address");
      return;
    }

    async function loadAddress() {
      try {
        setAddressLoading(true);
        const a = await addressApi.get(addressId);
        setAddress(a);
      } catch (err) {
        toast.error("مشکلی در بارگذاری اطلاعات آدرس پیش آمد. لطفاً آدرس معتبری انتخاب کنید.");
        router.push("/checkout/address"); // در صورت خطا یا عدم یافتن آدرس، به صفحه انتخاب آدرس برگردان
      } finally {
        setAddressLoading(false);
      }
    }

    loadAddress();
  }, [addressId, router]); // وابستگی به addressId و router

  // useEffect برای محاسبه قیمت نهایی پس از بارگذاری آدرس و سبد خرید
  useEffect(() => {
    // تنها زمانی که آدرس و سبد خرید هر دو موجود و بارگذاری شده باشند
    if (address && cart && !isCartLoading) {
      // اطمینان از اینکه cart.items یک آرایه است (حتی اگر خالی باشد)
      const totalItemsPrice = (cart.items || []).reduce( 
        (sum: number, item: any) => sum + item.quantity * item.product.price,
        0
      );
      setFinalPrice(totalItemsPrice + shippingCost);
    }
    // اگر سبد خرید خالی شد، قیمت نهایی فقط هزینه ارسال است (اگر سبد خرید پس از بارگذاری خالی باشد)
    else if (address && (!cart || (cart as Cart).items.length === 0) && !isCartLoading) {
        setFinalPrice(shippingCost);
    }
  }, [address, cart, shippingCost, isCartLoading]); // وابستگی به address، cart، shippingCost و isCartLoading

  const handlePay = async () => {
    // اعتبارسنجی اولیه قبل از اقدام به پرداخت
    if (!addressId || !address || !cart || (cart as CartItem).items.length === 0 || isClearing) {
      toast.error("اطلاعات مورد نیاز برای پرداخت کامل نیست یا عملیات در حال انجام است.");
      return;
    }

    try {
      // ساخت سفارش
      const order = await orderApi.create({
        addressId: Number(addressId),
        shippingCost,
        // نکته: آیتم‌های سبد خرید معمولاً در بک‌اند از روی سبد فعال کاربر استخراج و به OrderItems تبدیل می‌شوند.
        // اگر بک‌اند شما نیاز دارد آیتم‌ها را مستقیم دریافت کند، باید اینجا ارسال شوند.
      });

      // خالی کردن سبد خرید با استفاده از تابع هوک
      await clearCart(); 

      // هدایت کاربر به صفحه موفقیت‌آمیز
      router.push("/checkout/success?orderId=" + order.id);
    } catch (err) {
      toast.error("مشکلی در ساخت سفارش پیش آمد.");
      console.error("Payment failed:", err); // لاگ خطا برای دیباگ
    }
  };

  // وضعیت بارگذاری کلی صفحه
  const overallLoading = addressLoading || isCartLoading;

  if (overallLoading) {
    return <div className="py-20 text-center">در حال بارگذاری اطلاعات...</div>;
  }

  // اگر سبد خرید خالی باشد (بعد از بارگذاری)
  if (!cart || (cart as Cart).items.length === 0) {
      return (
          <div className="py-20 text-center">
              سبد خرید شما خالی است و نمی‌توانید ادامه دهید. <br />
              <button
                  onClick={() => router.push("/")}
                  className="mt-4 px-6 py-2 bg-[#00B4D8] text-white rounded-md font-medium hover:bg-[#0096c7] transition"
              >
                  بازگشت به فروشگاه
              </button>
          </div>
      );
  }

  return (
    <div step="payment" className="max-w-[800px] mx-auto px-4">
      <h1 className="text-xl font-bold mb-6 text-[#0077B6] text-center">
        پرداخت و بررسی نهایی
      </h1>

      {/* آدرس انتخاب‌شده */}
      <div className="border border-gray-300 rounded-lg p-4 mb-6">
        <h2 className="text-[#0077B6] font-semibold mb-2">آدرس تحویل</h2>
        {address ? (
          <>
            <p>{address.fullName}</p>
            <p>{address.province}، {address.city}، {address.street}</p>
            <p>کد پستی: {address.postalCode}</p>
          </>
        ) : (
          <p>آدرس یافت نشد یا در حال بارگذاری است.</p>
        )}
      </div>

      {/* خلاصه قیمت‌ها */}
      <div className="border border-gray-300 rounded-lg p-4 mb-6">
        <h2 className="text-[#0077B6] font-semibold mb-3">خلاصه سفارش</h2>

        <p className="text-gray-700">جمع اقلام: {(cart as Cart).items.length} کالا</p>

        <p className="text-gray-700">
          هزینه ارسال:
          <span className="text-[#0077B6] mr-1">{shippingCost.toLocaleString()} تومان</span>
        </p>

        <p className="font-bold text-[#242424] mt-3">
          مبلغ نهایی:
          <span className="text-[#00B4D8] mr-1">{finalPrice.toLocaleString()} تومان</span>
        </p>
      </div>

      {/* دکمه پرداخت */}
      <button
        onClick={handlePay}
        className="w-full py-3 bg-[#00B4D8] text-white rounded-md font-medium hover:bg-[#0096c7] transition"
        // دکمه در صورت بارگذاری اطلاعات، عدم وجود آدرس یا سبد خرید خالی یا در حال خالی شدن غیرفعال می‌شود
        disabled={overallLoading || !address || !cart || (cart as Cart).items.length === 0 || isClearing}
      >
        {isClearing ? "در حال خالی کردن سبد..." : "پرداخت"}
      </button>
    </div>
  );
}
