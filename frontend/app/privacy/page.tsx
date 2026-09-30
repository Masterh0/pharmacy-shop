"use client";

import Link from "next/link";
import {
  ShieldCheck,
  LockKeyhole,
  UserRound,
  Database,
  Cookie,
  EyeOff,
  CheckCircle2,
  ArrowLeft,
  Phone,
} from "lucide-react";

const sections = [
  {
    icon: UserRound,
    title: "چه اطلاعاتی از شما دریافت می‌کنیم؟",
    text: "برای ثبت و ارسال سفارش ممکن است اطلاعاتی مانند نام و نام خانوادگی، شماره تماس، آدرس و اطلاعات موردنیاز برای تحویل سفارش را از شما دریافت کنیم.",
  },
  {
    icon: Database,
    title: "اطلاعات شما چگونه استفاده می‌شود؟",
    text: "اطلاعات ثبت‌شده برای پردازش سفارش، ارسال کالا، پیگیری سفارش، پاسخگویی به درخواست‌های شما و بهبود تجربه خرید در فروشگاه استفاده می‌شود.",
  },
  {
    icon: LockKeyhole,
    title: "امنیت اطلاعات",
    text: "ما تلاش می‌کنیم اطلاعات کاربران را در برابر دسترسی غیرمجاز محافظت کنیم و دسترسی به اطلاعات را تا حد نیاز به فرایند ارائه خدمات محدود نگه داریم.",
  },
  {
    icon: EyeOff,
    title: "اطلاعات شما فروخته نمی‌شود",
    text: "اطلاعات شخصی شما برای فروش یا واگذاری تجاری به اشخاص ثالث در اختیار دیگران قرار نمی‌گیرد؛ مگر در مواردی که برای انجام سفارش یا طبق الزامات قانونی نیاز باشد.",
  },
];

export default function PrivacyPage() {
  return (
    <main
      dir="rtl"
      className="min-h-screen overflow-hidden bg-[#f7fbfc] text-[#083b56]"
    >
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#056b92] via-[#087da9] to-[#08a6c4] mt-4">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-white/10 blur-3xl" />

        <div className="relative mx-auto max-w-[1400px] px-5 py-16 md:px-8 md:py-24">
          <div className="grid items-center gap-10 lg:grid-cols-[1fr_380px]">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold text-white backdrop-blur">
                <ShieldCheck size={16} />
                حریم خصوصی کاربران
              </div>

              <h1 className="max-w-3xl text-3xl font-black leading-[1.5] text-white md:text-5xl">
                اطلاعات شما،
                <br />
                <span className="text-cyan-100">امانت شماست</span>
              </h1>

              <p className="mt-6 max-w-2xl text-sm leading-8 text-white/80 md:text-base">
                حفظ حریم خصوصی و اطلاعات کاربران برای ما اهمیت دارد. در این
                صفحه توضیح داده‌ایم اطلاعات شما در هنگام استفاده از فروشگاه
                اینترنتی داروخانه دکتر بهوندی چگونه مورد استفاده قرار می‌گیرد.
              </p>
            </div>

            <div className="hidden lg:flex justify-center">
              <div className="relative flex h-72 w-72 items-center justify-center rounded-[45px] border border-white/20 bg-white/10 backdrop-blur-md">
                <div className="absolute h-52 w-52 rounded-full border border-white/10" />
                <div className="absolute h-36 w-36 rounded-full border border-white/10" />

                <div className="relative flex h-28 w-28 items-center justify-center rounded-[30px] bg-white shadow-2xl">
                  <ShieldCheck
                    size={58}
                    strokeWidth={1.6}
                    className="text-[#087da9]"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CONTENT */}
      <section className="mx-auto max-w-[1200px] px-5 py-14 md:px-8 md:py-20">
        <div className="grid gap-6 md:grid-cols-2">
          {sections.map((section) => {
            const Icon = section.icon;

            return (
              <div
                key={section.title}
                className="rounded-3xl border border-slate-200 bg-white p-7 shadow-[0_8px_30px_rgba(8,59,86,0.04)] transition hover:-translate-y-1 hover:shadow-[0_15px_40px_rgba(8,59,86,0.08)]"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e8f9fc] text-[#087da9]">
                  <Icon size={23} />
                </div>

                <h2 className="text-lg font-black text-[#083b56]">
                  {section.title}
                </h2>

                <p className="mt-3 text-sm leading-8 text-slate-600">
                  {section.text}
                </p>
              </div>
            );
          })}
        </div>

        {/* COOKIE */}
        <div className="mt-6 rounded-3xl border border-[#08a6c4]/10 bg-white p-7">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#e8f9fc] text-[#087da9]">
              <Cookie size={23} />
            </div>

            <div>
              <h2 className="text-lg font-black">کوکی‌ها</h2>

              <p className="mt-3 text-sm leading-8 text-slate-600">
                ممکن است سایت برای حفظ تنظیمات، بهبود عملکرد و ارائه تجربه
                کاربری بهتر از کوکی‌ها و فناوری‌های مشابه استفاده کند. تنظیمات
                مرورگر شما نیز می‌تواند بر نحوه استفاده از کوکی‌ها تأثیر
                بگذارد.
              </p>
            </div>
          </div>
        </div>

        {/* USER RIGHTS */}
        <div className="mt-6 rounded-3xl bg-[#e8f9fc] p-7 md:p-9">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-[#087da9] shadow-sm">
              <CheckCircle2 size={23} />
            </div>

            <div>
              <h2 className="text-lg font-black">
                حریم خصوصی، فقط یک متن نیست
              </h2>

              <p className="mt-3 text-sm leading-8 text-slate-600">
                اگر درباره اطلاعاتی که هنگام ثبت سفارش وارد کرده‌اید سؤال یا
                نگرانی خاصی دارید، می‌توانید با پشتیبانی داروخانه دکتر بهوندی
                در ارتباط باشید.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-10 flex flex-col items-center justify-between gap-5 rounded-3xl bg-gradient-to-r from-[#056b92] to-[#08a6c4] p-7 text-center text-white md:flex-row md:text-right md:p-9">
          <div>
            <h3 className="text-xl font-black">
              درباره اطلاعات خود سوالی دارید؟
            </h3>

            <p className="mt-2 text-sm leading-7 text-white/75">
              پشتیبانی آماده پاسخگویی به شماست.
            </p>
          </div>

          <a
            href="tel:09163182903"
            className="flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-black text-[#087da9] transition hover:-translate-y-0.5 hover:shadow-lg"
          >
            <Phone size={18} />
            ۰۹۱۶۳۱۸۲۹۰۳
          </a>
        </div>
      </section>
    </main>
  );
}