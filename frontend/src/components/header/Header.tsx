"use client";
import HeaderSearch from "./HeaderSearch";
import HeaderLogo from "./HeaderLogo";
import HeaderActions from "./HeaderActions";
import HeaderNotife from "./HeaderNotife";
import HeaderMenu from "./HeaderMenu"; // ⬅️ اضافه شد

export default function Header() {
  return (
    <header
      dir="ltr"
      className="relative z-50 w-full bg-white border-b border-[#D6D6D6] shadow-sm"
    >
      {/* 🔷 نوار اعلان بالایی */}
      <div className="absolute top-0 left-0 right-0">
        <HeaderNotife />
      </div>

      {/* 🧱 محتوای اصلی هدر */}
      <div
        className="
          absolute left-1/2 -translate-x-1/2
          flex items-center justify-between
          w-[1440px] h-[104px]
          px-[108px] py-3 z-30
          top-[40px]    /* پایین‌تر از نوار اعلان */
        "
      >
        {/* 👈 سمت راست: اکشن‌ها */}
        <HeaderActions />

        {/* 🔍 وسط: جست‌وجو */}
        <HeaderSearch />

        {/* 👉 سمت چپ: لوگو */}
        <HeaderLogo />
        <div className="absolute left-0 right-0 top-[104px] border-t border-[#EDEDED]" />

        {/* خط دوم (خاکستری تیره‌تر، دقیقاً 8px پایین‌تر) */}
        <div className="absolute left-0 right-0 top-[112px] border-t border-[#D6D6D6]" />
      </div>
      <div className="absolute left-1/2 -translate-x-1/2 mt-8">
        <HeaderMenu />
      </div>
    </header>
  );
}
