"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { Eye, EyeSlash } from "iconsax-react";
import AuthLayout from "../authComponents/AuthLayout";
import BackButton from "../authComponents/BackButton";
import { useAuthRedirect } from "@/lib/hooks/useAuthRedirect";
import { useAuth } from "@/lib/hooks/useAuth";
import { toast } from "sonner";

/* ================= Helpers ================= */

const isValidIranPhone = (v: string) => /^09\d{9}$/.test(v);
const containsPersian = (v: string) => /[\u0600-\u06FF]/.test(v);

/* ================= Page ================= */

export default function LoginPage() {
  useAuthRedirect();
  const { login, isLoading } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [touched, setTouched] = useState(false);

  // ✅ برای جلوگیری از toast تکراری
  const passwordHintShown = useRef(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    
    // ✅ Validation فقط اینجا
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
    console.log("🚀 CALL login()", {
    identifier: phone,
    password,
  });
    login({
      identifier: phone,
      password,
    });
  };

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
            className="w-full h-[40px] border border-[#656565] rounded-[8px] px-[8px] text-right text-[14px] focus:ring-2 focus:ring-[#00B4D8]"
            placeholder="مثلاً 09123456789"
          />
          {touched && !isValidIranPhone(phone) && (
            <span className="text-[12px] text-red-500">
              شماره موبایل نامعتبر است
            </span>
          )}
        </div>

        {/* ===== Password ===== */}
        <div className="absolute flex flex-col gap-[4px] items-end w-[288px] left-[99.5px] top-[252.5px]">
          <label className="text-[14px] text-[#656565]">رمز عبور</label>

          <div className="relative w-full">
            <input
              dir="rtl"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => {
                if (!passwordHintShown.current) {
                  toast.message("کیبورد را روی انگلیسی قرار دهید");
                  passwordHintShown.current = true;
                }
              }}
              className="w-full h-[40px] border border-[#656565] rounded-[8px] px-[8px]"
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
          disabled={isLoading}
          className="absolute left-[99.5px] top-[361.5px] w-[288px] h-[40px] bg-[#00B4D8] text-white rounded-[8px] text-[14px] font-[500] disabled:opacity-50"
        >
          {isLoading ? "در حال ورود..." : "ورود"}
        </button>
      </form>

      {/* ===== OTP Login ===== */}
      <Link
        href="/login/otp"
        className="absolute left-[99.5px] top-[402px] w-[288px] h-[40px] flex justify-center items-center text-[#00B4D8] text-[14px] font-[500]"
      >
        ورود سریع با کد یک‌بار مصرف
      </Link>

      {/* ===== Signup ===== */}
      <Link
        href="/signup"
        className="absolute left-[99.5px] top-[442px] w-[288px] h-[40px] flex justify-center items-center text-[#656565] text-[13px]"
      >
        حساب کاربری ندارید؟ ثبت‌نام
      </Link>
    </AuthLayout>
  );
}
