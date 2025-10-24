"use client";

import Image from "next/image";
import Link from "next/link";

export default function HeaderActions() {
  return (
    <div
      className="
        flex flex-row items-center justify-between 
        w-[288px] h-[40px]
      "
    >
      {/* 🛒 سبد خرید */}
      <button
        className="
          relative flex flex-row-reverse items-center
          gap-[8px]
          text-[#434343] text-[14px] font-IRANYekanX font-medium
        "
      >
        {/* آیکن سبد خرید */}
        <div className="relative">
          <Image
            src="/pic/headersPic/shopping-cart.svg"
            alt="سبد خرید"
            width={24}
            height={24}
          />

          {/* Badge تعداد */}
          <span
            className="
              absolute -top-[4px] -right-[4px]
              flex items-center justify-center
              w-[10px] h-[10px]
              bg-[#90E0EF]
              rounded-full
            "
          />
        </div>

        <span>سبد خرید</span>
      </button>

      {/* 👤 ورود / ثبت‌نام */}
      <Link
        href="/auth"
        className="
    flex flex-row-reverse items-center gap-[6px]
    text-[#434343] text-[14px] font-IRANYekanX font-medium leading-[24px]
  "
      >
        <Image
          src="/pic/headersPic/login.svg"
          alt="ورود"
          width={20}
          height={20}
          className="relative top-[1px]"
        />
        <span>
          ورود <span className="text-[#BFBFBF] cursor-pointer">|</span> ثبت‌نام
        </span>
      </Link>
    </div>
  );
}
