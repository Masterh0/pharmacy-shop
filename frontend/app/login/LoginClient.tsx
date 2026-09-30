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
import { useQueryClient } from "@tanstack/react-query";
import { cartApi } from "@/lib/api/cart";
import type { Cart } from "@/lib/types/cart";

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
  const reason = searchParams.get("reason");

  const { user, isLoading, refreshUser } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touched, setTouched] = useState(false);
  const queryClient = useQueryClient();
  const passwordHintShown = useRef(false);

  useEffect(() => {
    if (reason === "required") {
      toast.error("لطفاً ابتدا وارد شوید", {
        id: "auth-required",
      });
    }

    if (reason === "expired") {
      toast.error("جلسه شما منقضی شده است. دوباره وارد شوید.", {
        id: "session-expired",
      });
    }
  }, [reason]);

  const isLoggingIn = useRef(false);
  useEffect(() => {
    if (!isLoading && user && !isLoggingIn.current) {
      router.replace(returnUrl);
    }
  }, [user, isLoading, router, returnUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setTouched(true);

    // =========================
    // Validation
    // =========================

    if (!phone && !password) {
      toast.error("لطفاً شماره موبایل و رمز عبور را وارد کنید");
      return;
    }

    if (!phone) {
      toast.error("لطفاً شماره موبایل را وارد کنید");
      return;
    }

    if (!isValidIranPhone(phone)) {
      toast.error("شماره موبایل نامعتبر است");
      return;
    }

    if (!password) {
      toast.error("لطفاً رمز عبور را وارد کنید");
      return;
    }

    if (containsPersian(password)) {
      toast.error("رمز عبور باید فقط با حروف انگلیسی وارد شود");
      return;
    }

    // =========================
    // Login
    // =========================

    try {
      setIsSubmitting(true);
      isLoggingIn.current = true;

      let guestCart: Cart | null = null;

      try {
        guestCart = await cartApi.get();
      } catch (error) {
        console.error("❌ GUEST CART ERROR:", error);
      }

      const guestItemCount =
        guestCart?.items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

      const response = await loginWithPassword(phone, password);


      // =========================
      // شماره تأیید نشده
      // =========================

      if (response?.requiresVerification) {
        toast.info(response.message || "شماره موبایل شما هنوز تأیید نشده است.");

        router.push(
          `/login/otp?phone=${encodeURIComponent(phone)}&expiresAt=${encodeURIComponent(
            response.expiresAt || "",
          )}&returnUrl=${encodeURIComponent(returnUrl)}`,
        );

        return;
      }

      // =========================
      // Login موفق
      // =========================

      await refreshUser();

      const finalCart = await cartApi.get();

      queryClient.setQueryData(["cart"], finalCart);

      toast.success("ورود موفقیت‌آمیز بود");

      if (guestItemCount > 0) {
        toast.success(`${guestItemCount} محصول از سبد مهمان اضافه شد 🛒`, {
          id: "cart-merge",
        });
      }

      await new Promise((resolve) => setTimeout(resolve, 500));

      router.push(returnUrl);
    } catch (err: unknown) {
      isLoggingIn.current = false;

      const error = err as ApiError;

      const status = error?.response?.status;

      // =========================
      // Wrong credentials
      // =========================

      if (status === 400 || status === 401) {
        toast.error("شماره موبایل یا رمز عبور اشتباه است");

        return;
      }

      // =========================
      // Unknown error
      // =========================

      console.error("🔥 LOGIN FLOW ERROR:", err);

      toast.error("خطایی در ورود رخ داد. لطفاً دوباره تلاش کنید");
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
      <div className="md:hidden flex flex-col items-center gap-2 mb-4">
        <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center overflow-hidden">
          {/* You can replace this src with your actual logo */}
          <div className="text-2xl">🐛</div>
        </div>
        <h2 className="text-[#0086a8] font-bold text-xl">
          داروخانه دکتر بهوندی
        </h2>
        <span className="text-gray-500 text-sm">ورود | ثبت نام</span>
      </div>
      {/* این کانتینر کل ارتفاع پنل سمت چپ را می‌گیرد و محتوا را دقیقاً وسط‌چین (عمودی و افقی) می‌کند */}
      <div className="flex flex-row justify-center items-start w-full h-[100dvh] md:h-full px-4 md:px-0">
        <div className="flex flex-col justify-center items-center w-full max-w-[360px]">
          <div className="flex flex-col justify-center items-center gap-[12px] w-full mb-8 md:mb-6">
            <h1 className="text-[32px] md:text-[40px] font-bold text-[#171717] leading-[44px]">
              ورود
            </h1>
            <p className="text-[14px] md:text-[16px] text-[#656565] text-center leading-[27px]">
              برای ورود اطلاعات خود را وارد کنید.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="w-full md:w-[288px] flex flex-col gap-4"
          >
            <div className="flex flex-col gap-[4px] items-end w-full">
              <label className="text-[14px] text-[#656565]">شماره موبایل</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => {
                  const v = e.target.value.replace(/[^\d]/g, "").slice(0, 11);
                  setPhone(v);
                }}
                onBlur={() => setTouched(true)}
                className={`w-full h-[48px] md:h-[40px] border rounded-[8px] px-[8px] text-right text-[14px] focus:ring-2 focus:ring-[#00B4D8] outline-none transition-all
                  ${
                    touched && !isValidIranPhone(phone)
                      ? "border-red-500"
                      : "border-[#656565]"
                  }`}
                placeholder="مثلاً 09123456789"
              />
            </div>

            <div className="flex flex-col gap-[4px] items-end w-full">
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
                  className="w-full h-[48px] md:h-[40px] border border-[#656565] rounded-[8px] pl-[40px] pr-[12px] text-right outline-none focus:ring-2 focus:ring-[#00B4D8]"
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
              href={`/forgot-password?returnUrl=${encodeURIComponent(returnUrl)}`}
              className="flex self-start text-[12px] md:text-[11px] text-[#3C8F7C] hover:underline mt-[-4px]"
            >
              فراموشی رمز عبور
            </Link>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-[48px] md:h-[40px] bg-[#00B4D8] text-white rounded-[8px] text-[16px] md:text-[14px] font-[500] disabled:opacity-50 disabled:cursor-not-allowed transition-opacity hover:bg-[#0096B4] mt-2"
            >
              {isSubmitting ? "در حال ورود..." : "ورود"}
            </button>
          </form>

          <div className="w-full md:w-[288px] flex flex-col gap-3 mt-4">
            <Link
              href={`/login/otp?returnUrl=${encodeURIComponent(returnUrl)}`}
              className="w-full h-[48px] md:h-[40px] flex justify-center items-center text-[#00B4D8] text-[15px] md:text-[14px] font-[500] hover:bg-gray-50 rounded-[8px] transition-colors"
            >
              ورود سریع با کد یک‌بار مصرف
            </Link>

            <Link
              href="/signup"
              className="w-full h-[48px] md:h-[40px] flex justify-center items-center text-[#656565] text-[14px] md:text-[13px] hover:text-[#00B4D8] transition-colors"
            >
              حساب کاربری ندارید؟ ثبت‌نام
            </Link>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}
