import Link from "next/link";
import {
  ArrowLeft,
  BadgeCheck,
  Building2,
  Clock3,
  HeartHandshake,
  MapPin,
  MessageCircle,
  PackageCheck,
  Phone,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Stethoscope,
  Truck,
} from "lucide-react";

const productGroups = [
  {
    icon: ShieldCheck,
    title: "مکمل‌های غذایی",
    text: "ویتامین‌ها، مینرال‌ها و مکمل‌های مورد نیاز روزمره",
  },
  {
    icon: Sparkles,
    title: "مکمل‌های ورزشی",
    text: "محصولات انتخاب‌شده برای ورزشکاران و علاقه‌مندان به تناسب اندام",
  },
  {
    icon: HeartHandshake,
    title: "محصولات بهداشتی و مراقبتی",
    text: "محصولات بهداشت فردی و مراقبت از پوست و بدن",
  },
  {
    icon: ShoppingBag,
    title: "محصولات کودک و نوزاد",
    text: "برخی از اقلام مورد نیاز نوزادان و کودکان",
  },
  {
    icon: Sparkles,
    title: "آرایشی و خوشبوکننده",
    text: "منتخبی از محصولات آرایشی، مراقبتی، خوشبوکننده و اسپری",
  },
  {
    icon: PackageCheck,
    title: "سایر محصولات داروخانه",
    text: "محصولات غیر دارویی قابل عرضه در داروخانه",
  },
];

const trustItems = [
  {
    icon: Building2,
    title: "حدود ۱۰ سال فعالیت",
    text: "پشت این فروشگاه آنلاین، یک داروخانه واقعی در اهواز قرار دارد.",
  },
  {
    icon: Stethoscope,
    title: "تحت نظر دکتر فروغ بهوندی",
    text: "فعالیت داروخانه با تجربه و حضور مجموعه داروخانه دکتر بهوندی",
  },
  {
    icon: Truck,
    title: "خرید آسان‌تر",
    text: "بخشی از محصولات غیر دارویی داروخانه را آنلاین در دسترس شما قرار داده‌ایم.",
  },
  {
    icon: MessageCircle,
    title: "پشتیبانی در دسترس",
    text: "برای سوال درباره محصولات و پیگیری سفارش، راه‌های ارتباطی در اختیار شماست.",
  },
];

export default function AboutUsPage() {
  return (
    <main className="overflow-hidden bg-[#f7fbfc]" dir="rtl">
      {/* Hero */}
      <section className="relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(8,179,208,0.15),transparent_34%),radial-gradient(circle_at_85%_10%,rgba(7,125,169,0.12),transparent_30%)]" />

        <div className="relative mx-auto max-w-[1280px] px-5 pb-14 pt-10 sm:px-8 md:pb-20 md:pt-14">
          <div className="grid items-center gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:gap-16">
            {/* Text */}
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#08a6c4]/20 bg-white px-4 py-2 text-xs font-medium text-[#087da9] shadow-sm">
                <BadgeCheck size={16} />
                یک داروخانه واقعی، حالا آنلاین
              </div>

              <h1 className="max-w-[700px] text-4xl font-black leading-[1.45] tracking-tight text-[#083b56] md:text-5xl lg:text-6xl">
                حدود ۱۰ ساله که
                <span className="block text-[#08a6c4]">کنار شما هستیم</span>
              </h1>

              <p className="mt-6 max-w-[700px] text-sm leading-8 text-slate-600 md:text-base">
                داروخانه دکتر بهوندی با مدیریت دکتر فروغ بهوندی، حدود ۱۰ سال است
                که در اهواز فعالیت می‌کند. حالا بخشی از محصولات غیر دارویی و
                مکمل‌های داروخانه را به فضای آنلاین آورده‌ایم تا خریدشان برای
                شما ساده‌تر و در دسترس‌تر باشد.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/products"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#087da9] px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#087da9]/15 transition hover:-translate-y-0.5 hover:bg-[#066b91]"
                >
                  مشاهده محصولات
                  <ArrowLeft size={17} />
                </Link>

                <a
                  href="tel:09163182903"
                  dir="ltr"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-bold text-[#083b56] transition hover:-translate-y-0.5 hover:border-[#08a6c4]/30 hover:shadow-md"
                >
                  <Phone size={17} />
                  09163182903
                </a>
              </div>

              <div className="mt-8 flex flex-wrap gap-3 text-xs text-slate-500">
                <span className="rounded-full bg-white px-4 py-2 shadow-sm">
                  اهواز
                </span>
                <span className="rounded-full bg-white px-4 py-2 shadow-sm">
                  مجتمع نصر
                </span>
                <span className="rounded-full bg-white px-4 py-2 shadow-sm">
                  بلوار معلم
                </span>
              </div>
            </div>

            {/* Visual / Photo Placeholder */}
            <div className="relative mx-auto w-full max-w-[520px]">
              <div className="absolute -right-8 top-10 h-40 w-40 rounded-full bg-[#08b3d0]/10 blur-2xl" />
              <div className="absolute -bottom-8 -left-8 h-44 w-44 rounded-full bg-[#087da9]/10 blur-2xl" />

              <div className="relative rounded-[34px] border border-white/80 bg-gradient-to-br from-[#087da9] via-[#08a6c4] to-[#09b7d0] p-4 shadow-2xl shadow-[#087da9]/15">
                <div className="flex min-h-[430px] flex-col justify-between overflow-hidden rounded-[27px] bg-white/10 p-7 backdrop-blur-sm">
                  <div className="flex items-center justify-between">
                    <div className="rounded-2xl bg-white/15 px-4 py-2 text-xs font-semibold text-white backdrop-blur">
                      داروخانه دکتر بهوندی
                    </div>

                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
                      <Stethoscope size={23} />
                    </div>
                  </div>

                  <div className="relative flex flex-1 items-center justify-center">
                    <div className="absolute h-60 w-60 rounded-full border border-white/10" />
                    <div className="absolute h-44 w-44 rounded-full border border-white/10" />
                    <div className="relative flex h-44 w-44 flex-col items-center justify-center rounded-[38px] border border-white/15 bg-white/12 text-center shadow-inner backdrop-blur-md">
                      <Building2 size={52} strokeWidth={1.5} />
                      <p className="mt-4 text-sm font-bold">جای عکس داروخانه</p>
                      <p className="mt-1 text-[11px] text-white/70">
                        می‌توانید بعداً تصویر واقعی اینجا قرار دهید
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-white/10 p-4">
                      <p className="text-2xl font-black">۱۰+</p>
                      <p className="mt-1 text-[11px] text-white/75">
                        سال تجربه
                      </p>
                    </div>
                    <div className="rounded-2xl bg-white/10 p-4">
                      <p className="text-2xl font-black">اهواز</p>
                      <p className="mt-1 text-[11px] text-white/75">
                        محل فعالیت
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-5 right-6 flex items-center gap-3 rounded-2xl border border-white/80 bg-white px-4 py-3 shadow-xl">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e6f9fc] text-[#087da9]">
                  <HeartHandshake size={19} />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#083b56]">
                    خرید با خیال راحت‌تر
                  </p>
                  <p className="mt-0.5 text-[10px] text-slate-500">
                    از یک داروخانه واقعی
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="bg-white">
        <div className="mx-auto max-w-[1280px] px-5 py-14 sm:px-8 md:py-20">
          <div className="grid items-start gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">
            <div>
              <p className="text-xs font-bold tracking-[0.18em] text-[#08a6c4]">
                OUR STORY
              </p>
              <h2 className="mt-3 text-3xl font-black text-[#083b56] md:text-4xl">
                داستان ما،
                <span className="text-[#08a6c4]"> ساده است</span>
              </h2>
            </div>

            <div className="space-y-5 text-sm leading-8 text-slate-600 md:text-[15px]">
              <p>
                ما اول از همه یک داروخانه هستیم. داروخانه دکتر بهوندی در اهواز،
                در مجتمع نصرِ بلوار معلم، سال‌هاست با مراجعه حضوری مشتری‌ها
                همراه بوده و نیازهای روزمره آن‌ها را از نزدیک دیده است.
              </p>

              <p>
                راه‌اندازی فروشگاه اینترنتی برای ما فقط ساختن یک سایت فروشگاهی
                نبود؛ هدفمان این بود که تجربه خرید از داروخانه را کمی ساده‌تر
                کنیم و محصولاتی را که خارج از حوزه دارو هستند، آنلاین هم در
                اختیار شما بگذاریم.
              </p>

              <p className="rounded-3xl bg-[#f1fbfd] p-5 text-[#0a506b]">
                به همین دلیل تمرکز فروشگاه روی مکمل‌های غذایی و ورزشی،
                ویتامین‌ها، محصولات بهداشتی و مراقبتی، برخی محصولات آرایشی،
                محصولات کودک و نوزاد و دیگر اقلام غیر دارویی داروخانه است.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Product categories */}
      <section className="relative overflow-hidden bg-[#f3fafb]">
        <div className="absolute -left-20 top-10 h-56 w-56 rounded-full bg-[#08b3d0]/10 blur-3xl" />

        <div className="relative mx-auto max-w-[1280px] px-5 py-14 sm:px-8 md:py-20">
          <div className="max-w-[700px]">
            <p className="text-xs font-bold tracking-[0.18em] text-[#08a6c4]">
              WHAT WE OFFER
            </p>
            <h2 className="mt-3 text-3xl font-black text-[#083b56] md:text-4xl">
              اینجا قرار است چه چیزهایی پیدا کنید؟
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-600 md:text-[15px]">
              تمرکز ما روی محصولاتی است که معمولاً در داروخانه‌ها پیدا می‌شوند،
              اما در دسته دارو قرار نمی‌گیرند.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {productGroups.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="group rounded-[26px] border border-slate-100 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e8f9fc] text-[#087da9] transition group-hover:scale-105">
                    <Icon size={24} strokeWidth={1.7} />
                  </div>

                  <h3 className="mt-5 text-base font-bold text-[#083b56]">
                    {item.title}
                  </h3>

                  <p className="mt-2 text-[13px] leading-6 text-slate-500">
                    {item.text}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="bg-white">
        <div className="mx-auto max-w-[1280px] px-5 py-14 sm:px-8 md:py-20">
          <div className="grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="relative">
              <div className="rounded-[34px] bg-[#083b56] p-8 text-white shadow-2xl">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                    <BadgeCheck size={24} />
                  </div>
                  <div>
                    <p className="text-xs text-white/60">از یک فروشگاه واقعی</p>
                    <p className="mt-1 font-bold">تا خرید آنلاین شما</p>
                  </div>
                </div>

                <div className="mt-10 border-t border-white/10 pt-7">
                  <p className="text-2xl font-black leading-9 md:text-3xl">
                    «هدف ما این نیست که فقط یک سفارش ثبت شود؛ می‌خواهیم تجربه
                    خریدتان خوب باشد.»
                  </p>
                </div>

                <div className="mt-10 flex items-center gap-3 text-sm text-white/75">
                  <Stethoscope size={18} />
                  <span>دکتر فروغ بهوندی</span>
                </div>
              </div>

              <div className="absolute -bottom-5 -left-4 hidden h-20 w-20 rounded-3xl border border-[#08b3d0]/20 bg-[#eafafd] lg:block" />
            </div>

            <div>
              <p className="text-xs font-bold tracking-[0.18em] text-[#08a6c4]">
                WHY US
              </p>
              <h2 className="mt-3 text-3xl font-black text-[#083b56] md:text-4xl">
                چیزی که برای ما مهم است
              </h2>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {trustItems.map((item) => {
                  const Icon = item.icon;

                  return (
                    <div
                      key={item.title}
                      className="rounded-3xl border border-slate-100 bg-[#fbfdfe] p-5"
                    >
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#e8f9fc] text-[#087da9]">
                        <Icon size={22} strokeWidth={1.8} />
                      </div>

                      <h3 className="mt-4 text-sm font-bold text-[#083b56]">
                        {item.title}
                      </h3>

                      <p className="mt-2 text-[12px] leading-6 text-slate-500">
                        {item.text}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Location / Contact */}
      <section className="bg-gradient-to-b from-[#f2fbfc] to-white">
        <div className="mx-auto max-w-[1280px] px-5 pb-14 sm:px-8 md:pb-20">
          <div className="overflow-hidden rounded-[34px] bg-gradient-to-r from-[#087da9] to-[#08b3d0] p-6 text-white shadow-2xl shadow-[#087da9]/15 md:p-8 lg:p-10">
            <div className="grid items-center gap-8 lg:grid-cols-[1fr_auto]">
              <div dir="rtl">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs">
                  <MapPin size={16} />
                  داروخانه دکتر بهوندی
                </div>

                <h2 className="mt-5 text-2xl font-black md:text-3xl">
                  حضوری هم می‌بینیمتان
                </h2>

                <p className="mt-3 max-w-[700px] text-sm leading-7 text-white/85">
                  اگر در اهواز هستید، می‌توانید ما را در بلوار معلم، مجتمع نصر
                  پیدا کنید. برای تماس و پشتیبانی هم می‌توانید از شماره تلفن یا
                  واتساپ استفاده کنید.
                </p>

                <div className="mt-7 flex flex-col gap-3 text-sm sm:flex-row sm:flex-wrap">
                  <div className="inline-flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-3">
                    <MapPin size={18} />
                    <span>اهواز، بلوار معلم، مجتمع نصر</span>
                  </div>

                  <div className="inline-flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-3">
                    <Clock3 size={18} />
                    <span>پاسخگویی: ۸ صبح تا ۲۴</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                <a
                  href="tel:09163182903"
                  dir="ltr"
                  className="inline-flex min-w-[190px] items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3.5 text-sm font-bold text-[#087da9] transition hover:-translate-y-0.5 hover:bg-white/95"
                >
                  <Phone size={18} />
                  09163182903
                </a>

                <a
                  href="https://wa.me/989163182903"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-w-[190px] items-center justify-center gap-2 rounded-2xl border border-white/25 bg-white/10 px-5 py-3.5 text-sm font-bold transition hover:-translate-y-0.5 hover:bg-white/15"
                >
                  <MessageCircle size={18} />
                  پشتیبانی واتساپ
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-5 pb-16 sm:px-8">
        <div className="mx-auto max-w-[900px] rounded-[34px] border border-[#08a6c4]/10 bg-white p-8 text-center shadow-sm md:p-12">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e8f9fc] text-[#087da9]">
            <HeartHandshake size={27} />
          </div>

          <h2 className="mt-5 text-2xl font-black text-[#083b56] md:text-3xl">
            خوشحالیم که اینجایید
          </h2>

          <p className="mx-auto mt-4 max-w-[650px] text-sm leading-7 text-slate-500">
            ما اینجا هستیم تا خرید محصولات مکمل، بهداشتی و غیر دارویی مورد
            نیازتان را راحت‌تر کنیم؛ از انتخاب محصول تا پیگیری سفارش، کنار شما
            می‌مانیم.
          </p>

          <Link
            href="/products"
            className="mt-7 inline-flex items-center gap-2 rounded-2xl bg-[#087da9] px-7 py-3.5 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#066b91]"
          >
            رفتن به فروشگاه
            <ArrowLeft size={17} />
          </Link>
        </div>
      </section>
    </main>
  );
}
