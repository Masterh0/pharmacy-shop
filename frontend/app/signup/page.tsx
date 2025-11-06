"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeSlash } from "iconsax-react";
import AuthLayout from "../authComponents/AuthLayout";
import { useMutation } from "@tanstack/react-query";
import { register, verifyRegisterOtp } from "@/lib/api/auth";
import { useAuthStore } from "@/lib/stores/authStore";
import { useRouter } from "next/navigation";
import BackButton from "../authComponents/BackButton";
import { useAuthRedirect } from "@/lib/hooks/useAuthRedirect";
import { useAuthReady } from "@/lib/hooks/useAuthReady";

// ⚡ فرم استایل‌ها دست‌نخورده 👇
export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // -- وضعیت محلی برای فرم
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // وضعیت OTP مرحله دوم
  const [step, setStep] = useState<"register" | "otp">("register");
  const [otp, setOtp] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const setAuth = useAuthStore((s) => s.setAuth);
  const router = useRouter();

  // --------------------
  // ✅ Mutation: Signup
  // --------------------
  const registerMutation = useMutation({
    mutationFn: register,
    onSuccess: (res) => {
      setUserPhone(formData.phone);
      setStep("otp");
    },
    onError: (err: unknown) => {
      if (err && typeof err === "object" && "response" in err) {
        const axiosErr = err as { response?: { data?: { error?: string } } };
        alert(axiosErr.response?.data?.error || "خطا در ثبت‌نام");
      } else {
        alert("خطای ناشناخته رخ داد");
      }
    },
  });

  // --------------------
  // ✅ Mutation: Verify OTP
  // --------------------
  const verifyOtpMutation = useMutation({
    mutationFn: verifyRegisterOtp,
    onSuccess: (res) => {
      const { accessToken, refreshToken, user } = res;
      setAuth({
        accessToken,
        refreshToken,
        role: user.role,
        userId: user.id,
        phone: user.phone,
        name: user.name,
      });

      // هدایت بر اساس نقش
      if (user.role === "ADMIN") router.push("/admin/dashboard");
      else router.push("/");
    },
    onError: (err: unknown) => {
      if (err && typeof err === "object" && "response" in err) {
        const axiosErr = err as { response?: { data?: { error?: string } } };
        alert(axiosErr.response?.data?.error || "خطا در ثبت‌نام");
      } else {
        alert("خطای ناشناخته رخ داد");
      }
    },
  });
  const status = useAuthRedirect();
  if (status === "checking") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <p className="animate-pulse text-[#00B4D8]">
          در حال بررسی وضعیت ورود...
        </p>
      </div>
    );
  }

  // 🔁 تو مرحله redirect هستیم → نشون نده
  if (status === "redirecting") return null;
  // --------------------
  // ⚙️ رویداد ارسال فرم ثبت‌نام
  // --------------------
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword)
      return alert("رمز عبور و تأیید یکسان نیست");

    registerMutation.mutate({
      name: formData.name.trim(),
      phone: formData.phone,
      password: formData.password,
      email: formData.email || undefined,
    });
  };

  // --------------------
  // ⚙️ رویداد ارسال OTP
  // --------------------
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    verifyOtpMutation.mutate({ phone: userPhone, code: otp });
  };

  // --------------------
  // فرم اصلی
  // --------------------
  return (
    <AuthLayout>
      {/* Back */}
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
              placeholder="شماره تماس خود را وارد کنید"
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
            className="absolute left-[99px] top-[515px] w-[288px] h-[40px] bg-[#00B4D8] text-white rounded-[8px] text-[14px] font-[500]"
          >
            {registerMutation.isPending ? "در حال ارسال..." : "ثبت‌نام"}
          </button>

          {/* Footer */}
          <div className="absolute flex flex-col items-center gap-[8px] w-[288px] left-[99px] top-[570px] text-center">
            <p className="text-[12px] text-[#171717]">
              اگر اکانت دارید{" "}
              <Link href="/login" className="text-[#00B4D8] hover:underline">
                اینجا کلیک کنید
              </Link>
            </p>
            <Link
              href="/login/otp"
              className="text-[12px] text-[#3C8F7C] hover:underline"
            >
              ورود با شماره تماس
            </Link>
          </div>
        </form>
      )}

      {/* === مرحله دوم: وارد کردن OTP === */}
      {step === "otp" && (
        <form onSubmit={handleVerifyOtp}>
          <div className="absolute flex flex-col gap-[4px] items-end w-[288px] left-[99px] top-[230px]">
            <label className="text-[14px] text-[#656565]">کد تأیید</label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full h-[40px] border border-[#656565] rounded-[8px] px-[8px] text-right text-[14px] focus:ring-2 focus:ring-[#00B4D8]"
              placeholder="کد دریافتی را وارد کنید"
            />
          </div>

          <button
            type="submit"
            disabled={verifyOtpMutation.isPending}
            className="absolute left-[99px] top-[310px] w-[288px] h-[40px] bg-[#00B4D8] text-white rounded-[8px] text-[14px] font-[500]"
          >
            {verifyOtpMutation.isPending ? "در حال تأیید..." : "تأیید کد"}
          </button>
        </form>
      )}
    </AuthLayout>
  );
}
