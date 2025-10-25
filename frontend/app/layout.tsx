import Providers from "./providers";
import { ReactNode } from "react";
import Header from "@/src/components/header/Header";
export const metadata = {
  title: "Pharmacy Shop",
  description: "Online pharmacy shop",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fa" dir="rtl">
      <head>
        {/* فونت فارسی ایران‌یکان (نسخه رایگان از CDN) */}
        <link
          rel="stylesheet"
          href="https://cdn.fontcdn.ir/Font/Persian/IranYekan.css"
        />
      </head>
      <body className="relative font-[IRANYekanX] bg-white text-[#242424]">
        <Providers>
          {/* 🔹 هدر ثابت در بالا صفحه */}
          <Header />

          {/* 🔹 فاصله از پایین هدر — ارتفاع هدر مثلاً 104px */}
          <main className="pt-[210px] min-h-screen">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
