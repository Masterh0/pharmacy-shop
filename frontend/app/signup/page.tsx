"use client";
import { useState } from "react";
import Link from "next/link";
import { Eye, EyeSlash } from "iconsax-react";
import AuthLayout from "../authComponents/AuthLayout";

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <AuthLayout>
      {/* Back */}
      <div className="absolute flex items-center gap-[10px] left-[76px] top-[54px]">
        <span className="text-[24px] text-[#171717]">↩</span>
        <Link href="/" className="text-[18px] text-[#171717]">
          بازگشت
        </Link>
      </div>

      {/* Title */}
      <div className="absolute flex flex-col justify-center items-center gap-[12px] w-[359px] left-[64px] top-[54px]">
        <h1 className="text-[40px] font-[700] text-[#171717] leading-[44px]">
          ثبت‌نام
        </h1>
        <p className="text-[18px] text-[#656565] leading-[27px] text-center">
          برای ایجاد حساب جدید اطلاعات خود را وارد کنید.
        </p>
      </div>

      {/* Name field */}
      <div className="absolute flex flex-col gap-[4px] items-end w-[288px] left-[99px] top-[160px]">
        <label className="text-[14px] text-[#656565]">نام و نام خانوادگی</label>
        <input
          type="text"
          className="w-full h-[40px] border border-[#656565] rounded-[8px] px-[8px] text-right text-[14px] focus:ring-2 focus:ring-[#00B4D8]"
          placeholder="نام خود را وارد کنید"
        />
      </div>

      {/* Phone field */}
      <div className="absolute flex flex-col gap-[4px] items-end w-[288px] left-[99px] top-[230px]">
        <label className="text-[14px] text-[#656565]">شماره تماس</label>
        <input
          type="tel"
          className="w-full h-[40px] border border-[#656565] rounded-[8px] px-[8px] text-right text-[14px] focus:ring-2 focus:ring-[#00B4D8]"
          placeholder="شماره تماس خود را وارد کنید"
        />
      </div>

      {/* Email field (optional) */}
      <div className="absolute flex flex-col gap-[4px] items-end w-[288px] left-[99px] top-[300px]">
        <label className="text-[14px] text-[#656565]">ایمیل (اختیاری)</label>
        <input
          type="email"
          className="w-full h-[40px] border border-[#656565] rounded-[8px] px-[8px] text-right text-[14px] focus:ring-2 focus:ring-[#00B4D8]"
          placeholder="example@gmail.com"
        />
      </div>

      {/* Password field */}
      <div className="absolute flex flex-col gap-[4px] items-end w-[288px] left-[99px] top-[370px]">
        <label className="text-[14px] text-[#656565]">رمز عبور</label>
        <div className="relative w-full">
          <input
            type={showPassword ? "text" : "password"}
            className="w-full h-[40px] border border-[#656565] rounded-[8px] px-[8px] text-right text-[14px] focus:ring-2 focus:ring-[#00B4D8]"
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute left-[12px] top-1/2 -translate-y-1/2 text-[#656565]"
          >
            {showPassword ? (
              <EyeSlash variant="Outline" size={20} color="#656565" />
            ) : (
              <Eye variant="Outline" size={20} color="#656565" />
            )}
          </button>
        </div>
      </div>

      {/* Confirm password field */}
      <div className="absolute flex flex-col gap-[4px] items-end w-[288px] left-[99px] top-[440px]">
        <label className="text-[14px] text-[#656565]">تأیید رمز عبور</label>
        <div className="relative w-full">
          <input
            type={showConfirmPassword ? "text" : "password"}
            className="w-full h-[40px] border border-[#656565] rounded-[8px] px-[8px] text-right text-[14px] focus:ring-2 focus:ring-[#00B4D8]"
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute left-[12px] top-1/2 -translate-y-1/2 text-[#656565]"
          >
            {showConfirmPassword ? (
              <EyeSlash variant="Outline" size={20} color="#656565" />
            ) : (
              <Eye variant="Outline" size={20} color="#656565" />
            )}
          </button>
        </div>
      </div>

      {/* Submit button */}
      <button
        type="submit"
        className="absolute left-[99px] top-[515px] w-[288px] h-[40px] bg-[#00B4D8] text-white rounded-[8px] text-[14px] font-[500]"
      >
        ثبت‌نام
      </button>

      {/* Footer links */}
      <div className="absolute flex flex-col items-center gap-[8px] w-[288px] left-[99px] top-[570px] text-center">
        <p className="text-[12px] text-[#171717]">
          اگر اکانت دارید{" "}
          <Link href="/login" className="text-[#00B4D8] hover:underline">
            اینجا کلیک کنید
          </Link>
        </p>
        <Link
          href="/login-otp"
          className="text-[12px] text-[#3C8F7C] hover:underline"
        >
          ورود با شماره تماس
        </Link>
      </div>
    </AuthLayout>
  );
}
