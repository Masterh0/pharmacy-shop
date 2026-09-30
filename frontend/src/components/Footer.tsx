"use client";

import Image from "next/image";
import Link from "next/link";

import {
  Instagram,
  MessageCircle,
  Phone,
  Clock3,
  Headphones,
  ShieldCheck,
  Truck,
  BadgeCheck,
  ChevronLeft,
} from "lucide-react";

const customerLinks = [
  { title: "سوالات متداول", href: "/faq" },
  { title: "حریم خصوصی", href: "/privacy" },
  { title: "ثبت شکایت", href: "/complaints" },
  { title: "ضمانت‌نامه محصولات", href: "/guarantee" },
  { title: "درباره ما", href: "/about-us" },
];

const guideLinks = [
  { title: "راهنمای ثبت سفارش", href: "/guide/order" },
  { title: "نحوه ارسال سفارش‌ها", href: "/guide/shipping" },
  { title: "شرایط بازگرداندن محصول", href: "/guide/returns" },
];

const features = [
  {
    icon: BadgeCheck,
    title: "محصولات اورجینال",
    description: "با کیفیت",
  },
  {
    icon: Truck,
    title: "ارسال سریع",
    description: "به سراسر کشور",
  },
  {
    icon: ShieldCheck,
    title: "ضمانت اصالت",
    description: "کالاها",
  },
  {
    icon: Headphones,
    title: "پشتیبانی واقعی",
    description: "و سریع",
  },
];

export default function Footer() {
  return (
    <footer
      className="relative mt-12 overflow-hidden bg-gradient-to-br from-[#087da9] via-[#08a6c4] to-[#09b7d0] text-white"
      dir="ltr"
    >
      {/* Decorative background */}
      <div className="pointer-events-none absolute -bottom-32 -right-24 h-72 w-[500px] rounded-[50%] border-[40px] border-white/[0.04]" />

      <div className="pointer-events-none absolute -bottom-40 left-[-140px] h-72 w-[500px] rounded-[50%] border-[40px] border-white/[0.03]" />

      {/* ================= Main Footer ================= */}
      <div className="relative">
        <div
          className="
            relative mx-auto w-full max-w-[1536px]
            px-6 py-12
            sm:px-8
            lg:px-12 lg:py-14
            xl:px-16
            2xl:px-20
          "
        >
          {/* ================= Main Grid ================= */}
          <div
            className="
              grid grid-cols-1
              gap-10
              lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]
              lg:gap-0
              2xl:grid-cols-[1.5fr_1fr_1fr_1.3fr]
            "
          >
            {/* ================= Brand / Contact ================= */}
            <div
              className="
                border-white/20
                text-right
                lg:border-r
                lg:pr-10
                2xl:pr-14
              "
              dir="rtl"
            >
              <h2 className="text-lg font-bold md:text-xl">
                فروشگاه اینترنتی داروخانه دکتر بهوندی
              </h2>

              <p className="mt-4 max-w-[440px] text-[13px] leading-7 text-white/90 md:text-[14px]">
                دسترسی آسان و مطمئن به محصولات بهداشتی و مکمل‌های غذایی اصل با
                کیفیت.
              </p>

              {/* Social */}
              <div className="mt-6 flex items-center gap-3" dir="ltr">
                {/* Instagram */}
                <a
                  href="https://instagram.com/drbehvandi_pharmacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="
                    flex h-10 w-10 items-center justify-center
                    rounded-xl bg-white/10
                    transition-all duration-200
                    hover:bg-white/20
                    hover:-translate-y-0.5
                  "
                >
                  <Instagram size={21} strokeWidth={2} />
                </a>

                {/* WhatsApp */}
                <a
                  href="https://wa.me/989163182903"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="پشتیبانی واتساپ"
                  className="
                    flex h-10 w-10 items-center justify-center
                    rounded-xl bg-white/10
                    transition-all duration-200
                    hover:bg-white/20
                    hover:-translate-y-0.5
                  "
                >
                  <MessageCircle size={21} strokeWidth={2} />
                </a>

                <span dir="rtl" className="mr-1 text-[12px] text-white/90">
                  پشتیبانی واتساپ
                </span>
              </div>

              {/* Contact */}
              <div
                className="
                  mt-7 space-y-4
                  border-t border-white/15
                  pt-6
                "
                dir="rtl"
              >
                {/* Working hours */}
                <div className="flex items-center gap-3 text-[13px]">
                  <Clock3 size={19} strokeWidth={1.8} className="shrink-0" />

                  <span>پاسخگویی از ۸ صبح تا ۲۴، ۷ روز هفته</span>
                </div>

                {/* Phone */}
                <div className="flex flex-wrap items-center gap-3 text-[13px]">
                  <Phone size={19} strokeWidth={1.8} className="shrink-0" />

                  <span>تماس با پشتیبانی:</span>

                  <a
                    href="tel:09163182903"
                    dir="ltr"
                    className="
                      font-bold
                      underline underline-offset-4
                      transition-opacity
                      hover:opacity-70
                    "
                    aria-label="تماس با پشتیبانی"
                  >
                    09163182903
                  </a>
                </div>
              </div>
            </div>

            {/* ================= Licenses ================= */}
            <div
              className="
                border-white/20
                text-right
                lg:border-r
                lg:px-8
                2xl:px-12
              "
              dir="rtl"
            >
              <div className="mb-4 flex items-center gap-2">
                <ShieldCheck size={21} strokeWidth={1.8} />

                <h3 className="text-base font-bold md:text-[17px]">
                  مجوزهای ما
                </h3>
              </div>

              <p className="mb-6 text-[12px] leading-6 text-white/80 md:text-[13px]">
                مجوزها و نمادهای اعتماد فروشگاه
              </p>

              <div className="flex flex-wrap gap-4" dir="ltr">
                {/* License 1 */}
                <a
                  href="#"
                  aria-label="مجوز اول"
                  className="
                    flex h-[100px] w-[88px]
                    items-center justify-center
                    overflow-hidden rounded-xl
                    bg-white
                    shadow-md
                    transition-all duration-200
                    hover:-translate-y-1
                  "
                >
                  <Image
                    src="/images/licenses/license-1.png"
                    alt="مجوز اول"
                    width={88}
                    height={100}
                    className="h-full w-full object-contain p-2"
                  />
                </a>

                {/* License 2 */}
                <a
                  href="#"
                  aria-label="مجوز دوم"
                  className="
                    flex h-[100px] w-[88px]
                    items-center justify-center
                    overflow-hidden rounded-xl
                    bg-white
                    shadow-md
                    transition-all duration-200
                    hover:-translate-y-1
                  "
                >
                  <Image
                    src="/images/licenses/license-2.png"
                    alt="مجوز دوم"
                    width={88}
                    height={100}
                    className="h-full w-full object-contain p-2"
                  />
                </a>

                {/* License 3 */}
                <a
                  href="#"
                  aria-label="مجوز سوم"
                  className="
                    flex h-[100px] w-[88px]
                    items-center justify-center
                    overflow-hidden rounded-xl
                    bg-white
                    shadow-md
                    transition-all duration-200
                    hover:-translate-y-1
                  "
                >
                  <Image
                    src="/images/licenses/license-3.png"
                    alt="مجوز سوم"
                    width={88}
                    height={100}
                    className="h-full w-full object-contain p-2"
                  />
                </a>
              </div>
            </div>

            {/* ================= Guide ================= */}
            <div
              className="
                border-white/20
                text-right
                lg:border-r
                lg:px-8
                2xl:px-12
              "
              dir="rtl"
            >
              <h3 className="mb-7 text-base font-bold md:text-[17px]">
                راهنمای خرید
              </h3>

              <ul className="space-y-5">
                {guideLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="
                        group flex items-center justify-between
                        gap-4
                        text-[13px]
                        text-white/90
                        transition-colors
                        hover:text-white
                        md:text-[14px]
                      "
                    >
                      <span>{link.title}</span>

                      <ChevronLeft
                        size={16}
                        strokeWidth={1.8}
                        className="
                          shrink-0
                          opacity-50
                          transition-transform
                          duration-200
                          group-hover:-translate-x-1
                        "
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* ================= Customer Services ================= */}
            <div
              className="
                text-right
                lg:pl-8
                2xl:pl-14
              "
              dir="rtl"
            >
              <h3 className="mb-7 text-base font-bold md:text-[17px]">
                خدمات مشتریان
              </h3>

              <ul className="space-y-5">
                {customerLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="
                        group flex items-center justify-between
                        gap-4
                        text-[13px]
                        text-white/90
                        transition-colors
                        hover:text-white
                        md:text-[14px]
                      "
                    >
                      <span>{link.title}</span>

                      <ChevronLeft
                        size={16}
                        strokeWidth={1.8}
                        className="
                          shrink-0
                          opacity-50
                          transition-transform
                          duration-200
                          group-hover:-translate-x-1
                        "
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* ================= Features ================= */}
          <div className="mt-12 border-t border-white/15 pt-8">
            <div
              className="
                grid grid-cols-2
                gap-y-8
                md:grid-cols-4
                md:gap-y-0
              "
              dir="rtl"
            >
              {features.map((feature, index) => {
                const Icon = feature.icon;

                return (
                  <div
                    key={feature.title}
                    className={`
                      flex items-center justify-center gap-3
                      px-4
                      ${index !== 0 ? "md:border-r md:border-white/15" : ""}
                    `}
                  >
                    <Icon size={27} strokeWidth={1.7} className="shrink-0" />

                    <div className="text-right">
                      <p className="text-[12px] font-bold md:text-[13px]">
                        {feature.title}
                      </p>

                      <p className="mt-1 text-[11px] text-white/75 md:text-[12px]">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ================= Copyright ================= */}
      <div className="bg-[#075176]">
        <div
          className="
            mx-auto flex w-full max-w-[1536px]
            flex-col gap-3
            px-6 py-5
            text-[11px]
            text-white/80
            sm:px-8
            lg:flex-row lg:items-center lg:justify-between
            lg:px-12
            xl:px-16
            2xl:px-20
          "
          dir="rtl"
        >
          <p className="text-center lg:text-right">
            © تمام حقوق این وب‌سایت متعلق به فروشگاه اینترنتی داروخانه دکتر
            بهوندی می‌باشد.
          </p>

          <p className="text-center font-medium text-white lg:text-left">
            با اعتماد خرید کنید ♥
          </p>
        </div>
      </div>
    </footer>
  );
}
