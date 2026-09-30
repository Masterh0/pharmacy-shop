import Providers from "./providers";
import { ReactNode } from "react";
import ConditionalHeader from "@/src/components/header/ConditionalHeader";
import MobileBottomNav from "@/src/components/header/MobileBottomNav";
import SupportWidget from "@/src/components/SupportWidget";
import Footer from "@/src/components/Footer";
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
      <body className="relative bg-white text-[#242424]">
        <Providers>
          {/* 🔹 هدر ثابت در بالا صفحه */}
          <ConditionalHeader />
          <MobileBottomNav />
          {/* 🔹 فاصله از پایین هدر — ارتفاع هدر مثلاً 104px */}
          <main
            className="
    pt-[80px]
    md:pt-[210px]
    pb-[84px]
    lg:pb-0
    min-h-screen
  "
          >
            {children}
            <SupportWidget />
            <Footer />
          </main>
        </Providers>
      </body>
    </html>
  );
}
