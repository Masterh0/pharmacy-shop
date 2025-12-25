"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Eye, EyeSlash } from "iconsax-react";
import AuthLayout from "../authComponents/AuthLayout";
import { useMutation } from "@tanstack/react-query";
import { register, verifyRegisterOtp } from "@/lib/api/auth";
import { useRouter, useSearchParams } from "next/navigation";
import BackButton from "../authComponents/BackButton";
import { useAuth } from "@/lib/context/AuthContext";
import { toast } from "sonner";

export default function SignupClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get("returnUrl") || "/";
  const { user, isLoading, refreshUser } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [step, setStep] = useState<"register" | "otp">("register");
  const [otp, setOtp] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [countdown, setCountdown] = useState(0);

  // ✅ چک ریدایرکت اگر قبلاً لاگین کرده
  useEffect(() => {
    if (!isLoading && user) {
      const target = user.role === "ADMIN" ? "/admin/dashboard" : returnUrl;
      router.replace(target);
    }
  }, [isLoading, user, router, returnUrl]);

  // ✅ شروع تایمر شمارش معکوس
  const startCountdown = () => {
    setCountdown(120);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // ✅ Mutation: ثبت‌نام اولیه
  const registerMutation = useMutation({
    mutationFn: register,
    onSuccess: () => {
      setUserPhone(formData.phone);
      setStep("otp");
      startCountdown(); // شروع تایمر
      toast.success("کد تایید به شماره شما ارسال شد");
    },
    onError: (err: any) => {
      const message = err?.response?.data?.error || "خطا در ثبت‌نام";
      toast.error(message);
    },
  });

  // ✅ Mutation: تایید OTP
  const verifyOtpMutation = useMutation({
    mutationFn: verifyRegisterOtp,
    onSuccess: async (res) => {
      await refreshUser(); // بروزرسانی اطلاعات کاربر
      toast.success("ثبت‌نام با موفقیت انجام شد ✅");

      // ✅ ریدایرکت به مسیر مورد نظر
      const target = res.user.role === "ADMIN" ? "/admin/dashboard" : returnUrl;
      router.replace(target);
    },
    onError: (err: any) => {
      const message = err?.response?.data?.error || "کد نادرست است";
      toast.error(message);
    },
  });

  // ✅ نمایش لودینگ
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#00B4D8] border-t-transparent"></div>
      </div>
    );
  }

  // ✅ اگر لاگین کرده، چیزی نمایش نده (در حال ریدایرکت)
  if (user) return null;

  // ✅ ارسال فرم ثبت‌نام
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error("رمز عبور و تأیید یکسان نیست");
      return;
    }

    registerMutation.mutate({
      name: formData.name.trim(),
      phone: formData.phone,
      password: formData.password,
      email: formData.email || undefined,
    });
  };

  // ✅ ارسال OTP
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast.error("کد باید 6 رقم باشد");
      return;
    }
    verifyOtpMutation.mutate({ phone: userPhone, code: otp });
  };

  // ✅ ارسال مجدد کد
  const handleResendOtp = () => {
    registerMutation.mutate({
      name: formData.name.trim(),
      phone: formData.phone,
      password: formData.password,
      email: formData.email || undefined,
    });
  };

  return (
    <AuthLayout>
      <BackButton fallback="/" />

      {/* Title */}
      <div className="absolute flex flex-col justify-center items-center gap-[12px] w-[359px] left-[64px] top-[54px]">
        <h1 className="text-[40px] font-[700] text-[#171717] leading-[44px]">
          {step === "register" ? "ثبت‌نام" : "تأیید کد"}
        </h1>
        <p className="text-[18px] text-[#656565] leading-[27px] text-center">
          {step === "register"
            ? "برای ایجاد حساب جدید اطلاعات خود را وارد کنید."
            : `کد ارسال‌شده به شماره ${userPhone} را وارد کنید.`}
        </p>
      </div>

      {/* === مرحله اول: اطلاعات کاربر === */}
      {step === "register" && (
        <form onSubmit={handleSubmit}>
          {/* Name field */}
          <div className="absolute flex flex-col gap-[4px] items-end w-[288px] left-[99px] top-[160px]">
            <label className="text-[14px] text-[#656565]">
              نام و نام خانوادگی
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full h-[40px] border border-[#656565] rounded-[8px] px-[8px] text-right text-[14px] focus:ring-2 focus:ring-[#00B4D8]"
              placeholder="نام خود را وارد کنید"
              required
            />
          </div>

          {/* Phone field */}
          <div className="absolute flex flex-col gap-[4px] items-end w-[288px] left-[99px] top-[230px]">
            <label className="text-[14px] text-[#656565]">شماره تماس</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              pattern="^09\d{9}$"
              required
              className="w-full h-[40px] border border-[#656565] rounded-[8px] px-[8px] text-right text-[14px] focus:ring-2 focus:ring-[#00B4D8]"
              placeholder="09123456789"
            />
          </div>

          {/* Email */}
          <div className="absolute flex flex-col gap-[4px] items-end w-[288px] left-[99px] top-[300px]">
            <label className="text-[14px] text-[#656565]">
              ایمیل (اختیاری)
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full h-[40px] border border-[#656565] rounded-[8px] px-[8px] text-right text-[14px] focus:ring-2 focus:ring-[#00B4D8]"
              placeholder="example@gmail.com"
            />
          </div>

          {/* Password */}
          <div className="absolute flex flex-col gap-[4px] items-end w-[288px] left-[99px] top-[370px]">
            <label className="text-[14px] text-[#656565]">رمز عبور</label>
            <div className="relative w-full">
              <input
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
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

          {/* Confirm password */}
          <div className="absolute flex flex-col gap-[4px] items-end w-[288px] left-[99px] top-[440px]">
            <label className="text-[14px] text-[#656565]">تأیید رمز عبور</label>
            <div className="relative w-full">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
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

          {/* submit */}
          <button
            type="submit"
            disabled={registerMutation.isPending}
            className="absolute left-[99px] top-[515px] w-[288px] h-[40px] bg-[#00B4D8] text-white rounded-[8px] text-[14px] font-[500] disabled:opacity-50"
          >
            {registerMutation.isPending ? "در حال ارسال..." : "ثبت‌نام"}
          </button>

          {/* Footer */}
          <div className="absolute flex flex-col items-center gap-[8px] w-[288px] left-[99px] top-[570px] text-center">
            <p className="text-[12px] text-[#171717]">
              اگر اکانت دارید{" "}
              <Link
                href={`/login?returnUrl=${encodeURIComponent(returnUrl)}`}
                className="text-[#00B4D8] hover:underline"
              >
                اینجا کلیک کنید
              </Link>
            </p>
            <Link
              href={`/login/otp?returnUrl=${encodeURIComponent(returnUrl)}`}
              className="text-[12px] text-[#3C8F7C] hover:underline"
            >
              ورود با شماره تماس
            </Link>
          </div>
        </form>
      )}

      {/* === مرحله دوم: وارد کردن OTP === */}
      {step === "otp" && (
        <form onSubmit={handleVerifyOtp} className="relative">
          {/* OTP Input */}
          <div className="absolute flex flex-col gap-[4px] items-end w-[288px] left-[99px] top-[200px]">
            <label className="text-[14px] text-[#656565]">
              کد تأیید 6 رقمی
            </label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              maxLength={6}
              className="w-full h-[40px] border border-[#656565] rounded-[8px] px-[8px] text-center text-[18px] tracking-widest focus:ring-2 focus:ring-[#00B4D8]"
              placeholder="● ● ● ● ● ●"
              required
            />
          </div>

          {/* Countdown / Resend */}
          <div className="absolute left-[99px] top-[260px] w-[288px] text-center">
            {countdown > 0 ? (
              <p className="text-[12px] text-[#656565] mt-2">
                ارسال مجدد کد تا <span className="font-bold">{countdown}</span>{" "}
                ثانیه دیگر
              </p>
            ) : (
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={registerMutation.isPending}
                className="text-[12px] text-[#00B4D8] hover:underline disabled:opacity-50"
              >
                ارسال مجدد کد
              </button>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={verifyOtpMutation.isPending || otp.length !== 6}
            className="absolute left-[99px] top-[310px] w-[288px] h-[40px] bg-[#00B4D8] text-white rounded-[8px] text-[14px] font-[500] disabled:opacity-50"
          >
            {verifyOtpMutation.isPending ? "در حال تأیید..." : "تأیید کد"}
          </button>

          {/* Change Phone */}
          <button
            type="button"
            onClick={() => {
              setStep("register");
              setOtp("");
            }}
            className="absolute left-[99px] top-[365px] w-[288px] text-[12px] text-[#656565] hover:text-[#00B4D8]"
          >
            تغییر شماره تماس
          </button>
        </form>
      )}
    </AuthLayout>
  );
}
