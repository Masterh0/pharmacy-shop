"use client";

import Link from "next/link";
import {
  RotateCcw,
  PackageCheck,
  SearchCheck,
  MessageCircle,
  Phone,
  Clock3,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  ShoppingBag,
  Truck,
} from "lucide-react";

const steps = [
  {
    number: "۰۱",
    icon: MessageCircle,
    title: "با پشتیبانی تماس بگیر",
    text: "اگر سفارش با مشکلی مواجه شده، در اولین فرصت موضوع را به پشتیبانی اطلاع بده.",
  },
  {
    number: "۰۲",
    icon: SearchCheck,
    title: "موضوع بررسی می‌شود",
    text: "اطلاعات سفارش و علت درخواست بررسی می‌شود تا شرایط مورد شما مشخص شود.",
  },
  {
    number: "۰۳",
    icon: PackageCheck,
    title: "راهکار اعلام می‌شود",
    text: "پس از بررسی، نتیجه و مراحل بعدی توسط پشتیبانی به شما اعلام خواهد شد.",
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

export default function ReturnsGuidePage() {
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
              <RotateCcw size={16} />
              شرایط بازگشت کالا
            </div>

            <h1 className="text-3xl font-black leading-[1.5] text-white md:text-5xl">
              اگر چیزی طبق انتظارت نبود،
              <br />
              <span className="text-cyan-100">با ما در ارتباط باش</span>
            </h1>

            <p className="mt-6 max-w-2xl text-sm leading-8 text-white/80 md:text-base">
              شرایط بررسی و بازگشت کالا به نوع محصول و وضعیت سفارش بستگی دارد.
              اینجا مسیر کلی پیگیری درخواست را توضیح داده‌ایم.
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
              const active = item.href === "/guide/returns";

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

      {/* INTRO */}
      <section className="mx-auto max-w-[1200px] px-5 py-14 md:px-8 md:py-20">
        <div className="rounded-[32px] border border-slate-200 bg-white p-7 shadow-[0_10px_40px_rgba(8,59,86,0.05)] md:p-10">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#e8f9fc] text-[#087da9]">
              <RotateCcw size={24} />
            </div>

            <div>
              <h2 className="text-xl font-black md:text-2xl">
                درخواست بازگشت چگونه بررسی می‌شود؟
              </h2>

              <p className="mt-3 text-sm leading-8 text-slate-600">
                هر درخواست با توجه به نوع محصول، وضعیت کالا، علت درخواست و
                شرایط سفارش بررسی می‌شود. به همین دلیل اگر مشکلی برای سفارش
                شما ایجاد شده، بهتر است قبل از هر اقدامی با پشتیبانی تماس
                بگیرید.
              </p>
            </div>
          </div>
        </div>

        {/* POSSIBLE CASES */}
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-7">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#e8f9fc] text-[#087da9]">
              <CheckCircle2 size={21} />
            </div>

            <h3 className="mt-5 text-lg font-black">
              مواردی که می‌توانند نیاز به بررسی داشته باشند
            </h3>

            <ul className="mt-5 space-y-3">
              {[
                "مغایرت محصول با سفارش ثبت‌شده",
                "آسیب‌دیدگی قابل مشاهده هنگام دریافت",
                "وجود مشکل یا ایراد در کالای دریافتی",
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 text-sm leading-7 text-slate-600"
                >
                  <CheckCircle2
                    size={18}
                    className="mt-1 shrink-0 text-[#08a6c4]"
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-7">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
              <XCircle size={21} />
            </div>

            <h3 className="mt-5 text-lg font-black">
              چرا هر محصول شرایط یکسانی ندارد؟
            </h3>

            <p className="mt-4 text-sm leading-8 text-slate-500">
              ماهیت بعضی محصولات باعث می‌شود شرایط بازگشت آن‌ها با سایر کالاها
              متفاوت باشد. به همین دلیل قبل از هرگونه ارسال مجدد کالا، شرایط
              درخواست شما باید توسط پشتیبانی بررسی شود.
            </p>
          </div>
        </div>

        {/* STEPS */}
        <div className="mt-16">
          <div className="mb-9 text-center">
            <span className="text-sm font-bold text-[#08a6c4]">
              مسیر پیگیری
            </span>

            <h2 className="mt-2 text-2xl font-black md:text-3xl">
              درخواستت چطور بررسی می‌شود؟
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {steps.map((step) => {
              const Icon = step.icon;

              return (
                <div
                  key={step.number}
                  className="rounded-3xl border border-slate-200 bg-white p-7"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e8f9fc] text-[#087da9]">
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
        </div>

        {/* CHECKLIST */}
        <div className="mt-14 rounded-3xl bg-[#e8f9fc] p-7 md:p-9">
          <h2 className="text-xl font-black">
            برای پیگیری چه اطلاعاتی آماده داشته باشیم؟
          </h2>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {[
              "شماره سفارش",
              "نام و شماره تماس ثبت‌شده",
              "توضیح کوتاه درباره مشکل",
              "عکس کالا یا بسته، در صورت نیاز",
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
        <div className="mt-10 rounded-[32px] bg-gradient-to-r from-[#056b92] to-[#08a6c4] p-7 text-white md:p-10">
          <div className="flex flex-col items-center justify-between gap-7 md:flex-row">
            <div>
              <h2 className="text-2xl font-black">
                درباره بازگشت سفارش سوال داری؟
              </h2>

              <p className="mt-2 text-sm leading-7 text-white/75">
                قبل از ارسال مجدد کالا، حتماً با پشتیبانی هماهنگ کن.
              </p>
            </div>

            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <a
                href="tel:09163182903"
                className="flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-black text-[#087da9]"
              >
                <Phone size={18} />
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

        {/* BOTTOM LINKS */}
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/guide/shipping"
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-bold text-[#087da9]"
          >
            <Truck size={18} />
            راهنمای ارسال
          </Link>

          <Link
            href="/complaints"
            className="flex items-center justify-center gap-2 rounded-xl bg-[#087da9] px-6 py-3.5 text-sm font-black text-white"
          >
            ثبت شکایت و پیگیری
            <ArrowLeft size={18} />
          </Link>
        </div>

        {/* HOURS */}
        <div className="mt-8 flex items-center justify-center gap-3 text-center text-sm text-slate-500">
          <Clock3 size={18} className="text-[#087da9]" />
          پاسخگویی پشتیبانی: ۸ صبح تا ۲۴، هر روز هفته
        </div>
      </section>
    </main>
  );
}