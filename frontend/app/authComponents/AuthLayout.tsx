"use client";

import Image from "next/image";
import { ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div
      dir="ltr"
      className="
        flex
        min-h-screen
        items-center
        justify-center
        bg-white
      "
    >
      <div
        className="
          relative
          flex
          min-h-[100dvh]
          w-full
          flex-col
          overflow-hidden
          bg-white

          md:h-[714px]
          md:min-h-0
          md:w-[1167px]
          md:flex-row
          md:rounded-[16px]
          md:border-2
          md:border-[#CBCBCB]
        "
      >
        {/* ----------------------------------------- */}
        {/* Form Side */}
        {/* ----------------------------------------- */}

        <div
          className="
            relative
            flex
            h-full
            w-full
            flex-col
            bg-white
            pt-8

            md:block
            md:w-[551px]
            md:bg-gradient-to-r
            md:from-[#FFFFFF]
            md:to-[#F3F3F3]
            md:pt-0
            md:rounded-l-[16px]
          "
        >
          {children}
        </div>

        {/* ----------------------------------------- */}
        {/* Image Side */}
        {/* ----------------------------------------- */}

        <div className="hidden h-full w-[620px] md:block">
          <Image
            src="/pic/login/login.png"
            alt="Auth Illustration"
            width={619}
            height={714}
            priority
            className="
              h-full
              w-full
              rounded-r-[12px]
              object-cover
            "
          />
        </div>
      </div>
    </div>
  );
}
