"use client";

import React, { useEffect, useState } from "react";

import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import {
  sendLoginOtp,
  verifyLoginOtp,
} from "@/lib/api/auth";

import {
  useRouter,
  useSearchParams,
} from "next/navigation";

import type { AxiosError } from "axios";

import { toast } from "sonner";

import AuthLayout from "../../authComponents/AuthLayout";

import BackButton from "@/app/authComponents/BackButton";

import { useAuth } from "@/lib/context/AuthContext";

import { cartApi } from "@/lib/api/cart";

import type { Cart } from "@/lib/types/cart";

// ---------------------------
// تایپ‌ها
// ---------------------------

type SendOtpResponse = {
  expiresAt?: string;
  remainingMs?: number;
};

type VerifyOtpResponse = {
  user: {
    id: number;
    role: "ADMIN" | "CUSTOMER" | "STAFF";
    phone: string;
    name: string;
  };
};

type ApiError = AxiosError<{
  error?: string;
  message?: string;
  remainingMs?: number;
  expiresAt?: string;
}>;

export default function OtpClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const returnUrl = searchParams.get("returnUrl") || "/";
  const phoneFromUrl = searchParams.get("phone") || "";
  const expiresAtFromUrl =
    searchParams.get("expiresAt") || "";

  const [phone, setPhone] = useState(phoneFromUrl);
  const [code, setCode] = useState("");

  const [step, setStep] = useState<"phone" | "otp">(
    phoneFromUrl ? "otp" : "phone",
  );

  const [countdown, setCountdown] = useState(0);

  const queryClient = useQueryClient();

  const {
    user,
    isLoading,
    refreshUser,
  } = useAuth();

  const isAuthenticated = !!user;

  // ---------------------------
  // ارسال OTP
  // ---------------------------

  const sendOtp = useMutation<
    SendOtpResponse,
    ApiError,
    { phone: string }
  >({
    mutationFn: sendLoginOtp,

    onSuccess: (data) => {
      setStep("otp");

      if (data.expiresAt) {
        const remain =
          new Date(data.expiresAt).getTime() -
          Date.now();

        setCountdown(
          Math.max(0, Math.floor(remain / 1000)),
        );
      }

      toast.success("کد ارسال شد ✅");
    },

    onError: (err) => {
      const data = err.response?.data;

      const msg = data?.error || data?.message;

      const isActiveOtp =
        err.response?.status === 429 &&
        (!!data?.remainingMs ||
          !!data?.expiresAt);

      if (isActiveOtp) {
        setStep("otp");

        if (data?.expiresAt) {
          const remain =
            new Date(data.expiresAt).getTime() -
            Date.now();

          setCountdown(
            Math.max(
              0,
              Math.floor(remain / 1000),
            ),
          );
        } else if (data?.remainingMs) {
          setCountdown(
            Math.max(
              0,
              Math.floor(data.remainingMs / 1000),
            ),
          );
        }

        toast.info(
          "کد قبلی هنوز معتبر است؛ همان کد را وارد کنید.",
        );

        return;
      }

      toast.error(msg || "خطایی رخ داد.");
    },
  });

  // ---------------------------
  // تأیید OTP
  // ---------------------------

  const verifyOtp = useMutation<
    VerifyOtpResponse,
    ApiError,
    { phone: string; code: string }
  >({
    mutationFn: verifyLoginOtp,

    onSuccess: async (data) => {
      try {
        // سبد مهمان قبل از لاگین
        const guestCart =
          queryClient.getQueryData<Cart>(["cart"]);

        const guestItemCount =
          guestCart?.items?.reduce(
            (sum, item) => sum + item.quantity,
            0,
          ) ?? 0;

        // آپدیت Auth Context
        await refreshUser();

        // دریافت سبد نهایی از سرور
        const finalCart = await cartApi.get();

        // آپدیت cache
        queryClient.setQueryData(
          ["cart"],
          finalCart,
        );

        // Toast ورود
        toast.success(
          "ورود موفقیت‌آمیز ✅",
        );

        // Toast merge سبد مهمان
        if (guestItemCount > 0) {
          toast.success(
            `${guestItemCount} محصول از سبد مهمان به سبد شما اضافه شد 🛒`,
            {
              id: "cart-merge",
            },
          );
        }

        await new Promise((resolve) =>
          setTimeout(resolve, 300),
        );

        // Redirect
        router.push(
          data.user.role === "ADMIN"
            ? "/admin/dashboard"
            : returnUrl,
        );
      } catch (error) {
        console.error(
          "❌ OTP LOGIN CART SYNC ERROR:",
          error,
        );

        toast.success(
          "ورود موفقیت‌آمیز ✅",
        );

        router.push(
          data.user.role === "ADMIN"
            ? "/admin/dashboard"
            : returnUrl,
        );
      }
    },

    onError: (err) => {
      toast.error(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "کد وارد شده نادرست است.",
      );
    },
  });

  // ---------------------------
  // اگر کاربر قبلاً لاگین است
  // ---------------------------

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/");
    }
  }, [
    isLoading,
    isAuthenticated,
    router,
  ]);

  // ---------------------------
  // شمارش معکوس
  // ---------------------------

  useEffect(() => {
    if (!expiresAtFromUrl) return;

    const updateCountdown = () => {
      const remain =
        new Date(expiresAtFromUrl).getTime() -
        Date.now();

      setCountdown(
        Math.max(
          0,
          Math.floor(remain / 1000),
        ),
      );
    };

    updateCountdown();

    const timer = setInterval(
      updateCountdown,
      1000,
    );

    return () => clearInterval(timer);
  }, [expiresAtFromUrl]);

  // ---------------------------
  // Handlers
  // ---------------------------

  const handleSend = () => {
    if (
      phone &&
      !sendOtp.isPending
    ) {
      sendOtp.mutate({ phone });
    }
  };

  const handleVerify = () => {
    if (
      code &&
      !verifyOtp.isPending
    ) {
      verifyOtp.mutate({
        phone,
        code,
      });
    }
  };

  const handleResend = () => {
    if (!countdown) {
      sendOtp.mutate({ phone });
    }
  };

  const resetToPhone = () => {
    setStep("phone");
    setCode("");
    setCountdown(0);
  };

  // ---------------------------
  // Loading اولیه Auth
  // ---------------------------

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <p className="animate-pulse text-[#00B4D8]">
          در حال بررسی...
        </p>
      </div>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  return (
    <AuthLayout>
      <BackButton fallback="/" />

      <div className="mt-24 flex w-full flex-col items-center justify-center px-6 text-center">
        {/* PHONE */}
        {step === "phone" && (
          <div className="flex w-[288px] flex-col items-center gap-4">
            <h1 className="text-[32px] font-bold text-[#171717]">
              ورود با کد یک‌بار مصرف
            </h1>

            <p className="text-[16px] text-[#656565]">
              شماره موبایل خود را وارد کنید تا کد ارسال شود
            </p>

            <input
              type="tel"
              maxLength={11}
              value={phone}
              onChange={(e) =>
                setPhone(e.target.value)
              }
              className="h-[40px] w-full rounded-[8px] border border-[#656565] px-[8px] text-right text-[14px] focus:ring-2 focus:ring-[#00B4D8]"
              placeholder="مثلاً 09123456789"
            />

            <button
              onClick={handleSend}
              disabled={
                sendOtp.isPending ||
                !phone
              }
              className="h-[40px] w-full rounded-[8px] bg-[#00B4D8] text-[14px] font-[500] text-white disabled:opacity-60"
            >
              {sendOtp.isPending
                ? "در حال ارسال..."
                : "ارسال کد"}
            </button>
          </div>
        )}

        {/* OTP */}
        {step === "otp" && (
          <div className="relative flex w-[288px] flex-col items-center gap-4">
            {verifyOtp.isPending && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-lg bg-white/90 backdrop-blur-sm">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#00B4D8] border-t-transparent" />

                <p className="mt-4 text-[16px] font-medium text-[#171717]">
                  در حال ورود...
                </p>
              </div>
            )}

            <p className="mb-1 text-[16px] text-[#171717]">
              کد به شماره زیر ارسال شد:
            </p>

            <p className="font-[500] text-[#00B4D8]">
              {phone.replace(
                /^(\d{3})(\d{3})(\d{4})$/,
                "09*** *** $3",
              )}
            </p>

            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={code}
              onChange={(e) =>
                setCode(e.target.value)
              }
              placeholder="کد ۶ رقمی"
              className="h-[40px] w-full rounded-[8px] border border-[#656565] text-center tracking-widest focus:ring-2 focus:ring-[#00B4D8]"
            />

            <button
              onClick={handleVerify}
              disabled={
                !code ||
                verifyOtp.isPending
              }
              className="h-[40px] w-full rounded-[8px] bg-[#00B4D8] text-[14px] font-[500] text-white disabled:opacity-60"
            >
              تأیید کد
            </button>

            <div className="mt-1 text-[12px] text-[#434343]">
              {countdown > 0 ? (
                <p>
                  امکان ارسال مجدد تا{" "}
                  {countdown} ثانیه دیگر
                </p>
              ) : (
                <button
                  onClick={handleResend}
                  disabled={sendOtp.isPending}
                  className="font-[500] text-[#00B4D8] hover:underline disabled:opacity-50"
                >
                  {sendOtp.isPending
                    ? "در حال ارسال..."
                    : "ارسال مجدد کد"}
                </button>
              )}
            </div>

            <p
              onClick={resetToPhone}
              className="mt-2 cursor-pointer text-[13px] text-blue-500 hover:underline"
            >
              تغییر شماره تماس
            </p>
          </div>
        )}
      </div>
    </AuthLayout>
  );
}