"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Eye, EyeSlash } from "iconsax-react";
import AuthLayout from "../authComponents/AuthLayout";
import BackButton from "../authComponents/BackButton";
import { useAuth } from "@/lib/context/AuthContext"; // ✅ ایمپورت از کانتکست جدید
import { loginWithPassword } from "@/lib/api/auth"; // ✅ تابع API مستقیم
import { toast } from "sonner";
import { useRouter } from "next/navigation";

/* ================= Helpers ================= */
const isValidIranPhone = (v: string) => /^09\d{9}$/.test(v);
const containsPersian = (v: string) => /[\u0600-\u06FF]/.test(v);

/* ================= Page ================= */
export default function LoginPage() {
  const router = useRouter();

  // ✅ استفاده از کانتکست جدید
  const { user, isLoading, refreshUser } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false); // مدیریت لودینگ دکمه
  const [touched, setTouched] = useState(false);

  // برای جلوگیری از پیام تکراری کیبورد
  const passwordHintShown = useRef(false);

  // ✅ لاجیک اصلی: اگر کاربر قبلاً لاگین کرده باشد
  useEffect(() => {
    // صبر می‌کنیم تا لودینگ اولیه کانتکست تمام شود
    if (!isLoading && user) {
      toast.info("شما قبلاً وارد شده‌اید", { duration: 2000 });
      router.replace("/"); // ریدایرکت به صفحه اصلی
    }
  }, [user, isLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);

    // 1️⃣ ولیدیشن‌ها
    if (!isValidIranPhone(phone)) {
      toast.error("شماره موبایل نامعتبر است");
      return;
    }

    if (!password) {
      toast.error("رمز عبور الزامی است");
      return;
    }

    if (containsPersian(password)) {
      toast.error("رمز عبور باید فقط با حروف انگلیسی وارد شود");
      return;
    }

    // 2️⃣ شروع پروسه لاگین
    try {
      setIsSubmitting(true);

      // درخواست به سرور
      await loginWithPassword(phone, password);

      // ✅ لاگین موفق شد:
      toast.success("ورود موفقیت‌آمیز بود");

      // مهم: کانتکست را رفرش می‌کنیم تا هدر آپدیت شود
      await refreshUser();

      // ریدایرکت نهایی (اگر useEffect بالا عمل نکرد، اینجا عمل می‌کند)
      router.replace("/");
    } catch (error: any) {
      // مدیریت ارورها
      if (error?.response?.status === 401 || error?.response?.status === 400) {
        toast.error("شماره موبایل یا رمز عبور اشتباه است");
      } else {
        toast.error("خطایی رخ داد. لطفاً دوباره تلاش کنید");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // ✅ اگر هنوز وضعیت مشخص نیست (داریم چک میکنیم)، صفحه لودینگ نشان بده
  // تا فرم لاگین یهو نپرد جلوی صورت کاربر لاگین شده
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <p className="animate-pulse text-[#00B4D8] font-IRANYekanX">
          در حال بررسی وضعیت...
        </p>
      </div>
    );
  }

  // ✅ اگر کاربر لاگین است، کلاً چیزی رندر نکن (چون دارد ریدایرکت می‌شود)
  if (user) return null;

  return (
    <AuthLayout>
      <BackButton fallback="/" />

      {/* ===== Title ===== */}
      <div className="absolute flex flex-col justify-center items-center gap-[12px] w-[359px] left-[64px] top-[54px]">
        <h1 className="text-[40px] font-bold text-[#171717] leading-[44px]">
          ورود
        </h1>
        <p className="text-[18px] text-[#656565] text-center leading-[27px]">
          برای ورود اطلاعات خود را وارد کنید.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* ===== Phone ===== */}
        <div className="absolute flex flex-col gap-[4px] items-end w-[288px] left-[99.5px] top-[169px]">
          <label className="text-[14px] text-[#656565]">شماره موبایل</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => {
              const v = e.target.value.replace(/[^\d]/g, "").slice(0, 11);
              setPhone(v);
            }}
            onBlur={() => setTouched(true)}
            className={`w-full h-[40px] border rounded-[8px] px-[8px] text-right text-[14px] focus:ring-2 focus:ring-[#00B4D8] outline-none transition-all
              ${
                touched && !isValidIranPhone(phone)
                  ? "border-red-500"
                  : "border-[#656565]"
              }`}
            placeholder="مثلاً 09123456789"
          />
        </div>

        {/* ===== Password ===== */}
        <div className="absolute flex flex-col gap-[4px] items-end w-[288px] left-[99.5px] top-[252.5px]">
          <label className="text-[14px] text-[#656565]">رمز عبور</label>

          <div className="relative w-full">
            <input
              dir="ltr"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => {
                if (!passwordHintShown.current) {
                  // toast.message("کیبورد را روی انگلیسی قرار دهید"); // اگر خواستی فعال کن
                  passwordHintShown.current = true;
                }
              }}
              className="w-full h-[40px] border border-[#656565] rounded-[8px] px-[8px] outline-none focus:ring-2 focus:ring-[#00B4D8]"
            />

            <button
              type="button"
              onClick={() => setShowPassword((p) => !p)}
              className="absolute right-[12px] top-1/2 -translate-y-1/2 text-[#656565]"
            >
              {showPassword ? (
                <EyeSlash size={20} color="#656565" />
              ) : (
                <Eye size={20} color="#656565" />
              )}
            </button>
          </div>
        </div>

        {/* ===== Forgot Password ===== */}
        <Link
          href="/forgot-password"
          className="absolute right-[164.5px] top-[328px] text-[10px] text-[#3C8F7C] hover:underline"
        >
          فراموشی رمز عبور
        </Link>

        {/* ===== Submit ===== */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="absolute left-[99.5px] top-[361.5px] w-[288px] h-[40px] bg-[#00B4D8] text-white rounded-[8px] text-[14px] font-[500] disabled:opacity-50 disabled:cursor-not-allowed transition-opacity hover:bg-[#0096B4]"
        >
          {isSubmitting ? "در حال ورود..." : "ورود"}
        </button>
      </form>

      {/* ===== OTP Login ===== */}
      <Link
        href="/login/otp"
        className="absolute left-[99.5px] top-[402px] w-[288px] h-[40px] flex justify-center items-center text-[#00B4D8] text-[14px] font-[500] hover:bg-gray-50 rounded-[8px] transition-colors"
      >
        ورود سریع با کد یک‌بار مصرف
      </Link>

      {/* ===== Signup ===== */}
      <Link
        href="/signup"
        className="absolute left-[99.5px] top-[442px] w-[288px] h-[40px] flex justify-center items-center text-[#656565] text-[13px] hover:text-[#00B4D8] transition-colors"
      >
        حساب کاربری ندارید؟ ثبت‌نام
      </Link>
    </AuthLayout>
  );
}
