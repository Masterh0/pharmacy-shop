"use client";

import Link from "next/link";
import {
  MessageCircleWarning,
  ClipboardList,
  SearchCheck,
  MessageCircle,
  Phone,
  Clock3,
  CheckCircle2,
  ArrowLeft,
  HelpCircle,
} from "lucide-react";

const steps = [
  {
    number: "۰۱",
    icon: ClipboardList,
    title: "ثبت درخواست",
    text: "موضوع یا مشکل خود را از طریق تماس تلفنی یا واتساپ با ما در میان بگذارید.",
  },
  {
    number: "۰۲",
    icon: SearchCheck,
    title: "بررسی موضوع",
    text: "اطلاعات سفارش و موضوع مطرح‌شده بررسی می‌شود تا راهکار مناسب مشخص شود.",
  },
  {
    number: "۰۳",
    icon: MessageCircle,
    title: "پاسخ و پیگیری",
    text: "نتیجه بررسی و مراحل بعدی به شما اعلام خواهد شد و در صورت نیاز موضوع پیگیری می‌شود.",
  },
];

export default function ComplaintsPage() {
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
                <MessageCircleWarning size={16} />
                ثبت شکایت و پیگیری
              </div>

              <h1 className="max-w-3xl text-3xl font-black leading-[1.5] text-white md:text-5xl">
                اگر مشکلی پیش آمده،
                <br />
                <span className="text-cyan-100">کنار شما هستیم</span>
              </h1>

              <p className="mt-6 max-w-2xl text-sm leading-8 text-white/80 md:text-base">
                تجربه خوب خرید برای ما مهم است. اگر در سفارش، ارسال یا دریافت
                محصول با مشکلی روبه‌رو شدید، موضوع را با ما در میان بگذارید تا
                بررسی شود.
              </p>
            </div>

            <div className="hidden lg:flex justify-center">
              <div className="relative flex h-72 w-72 items-center justify-center rounded-[45px] border border-white/20 bg-white/10 backdrop-blur-md">
                <div className="absolute h-52 w-52 rounded-full border border-white/10" />
                <div className="absolute h-36 w-36 rounded-full border border-white/10" />

                <div className="relative flex h-28 w-28 items-center justify-center rounded-[30px] bg-white shadow-2xl">
                  <MessageCircleWarning
                    size={55}
                    strokeWidth={1.6}
                    className="text-[#087da9]"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* INTRO */}
      <section className="mx-auto max-w-[1200px] px-5 py-14 md:px-8 md:py-20">
        <div className="rounded-[32px] border border-slate-200 bg-white p-7 shadow-[0_10px_40px_rgba(8,59,86,0.05)] md:p-10">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#e8f9fc] text-[#087da9]">
              <MessageCircleWarning size={24} />
            </div>

            <div>
              <h2 className="text-xl font-black md:text-2xl">
                هدف ما حل مسئله است
              </h2>

              <p className="mt-3 text-sm leading-8 text-slate-600 md:text-base">
                گاهی ممکن است در فرایند خرید، ارسال یا دریافت کالا مشکلی پیش
                بیاید. اگر چنین اتفاقی افتاد، موضوع را با ما در میان بگذارید.
                بررسی دقیق موضوع به ما کمک می‌کند راهکار مناسب را سریع‌تر
                پیدا کنیم.
              </p>
            </div>
          </div>
        </div>

        {/* STEPS */}
        <div className="mt-14">
          <div className="mb-8 text-center">
            <span className="text-sm font-bold text-[#08a6c4]">
              روند رسیدگی
            </span>

            <h2 className="mt-2 text-2xl font-black md:text-3xl">
              درخواست شما چطور بررسی می‌شود؟
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {steps.map((step) => {
              const Icon = step.icon;

              return (
                <div
                  key={step.number}
                  className="relative rounded-3xl border border-slate-200 bg-white p-7 shadow-[0_8px_30px_rgba(8,59,86,0.04)]"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e8f9fc] text-[#087da9]">
                      <Icon size={23} />
                    </div>

                    <span className="text-3xl font-black text-[#e8f9fc]">
                      {step.number}
                    </span>
                  </div>

                  <h3 className="mt-6 font-black text-[#083b56]">
                    {step.title}
                  </h3>

                  <p className="mt-3 text-sm leading-7 text-slate-500">
                    {step.text}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* WHAT TO PROVIDE */}
        <div className="mt-14 rounded-3xl bg-[#e8f9fc] p-7 md:p-9">
          <h2 className="text-xl font-black">
            برای بررسی سریع‌تر چه اطلاعاتی لازم است؟
          </h2>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {[
              "نام و شماره تماس",
              "شماره سفارش در صورت وجود",
              "شرح کوتاه مشکل",
              "عکس یا مدرک مرتبط، در صورت نیاز",
            ].map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 rounded-2xl bg-white p-4"
              >
                <CheckCircle2
                  size={19}
                  className="shrink-0 text-[#08a6c4]"
                />
                <span className="text-sm font-bold text-slate-600">
                  {item}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* CONTACT */}
        <div className="mt-14 grid gap-5 md:grid-cols-2">
          <a
            href="tel:09163182903"
            className="group rounded-3xl bg-gradient-to-br from-[#056b92] to-[#087da9] p-7 text-white transition hover:-translate-y-1 hover:shadow-xl"
          >
            <Phone size={28} />

            <h3 className="mt-5 text-xl font-black">تماس مستقیم</h3>

            <p className="mt-2 text-sm leading-7 text-white/70">
              برای مطرح کردن مشکل یا دریافت راهنمایی با ما تماس بگیرید.
            </p>

            <div className="mt-5 flex items-center gap-2 text-sm font-black">
              ۰۹۱۶۳۱۸۲۹۰۳
              <ArrowLeft
                size={18}
                className="transition group-hover:-translate-x-1"
              />
            </div>
          </a>

          <a
            href="https://wa.me/989163182903"
            target="_blank"
            rel="noopener noreferrer"
            className="group rounded-3xl border border-slate-200 bg-white p-7 transition hover:-translate-y-1 hover:border-[#08a6c4]/30 hover:shadow-xl"
          >
            <MessageCircle size={28} className="text-[#087da9]" />

            <h3 className="mt-5 text-xl font-black">
              پشتیبانی واتساپ
            </h3>

            <p className="mt-2 text-sm leading-7 text-slate-500">
              اگر ترجیح می‌دهید موضوع را به صورت پیام مطرح کنید، از واتساپ
              استفاده کنید.
            </p>

            <div className="mt-5 flex items-center gap-2 text-sm font-black text-[#087da9]">
              شروع گفتگو
              <ArrowLeft
                size={18}
                className="transition group-hover:-translate-x-1"
              />
            </div>
          </a>
        </div>

        {/* HOURS */}
        <div className="mt-6 flex items-center gap-4 rounded-3xl border border-slate-200 bg-white p-6">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#e8f9fc] text-[#087da9]">
            <Clock3 size={21} />
          </div>

          <div>
            <h4 className="font-black">ساعات پاسخگویی</h4>
            <p className="mt-1 text-sm text-slate-500">
              ۸ صبح تا ۲۴، در تمام روزهای هفته
            </p>
          </div>
        </div>

        {/* FAQ LINK */}
        <div className="mt-10 text-center">
          <p className="text-sm text-slate-500">
            شاید پاسخ سوال شما در پرسش‌های متداول وجود داشته باشد.
          </p>

          <Link
            href="/faq"
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#087da9] px-6 py-3.5 text-sm font-black text-white transition hover:-translate-y-0.5 hover:shadow-lg"
          >
            <HelpCircle size={18} />
            مشاهده سوالات متداول
          </Link>
        </div>
      </section>
    </main>
  );
}