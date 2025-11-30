"use client";

import Image from "next/image";
import Link from "next/link";
import { useAuthStore } from "@/lib/stores/authStore";
import { useCart } from "@/lib/hooks/useAddToCart";
import { useEffect, useState, useRef } from "react";
import CartPreview from "./CartPreview";

export default function HeaderActions() {
  const { userId, name } = useAuthStore();
  const isLoggedIn = Boolean(userId);
  const { cart } = useCart();

  const itemCount =
    cart?.items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

  const [hydrated, setHydrated] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => setHydrated(true), []);
  useEffect(
    () => () =>
      hoverTimeoutRef.current && clearTimeout(hoverTimeoutRef.current),
    []
  );

  if (!hydrated) return <div style={{ width: 288, height: 40 }} />;

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setIsHovered(true);
  };
  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => setIsHovered(false), 200);
  };

  return (
    <div className="flex flex-row items-center justify-between w-[288px] h-[40px]">
      {/* 🛒 سبد خرید */}
      <div
        className="relative"
        onMouseEnter={() => {
          if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
          setIsHovered(true);
        }}
        onMouseLeave={() => {
          if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
          hoverTimeoutRef.current = setTimeout(() => setIsHovered(false), 250);
        }}
      >
        {/* دکمه */}
        <button
          className="
      relative flex flex-row-reverse items-center gap-[8px]
      text-[#434343] text-[14px] font-IRANYekanX font-medium
      transition-all duration-200 hover:text-[#00B4D8]
      focus:outline-none
    "
        >
          <div className="relative">
            <Image
              src="/pic/headersPic/shopping-cart.svg"
              alt="سبد خرید"
              width={24}
              height={24}
              className="transition-all duration-200 hover:brightness-125"
            />
            {itemCount > 0 && (
              <span
                className="absolute -top-[5px] z-50 -right-[9px] flex items-center justify-center 
          min-w-[18px] h-[18px] px-[4px] bg-[#90E0EF] text-[10px]
          text-[#242424] font-bold rounded-full border border-white shadow "
              >
                {itemCount}
              </span>
            )}
          </div>
          <span>سبد خرید</span>
        </button>

        {/* پنل پاپ‌آور */}
        <div
          className={`
      absolute left-[-70px] top-[52px] w-[360px] z-50
      bg-white rounded-xl border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.1)]
      overflow-hidden transition-all duration-200 ease-in-out
      ${
        isHovered
          ? "opacity-100 visible translate-y-0"
          : "opacity-0 invisible -translate-y-2"
      }
    `}
        >
          {/* اضافه کردن onMouseEnter/Leave به خود پنل */}
          <div
            onMouseEnter={() => {
              if (hoverTimeoutRef.current)
                clearTimeout(hoverTimeoutRef.current);
              setIsHovered(true);
            }}
            onMouseLeave={() => {
              if (hoverTimeoutRef.current)
                clearTimeout(hoverTimeoutRef.current);
              hoverTimeoutRef.current = setTimeout(
                () => setIsHovered(false),
                250
              );
            }}
          >
            <CartPreview />
          </div>
        </div>
      </div>

      {/* 👤 ورود یا پروفایل */}
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
            />
          </Link>
          <span className="text-[#BFBFBF]">|</span>
          <Link
            href="/signup"
            className="hover:text-[#00B4D8] transition-all duration-200"
          >
            ثبت‌نام
          </Link>
        </div>
      ) : (
        <Link
          href="/manager/profile"
          className="flex flex-row-reverse items-center gap-[8px] text-[#0077B6] 
          text-[14px] font-IRANYekanX font-medium hover:text-[#00B4D8] transition-all duration-200"
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
