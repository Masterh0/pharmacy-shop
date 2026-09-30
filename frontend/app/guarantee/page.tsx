"use client";

import Link from "next/link";
import {
  ShieldCheck,
  BadgeCheck,
  PackageCheck,
  SearchCheck,
  RotateCcw,
  Phone,
  MessageCircle,
  CheckCircle2,
  ArrowLeft,
  HelpCircle,
} from "lucide-react";

const features = [
  {
    icon: BadgeCheck,
    title: "توجه به اصالت کالا",
    text: "محصولات ارائه‌شده در فروشگاه با هدف ارائه کالای معتبر و قابل اطمینان انتخاب و عرضه می‌شوند.",
  },
  {
    icon: PackageCheck,
    title: "بررسی سفارش",
    text: "سفارش پیش از ارسال بررسی می‌شود تا کالا و اطلاعات سفارش با دقت بیشتری آماده تحویل شود.",
  },
  {
    icon: SearchCheck,
    title: "بررسی موارد مغایرت",
    text: "اگر کالای دریافتی با سفارش شما مغایرت داشته باشد، موضوع قابل بررسی توسط پشتیبانی است.",
  },
];

const process = [
  {
    number: "۱",
    title: "بررسی کالا",
    text: "در زمان دریافت، بسته و کالای خود را بررسی کنید.",
  },
  {
    number: "۲",
    title: "اطلاع به پشتیبانی",
    text: "در صورت مشاهده مشکل، در سریع‌ترین زمان با ما تماس بگیرید.",
  },
  {
    number: "۳",
    title: "بررسی درخواست",
    text: "موضوع سفارش بررسی و راهکار مناسب به شما اعلام می‌شود.",
  },
];

export default function GuaranteePage() {
  return (
    <main
      dir="rtl"
      className="min-h-screen overflow-hidden bg-[#f7fbfc] text-[#083b56]"
    >
      {/* HERO */}
      <section className="mt-4 relative overflow-hidden bg-gradient-to-br from-[#056b92] via-[#087da9] to-[#08a6c4]">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-white/10 blur-3xl" />

        <div className="relative mx-auto max-w-[1400px] px-5 py-16 md:px-8 md:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-[1fr_380px]">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold text-white backdrop-blur">
                <ShieldCheck size={16} />
                ضمانت و پیگیری سفارش
              </div>

              <h1 className="max-w-3xl text-3xl font-black leading-[1.5] text-white md:text-5xl">
                با خیال راحت‌تر
                <br />
                <span className="text-cyan-100">خریدت رو انجام بده</span>
              </h1>

              <p className="mt-6 max-w-2xl text-sm leading-8 text-white/80 md:text-base">
                ما تلاش می‌کنیم سفارش شما با دقت آماده و ارسال شود. اگر هنگام
                دریافت کالا با مغایرت یا مشکلی مواجه شدید، پشتیبانی در کنار شما
                خواهد بود تا موضوع بررسی شود.
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

      {/* FEATURES */}
      <section className="mx-auto max-w-[1200px] px-5 py-14 md:px-8 md:py-20">
        <div className="mb-10 text-center">
          <span className="text-sm font-bold text-[#08a6c4]">
            خرید مطمئن‌تر
          </span>

          <h2 className="mt-2 text-2xl font-black md:text-3xl">
            چه چیزهایی برای ما مهم است؟
          </h2>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <div
                key={feature.title}
                className="rounded-3xl border border-slate-200 bg-white p-7 shadow-[0_8px_30px_rgba(8,59,86,0.04)] transition hover:-translate-y-1 hover:shadow-[0_15px_40px_rgba(8,59,86,0.08)]"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e8f9fc] text-[#087da9]">
                  <Icon size={23} />
                </div>

                <h3 className="mt-5 font-black">{feature.title}</h3>

                <p className="mt-3 text-sm leading-7 text-slate-500">
                  {feature.text}
                </p>
              </div>
            );
          })}
        </div>

        {/* IMPORTANT NOTE */}
        <div className="mt-8 rounded-3xl border border-[#08a6c4]/15 bg-[#e8f9fc] p-7 md:p-9">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-[#087da9]">
              <ShieldCheck size={22} />
            </div>

            <div>
              <h3 className="font-black">یک نکته مهم درباره ضمانت و مرجوعی</h3>

              <p className="mt-3 text-sm leading-8 text-slate-600">
                شرایط بررسی و مرجوعی می‌تواند با توجه به نوع محصول، وضعیت کالا و
                علت درخواست متفاوت باشد. بنابراین اگر مشکلی برای سفارش شما پیش
                آمده، قبل از ارسال یا استفاده از محصول با پشتیبانی تماس بگیرید
                تا شرایط دقیق مورد شما بررسی شود.
              </p>
            </div>
          </div>
        </div>

        {/* PROCESS */}
        <div className="mt-16">
          <div className="mb-8 text-center">
            <span className="text-sm font-bold text-[#08a6c4]">
              اگر مشکلی پیش آمد
            </span>

            <h2 className="mt-2 text-2xl font-black md:text-3xl">
              روند بررسی درخواست
            </h2>
          </div>

          <div className="relative grid gap-5 md:grid-cols-3">
            {process.map((item) => (
              <div
                key={item.number}
                className="rounded-3xl border border-slate-200 bg-white p-7 text-center"
              >
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#087da9] text-lg font-black text-white shadow-lg shadow-[#087da9]/20">
                  {item.number}
                </div>

                <h3 className="mt-5 font-black">{item.title}</h3>

                <p className="mt-3 text-sm leading-7 text-slate-500">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CHECKLIST */}
        <div className="mt-16 rounded-3xl bg-white p-7 shadow-[0_8px_30px_rgba(8,59,86,0.04)] md:p-9">
          <h2 className="text-xl font-black">
            هنگام دریافت سفارش چه چیزهایی را بررسی کنیم؟
          </h2>

          <div className="mt-6 grid gap-3 md:grid-cols-2">
            {[
              "نام و تعداد کالاها با سفارش مطابقت داشته باشد.",
              "بسته‌بندی و ظاهر کالا را بررسی کنید.",
              "در صورت مشاهده مغایرت، موضوع را سریعاً اطلاع دهید.",
              "در صورت وجود مشکل، اطلاعات سفارش را در اختیار پشتیبانی قرار دهید.",
            ].map((item) => (
              <div
                key={item}
                className="flex items-start gap-3 rounded-2xl bg-[#f7fbfc] p-4"
              >
                <CheckCircle2
                  size={19}
                  className="mt-0.5 shrink-0 text-[#08a6c4]"
                />

                <span className="text-sm leading-7 text-slate-600">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CONTACT CTA */}
        <div className="mt-10 rounded-[32px] bg-gradient-to-r from-[#056b92] to-[#08a6c4] p-7 text-white md:p-10">
          <div className="flex flex-col items-center justify-between gap-7 md:flex-row">
            <div>
              <h2 className="text-2xl font-black">
                درباره ضمانت یا سفارش خود سوال داری؟
              </h2>

              <p className="mt-2 text-sm leading-7 text-white/75">
                قبل از هر اقدامی با پشتیبانی در ارتباط باش تا راهنمایی‌ات کنیم.
              </p>
            </div>

            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <a
                href="tel:09163182903"
                className="flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-black text-[#087da9] transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                <Phone size={18} />
                تماس با پشتیبانی
              </a>

              <a
                href="https://wa.me/989163182903"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-white/15"
              >
                <MessageCircle size={18} />
                واتساپ
              </a>
            </div>
          </div>
        </div>

        {/* LINKS */}
        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/faq"
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-[#087da9] transition hover:border-[#087da9]/30"
          >
            <HelpCircle size={18} />
            سوالات متداول
          </Link>

          <Link
            href="/complaints"
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-[#087da9] transition hover:border-[#087da9]/30"
          >
            ثبت شکایت و پیگیری
            <ArrowLeft size={18} />
          </Link>
        </div>
      </section>
    </main>
  );
}
