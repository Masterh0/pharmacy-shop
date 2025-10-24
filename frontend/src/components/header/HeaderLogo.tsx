"use client";
import Image from "next/image";

export default function HeaderLogo() {
  return (
    <div
      className="
        flex flex-row items-center justify-center gap-[4px]
        w-[204px] h-[50px] mx-auto
      "
    >
      <span className="font-IRANYekanX font-bold text-[20px] text-[#0077B6] leading-[36px]">
        داروخانه بهوندی
      </span>
      <Image
        src="/pic/22.png"   // ✅ اگر در پوشه public است
        alt="Logo"
        width={50}
        height={50}
        className="w-[50px] h-[50px]"
      />
    </div>
  );
}
