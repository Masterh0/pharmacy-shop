"use client";

import Image from "next/image";
import Link from "next/link";
import { useAuthStore } from "@/lib/stores/authStore";
import { useCart } from "@/lib/hooks/useAddToCart";
import { Popover } from "@headlessui/react";
import CartPreview from "./CartPreview";
import { useEffect, useState,useRef } from "react";

export default function HeaderActions() {
  const { userId, accessToken, name } = useAuthStore();
  const isLoggedIn = Boolean(accessToken && userId);

  const { cart } = useCart();
  console.log(`cart-item:${cart?.items}`);
  const itemCount =
    cart?.items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

  // 🧩 ابتدا همه Hook ها فراخوانی شوند (قبل از هر return)
  const [hydrated, setHydrated] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    setHydrated(true);
  }, []);
  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setIsHovered(true);
  };
  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => setIsHovered(false), 200);
  };
  // ✅ رندر مشروط پایین‌تر از همه Hookها
  if (!hydrated) {
    return <div style={{ width: 288, height: 40 }} />; // اسکلت موقت سبک بدون SSR درگیری
  }

  return (
    <div className="flex flex-row items-center justify-between w-[288px] h-[40px]">
      {/* 🛒 سبد خرید با پیش‌نمایش هاور */}
      <Popover className="relative">
        <div
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className="relative"
        >
          <Popover.Button
            className="
            relative flex flex-row-reverse items-center gap-[8px]
            text-[#434343] text-[14px] font-IRANYekanX font-medium
            transition-all duration-200 hover:text-[#00B4D8] group
            focus:outline-none z-10
          "
          >
            <div className="relative">
              <Image
                src="/pic/headersPic/shopping-cart.svg"
                alt="سبد خرید"
                width={24}
                height={24}
                className="transition-all duration-200 group-hover:brightness-125"
              />
              {itemCount > 0 && (
                <span
                  className="
                  absolute -top-[5px] -right-[9px]
                  flex items-center justify-center
                  min-w-[18px] h-[18px] px-[4px]
                  bg-[#90E0EF]
                  text-[10px] text-[#242424] font-bold
                  rounded-full border border-white
                  shadow-[0_0_2px_rgba(0,0,0,0.25)]
                "
                >
                  {itemCount}
                </span>
              )}
            </div>
            <span>سبد خرید</span>
          </Popover.Button>

          {/* پل ارتباطی نامرئی برای جلوگیری از پرش موس (Bridge) */}
          <div
            className="
            absolute left-0 top-[40px]
            w-[120px] h-[12px]
            z-[19]
          "
          />

          {/* ✅ پنل پاپ‌آور */}
          <Popover.Panel
            static
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className={`
            absolute left-[-70px] top-[52px]
            w-[360px] z-20
            bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.1)]
            border border-gray-100 overflow-hidden
            transition-all duration-200 ease-in-out
            ${
              isHovered
                ? "opacity-100 visible translate-y-1"
                : "opacity-0 invisible -translate-y-3"
            }
          `}
          >
            <CartPreview />
          </Popover.Panel>
        </div>
      </Popover>

      {/* 👤 ورود / ثبت‌نام یا پروفایل */}
      {!isLoggedIn ? (
        <div className="flex flex-row-reverse items-center gap-[6px] text-[#434343] text-[14px] font-IRANYekanX font-medium leading-[24px]">
          <Link
            href="/login"
            className="flex items-center gap-[4px] transition-all duration-200 hover:text-[#00B4D8]"
          >
            <span>ورود</span>
            <Image
              src="/pic/headersPic/login.svg"
              alt="ورود"
              width={20}
              height={20}
              className="relative top-[1px] transition-all duration-200 hover:brightness-125"
            />
          </Link>
          <span className="text-[#BFBFBF]">|</span>
          <Link
            href="/signup"
            className="transition-all duration-200 hover:text-[#00B4D8]"
          >
            ثبت‌نام
          </Link>
        </div>
      ) : (
        <Link
          href="/manager/profile"
          className="
            flex flex-row-reverse items-center gap-[8px]
            text-[#0077B6] text-[14px] font-IRANYekanX font-medium
            transition-all duration-200 hover:text-[#00B4D8]
          "
        >
          <div className="w-[28px] h-[28px] rounded-full flex items-center justify-center">
            <Image
              src="/pic/headersPic/profile-circle-svgrepo-com.svg"
              alt="پروفایل"
              width={30}
              height={30}
            />
          </div>
          <span>{name || "کاربر من"}</span>
        </Link>
      )}
    </div>
  );
}
