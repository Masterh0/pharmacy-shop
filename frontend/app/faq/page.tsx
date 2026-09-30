"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ChevronDown,
  MessageCircle,
  Phone,
  ShoppingBag,
  Truck,
  Package,
  RotateCcw,
  Headphones,
  HelpCircle,
  ShieldCheck,
  ArrowLeft,
  Clock3,
} from "lucide-react";

type FaqItem = {
  question: string;
  answer: string;
};

type FaqCategory = {
  id: string;
  title: string;
  icon: React.ElementType;
  items: FaqItem[];
};

const faqCategories: FaqCategory[] = [
  {
    id: "order",
    title: "سفارش و خرید",
    icon: ShoppingBag,
    items: [
      {
        question: "چطور می‌توانم از سایت سفارش ثبت کنم؟",
        answer:
          "محصول موردنظر خود را انتخاب کنید، آن را به سبد خرید اضافه کنید و پس از بررسی سبد، مراحل ثبت سفارش و پرداخت را انجام دهید.",
      },
      {
        question: "آیا برای خرید از سایت باید حساب کاربری داشته باشم؟",
        answer:
          "برای تکمیل سفارش ممکن است نیاز باشد وارد حساب کاربری خود شوید یا حساب ایجاد کنید. اطلاعات حساب شما برای پیگیری بهتر سفارش‌ها استفاده می‌شود.",
      },
      {
        question: "چطور می‌توانم وضعیت سفارش خود را پیگیری کنم؟",
        answer:
          "پس از ثبت سفارش، وضعیت آن از طریق حساب کاربری قابل پیگیری است. در صورت نیاز می‌توانید برای دریافت راهنمایی بیشتر با پشتیبانی تماس بگیرید.",
      },
      {
        question: "آیا می‌توانم بعد از ثبت سفارش آن را لغو کنم؟",
        answer:
          "اگر سفارش هنوز وارد مرحله ارسال نشده باشد، امکان بررسی درخواست لغو وجود دارد. برای این کار هرچه سریع‌تر با پشتیبانی تماس بگیرید.",
      },
    ],
  },

  {
    id: "shipping",
    title: "ارسال",
    icon: Truck,
    items: [
      {
        question: "سفارش‌ها چگونه ارسال می‌شوند؟",
        answer:
          "سفارش‌ها پس از آماده‌سازی و تأیید، به آدرس ثبت‌شده هنگام خرید ارسال می‌شوند. روش و زمان ارسال می‌تواند با توجه به مقصد و شرایط سفارش متفاوت باشد.",
      },
      {
        question: "چه مدت طول می‌کشد سفارش به دستم برسد؟",
        answer:
          "زمان تحویل به مقصد و روش ارسال بستگی دارد. زمان تقریبی ارسال هنگام تکمیل سفارش یا توسط پشتیبانی به شما اعلام می‌شود.",
      },
      {
        question: "آیا امکان ارسال به شهرهای دیگر وجود دارد؟",
        answer:
          "امکان ارسال سفارش به مقصدهای تحت پوشش ارسال وجود دارد. برای اطلاع از شرایط ارسال به شهر موردنظر خود می‌توانید با پشتیبانی تماس بگیرید.",
      },
      {
        question: "اگر هنگام تحویل سفارش مشکلی وجود داشت چه کار کنم؟",
        answer:
          "در صورت مشاهده آسیب‌دیدگی، مغایرت یا مشکل در سفارش، قبل از هر اقدامی با پشتیبانی تماس بگیرید تا موضوع بررسی و راهنمایی لازم ارائه شود.",
      },
    ],
  },

  {
    id: "products",
    title: "محصولات",
    icon: Package,
    items: [
      {
        question: "چه محصولاتی در داروخانه دکتر بهوندی عرضه می‌شود؟",
        answer:
          "فروشگاه روی محصولاتی مانند مکمل‌های غذایی و ورزشی، ویتامین‌ها، محصولات بهداشتی و مراقبتی، برخی محصولات آرایشی، عطر و اسپری و محصولات مرتبط با کودک تمرکز دارد.",
      },
      {
        question: "آیا محصولات دارویی هم در سایت فروخته می‌شوند؟",
        answer:
          "این فروشگاه اینترنتی برای عرضه محصولات غیر دارویی طراحی شده است و تمرکز آن روی مکمل‌ها، ویتامین‌ها، محصولات بهداشتی و سایر محصولات مجاز فروشگاه است.",
      },
      {
        question: "آیا اطلاعات محصول و مشخصات آن در سایت درج می‌شود؟",
        answer:
          "برای هر محصول، اطلاعات و مشخصات موجود در زمان ثبت محصول نمایش داده می‌شود. اگر درباره مشخصات یا نحوه مصرف محصولی سؤال دارید، می‌توانید با پشتیبانی تماس بگیرید.",
      },
      {
        question: "اگر محصولی موجود نباشد دوباره شارژ می‌شود؟",
        answer:
          "موجودی محصولات با توجه به تأمین کالا تغییر می‌کند. اگر محصولی ناموجود است، می‌توانید برای اطلاع از موجودی مجدد با پشتیبانی در ارتباط باشید.",
      },
    ],
  },

  {
    id: "returns",
    title: "مرجوعی و لغو",
    icon: RotateCcw,
    items: [
      {
        question: "آیا امکان مرجوع کردن سفارش وجود دارد؟",
        answer:
          "شرایط مرجوعی به نوع محصول و وضعیت آن بستگی دارد. برای بررسی شرایط سفارش، قبل از ارسال یا استفاده از محصول با پشتیبانی تماس بگیرید.",
      },
      {
        question: "اگر محصول اشتباهی برای من ارسال شده باشد چه کنم؟",
        answer:
          "در صورت دریافت محصول اشتباه، در اسرع وقت با پشتیبانی تماس بگیرید و اطلاعات سفارش را اعلام کنید تا موضوع بررسی شود.",
      },
      {
        question: "اگر محصول هنگام تحویل آسیب دیده باشد چه می‌شود؟",
        answer:
          "در صورت مشاهده آسیب یا ایراد ظاهری، موضوع را سریعاً به پشتیبانی اطلاع دهید تا وضعیت سفارش بررسی و راهکار مناسب اعلام شود.",
      },
      {
        question: "آیا بعد از باز شدن بسته امکان مرجوعی وجود دارد؟",
        answer:
          "شرایط مرجوعی به نوع کالا و وضعیت آن بستگی دارد و برای بعضی محصولات ممکن است به دلیل ماهیت کالا محدودیت وجود داشته باشد. برای بررسی مورد خود با پشتیبانی تماس بگیرید.",
      },
    ],
  },

  {
    id: "support",
    title: "پشتیبانی",
    icon: Headphones,
    items: [
      {
        question: "چطور با پشتیبانی تماس بگیرم؟",
        answer:
          "می‌توانید از طریق تماس تلفنی با شماره ۰۹۱۶۳۱۸۲۹۰۳ یا از طریق واتساپ با پشتیبانی در ارتباط باشید.",
      },
      {
        question: "ساعات پاسخگویی پشتیبانی چه زمانی است؟",
        answer:
          "پشتیبانی در حال حاضر از ساعت ۸ صبح تا ۲۴، در تمام روزهای هفته پاسخگوی شماست.",
      },
      {
        question: "اگر سؤال من در این صفحه نبود چه کار کنم؟",
        answer:
          "اگر پاسخ سؤال خود را پیدا نکردید، مشکلی نیست. از طریق تماس تلفنی یا واتساپ با ما در ارتباط باشید تا راهنمایی‌تان کنیم.",
      },
    ],
  },
];

const allItems = faqCategories.flatMap((category) => category.items);

function FAQAccordion({ item }: { item: FaqItem }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={`overflow-hidden rounded-2xl border transition-all duration-300 ${
        open
          ? "border-[#08a6c4]/30 bg-[#f8fdff] shadow-[0_8px_30px_rgba(8,166,196,0.08)]"
          : "border-slate-200 bg-white hover:border-[#08a6c4]/20"
      }`}
    >
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between gap-4 px-5 py-5 text-right md:px-6"
      >
        <span
          className={`text-sm font-bold leading-7 md:text-[15px] ${
            open ? "text-[#087da9]" : "text-[#083b56]"
          }`}
        >
          {item.question}
        </span>

        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-all duration-300 ${
            open
              ? "rotate-180 bg-[#087da9] text-white"
              : "bg-[#e8f9fc] text-[#087da9]"
          }`}
        >
          <ChevronDown size={18} />
        </span>
      </button>

      <div
        className={`grid transition-all duration-300 ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <div className="px-5 pb-5 md:px-6 md:pb-6">
            <div className="border-t border-[#08a6c4]/10 pt-4">
              <p className="text-sm leading-8 text-slate-600">{item.answer}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState("all");

  const activeItems = useMemo(() => {
    if (activeCategory === "all") {
      return allItems;
    }

    return (
      faqCategories.find((category) => category.id === activeCategory)?.items ||
      []
    );
  }, [activeCategory]);

  const activeCategoryData = faqCategories.find(
    (category) => category.id === activeCategory,
  );

  return (
    <main
      dir="rtl"
      className="min-h-screen overflow-hidden bg-[#f7fbfc] text-[#083b56]"
    >
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#056b92] via-[#087da9] to-[#08a6c4] mt-4">
        {/* Decorative circles */}
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-white/10 blur-3xl" />

        <div className="relative mx-auto max-w-[1400px] px-5 pb-16 pt-14 md:px-8 md:pb-20 md:pt-20">
          <div className="grid items-center gap-12 lg:grid-cols-[1fr_420px]">
            <div className="max-w-3xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold text-white backdrop-blur">
                <HelpCircle size={16} />
                مرکز پرسش‌های متداول
              </div>

              <h1 className="text-3xl font-black leading-[1.5] text-white md:text-5xl md:leading-[1.4]">
                هر سوالی داری،
                <br />
                <span className="text-cyan-100">احتمالاً جوابش اینجاست</span>
              </h1>

              <p className="mt-6 max-w-2xl text-sm leading-8 text-white/80 md:text-base">
                سوالات پرتکرار درباره ثبت سفارش، ارسال، محصولات، مرجوعی و
                پشتیبانی را یکجا جمع کرده‌ایم تا سریع‌تر به جواب موردنظرت برسی.
              </p>
            </div>

            {/* Hero Card */}
            <div className="hidden lg:block">
              <div className="relative mx-auto flex h-[300px] w-full max-w-[400px] items-center justify-center rounded-[40px] border border-white/20 bg-white/10 shadow-2xl backdrop-blur-md">
                <div className="absolute h-48 w-48 rounded-full border border-white/10" />
                <div className="absolute h-32 w-32 rounded-full border border-white/10" />

                <div className="relative flex h-28 w-28 items-center justify-center rounded-3xl bg-white shadow-xl">
                  <HelpCircle
                    size={62}
                    strokeWidth={1.7}
                    className="text-[#087da9]"
                  />
                </div>

                <div className="absolute right-8 top-10 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-white">
                  <MessageCircle size={22} />
                </div>

                <div className="absolute bottom-10 left-8 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-white">
                  <ShieldCheck size={22} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORY TABS */}
      <section className="relative -mt-7">
        <div className="mx-auto max-w-[1400px] px-5 md:px-8">
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_12px_40px_rgba(8,59,86,0.08)]">
            <div className="flex min-w-max gap-2">
              {/* ALL */}
              <button
                type="button"
                onClick={() => setActiveCategory("all")}
                className={`flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition-all ${
                  activeCategory === "all"
                    ? "bg-[#087da9] text-white shadow-lg shadow-[#087da9]/20"
                    : "text-slate-600 hover:bg-[#e8f9fc] hover:text-[#087da9]"
                }`}
              >
                <HelpCircle size={18} />
                همه سوالات
                <span
                  className={`rounded-full px-2 py-0.5 text-[11px] ${
                    activeCategory === "all"
                      ? "bg-white/20 text-white"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {allItems.length}
                </span>
              </button>

              {faqCategories.map((category) => {
                const Icon = category.icon;
                const isActive = activeCategory === category.id;

                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => setActiveCategory(category.id)}
                    className={`flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition-all ${
                      isActive
                        ? "bg-[#087da9] text-white shadow-lg shadow-[#087da9]/20"
                        : "text-slate-600 hover:bg-[#e8f9fc] hover:text-[#087da9]"
                    }`}
                  >
                    <Icon size={18} />
                    {category.title}
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] ${
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {category.items.length}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ CONTENT */}
      <section className="mx-auto max-w-[1400px] px-5 py-14 md:px-8 md:py-20">
        <div className="grid gap-10 lg:grid-cols-[1fr_340px]">
          {/* QUESTIONS */}
          <div>
            <div className="mb-8 flex items-end justify-between gap-4">
              <div>
                <div className="mb-2 flex items-center gap-2 text-sm font-bold text-[#08a6c4]">
                  <span className="h-2 w-2 rounded-full bg-[#08a6c4]" />
                  {activeCategory === "all"
                    ? "سوالات متداول"
                    : activeCategoryData?.title}
                </div>

                <h2 className="text-2xl font-black text-[#083b56] md:text-3xl">
                  {activeCategory === "all"
                    ? "همه سوالات"
                    : `سوالات ${activeCategoryData?.title}`}
                </h2>
              </div>

              <div className="hidden rounded-full bg-[#e8f9fc] px-4 py-2 text-xs font-bold text-[#087da9] sm:block">
                {activeItems.length} سوال
              </div>
            </div>

            {activeCategory === "all" ? (
              /* ALL QUESTIONS — GROUPED BY CATEGORY */
              <div className="space-y-10">
                {faqCategories.map((category) => {
                  const Icon = category.icon;

                  return (
                    <div key={category.id}>
                      <div className="mb-4 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e8f9fc] text-[#087da9]">
                          <Icon size={20} />
                        </div>

                        <div>
                          <h3 className="font-black text-[#083b56]">
                            {category.title}
                          </h3>
                          <p className="text-xs text-slate-400">
                            {category.items.length} سوال
                          </p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {category.items.map((item, index) => (
                          <FAQAccordion
                            key={`${category.id}-${index}`}
                            item={item}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-3">
                {activeItems.map((item, index) => (
                  <FAQAccordion
                    key={`${activeCategory}-${index}`}
                    item={item}
                  />
                ))}
              </div>
            )}
          </div>

          {/* SIDEBAR */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-[#056b92] to-[#08a6c4] p-7 text-white shadow-xl">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15">
                <Headphones size={28} />
              </div>

              <h3 className="text-xl font-black">جواب سوالت رو پیدا نکردی؟</h3>

              <p className="mt-3 text-sm leading-7 text-white/80">
                مشکلی نیست. تیم پشتیبانی داروخانه دکتر بهوندی آماده پاسخگویی به
                شماست.
              </p>

              <div className="mt-6 flex items-center gap-3 rounded-2xl bg-white/10 p-4">
                <Clock3 size={20} className="shrink-0" />

                <div>
                  <p className="text-xs text-white/60">ساعات پاسخگویی</p>
                  <p className="mt-1 text-sm font-bold">
                    ۸ صبح تا ۲۴ • هر روز هفته
                  </p>
                </div>
              </div>

              <div className="mt-5 grid gap-3">
                <a
                  href="tel:09163182903"
                  className="flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-black text-[#087da9] transition hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <Phone size={18} />
                  تماس با پشتیبانی
                </a>

                <a
                  href="https://wa.me/989163182903"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-bold text-white transition hover:bg-white/15"
                >
                  <MessageCircle size={18} />
                  پشتیبانی واتساپ
                </a>
              </div>
            </div>

            <div className="mt-5 rounded-3xl border border-slate-200 bg-white p-6">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#e8f9fc] text-[#087da9]">
                  <ShieldCheck size={20} />
                </div>

                <div>
                  <h4 className="font-black text-[#083b56]">
                    هنوز سوالی داری؟
                  </h4>

                  <p className="mt-2 text-xs leading-6 text-slate-500">
                    اگر پاسخ موردنظرت را در سوالات متداول پیدا نکردی، مستقیماً
                    با ما در ارتباط باش.
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-slate-100 bg-white">
        <div className="mx-auto max-w-[1400px] px-5 py-14 md:px-8 md:py-16">
          <div className="flex flex-col items-center justify-between gap-6 rounded-[32px] bg-[#e8f9fc] px-7 py-9 text-center md:flex-row md:text-right md:px-10">
            <div>
              <p className="text-sm font-bold text-[#08a6c4]">
                هنوز دنبال چیزی می‌گردی؟
              </p>

              <h3 className="mt-2 text-xl font-black text-[#083b56] md:text-2xl">
                می‌تونی مستقیم با ما در ارتباط باشی
              </h3>

              <p className="mt-2 text-sm leading-7 text-slate-500">
                کارشناسان ما آماده پاسخگویی به سوالات شما هستند.
              </p>
            </div>

            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <a
                href="tel:09163182903"
                className="flex items-center justify-center gap-2 rounded-xl bg-[#087da9] px-6 py-3.5 text-sm font-black text-white transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                <Phone size={18} />
                ۰۹۱۶۳۱۸۲۹۰۳
              </a>

              <Link
                href="/contact"
                className="flex items-center justify-center gap-2 rounded-xl border border-[#087da9]/20 bg-white px-6 py-3.5 text-sm font-bold text-[#087da9] transition hover:border-[#087da9]/40"
              >
                صفحه تماس با ما
                <ArrowLeft size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
