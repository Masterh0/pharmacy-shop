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
        {/* فونت فارسی ایران یکان (نسخه رایگان از CDN) */}
        <link
          rel="stylesheet"
          href="https://cdn.fontcdn.ir/Font/Persian/IranYekan.css"
        />
      </head>
      <body className="relative">
        <Providers>
          <Header />
          <main >{children}</main>
        </Providers>
      </body>
    </html>
  );
}
