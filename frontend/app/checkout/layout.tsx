"use client";

import { usePathname } from "next/navigation";
import { MoneySend, ShoppingCart, Location } from "iconsax-react";

import { AuthGuard } from "@/src/components/guards/AuthGuard";
import { CheckoutProvider } from "@/lib/context/CheckoutContext";
import { useCart } from "@/lib/hooks/useAddToCart";

function EmptyCart() {
  return (
    <div className="w-full min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="w-24 h-24 rounded-full bg-[#F0FAFF] flex items-center justify-center mb-5">
        <ShoppingCart size="42" variant="Outline" color="#00B4D8" />
      </div>

      <h1 className="text-xl font-bold text-[#242424] mb-2">
        سبد خرید شما خالی است
      </h1>

      <p className="text-sm text-[#9CA3AF]">
        هنوز محصولی به سبد خرید اضافه نکرده‌اید.
      </p>
    </div>
  );
}

function CheckoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const { cart, isLoading: isCartLoading } = useCart();

  // تا وقتی وضعیت سبد مشخص نشده، چیزی را به عنوان سبد خالی نشان نده
  if (isCartLoading || !cart) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-white">
        <div className="text-sm text-[#9CA3AF]">در حال بررسی سبد خرید...</div>
      </div>
    );
  }

  // ⭐ سبد خالی است → فقط EmptyCart
  if (!cart.items || cart.items.length === 0) {
    return <EmptyCart />;
  }

  // تشخیص مرحله فعلی
  const step = pathname.includes("/payment")
    ? "payment"
    : pathname.includes("/address")
      ? "address"
      : "cart";

  const steps = ["cart", "address", "payment"] as const;

  const currentStepIndex = steps.indexOf(step);

  const isStepCompleted = (index: number) => index <= currentStepIndex;

  const isLineCompleted = (lineIndex: number) => lineIndex < currentStepIndex;

  return (
    <>
      {/* Stepper */}
      {/* Stepper */}
      <div
        dir="rtl"
        className="
    w-full
    flex items-center justify-center
    px-3
    mt-5 lg:mt-[30px]
    mb-8 lg:mb-[48px]
  "
      >
        <div
          className="
      w-full
      max-w-[700px]
      flex items-center justify-center
      gap-1
      sm:gap-2
      lg:gap-6
    "
        >
          {/* Step 1 — Cart */}
          <div className="flex flex-col items-center gap-1.5 sm:gap-2 shrink-0">
            {isStepCompleted(0) ? (
              <ShoppingCart size="26" variant="Bold" color="#00B4D8" />
            ) : (
              <ShoppingCart size="26" variant="Outline" color="#90E0EF" />
            )}

            <span
              className={`text-[11px] sm:text-sm font-medium whitespace-nowrap ${
                isStepCompleted(0) ? "text-[#00B4D8]" : "text-[#90E0EF]"
              }`}
            >
              سبد خرید
            </span>
          </div>

          {/* Line 1 */}
          <div className="flex items-center flex-1 max-w-[100px] sm:max-w-[140px] lg:max-w-none">
            <div
              className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full shrink-0 ${
                isLineCompleted(0) ? "bg-[#00B4D8]" : "bg-[#90E0EF]"
              }`}
            />

            <div
              className={`flex-1 h-[2px] sm:h-[3px] mx-1 ${
                isLineCompleted(0)
                  ? "bg-[#00B4D8]"
                  : "border-t border-dashed border-[#90E0EF]"
              }`}
            />

            <div
              className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full shrink-0 ${
                isLineCompleted(0) ? "bg-[#00B4D8]" : "bg-[#90E0EF]"
              }`}
            />
          </div>

          {/* Step 2 — Address */}
          <div className="flex flex-col items-center gap-1.5 sm:gap-2 shrink-0">
            {isStepCompleted(1) ? (
              <Location size="26" variant="Bold" color="#00B4D8" />
            ) : (
              <Location size="26" variant="Outline" color="#90E0EF" />
            )}

            <span
              className={`text-[11px] sm:text-sm font-medium whitespace-nowrap ${
                isStepCompleted(1) ? "text-[#00B4D8]" : "text-[#90E0EF]"
              }`}
            >
              آدرس
            </span>
          </div>

          {/* Line 2 */}
          <div className="flex items-center flex-1 max-w-[100px] sm:max-w-[140px] lg:max-w-none">
            <div
              className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full shrink-0 ${
                isLineCompleted(1) ? "bg-[#00B4D8]" : "bg-[#90E0EF]"
              }`}
            />

            <div
              className={`flex-1 h-[2px] sm:h-[3px] mx-1 ${
                isLineCompleted(1)
                  ? "bg-[#00B4D8]"
                  : "border-t border-dashed border-[#90E0EF]"
              }`}
            />

            <div
              className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full shrink-0 ${
                isLineCompleted(1) ? "bg-[#00B4D8]" : "bg-[#90E0EF]"
              }`}
            />
          </div>

          {/* Step 3 — Payment */}
          <div className="flex flex-col items-center gap-1.5 sm:gap-2 shrink-0">
            {isStepCompleted(2) ? (
              <MoneySend size="26" variant="Bold" color="#00B4D8" />
            ) : (
              <MoneySend size="26" variant="Outline" color="#90E0EF" />
            )}

            <span
              className={`text-[11px] sm:text-sm font-medium whitespace-nowrap ${
                isStepCompleted(2) ? "text-[#00B4D8]" : "text-[#90E0EF]"
              }`}
            >
              پرداخت
            </span>
          </div>
        </div>
      </div>

      {/* محتوای checkout */}
      <div className="w-full flex justify-center pb-10">{children}</div>
    </>
  );
}

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <CheckoutProvider>
        <div className="w-full flex flex-col items-center bg-white min-h-screen">
          <CheckoutContent>{children}</CheckoutContent>
        </div>
      </CheckoutProvider>
    </AuthGuard>
  );
}
