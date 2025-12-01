import { MoneySend, ShoppingCart, Location } from "iconsax-react";

export const metadata = {
  title: "تکمیل سفارش | داروخانه بهوندی",
};

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  const step = (children as any)?.props?.step || "cart";

  const isActive = (name: string) => step === name;

  return (
    <div className="w-full flex flex-col items-center bg-white min-h-screen">
      {/* Stepper */}
      <div className="flex flex-row items-center justify-center gap-6 mt-[30px] mb-[48px]">

        {/* Step 1 — Cart */}
        <div className="flex flex-col items-center gap-1">
          {isActive("cart") ? (
            <ShoppingCart size="24" variant="Bold" color="#00B4D8" />
          ) : (
            <ShoppingCart size="24" variant="Outline" color="#90E0EF" />
          )}
          <span className={isActive("cart") ? "text-[#00B4D8]" : "text-[#90E0EF]"}>
            سبد خرید
          </span>
        </div>

        {/* خط چین بین 1 و 2 */}
        <div className="flex items-center">
          <div className="w-[8px] h-[8px] rounded-full bg-[#90E0EF]" />
          <div className="w-[80px] h-[2px] border-t border-dashed border-[#90E0EF]" />
          <div className="w-[8px] h-[8px] rounded-full bg-[#90E0EF]" />
        </div>

        {/* Step 2 — Address */}
        <div className="flex flex-col items-center gap-1">
          {isActive("address") ? (
            <Location size="24" variant="Bold" color="#00B4D8" />
          ) : (
            <Location size="24" variant="Outline" color="#90E0EF" />
          )}
          <span className={isActive("address") ? "text-[#00B4D8]" : "text-[#90E0EF]"}>
            آدرس
          </span>
        </div>

        {/* خط چین بین 2 و 3 */}
        <div className="flex items-center">
          <div className="w-[8px] h-[8px] rounded-full bg-[#90E0EF]" />
          <div className="w-[80px] h-[2px] border-t border-dashed border-[#90E0EF]" />
          <div className="w-[8px] h-[8px] rounded-full bg-[#90E0EF]" />
        </div>

        {/* Step 3 — Payment */}
        <div className="flex flex-col items-center gap-1">
          {isActive("payment") ? (
            <MoneySend size="24" variant="Bold" color="#00B4D8" />
          ) : (
            <MoneySend size="24" variant="Outline" color="#90E0EF" />
          )}
          <span className={isActive("payment") ? "text-[#00B4D8]" : "text-[#90E0EF]"}>
            پرداخت
          </span>
        </div>
      </div>

      {/* Page content */}
      <div className="w-full flex justify-center">{children}</div>
    </div>
  );
}
