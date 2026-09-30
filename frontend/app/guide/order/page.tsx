"use client";

import Link from "next/link";
import {
  ShoppingBag,
  Search,
  PackagePlus,
  ShoppingCart,
  MapPin,
  CreditCard,
  CheckCircle2,
  ArrowLeft,
  Truck,
  RotateCcw,
  HelpCircle,
} from "lucide-react";

const steps = [
  {
    number: "۰۱",
    icon: Search,
    title: "محصول موردنظرت را پیدا کن",
    text: "از طریق دسته‌بندی‌ها یا جستجوی سایت، محصول موردنظر خود را پیدا و مشخصات آن را بررسی کن.",
  },
  {
    number: "۰۲",
    icon: PackagePlus,
    title: "واریانت محصول را انتخاب کن",
    text: "اگر محصول دارای طعم، تعداد یا مدل‌های مختلف است، گزینه موردنظر خود را انتخاب کن.",
  },
  {
    number: "۰۳",
    icon: ShoppingCart,
    title: "به سبد خرید اضافه کن",
    text: "تعداد موردنظر را مشخص کن و محصول را به سبد خرید اضافه کن.",
  },
  {
    number: "۰۴",
    icon: ShoppingBag,
    title: "سبد خرید را بررسی کن",
    text: "محصولات، تعداد و قیمت‌ها را بررسی کن و سپس برای ادامه خرید اقدام کن.",
  },
  {
    number: "۰۵",
    icon: MapPin,
    title: "آدرس را وارد کن",
    text: "آدرس و اطلاعات موردنیاز برای تحویل سفارش را با دقت وارد یا انتخاب کن.",
  },
  {
    number: "۰۶",
    icon: CreditCard,
    title: "پرداخت و ثبت سفارش",
    text: "روش پرداخت را انتخاب کن و پس از تکمیل فرایند، سفارش خود را ثبت کن.",
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

export default function OrderGuidePage() {
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
              <ShoppingBag size={16} />
              راهنمای خرید
            </div>

            <h1 className="text-3xl font-black leading-[1.5] text-white md:text-5xl">
              خریدت رو
              <br />
              <span className="text-cyan-100">ساده و راحت انجام بده</span>
            </h1>

            <p className="mt-6 max-w-2xl text-sm leading-8 text-white/80 md:text-base">
              از انتخاب محصول تا ثبت نهایی سفارش، مراحل خرید را قدم‌به‌قدم
              برایت توضیح داده‌ایم.
            </p>
          </div>
        </div>
      </section>

      {/* GUIDE NAV */}
      <section className="relative -mt-7">
        <div className="mx-auto max-w-[1200px] px-5 md:px-8">
          <div className="grid gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_12px_40px_rgba(8,59,86,0.08)] md:grid-cols-3">
            {guideLinks.map((item) => {
              const Icon = item.icon;
              const active = item.href === "/guide/order";

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

      {/* STEPS */}
      <section className="mx-auto max-w-[1200px] px-5 py-14 md:px-8 md:py-20">
        <div className="mb-10 text-center">
          <span className="text-sm font-bold text-[#08a6c4]">
            از انتخاب تا خرید
          </span>

          <h2 className="mt-2 text-2xl font-black md:text-3xl">
            ثبت سفارش در ۶ مرحله
          </h2>

          <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-slate-500">
            کافی است مراحل زیر را دنبال کنی تا سفارش خودت را به‌راحتی ثبت کنی.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {steps.map((step) => {
            const Icon = step.icon;

            return (
              <div
                key={step.number}
                className="group rounded-3xl border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:border-[#08a6c4]/20 hover:shadow-[0_15px_40px_rgba(8,59,86,0.08)] md:p-7"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e8f9fc] text-[#087da9] transition group-hover:bg-[#087da9] group-hover:text-white">
                    <Icon size={22} />
                  </div>

                  <span className="text-3xl font-black text-[#e8f9fc]">
                    {step.number}
                  </span>
                </div>

                <h3 className="mt-5 font-black">{step.title}</h3>

                <p className="mt-3 text-sm leading-7 text-slate-500">
                  {step.text}
                </p>
              </div>
            );
          })}
        </div>

        {/* TIP */}
        <div className="mt-8 rounded-3xl bg-[#e8f9fc] p-7 md:p-9">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-[#087da9]">
              <CheckCircle2 size={22} />
            </div>

            <div>
              <h3 className="font-black">قبل از ثبت نهایی سفارش</h3>

              <p className="mt-2 text-sm leading-7 text-slate-600">
                یک بار محصولات، تعداد، قیمت و آدرس تحویل را بررسی کن تا سفارش
                با اطلاعات درست ثبت شود.
              </p>
            </div>
          </div>
        </div>

        {/* BOTTOM LINKS */}
        <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/guide/shipping"
            className="flex items-center justify-center gap-2 rounded-xl bg-[#087da9] px-6 py-3.5 text-sm font-black text-white transition hover:-translate-y-0.5 hover:shadow-lg"
          >
            راهنمای ارسال سفارش
            <ArrowLeft size={18} />
          </Link>

          <Link
            href="/faq"
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-bold text-[#087da9]"
          >
            <HelpCircle size={18} />
            سوالات متداول
          </Link>
        </div>
      </section>
    </main>
  );
}