"use client";

import HeaderSearch from "./HeaderSearch";
import HeaderLogo from "./HeaderLogo";
import HeaderActions from "./HeaderActions";
import HeaderNotife from "./HeaderNotife";
import HeaderMenu from "./HeaderMenu";
import MobileMenu from "./MobileMenu";

export default function Header() {
  return (
    <header
      dir="ltr"
      className="
        relative z-50 w-full bg-white
        lg:border-b lg:border-[#D6D6D6]
        shadow-sm lg:overflow-visible
      "
    >
      {/* نوار اعلان بالایی — فقط دسکتاپ */}
      {/*
      <div className="hidden lg:block absolute top-0 left-0 right-0">
        <HeaderNotife />
      </div>
      */}

      {/* محتوای اصلی هدر */}
      <div
        className="
    flex items-center
    w-full
    h-auto lg:h-[104px]
    px-2 sm:px-4 lg:px-[108px]
    py-2.5 lg:py-3
    gap-2
    lg:gap-0

    lg:absolute
    lg:left-1/2
    lg:-translate-x-1/2
    lg:top-[40px]
    lg:max-w-[1440px]

    z-30
    border-b border-gray-100
    lg:border-none
  "
      >
        {/* سمت چپ */}
        <div className="shrink-0 flex items-center">
          {/* دسکتاپ */}
          <div className="hidden lg:block">
            <HeaderActions />
          </div>

          {/* موبایل */}
          <div className="flex lg:hidden items-center">
            <HeaderLogo />
          </div>
        </div>

        {/* سرچ */}
        <div
          className="
      flex-1
      min-w-0
      mx-1
      lg:mx-0
    "
        >
          <HeaderSearch />
        </div>

        {/* سمت راست */}
        <div className="shrink-0 flex items-center">
          {/* موبایل */}
          <div className="flex lg:hidden items-center">
            <MobileMenu />
          </div>

          {/* دسکتاپ */}
          <div className="hidden lg:block">
            <HeaderLogo />
          </div>
        </div>
      </div>

      {/* خطوط جداکننده دسکتاپ */}
      <div
        className="
          hidden lg:block
          absolute left-0 right-0
          top-[144px]
          border-t border-[#EDEDED]
        "
      />

      <div
        className="
          hidden lg:block
          absolute left-0 right-0
          top-[152px]
          border-t border-[#D6D6D6]
        "
      />

      {/* منوی دسته‌بندی دسکتاپ */}
      <div
        className="
          hidden lg:block
          absolute
          left-1/2
          -translate-x-1/2
          mt-8
        "
      >
        <HeaderMenu />
      </div>
    </header>
  );
}
