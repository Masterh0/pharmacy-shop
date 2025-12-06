"use client";

import { usePathname } from "next/navigation";
import { MoneySend, ShoppingCart, Location } from "iconsax-react";

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // تشخیص مرحله فعلی از روی URL
  const step = pathname.includes("/payment")
    ? "payment"
    : pathname.includes("/address")
    ? "address"
    : "cart";

  // ترتیب مراحل
  const steps = ["cart", "address", "payment"] as const;
  const currentStepIndex = steps.indexOf(step); // 0 = cart, 1 = address, 2 = payment

  // آیا این مرحله کامل شده یا فعاله؟
  const isStepCompleted = (index: number) => index <= currentStepIndex;

  // آیا خط بین دو مرحله کامل شده؟
  const isLineCompleted = (lineIndex: number) => lineIndex < currentStepIndex;

  return (
    <div className="w-full flex flex-col items-center bg-white min-h-screen">
      {/* Stepper */}
      <div className="flex flex-row items-center justify-center gap-6 mt-[30px] mb-[48px] px-4">
        {/* Step 1 — Cart */}
        <div className="flex flex-col items-center gap-2 min-w-[80px]">
          {isStepCompleted(0) ? (
            <ShoppingCart size="28" variant="Bold" color="#00B4D8" />
          ) : (
            <ShoppingCart size="28" variant="Outline" color="#90E0EF" />
          )}
          <span
            className={`text-sm font-medium ${
              isStepCompleted(0) ? "text-[#00B4D8]" : "text-[#90E0EF]"
            }`}
          >
            سبد خرید
          </span>
        </div>

        {/* خط اول */}
        <div className="flex items-center -translate-y-1">
          <div
            className={`w-2 h-2 rounded-full transition-colors ${
              isLineCompleted(0) ? "bg-[#00B4D8]" : "bg-[#90E0EF]"
            }`}
          />
          <div
            className={`w-20 h-[3px] mx-1 transition-all ${
              isLineCompleted(0)
                ? "border-t-4 border-solid border-[#00B4D8]"
                : "border-t border-dashed border-[#90E0EF]"
            }`}
          />
          <div
            className={`w-2 h-2 rounded-full transition-colors ${
              isLineCompleted(0) ? "bg-[#00B4D8]" : "bg-[#90E0EF]"
            }`}
          />
        </div>

        {/* Step 2 — Address */}
        <div className="flex flex-col items-center gap-2 min-w-[80px]">
          {isStepCompleted(1) ? (
            <Location size="28" variant="Bold" color="#00B4D8" />
          ) : (
            <Location size="28" variant="Outline" color="#90E0EF" />
          )}
          <span
            className={`text-sm font-medium ${
              isStepCompleted(1) ? "text-[#00B4D8]" : "text-[#90E0EF]"
            }`}
          >
            آدرس
          </span>
        </div>

        {/* خط دوم */}
        <div className="flex items-center -translate-y-1">
          <div
            className={`w-2 h-2 rounded-full transition-colors ${
              isLineCompleted(1) ? "bg-[#00B4D8]" : "bg-[#90E0EF]"
            }`}
          />
          <div
            className={`w-20 h-[3px] mx-1 transition-all ${
              isLineCompleted(1)
                ? "border-t-4 border-solid border-[#00B4D8]"
                : "border-t border-dashed border-[#90E0EF]"
            }`}
          />
          <div
            className={`w-2 h-2 rounded-full transition-colors ${
              isLineCompleted(1) ? "bg-[#00B4D8]" : "bg-[#90E0EF]"
            }`}
          />
        </div>

        {/* Step 3 — Payment */}
        <div className="flex flex-col items-center gap-2 min-w-[80px]">
          {isStepCompleted(2) ? (
            <MoneySend size="28" variant="Bold" color="#00B4D8" />
          ) : (
            <MoneySend size="28" variant="Outline" color="#90E0EF" />
          )}
          <span
            className={`text-sm font-medium ${
              isStepCompleted(2) ? "text-[#00B4D8]" : "text-[#90E0EF]"
            }`}
          >
            پرداخت
          </span>
        </div>
      </div>

      {/* محتوای صفحه */}
      <div className="w-full flex justify-center pb-10">{children}</div>
    </div>
  );
}