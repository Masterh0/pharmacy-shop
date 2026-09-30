"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Sparkles,
  ChevronLeft,
  Tag,
  Truck,
  ShieldCheck,
  Headphones,
  Lock,
} from "lucide-react";

// Helper components for desktop
const FEATURES = [
  { icon: Truck, title: "ارسال سریع", subtitle: "به سراسر کشور" },
  { icon: ShieldCheck, title: "ضمانت اصالت کالا", subtitle: "کالای اورجینال" },
  { icon: Headphones, title: "مشاوره تخصصی", subtitle: "پاسخگوی شما هستیم" },
  { icon: Lock, title: "پرداخت امن", subtitle: "اطلاعات شما محفوظ" },
];
function BackgroundBlobs() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      <div className="absolute -left-16 top-8 h-48 w-48 rounded-[45%] bg-[#12B6C5]/10 blur-xl" />
      <div className="absolute -right-20 top-0 h-64 w-64 rounded-[40%] bg-[#12B6C5]/15 blur-xl" />
      <div className="absolute -left-10 bottom-0 h-56 w-56 rounded-[45%] bg-[#12B6C5]/10 blur-xl" />
      <div className="absolute -right-16 bottom-0 h-52 w-52 rounded-[40%] bg-[#12B6C5]/10 blur-xl" />
    </div>
  );
}
function DotGrid({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={`h-20 w-20 ${className}`}
      viewBox="0 0 80 80"
    >
      <defs>
        <pattern
          id="dotgrid"
          width="12"
          height="12"
          patternUnits="userSpaceOnUse"
        >
          <circle cx="2" cy="2" r="2" fill="currentColor" />
        </pattern>
      </defs>
      <rect width="80" height="80" fill="url(#dotgrid)" />
    </svg>
  );
}

export default function Hero() {
  return (
    <main className="w-full bg-gray-50 lg:bg-transparent pt-4 pb-8 lg:pt-0 lg:pb-0 ">
      {/* ============== MOBILE HERO (<lg) ============== */}
      <div className="block lg:hidden px-4 ">
        <div className="rounded-2xl shadow-lg overflow-hidden bg-white ">
          {/* Image Part */}
          <div className="relative w-full aspect-video ">
            <Image
              src="/pic/hero/hero.webp" // همان عکس دسکتاپ
              alt="داروخانه بهوندی"
              fill
              sizes="100vw"
              className="object-cover "
            />
          </div>
          {/* Text Part (مطابق تصویر مرجع موبایل) */}
          <div
            className="p-5 text-center "
            style={{ backgroundColor: "#e0f5fa" }} // رنگ آبی روشن مشابه تصویر
          >
            <h1 className="text-2xl font-extrabold text-[#16324F]">
              داروخانه دکتر بهوندی
            </h1>
            <p className="mt-3 text-[15px] leading-7 text-[#4B5E74] max-w-sm mx-auto">
              داروخانه تلاش می‌کند تا با بهره‌گیری از جدیدترین مکمل‌های
              تغذیه‌ای، و محصولات مراقبتی پوست و مو، به سلامت و رفاه مردم منطقه
              کمک کند.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center justify-center mt-5 rounded-xl bg-[#00B4D8] px-10 py-3 text-base font-semibold text-white transition hover:bg-[#0096B4] shadow-md"
            >
              آخرین محصولات
            </Link>
          </div>
        </div>
      </div>

      {/* ============== DESKTOP HERO (lg+) ============== */}
      <section
        dir="ltr"
        className="rounded-3xl hidden lg:block relative mt-2 overflow-hidden bg-gradient-to-br from-[#EAF6FB] via-[#F1FAFD] to-white py-8 sm:py-10 "
      >
        <BackgroundBlobs />
        <div className="relative mx-auto grid max-w-7xl gap-8 px-6 lg:grid-cols-2 lg:items-center lg:gap-12 lg:px-10 ">
          {/* عکس */}
          <div className="relative aspect-[16/10] w-full overflow-hidden rounded-3xl shadow-xl shadow-[#0E7C86]/15">
            <Image
              src="/pic/hero/hero.webp"
              alt="فروشگاه داروخانه بهوندی"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 700px"
              className="object-center"
            />
          </div>

          {/* متن */}
          <div className="relative text-right">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-medium text-[#12B6C5] shadow-sm">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              داروخانه آنلاین بهوندی
            </span>
            <h1 className="mt-5 text-3xl font-extrabold leading-[1.35] text-[#16324F] sm:text-4xl lg:text-[2.65rem] lg:leading-[1.3]">
              خرید آنلاین
              <br />
              مکمل و محصولات مراقبتی
            </h1>
            <p className="mt-4 max-w-md text-sm leading-8 text-[#4B5E74] sm:text-base sm:leading-9">
              خرید مکمل‌های ورزشی، محصولات مراقبت پوست و مو و محصولات بهداشتی با
              تضمین اصالت کالا و ارسال سریع به سراسر کشور
            </p>
            <div className="mt-6 flex flex-wrap justify-end gap-4">
              <Link
                href={"/products"}
                className="inline-flex items-center gap-2 rounded-xl bg-[#12B6C5] px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#12B6C5]/25 transition hover:bg-[#0E9CAB]"
              >
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                مشاهده محصولات
              </Link>
              <Link
                href={
                  "/products?page=1&discount=1&minPrice=0&maxPrice=20000000"
                }
                className="inline-flex items-center gap-2 rounded-xl border border-[#12B6C5]/40 bg-white px-7 py-3.5 text-sm font-semibold text-[#12B6C5] transition hover:bg-[#F2FCFD]"
              >
                <Tag className="h-4 w-4" aria-hidden="true" />
                تخفیف‌ها و پیشنهادها
              </Link>
            </div>
            <DotGrid className="pointer-events-none absolute -top-10 -left-10 hidden text-[#12B6C5]/25 lg:block" />
          </div>
        </div>

        {/* نوار ویژگی‌ها */}
        <div className="relative mx-auto mt-10 grid max-w-7xl grid-cols-2  bg-white px-6 py-6 shadow-sm sm:grid-cols-4">
          {" "}
          {FEATURES.map(({ icon: Icon, title, subtitle }, index) => (
            <div
              key={title}
              className={`flex flex-row-reverse items-center justify-center gap-3 py-2 ${index !== FEATURES.length - 1 ? "sm:border-rsm:border-[#E7EEF3]" : ""}`}
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#12B6C5]/10 text-[#12B6C5]">
                <Icon className="h-5 w-5" />
              </span>
              <div className="text-right">
                <p className="font-bold text-[#16324F]">{title}</p>
                <p className="text-xs text-[#6B7A8D]">{subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
