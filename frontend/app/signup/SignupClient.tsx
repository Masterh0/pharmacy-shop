"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Eye, EyeSlash } from "iconsax-react";
import AuthLayout from "../authComponents/AuthLayout";
import { useMutation } from "@tanstack/react-query";
import { register, verifyRegisterOtp } from "@/lib/api/auth";
import { useRouter, useSearchParams } from "next/navigation";
import BackButton from "../authComponents/BackButton";
import { useAuth } from "@/lib/context/AuthContext";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { cartApi } from "@/lib/api/cart";
import Image from "next/image";

export default function SignupClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get("returnUrl") || "/";
  const { user, isLoading, refreshUser } = useAuth();
  const queryClient = useQueryClient();
  const isCompletingAuth = useRef(false);
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
  const guestItemCountRef = useRef(0);

  // ✅ چک ریدایرکت اگر قبلاً لاگین کرده
  useEffect(() => {
    if (!isLoading && user && !isCompletingAuth.current) {
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
      try {
        isCompletingAuth.current = true;
        await refreshUser();

        const finalCart = await cartApi.get();
        queryClient.setQueryData(["cart"], finalCart);

        if (guestItemCountRef.current > 0) {
          toast.success(
            `${guestItemCountRef.current} محصول از سبد مهمان به حساب شما اضافه شد 🛒`,
            { id: "register-cart-merge" },
          );
        }

        toast.success("ثبت‌نام با موفقیت انجام شد ✅");
        await new Promise((resolve) => setTimeout(resolve, 500));

        const target =
          res.user.role === "ADMIN" ? "/admin/dashboard" : returnUrl;
        router.replace(target);
      } catch (error) {
        console.error("🔥 REGISTER CART SYNC ERROR:", error);
        toast.success("ثبت‌نام با موفقیت انجام شد ✅");
        const target =
          res.user.role === "ADMIN" ? "/admin/dashboard" : returnUrl;
        router.replace(target);
      }
    },
    onError: (err: any) => {
      isCompletingAuth.current = false;
      const message =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        "کد نادرست است";
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
  if (user && !isCompletingAuth.current) return null;

  // ✅ ارسال فرم ثبت‌نام
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("رمز عبور و تأیید یکسان نیست");
      return;
    }

    try {
      const guestCart = await cartApi.get();
      const guestItemCount =
        guestCart?.items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0;
      guestItemCountRef.current = guestItemCount;

      registerMutation.mutate({
        name: formData.name.trim(),
        phone: formData.phone,
        password: formData.password,
        email: formData.email || undefined,
      });
    } catch (error) {
      console.error("❌ GUEST CART BEFORE REGISTER ERROR:", error);
      registerMutation.mutate({
        name: formData.name.trim(),
        phone: formData.phone,
        password: formData.password,
        email: formData.email || undefined,
      });
    }
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

      {/* Header / Titles Mobile + Desktop */}
      <div
        className="
    relative
    mt-10
    mb-6
    flex
    w-full
    flex-col
    items-center
    justify-center
    gap-[12px]
    px-4

    md:absolute
    md:left-[64px]
    md:top-[54px]
    md:mt-0
    md:mb-0
    md:w-[359px]
    md:px-0
  "
      >
        {/* Mobile Logo */}
        <div className="mb-4 flex flex-col items-center gap-2 md:hidden">
          <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-orange-100">
            <div className="text-2xl">🐛</div>
          </div>

          <h2 className="text-xl font-bold text-[#0086a8]">
            داروخانه دکتر بهوندی
          </h2>

          <span className="text-sm text-gray-500">ورود | ثبت نام</span>
        </div>

        {/* Desktop Title */}
        <h1 className="hidden text-[40px] font-[700] leading-[44px] text-[#171717] md:block">
          {step === "register" ? "ثبت‌نام" : "تأیید کد"}
        </h1>

        <p className="hidden text-center text-[18px] leading-[27px] text-[#656565] md:block">
          {step === "register"
            ? ".برای ایجاد حساب جدید اطلاعات خود را وارد کنید"
            : `کد ارسال‌شده به شماره ${userPhone} را وارد کنید.`}
        </p>
      </div>

      {/* === مرحله اول: اطلاعات کاربر === */}
      {step === "register" && (
        <form
          onSubmit={handleSubmit}
          className="
    relative
    flex
    w-full
    flex-col
    items-center
    gap-4
    px-4

    md:absolute
    md:inset-0
    md:block
    md:px-0
  "
        >
          {/* Name field */}
          <div className="relative md:absolute flex flex-col gap-[4px] items-end w-full max-w-[360px] md:w-[288px] md:left-[99px] md:top-[160px]">
            <label className="text-[14px] text-[#656565]">
              نام و نام خانوادگی
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full h-[40px] md:h-[40px] border border-[#656565] rounded-[8px] px-[8px] text-right text-[14px] focus:ring-2 focus:ring-[#00B4D8]"
              placeholder="نام خود را وارد کنید"
              required
            />
          </div>

          {/* Phone field */}
          <div className="relative md:absolute flex flex-col gap-[4px] items-end w-full max-w-[360px] md:w-[288px] md:left-[99px] md:top-[230px]">
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
              placeholder="0912xxx6789"
            />
          </div>

          {/* Email */}
          <div className="relative md:absolute flex flex-col gap-[4px] items-end w-full max-w-[360px] md:w-[288px] md:left-[99px] md:top-[300px]">
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
          <div className="relative md:absolute flex flex-col gap-[4px] items-end w-full max-w-[360px] md:w-[288px] md:left-[99px] md:top-[370px]">
            <label className="text-right text-[12px] leading-[18px] text-[#656565] md:text-[11px] md:leading-[16px]">
              رمز عبور (اختیاری) حداقل ۶ کارکتر، حداقل ۱ حرف انگلیسی و ۱ عدد
            </label>
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
          <div className="relative md:absolute flex flex-col gap-[4px] items-end w-full max-w-[360px] md:w-[288px] md:left-[99px] md:top-[440px]">
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
            className="relative md:absolute mt-4 md:mt-0 w-full max-w-[360px] md:w-[288px] md:left-[99px] md:top-[515px] h-[44px] md:h-[40px] bg-[#00B4D8] text-white rounded-[8px] text-[16px] md:text-[14px] font-[500] disabled:opacity-50"
          >
            {registerMutation.isPending ? "در حال ارسال..." : "ثبت‌نام در سایت"}
          </button>

          {/* Footer */}
          <div className="relative md:absolute flex flex-col items-center gap-[8px] w-full max-w-[360px] md:w-[288px] md:left-[99px] md:top-[570px] text-center mt-2 md:mt-0">
            <p className="text-[14px] md:text-[12px] text-[#171717]">
              اگر اکانت دارید{" "}
              <Link
                href={`/login?returnUrl=${encodeURIComponent(returnUrl)}`}
                className="text-[#00B4D8] hover:underline"
              >
                اینجا کلیک کنید
              </Link>
            </p>
            
          </div>
        </form>
      )}

      {/* === مرحله دوم: وارد کردن OTP === */}
      {step === "otp" && (
        <form
          onSubmit={handleVerifyOtp}
          className="w-full flex flex-col items-center gap-4 px-4 md:px-0 md:block"
        >
          {/* OTP Input */}
          <div className="relative md:absolute flex flex-col gap-[4px] items-end w-full max-w-[360px] md:w-[288px] md:left-[99px] md:top-[200px]">
            <label className="text-[14px] text-[#656565]">
              کد تأیید 6 رقمی
            </label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              maxLength={6}
              className="w-full h-[44px] md:h-[40px] border border-[#656565] rounded-[8px] px-[8px] text-center text-[18px] tracking-widest focus:ring-2 focus:ring-[#00B4D8]"
              placeholder="● ● ● ● ● ●"
              required
            />
          </div>

          {/* Countdown / Resend */}
          <div className="relative md:absolute w-full max-w-[360px] md:w-[288px] md:left-[99px] md:top-[260px] text-center mt-2 md:mt-0">
            {countdown > 0 ? (
              <p className="text-[14px] md:text-[12px] text-[#656565] mt-2">
                ارسال مجدد کد تا <span className="font-bold">{countdown}</span>{" "}
                ثانیه دیگر
              </p>
            ) : (
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={registerMutation.isPending}
                className="text-[14px] md:text-[12px] text-[#00B4D8] hover:underline disabled:opacity-50"
              >
                ارسال مجدد کد
              </button>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={verifyOtpMutation.isPending || otp.length !== 6}
            className="relative md:absolute w-full max-w-[360px] md:w-[288px] md:left-[99px] md:top-[310px] h-[44px] md:h-[40px] bg-[#00B4D8] text-white rounded-[8px] text-[16px] md:text-[14px] font-[500] disabled:opacity-50 mt-4 md:mt-0"
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
            className="relative md:absolute w-full max-w-[360px] md:w-[288px] md:left-[99px] md:top-[365px] text-[14px] md:text-[12px] text-[#656565] hover:text-[#00B4D8] mt-2 md:mt-0"
          >
            تغییر شماره تماس
          </button>
        </form>
      )}
    </AuthLayout>
  );
}
