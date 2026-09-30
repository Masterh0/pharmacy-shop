"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { Eye, EyeSlash } from "iconsax-react";
import { toast } from "sonner";
import type { AxiosError } from "axios";

import AuthLayout from "../../authComponents/AuthLayout";
import BackButton from "../../authComponents/BackButton";

import { resetPassword, type ResetPasswordResponse } from "@/lib/api/auth";
import { useAuth } from "@/lib/context/AuthContext";

type ApiError = AxiosError<{
  error?: string;
  message?: string;
}>;

const validatePassword = (password: string) => {
  if (!password) {
    return "رمز عبور الزامی است.";
  }

  if (password.length < 6) {
    return "رمز عبور باید حداقل ۶ کاراکتر باشد.";
  }

  if (/\s/.test(password)) {
    return "رمز عبور نباید شامل فاصله باشد.";
  }

  if (!/^[A-Za-z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?`~]+$/.test(password)) {
    return "رمز عبور فقط می‌تواند شامل حروف انگلیسی، اعداد انگلیسی و علامت‌های خاص باشد.";
  }

  if (!/[A-Za-z]/.test(password)) {
    return "رمز عبور باید حداقل شامل یک حرف انگلیسی باشد.";
  }

  if (!/[0-9]/.test(password)) {
    return "رمز عبور باید حداقل شامل یک عدد باشد.";
  }

  return null;
};

export default function ForgotPasswordResetClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const resetToken = searchParams.get("resetToken") || "";
  const returnUrl = searchParams.get("returnUrl") || "/";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { user, isLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const resetMutation = useMutation<
    ResetPasswordResponse,
    ApiError,
    {
      resetToken: string;
      newPassword: string;
    }
  >({
    mutationFn: resetPassword,

    onSuccess: (data) => {
      toast.success(data.message || "رمز عبور با موفقیت تغییر کرد.");

      router.push(`/login?returnUrl=${encodeURIComponent(returnUrl)}`);
    },

    onError: (error) => {
      toast.error(
        error.response?.data?.error ||
          error.response?.data?.message ||
          "خطایی در تغییر رمز عبور رخ داد.",
      );
    },
  });
  useEffect(() => {
    if (!isLoading && user) {
      router.replace("/");
    }
  }, [user, isLoading, router]);

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
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!resetToken) {
      toast.error(
        "لینک بازیابی معتبر نیست. لطفاً دوباره درخواست بازیابی کنید.",
      );

      router.replace("/forgot-password");
      return;
    }

    const passwordError = validatePassword(password);

    if (passwordError) {
      toast.error(passwordError);
      return;
    }

    if (password !== confirmPassword) {
      toast.error("تکرار رمز عبور با رمز جدید یکسان نیست.");
      return;
    }

    if (resetMutation.isPending) return;

    resetMutation.mutate({
      resetToken,
      newPassword: password,
    });
  };

  return (
    <AuthLayout>
      <BackButton fallback="/forgot-password" />

      <div className="md:hidden flex flex-col items-center gap-2 mb-4">
        <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center overflow-hidden">
          <div className="text-2xl">🐛</div>
        </div>

        <h2 className="text-[#0086a8] font-bold text-xl">
          داروخانه دکتر بهوندی
        </h2>

        <span className="text-gray-500 text-sm">تعیین رمز عبور جدید</span>
      </div>

      <div className="flex flex-row justify-center items-start w-full h-[100dvh] md:h-full px-4 md:px-0">
        <div className="flex flex-col justify-center items-center w-full max-w-[360px]">
          <div className="flex flex-col justify-center items-center gap-[12px] w-full mb-8 md:mb-6">
            <h1 className="text-[32px] md:text-[40px] font-bold text-[#171717] leading-[44px]">
              رمز عبور جدید
            </h1>

            <p className="text-[14px] md:text-[16px] text-[#656565] text-center leading-[27px]">
              رمز عبور جدید خود را وارد کنید.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="w-full md:w-[288px] flex flex-col gap-4"
          >
            <div className="flex flex-col gap-[4px] items-end w-full">
              <label className="text-[14px] text-[#656565]">
                رمز عبور جدید
              </label>

              <div className="relative w-full">
                <input
                  dir="ltr"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-[48px] md:h-[40px] border border-[#656565] rounded-[8px] pl-[40px] pr-[12px] text-right outline-none focus:ring-2 focus:ring-[#00B4D8]"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
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

            <div className="flex flex-col gap-[4px] items-end w-full">
              <label className="text-[14px] text-[#656565]">
                تکرار رمز عبور
              </label>

              <div className="relative w-full">
                <input
                  dir="ltr"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full h-[48px] md:h-[40px] border border-[#656565] rounded-[8px] pl-[40px] pr-[12px] text-right outline-none focus:ring-2 focus:ring-[#00B4D8]"
                />

                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((value) => !value)}
                  className="absolute left-[12px] top-1/2 -translate-y-1/2 text-[#656565]"
                >
                  {showConfirmPassword ? (
                    <EyeSlash size={20} color="#656565" />
                  ) : (
                    <Eye size={20} color="#656565" />
                  )}
                </button>
              </div>
            </div>

            <p
              dir="rtl"
              className="text-[11px] text-[#777] leading-5 text-right"
            >
              رمز عبور باید حداقل ۶ کاراکتر، شامل حداقل یک حرف انگلیسی و یک عدد
              انگلیسی باشد.
            </p>

            <button
              type="submit"
              disabled={resetMutation.isPending}
              className="w-full h-[48px] md:h-[40px] bg-[#00B4D8] text-white rounded-[8px] text-[16px] md:text-[14px] font-[500] disabled:opacity-50 disabled:cursor-not-allowed transition-opacity hover:bg-[#0096B4] mt-2"
            >
              {resetMutation.isPending
                ? "در حال تغییر رمز..."
                : "تغییر رمز عبور"}
            </button>
          </form>
        </div>
      </div>
    </AuthLayout>
  );
}
