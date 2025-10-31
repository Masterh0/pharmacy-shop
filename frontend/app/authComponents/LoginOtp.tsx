"use client";
import React, { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { sendLoginOtp, verifyLoginOtp } from "@/lib/api/auth";
import { useAuthStore } from "@/lib/stores/authStore";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import AuthLayout from "./AuthLayout";
export default function LoginOtpPage() {
  const [phone, setPhone] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [code, setCode] = useState("");
  const [countdown, setCountdown] = useState<number>(0);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);

  const setAuth = useAuthStore((state) => state.setAuth);
  const router = useRouter();

  // -------------------------
  // Mutation: ارسال OTP
  // -------------------------
  const sendOtp = useMutation({
    mutationFn: (data: { phone: string }) => sendLoginOtp(data),
    onSuccess: (data) => {
      setStep("otp");
      setExpiresAt(data.expiresAt);
      const remain = new Date(data.expiresAt).getTime() - Date.now();
      setCountdown(Math.floor(remain / 1000));
      toast.success("کد تأیید ارسال شد ✅");
    },
    onError: (error: AxiosError<{ error?: string; message?: string }>) => {
      const msg =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "خطا در ارسال کد";
      toast.error(msg);
    },
  });

  // -------------------------
  // Mutation: تأیید OTP
  // -------------------------
  const verifyOtp = useMutation({
    mutationFn: (data: { phone: string; code: string }) => verifyLoginOtp(data),
    onSuccess: (data) => {
      setAuth({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        role: data.user.role,
        userId: data.user.id,
        phone: data.user.phone,
      });
      toast.success("ورود موفقیت‌آمیز ✅");
      if (data.user.role === "ADMIN") router.push("/admin/dashboard");
      else router.push("/");
    },
    onError: (error: AxiosError<{ error?: string; message?: string }>) => {
      const msg =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "کد وارد شده نادرست است.";
      toast.error(msg);
    },
  });

  // -------------------------
  // Countdown Logic
  // -------------------------
  useEffect(() => {
    if (!countdown) return;
    const interval = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [countdown]);

  const handleResend = () => {
    if (countdown > 0) return;
    sendOtp.mutate({ phone });
  };

  const resetToPhoneStep = () => {
    setStep("phone");
    setCode("");
    setExpiresAt(null);
    setCountdown(0);
  };

  // -------------------------
  // Render
  // -------------------------
  return (
    <AuthLayout title="ورود با کد یک‌بار مصرف" subtitle="برای ورود شماره موبایل خود را وارد کنید">
      {step === "phone" && (
        <>
          <input
            type="tel"
            maxLength={11}
            placeholder="شماره موبایل را وارد کنید"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-center direction-ltr focus:outline-none focus:border-blue-500"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <button
            onClick={() => sendOtp.mutate({ phone })}
            disabled={sendOtp.isPending}
            className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-all"
          >
            {sendOtp.isPending ? "در حال ارسال..." : "ارسال کد"}
          </button>
        </>
      )}

      {step === "otp" && (
        <>
          <p className="text-gray-700 mb-3">
            کد یک‌بار مصرف به شماره{" "}
            <span className="font-semibold text-blue-600">
              {phone.replace(/^(\d{3})(\d{3})(\d{4})$/, "09*** *** $3")}
            </span>{" "}
            ارسال شد.
          </p>

          <div className="flex justify-center gap-2 mb-4">
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-32 text-center border rounded-lg py-2 tracking-widest focus:border-blue-500 focus:outline-none"
              placeholder="کد ۶ رقمی"
            />
          </div>

          <button
            onClick={() => verifyOtp.mutate({ phone, code })}
            disabled={verifyOtp.isPending || !code}
            className="w-full bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700 transition-all"
          >
            {verifyOtp.isPending ? "در حال بررسی..." : "تأیید کد"}
          </button>

          <div className="mt-4 text-sm text-gray-600">
            {countdown > 0 ? (
              <p>می‌توانید تا {countdown} ثانیه دیگر کد جدید بگیرید.</p>
            ) : (
              <button
                onClick={handleResend}
                className="text-blue-600 font-medium hover:underline"
              >
                ارسال مجدد کد
              </button>
            )}
          </div>

          <p
            onClick={resetToPhoneStep}
            className="mt-3 text-blue-500 text-sm cursor-pointer hover:underline"
          >
            تغییر شماره تماس
          </p>
        </>
      )}
    </AuthLayout>
  );
}
