"use client";

import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import type { AxiosError } from "axios";

import AuthLayout from "../../authComponents/AuthLayout";
import BackButton from "../../authComponents/BackButton";

import {
  requestPasswordResetOtp,
  verifyPasswordResetOtp,
  type PasswordResetOtpResponse,
  type VerifyPasswordResetOtpResponse,
} from "@/lib/api/auth";
import { useAuth } from "@/lib/context/AuthContext";

type ApiError = AxiosError<{
  error?: string;
  message?: string;
  expiresAt?: string;
  remainingMs?: number;
}>;

export default function ForgotPasswordOtpClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const phone = searchParams.get("phone") || "";
  const expiresAt = searchParams.get("expiresAt") || "";
  const remainingMsFromUrl = searchParams.get("remainingMs") || "";
  const { user, isLoading } = useAuth();
  const returnUrl = searchParams.get("returnUrl") || "/";

  const [code, setCode] = useState("");

  const [countdown, setCountdown] = useState(() => {
    if (remainingMsFromUrl) {
      return Math.max(0, Math.floor(Number(remainingMsFromUrl) / 1000));
    }

    if (expiresAt) {
      return Math.max(
        0,
        Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000),
      );
    }

    return 0;
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
  useEffect(() => {
    if (!expiresAt && !remainingMsFromUrl) return;

    const updateCountdown = () => {
      if (expiresAt) {
        const remain = new Date(expiresAt).getTime() - Date.now();

        setCountdown(Math.max(0, Math.floor(remain / 1000)));
      }
    };

    updateCountdown();

    const timer = setInterval(updateCountdown, 1000);

    return () => clearInterval(timer);
  }, [expiresAt, remainingMsFromUrl]);

  const verifyOtp = useMutation<
    VerifyPasswordResetOtpResponse,
    ApiError,
    { phone: string; code: string }
  >({
    mutationFn: verifyPasswordResetOtp,

    onSuccess: (data) => {
      toast.success(data.message || "کد با موفقیت تأیید شد.");

      router.push(
        `/forgot-password/reset?resetToken=${encodeURIComponent(
          data.resetToken,
        )}&returnUrl=${encodeURIComponent(returnUrl)}`,
      );
    },

    onError: (error) => {
      toast.error(
        error.response?.data?.error ||
          error.response?.data?.message ||
          "کد وارد شده نادرست است.",
      );
    },
  });

  const resendOtp = useMutation<
    PasswordResetOtpResponse,
    ApiError,
    { phone: string }
  >({
    mutationFn: requestPasswordResetOtp,

    onSuccess: (data) => {
      if (data.expiresAt) {
        const remain = new Date(data.expiresAt).getTime() - Date.now();

        setCountdown(Math.max(0, Math.floor(remain / 1000)));

        router.replace(
          `/forgot-password/otp?phone=${encodeURIComponent(
            phone,
          )}&expiresAt=${encodeURIComponent(
            data.expiresAt,
          )}&returnUrl=${encodeURIComponent(returnUrl)}`,
        );
      }

      toast.success("کد جدید ارسال شد.");
    },

    onError: (error) => {
      const remainingMs = error.response?.data?.remainingMs || 0;

      const newExpiresAt = error.response?.data?.expiresAt || "";

      if (error.response?.status === 429) {
        setCountdown(Math.max(0, Math.floor(remainingMs / 1000)));

        if (newExpiresAt) {
          router.replace(
            `/forgot-password/otp?phone=${encodeURIComponent(
              phone,
            )}&expiresAt=${encodeURIComponent(
              newExpiresAt,
            )}&returnUrl=${encodeURIComponent(returnUrl)}`,
          );
        }
      }

      toast.error(
        error.response?.data?.error || "امکان ارسال مجدد کد وجود ندارد.",
      );
    },
  });

  const handleVerify = () => {
    if (code.length !== 6) {
      toast.error("کد باید ۶ رقمی باشد.");
      return;
    }

    if (verifyOtp.isPending) return;

    verifyOtp.mutate({
      phone,
      code,
    });
  };

  const handleResend = () => {
    if (!countdown && !resendOtp.isPending) {
      resendOtp.mutate({ phone });
    }
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

        <span className="text-gray-500 text-sm">بازیابی رمز عبور</span>
      </div>

      <div className="flex flex-col items-center justify-center w-full mt-24 px-6 text-center">
        <div className="flex flex-col gap-4 items-center w-[288px] relative">
          {verifyOtp.isPending && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm rounded-lg z-10">
              <div className="animate-spin w-8 h-8 border-4 border-[#00B4D8] border-t-transparent rounded-full" />

              <p className="mt-4 text-[#171717] text-[16px] font-medium">
                در حال بررسی...
              </p>
            </div>
          )}

          <h1 className="text-[32px] font-bold text-[#171717]">تأیید کد</h1>

          <p className="text-[16px] text-[#656565]">
            کد بازیابی به شماره زیر ارسال شد:
          </p>

          <p className="font-[500] text-[#00B4D8]">
            {phone.replace(/^(\d{3})(\d{3})(\d{4})$/, "09*** *** $3")}
          </p>

          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={code}
            onChange={(e) => {
              setCode(e.target.value.replace(/[^\d]/g, "").slice(0, 6));
            }}
            placeholder="کد ۶ رقمی"
            className="w-full h-[40px] border border-[#656565] rounded-[8px] text-center tracking-widest outline-none focus:ring-2 focus:ring-[#00B4D8]"
          />

          <button
            type="button"
            onClick={handleVerify}
            disabled={code.length !== 6 || verifyOtp.isPending}
            className="w-full h-[40px] bg-[#00B4D8] text-white rounded-[8px] text-[14px] font-[500] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {verifyOtp.isPending ? "در حال بررسی..." : "تأیید کد"}
          </button>

          <div className="text-[12px] text-[#434343] mt-1">
            {countdown > 0 ? (
              <p>امکان ارسال مجدد تا {countdown} ثانیه دیگر</p>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                disabled={resendOtp.isPending}
                className="text-[#00B4D8] font-[500] hover:underline disabled:opacity-50"
              >
                {resendOtp.isPending ? "در حال ارسال..." : "ارسال مجدد کد"}
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() =>
              router.push(
                `/forgot-password?returnUrl=${encodeURIComponent(returnUrl)}`,
              )
            }
            className="text-blue-500 text-[13px] cursor-pointer hover:underline mt-2"
          >
            تغییر شماره تماس
          </button>
        </div>
      </div>
    </AuthLayout>
  );
}
