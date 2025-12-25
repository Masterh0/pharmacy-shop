"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Eye, EyeSlash } from "iconsax-react";
import AuthLayout from "../authComponents/AuthLayout";
import BackButton from "../authComponents/BackButton";
import { useAuth } from "@/lib/context/AuthContext";
import { loginWithPassword } from "@/lib/api/auth";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";

interface ApiError {
  response?: {
    status: number;
    data?: any;
  };
}

const isValidIranPhone = (v: string) => /^09\d{9}$/.test(v);
const containsPersian = (v: string) => /[\u0600-\u06FF]/.test(v);

export default function LoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get("returnUrl") || "/";

  const { user, isLoading, refreshUser } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touched, setTouched] = useState(false);

  const passwordHintShown = useRef(false);

  useEffect(() => {
    if (!isLoading && user) {
      router.replace(returnUrl);
    }
  }, [user, isLoading, router, returnUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);

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

    try {
      setIsSubmitting(true);
      await loginWithPassword(phone, password);
      toast.success("ورود موفقیت‌آمیز بود");
      await refreshUser();
      router.push(returnUrl);
    } catch (err: unknown) {
      const error = err as ApiError;
      if (error?.response?.status === 401 || error?.response?.status === 400) {
        toast.error("شماره موبایل یا رمز عبور اشتباه است");
      } else {
        toast.error("خطایی رخ داد. لطفاً دوباره تلاش کنید");
        console.error("Login Error:", error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <p className="animate-pulse text-[#00B4D8] font-IRANYekanX">
          در حال بررسی وضعیت...
        </p>
      </div>
    );
  }

  if (user) return null;

  return (
    <AuthLayout>
      <BackButton fallback="/" />

      <div className="absolute flex flex-col justify-center items-center gap-[12px] w-[359px] left-[64px] top-[54px]">
        <h1 className="text-[40px] font-bold text-[#171717] leading-[44px]">
          ورود
        </h1>
        <p className="text-[18px] text-[#656565] text-center leading-[27px]">
          برای ورود اطلاعات خود را وارد کنید.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
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
                  passwordHintShown.current = true;
                }
              }}
              className="w-full h-[40px] border border-[#656565] rounded-[8px] pl-[40px] pr-[12px] text-right outline-none focus:ring-2 focus:ring-[#00B4D8]"
            />

            <button
              type="button"
              onClick={() => setShowPassword((p) => !p)}
              className="absolute left-[12px] top-1/2 -translate-y-1/2 text-[#656565]"
            >
              {showPassword ? (
                <EyeSlash size={20} color="#656565" />
              ) : (
                <Eye size={20} color="#656565" />
              )}
            </button>
          </div>
        </div>

        <Link
          href="/forgot-password"
          className="absolute right-[164.5px] top-[328px] text-[10px] text-[#3C8F7C] hover:underline"
        >
          فراموشی رمز عبور
        </Link>

        <button
          type="submit"
          disabled={isSubmitting}
          className="absolute left-[99.5px] top-[361.5px] w-[288px] h-[40px] bg-[#00B4D8] text-white rounded-[8px] text-[14px] font-[500] disabled:opacity-50 disabled:cursor-not-allowed transition-opacity hover:bg-[#0096B4]"
        >
          {isSubmitting ? "در حال ورود..." : "ورود"}
        </button>
      </form>

      <Link
        href={`/login/otp?returnUrl=${encodeURIComponent(returnUrl)}`}
        className="absolute left-[99.5px] top-[402px] w-[288px] h-[40px] flex justify-center items-center text-[#00B4D8] text-[14px] font-[500] hover:bg-gray-50 rounded-[8px] transition-colors"
      >
        ورود سریع با کد یک‌بار مصرف
      </Link>

      <Link
        href="/signup"
        className="absolute left-[99.5px] top-[442px] w-[288px] h-[40px] flex justify-center items-center text-[#656565] text-[13px] hover:text-[#00B4D8] transition-colors"
      >
        حساب کاربری ندارید؟ ثبت‌نام
      </Link>
    </AuthLayout>
  );
}
