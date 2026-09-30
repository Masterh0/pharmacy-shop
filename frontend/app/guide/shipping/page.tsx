"use client";

import Link from "next/link";
import {
  Truck,
  ShoppingBag,
  PackageCheck,
  MapPin,
  Home,
  RotateCcw,
  ArrowLeft,
  Clock3,
  MessageCircle,
  CheckCircle2,
} from "lucide-react";

const steps = [
  {
    icon: ShoppingBag,
    title: "ثبت سفارش",
    text: "بعد از تکمیل خرید، سفارش شما در سیستم ثبت می‌شود.",
  },
  {
    icon: PackageCheck,
    title: "آماده‌سازی",
    text: "سفارش بررسی و برای ارسال آماده می‌شود.",
  },
  {
    icon: Truck,
    title: "ارسال سفارش",
    text: "سفارش پس از آماده‌سازی برای ارسال به مقصد تحویل داده می‌شود.",
  },
  {
    icon: Home,
    title: "تحویل به شما",
    text: "سفارش در آدرس ثبت‌شده هنگام خرید به شما تحویل داده می‌شود.",
  },
];

const guideLinks = [
  {
    href: "/guide/order",
    title: "ثبت سفارش",
    icon: ShoppingBag,
    description: "چطور خرید خود را ثبت کنیم؟",
  },
  {
    href: "/guide/shipping",
    title: "ارسال سفارش",
    icon: Truck,
    description: "سفارش چطور به دستت می‌رسد؟",
  },
  {
    href: "/guide/returns",
    title: "بازگشت کالا",
    icon: RotateCcw,
    description: "اگر مشکلی پیش آمد چه کنیم؟",
  },
];

export default function ShippingGuidePage() {
  return (
    <main
      dir="rtl"
      className="mt-4 min-h-screen overflow-hidden bg-[#f7fbfc] text-[#083b56]"
    >
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#056b92] via-[#087da9] to-[#08a6c4]">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-white/10 blur-3xl" />

        <div className="relative mx-auto max-w-[1400px] px-5 pb-16 pt-14 md:px-8 md:pb-20 md:pt-20">
          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold text-white backdrop-blur">
              <Truck size={16} />
              راهنمای ارسال
            </div>

            <h1 className="text-3xl font-black leading-[1.5] text-white md:text-5xl">
              سفارشت رو ثبت کن،
              <br />
              <span className="text-cyan-100">ما بقیه مسیر رو پیگیری می‌کنیم</span>
            </h1>

            <p className="mt-6 max-w-2xl text-sm leading-8 text-white/80 md:text-base">
              از آماده‌سازی سفارش تا تحویل در مقصد، اینجا می‌توانی با روند کلی
              ارسال سفارش آشنا شوی.
            </p>
          </div>
        </div>
      </section>

      {/* NAV */}
      <section className="relative -mt-7">
        <div className="mx-auto max-w-[1200px] px-5 md:px-8">
          <div className="grid gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_12px_40px_rgba(8,59,86,0.08)] md:grid-cols-3">
            {guideLinks.map((item) => {
              const Icon = item.icon;
              const active = item.href === "/guide/shipping";

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-xl p-4 transition ${
                    active
                      ? "bg-[#087da9] text-white shadow-lg shadow-[#087da9]/20"
                      : "text-slate-600 hover:bg-[#e8f9fc] hover:text-[#087da9]"
                  }`}
                >
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                      active ? "bg-white/15" : "bg-[#e8f9fc]"
                    }`}
                  >
                    <Icon size={20} />
                  </div>

                  <div>
                    <p className="text-sm font-black">{item.title}</p>
                    <p
                      className={`mt-1 text-xs ${
                        active ? "text-white/70" : "text-slate-400"
                      }`}
                    >
                      {item.description}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* TIMELINE */}
      <section className="mx-auto max-w-[1200px] px-5 py-14 md:px-8 md:py-20">
        <div className="mb-10 text-center">
          <span className="text-sm font-bold text-[#08a6c4]">
            مسیر سفارش
          </span>

          <h2 className="mt-2 text-2xl font-black md:text-3xl">
            سفارشت چطور به دستت می‌رسد؟
          </h2>
        </div>

        <div className="grid gap-5 md:grid-cols-4">
          {steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <div
                key={step.title}
                className="relative rounded-3xl border border-slate-200 bg-white p-6 text-center"
              >
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e8f9fc] text-[#087da9]">
                  <Icon size={25} />
                </div>

                <div className="mt-5 text-xs font-black text-[#08a6c4]">
                  مرحله {index + 1}
                </div>

                <h3 className="mt-2 font-black">{step.title}</h3>

                <p className="mt-3 text-sm leading-7 text-slate-500">
                  {step.text}
                </p>
              </div>
            );
          })}
        </div>

        {/* INFO CARDS */}
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-7">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#e8f9fc] text-[#087da9]">
              <Clock3 size={21} />
            </div>

            <h3 className="mt-5 font-black">زمان ارسال</h3>

            <p className="mt-3 text-sm leading-8 text-slate-500">
              زمان آماده‌سازی و تحویل سفارش می‌تواند با توجه به مقصد، روش
              ارسال و شرایط سفارش متفاوت باشد. زمان تقریبی در فرایند خرید یا
              توسط پشتیبانی اعلام می‌شود.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-7">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#e8f9fc] text-[#087da9]">
              <MapPin size={21} />
            </div>

            <h3 className="mt-5 font-black">آدرس تحویل</h3>

            <p className="mt-3 text-sm leading-8 text-slate-500">
              هنگام ثبت سفارش، آدرس و اطلاعات تحویل را با دقت بررسی کن. اگر
              بعد از ثبت سفارش متوجه اشتباه شدی، در سریع‌ترین زمان با پشتیبانی
              تماس بگیر.
            </p>
          </div>
        </div>

        {/* IMPORTANT */}
        <div className="mt-6 rounded-3xl bg-[#e8f9fc] p-7 md:p-9">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-[#087da9]">
              <CheckCircle2 size={22} />
            </div>

            <div>
              <h3 className="font-black">سفارش را هنگام تحویل بررسی کن</h3>

              <p className="mt-2 text-sm leading-7 text-slate-600">
                پس از دریافت، بهتر است بسته و اقلام سفارش را بررسی کنی. در
                صورت مشاهده مغایرت یا آسیب‌دیدگی، موضوع را در سریع‌ترین زمان به
                پشتیبانی اطلاع بده.
              </p>
            </div>
          </div>
        </div>

        {/* SUPPORT */}
        <div className="mt-10 rounded-[32px] bg-gradient-to-r from-[#056b92] to-[#08a6c4] p-7 text-white md:p-9">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div>
              <h3 className="text-xl font-black">
                درباره ارسال سفارشت سوال داری؟
              </h3>

              <p className="mt-2 text-sm text-white/75">
                پشتیبانی آماده پاسخگویی به شماست.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <a
                href="tel:09163182903"
                className="flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-black text-[#087da9]"
              >
                تماس با پشتیبانی
              </a>

              <a
                href="https://wa.me/989163182903"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-6 py-3.5 text-sm font-bold text-white"
              >
                <MessageCircle size={18} />
                واتساپ
              </a>
            </div>
          </div>
        </div>

        {/* LINKS */}
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/guide/order"
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-bold text-[#087da9]"
          >
            <ArrowLeft size={18} />
            راهنمای ثبت سفارش
          </Link>

          <Link
            href="/guide/returns"
            className="flex items-center justify-center gap-2 rounded-xl bg-[#087da9] px-6 py-3.5 text-sm font-black text-white"
          >
            شرایط بازگشت کالا
            <ArrowLeft size={18} />
          </Link>
        </div>
      </section>
    </main>
  );
}