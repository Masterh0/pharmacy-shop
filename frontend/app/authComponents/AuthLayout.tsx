"use client";
import Image from "next/image";
import { ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode; // محتوای سمت چپ (فرم‌ها)
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div
      dir="ltr"
      className="flex justify-center items-center min-h-screen bg-white"
    >
      {/* Container */}
      <div className="relative w-[1167px] h-[714px] flex border-2 border-[#CBCBCB] rounded-[16px] overflow-hidden">
        {/* Left column (dynamic form) */}
        <div className="relative w-[551px] h-full bg-gradient-to-r from-[#FFFFFF] to-[#F3F3F3] rounded-l-[16px]">
          {children}
        </div>

        {/* Right column (fixed image) */}
        <div className="w-[620px] h-full">
          <Image
            src="/pic/login/login.png"
            alt="Auth Illustration"
            width={619}
            height={714}
            className="w-full h-full object-cover rounded-r-[12px]"
          />
        </div>
      </div>
    </div>
  );
}
