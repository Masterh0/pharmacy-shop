"use client";

import Image from "next/image";

export default function HeaderLogo() {
  return (
    <div
      className="
        flex
        items-center
        justify-center
        gap-2
        w-[50px]
        h-[50px]
        lg:w-[260px]
        lg:h-[50px]
        shrink-0
      "
    >
      {/* متن فقط دسکتاپ */}
      <span
        className="
          hidden
          lg:block
          whitespace-nowrap
          font-IRANYekanX
          font-bold
          text-[20px]
          text-[#0077B6]
          leading-[36px]
        "
      >
        داروخانه دکتر بهوندی
      </span>

      <Image
        src="/pic/headersPic/logo.webp"
        alt="داروخانه دکتر بهوندی"
        width={50}
        height={50}
        priority
        className="h-[50px] w-[50px] shrink-0"
      />
    </div>
  );
}
