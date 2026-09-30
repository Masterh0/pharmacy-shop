"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import AuthLayout from "../authComponents/AuthLayout";
import BackButton from "../authComponents/BackButton";

import {
  requestPasswordResetOtp,
  type PasswordResetOtpResponse,
} from "@/lib/api/auth";

import type { AxiosError } from "axios";
import { useAuth } from "@/lib/context/AuthContext";

type ApiError = AxiosError<{
  error?: string;
  message?: string;
  expiresAt?: string;
  remainingMs?: number;
}>;

const isValidIranPhone = (value: string) => /^09\d{9}$/.test(value);

export default function ForgotPasswordClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const returnUrl = searchParams.get("returnUrl") || "/";

  const [phone, setPhone] = useState("");
  const [touched, setTouched] = useState(false);
  const { user, isLoading } = useAuth();
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
  const sendOtp = useMutation<
    PasswordResetOtpResponse,
    ApiError,
    { phone: string }
  >({
    mutationFn: requestPasswordResetOtp,

    onSuccess: (data) => {
      toast.success(data.message || "کد بازیابی ارسال شد.");

      router.push(
        `/forgot-password/otp?phone=${encodeURIComponent(
          phone,
        )}&expiresAt=${encodeURIComponent(
          data.expiresAt || "",
        )}&returnUrl=${encodeURIComponent(returnUrl)}`,
      );
    },

    onError: (error) => {
      const message =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "خطایی رخ داد. لطفاً دوباره تلاش کنید.";

      if (error.response?.status === 429) {
        const expiresAt = error.response?.data?.expiresAt || "";
        const remainingMs = error.response?.data?.remainingMs || 0;

        router.push(
          `/forgot-password/otp?phone=${encodeURIComponent(
            phone,
          )}&expiresAt=${encodeURIComponent(
            expiresAt,
          )}&remainingMs=${remainingMs}&returnUrl=${encodeURIComponent(
            returnUrl,
          )}`,
        );

        return;
      }

      toast.error(message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    setTouched(true);

    if (!isValidIranPhone(phone)) {
      toast.error("شماره موبایل نامعتبر است.");
      return;
    }

    if (sendOtp.isPending) return;

    sendOtp.mutate({ phone });
  };

  return (
    <AuthLayout>
      <BackButton fallback="/login" />

      <div className="md:hidden flex flex-col items-center gap-2 mb-4">
        <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center overflow-hidden">
          <div className="text-2xl">🐛</div>
        </div>

        <h2 className="text-[#0086a8] font-bold text-xl">
          داروخانه دکتر بهوندی
        </h2>

        <span className="text-gray-500 text-sm">بازیابی رمز عبور</span>
      </div>

      <div className="flex flex-row justify-center items-start w-full h-[100dvh] md:h-full px-4 md:px-0">
        <div className="flex flex-col justify-center items-center w-full max-w-[360px]">
          <div className="flex flex-col justify-center items-center gap-[12px] w-full mb-8 md:mb-6">
            <h1 className="text-[32px] md:text-[40px] font-bold text-[#171717] leading-[44px]">
              فراموشی رمز عبور
            </h1>

            <p className="text-[14px] md:text-[16px] text-[#656565] text-center leading-[27px]">
              شماره موبایل خود را وارد کنید تا کد بازیابی برای شما ارسال شود.
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
                inputMode="numeric"
                value={phone}
                maxLength={11}
                onChange={(e) => {
                  const value = e.target.value
                    .replace(/[^\d]/g, "")
                    .slice(0, 11);

                  setPhone(value);
                }}
                onBlur={() => setTouched(true)}
                placeholder="مثلاً 09123456789"
                className={`w-full h-[48px] md:h-[40px] border rounded-[8px] px-[8px] text-right text-[14px] outline-none focus:ring-2 focus:ring-[#00B4D8] transition-all ${
                  touched && !isValidIranPhone(phone)
                    ? "border-red-500"
                    : "border-[#656565]"
                }`}
              />
            </div>

            <button
              type="submit"
              disabled={sendOtp.isPending}
              className="w-full h-[48px] md:h-[40px] bg-[#00B4D8] text-white rounded-[8px] text-[16px] md:text-[14px] font-[500] disabled:opacity-50 disabled:cursor-not-allowed transition-opacity hover:bg-[#0096B4] mt-2"
            >
              {sendOtp.isPending ? "در حال ارسال..." : "ارسال کد بازیابی"}
            </button>
          </form>

          <div className="w-full md:w-[288px] flex flex-col gap-3 mt-4">
            <button
              type="button"
              onClick={() =>
                router.push(`/login?returnUrl=${encodeURIComponent(returnUrl)}`)
              }
              className="w-full h-[48px] md:h-[40px] flex justify-center items-center text-[#656565] text-[14px] md:text-[13px] hover:text-[#00B4D8] transition-colors"
            >
              بازگشت به صفحه ورود
            </button>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}
