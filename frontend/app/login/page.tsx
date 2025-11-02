"use client";
import { useState } from "react";
import Link from "next/link";
import { Eye, EyeSlash } from "iconsax-react";
import AuthLayout from "../authComponents/AuthLayout";
import BackButton from "../authComponents/BackButton";
import { useAuthRedirect } from "@/lib/hooks/useAuthRedirect";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
    useAuthRedirect();
  return (
    <AuthLayout>
      {/* Back */}
      <BackButton fallback="/" />

      {/* Title */}
      <div className="absolute flex flex-col justify-center items-center gap-[12px] w-[359px] left-[64px] top-[54px]">
        <h1 className="text-[40px] font-[700] text-[#171717] leading-[44px]">
          ورود
        </h1>
        <p className="text-[18px] text-[#656565] text-center leading-[27px]">
          برای ورود اطلاعات خود را وارد کنید.
        </p>
      </div>

      {/* Username */}
      <div className="absolute flex flex-col gap-[4px] items-end w-[288px] left-[99.5px] top-[169px]">
        <label className="text-[14px] text-[#656565]">نام کاربری</label>
        <input
          type="text"
          className="w-full h-[40px] border border-[#656565] rounded-[8px] px-[8px] text-right text-[14px] focus:ring-2 focus:ring-[#00B4D8]"
          placeholder="نام کاربری خود را وارد کنید"
        />
      </div>

      {/* Password */}
      <div className="absolute flex flex-col gap-[4px] items-end w-[288px] left-[99.5px] top-[252.5px]">
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

      {/* Forgot Password */}
      <Link
        href="/forgot-password"
        className="absolute right-[164.5px] top-[328px] text-[10px] text-[#3C8F7C] hover:underline"
      >
        فراموشی رمز عبور
      </Link>

      {/* Buttons */}
      <button
        type="submit"
        className="absolute left-[99.5px] top-[361.5px] w-[288px] h-[40px] bg-[#00B4D8] text-white rounded-[8px] text-[14px] font-[500]"
      >
        ورود
      </button>
      <Link
        href="/signup"
        className="absolute left-[99.5px] top-[402px] w-[288px] h-[40px] flex justify-center items-center rounded-[8px] text-[#00B4D8] text-[14px] font-[500]"
      >
        ثبت نام
      </Link>
    </AuthLayout>
  );
}
