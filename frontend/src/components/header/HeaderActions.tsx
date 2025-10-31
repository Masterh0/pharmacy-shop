"use client";

import Image from "next/image";
import Link from "next/link";
import { useAuthStore } from "@/lib/stores/authStore";
export default function HeaderActions() {
  const { userId, phone, role, accessToken, name } = useAuthStore();
  const isLoggedIn = Boolean(accessToken && userId);

  return (
    <div className="flex flex-row items-center justify-between w-[288px] h-[40px]">
      {/* 🛒 سبد خرید */}
      <Link
        href="/cart"
        className="
          relative flex flex-row-reverse items-center gap-[8px]
          text-[#434343] text-[14px] font-IRANYekanX font-medium
          transition-all duration-200 hover:text-[#00B4D8]
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

          {/* Badge */}
          <span
            className="
              absolute -top-[4px] -right-[4px]
              flex items-center justify-center
              w-[16px] h-[16px]
              bg-[#90E0EF]
              text-[10px] text-[#242424] font-bold
              rounded-full
            "
          >
            ۰
          </span>
        </div>
        <span>سبد خرید</span>
      </Link>

      {/* 👤 ورود / ثبت‌نام یا پروفایل کاربر */}
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
          href="/profile"
          className="
            flex flex-row-reverse items-center gap-[8px]
            text-[#0077B6] text-[14px] font-IRANYekanX font-medium
            transition-all duration-200 hover:text-[#00B4D8]
          "
        >
          <div className="w-[28px] h-[28px] rounded-full  flex items-center justify-center">
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
