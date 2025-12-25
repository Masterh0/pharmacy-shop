"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/lib/hooks/useAddToCart";
import { useEffect, useState, useRef } from "react";
import CartPreview from "./CartPreview";
import { useLoginRequired } from "@/lib/hooks/useLoginRequired";
import LoginRequiredModal from "../modals/LoginRequiredModal";

export default function HeaderActions() {
  const {
    user,
    isLoading,
    showModal,
    requireLogin,
    goToLogin,
    goToSignup,
    closeModal,
  } = useLoginRequired();

  const { cart } = useCart();
  const itemCount =
    cart?.items?.reduce(
      (sum: number, item: { quantity: number }) => sum + item.quantity,
      0
    ) ?? 0;

  const [mounted, setMounted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setMounted(true);
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  if (!mounted) return <div style={{ width: 288, height: 40 }} />;

  const profileHref =
    user?.role === "ADMIN" ? "/manager/profile" : "/customer/profile";

  const handleCartClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!requireLogin("/checkout/cart")) {
      e.preventDefault();
    }
  };

  return (
    <>
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
          <Link
            href="/checkout/cart"
            onClick={handleCartClick}
            className="relative flex flex-row-reverse items-center gap-[8px]
            text-[#434343] text-[14px] font-IRANYekanX font-medium
            transition-all duration-200 hover:text-[#00B4D8]"
          >
            <div className="relative">
              <Image
                src="/pic/headersPic/shopping-cart.svg"
                alt="سبد خرید"
                width={24}
                height={24}
              />
              {itemCount > 0 && (
                <span
                  className="absolute -top-[5px] -right-[9px] z-50
                  min-w-[18px] h-[18px] px-[4px]
                  bg-[#90E0EF] text-[#242424]
                  text-[10px] font-bold rounded-full
                  border border-white shadow"
                >
                  {itemCount}
                </span>
              )}
            </div>
            <span>سبد خرید</span>
          </Link>

          {/* ✅ پیش‌نمایش سبد (برای همه - حتی بدون لاگین) */}
          {itemCount > 0 && (
            <div
              className={`
                absolute left-[-70px] top-[52px] w-[360px] z-50
                bg-white rounded-xl border border-gray-100
                shadow-[0_4px_20px_rgba(0,0,0,0.1)]
                transition-all duration-200
                ${
                  isHovered
                    ? "opacity-100 visible translate-y-0"
                    : "opacity-0 invisible -translate-y-2"
                }
              `}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <CartPreview 
                isLoggedIn={!!user}
                onLoginRequired={requireLogin}
              />
            </div>
          )}
        </div>

        {/* 👤 بخش لاگین / پروفایل */}
        {isLoading ? (
          <div className="w-[100px] h-[20px] bg-gray-200 animate-pulse rounded"></div>
        ) : user ? (
          <Link
            href={profileHref}
            className="flex flex-row-reverse items-center gap-[8px]
            text-[#0077B6] text-[14px] font-IRANYekanX font-medium
            hover:text-[#00B4D8]"
          >
            <Image
              src="/pic/headersPic/profile-circle-svgrepo-com.svg"
              alt="پروفایل"
              width={28}
              height={28}
            />
            <span>{user.name || "کاربر عزیز"}</span>
          </Link>
        ) : (
          <div className="flex flex-row-reverse items-center gap-[6px] text-[#434343] text-[14px] font-IRANYekanX font-medium">
            <Link href="/login" className="hover:text-[#00B4D8]">
              ورود
            </Link>
            <span className="text-[#BFBFBF]">|</span>
            <Link href="/signup" className="hover:text-[#00B4D8]">
              ثبت‌نام
            </Link>
          </div>
        )}
      </div>

      {/* ✅ مودال لاگین اجباری (تمام‌صفحه با backdrop تیره) */}
      <LoginRequiredModal
        isOpen={showModal}
        onClose={closeModal}
        onLogin={goToLogin}
        onSignup={goToSignup}
      />
    </>
  );
}
