"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { sendLoginOtp, verifyLoginOtp } from "@/lib/api/auth";
import { useAuthStore } from "@/lib/stores/authStore";
import { useRouter } from "next/navigation";
import type { AxiosError } from "axios";
import { toast } from "sonner";
import AuthLayout from "../../authComponents/AuthLayout";

export default function LoginOtpPage() {
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [countdown, setCountdown] = useState(0);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const setAuth = useAuthStore((s) => s.setAuth);
  const router = useRouter();

  const sendOtp = useMutation({
    mutationFn: (data: { phone: string }) => sendLoginOtp(data),
    onSuccess: (data) => {
      setStep("otp");
      if (data.expiresAt) {
        const remain = new Date(data.expiresAt).getTime() - Date.now();
        setCountdown(Math.floor(remain / 1000));
        setExpiresAt(data.expiresAt);
      }
      toast.success("کد ارسال شد ✅");
    },
    onError: (err: AxiosError<{ error?: string; message?: string }>) => {
      toast.error(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "خطایی رخ داد."
      );
    },
  });

  const verifyOtp = useMutation({
    mutationFn: (data: { phone: string; code: string }) => verifyLoginOtp(data),
    onSuccess: (data) => {
      console.log("✅ OTP VERIFY RESPONSE:", data); // 👈 دقیق می‌بینیم چی برگشته
      setAuth({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        role: data.user.role,
        userId: data.user.id,
        phone: data.user.phone,
        name: data.user.name,
      });
      toast.success("ورود موفقیت‌آمیز ✅");
      if (data.user.role === "ADMIN") router.push("/admin/dashboard");
      else router.push("/");
    },
    onError: (err: AxiosError<{ error?: string; message?: string }>) => {
      toast.error(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "کد وارد شده نادرست است."
      );
    },
  });

  useEffect(() => {
    if (!countdown) return;
    const interval = setInterval(() => {
      setCountdown((t) => (t > 0 ? t - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [countdown]);

  const handleResend = () => {
    if (!countdown) sendOtp.mutate({ phone });
  };

  const resetToPhone = () => {
    setStep("phone");
    setCode("");
    setCountdown(0);
  };

  return (
    <AuthLayout>
      <div className="flex flex-col items-center justify-center w-full min-h-screen relative px-6">
        {/* Back */}
        <div className="absolute flex items-center gap-[10px] left-[76px] top-[54px]">
          <span className="text-[24px] text-[#171717]">↩</span>
          <Link href="/login" className="text-[18px] text-[#171717]">
            بازگشت
          </Link>
        </div>

        {/* Title */}
        <div className="flex flex-col items-center gap-[8px] mt-20 mb-6 text-center">
          <h1 className="text-[32px] font-bold text-[#171717]">
            ورود با کد یک‌بار مصرف
          </h1>
          <p className="text-[16px] text-[#656565]">
            شماره موبایل خود را وارد کنید تا کد ارسال شود
          </p>
        </div>

        {step === "phone" && (
          <div className="flex flex-col gap-4 items-center w-[288px]">
            <label className="w-full text-right text-[14px] text-[#656565]">
              شماره موبایل
            </label>
            <input
              type="tel"
              maxLength={11}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full h-[40px] border border-[#656565] rounded-[8px] px-[8px] text-right text-[14px] focus:ring-2 focus:ring-[#00B4D8]"
              placeholder="مثلاً 09123456789"
            />
            <button
              onClick={() => sendOtp.mutate({ phone })}
              disabled={sendOtp.isPending}
              className="w-full h-[40px] bg-[#00B4D8] text-white rounded-[8px] text-[14px] font-[500]"
            >
              {sendOtp.isPending ? "در حال ارسال..." : "ارسال کد"}
            </button>
          </div>
        )}

        {step === "otp" && (
          <div className="flex flex-col gap-4 items-center w-[288px]">
            <div className="text-center">
              <p className="text-[#171717] text-[16px] mb-1">
                کد به شماره زیر ارسال شد:
              </p>
              <p className="font-[500] text-[#00B4D8]">
                {phone.replace(/^(\d{3})(\d{3})(\d{4})$/, "09*** *** $3")}
              </p>
            </div>

            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="کد ۶ رقمی"
              className="w-full h-[40px] border border-[#656565] rounded-[8px] text-center tracking-widest focus:ring-2 focus:ring-[#00B4D8]"
            />

            <button
              onClick={() => verifyOtp.mutate({ phone, code })}
              disabled={verifyOtp.isPending || !code}
              className="w-full h-[40px] bg-[#00B4D8] text-white rounded-[8px] text-[14px] font-[500]"
            >
              {verifyOtp.isPending ? "در حال بررسی..." : "تأیید کد"}
            </button>

            <div className="text-[12px] text-[#434343]">
              {countdown > 0 ? (
                <p>امکان ارسال مجدد تا {countdown} ثانیه دیگر</p>
              ) : (
                <button
                  onClick={handleResend}
                  className="text-[#00B4D8] font-[500] hover:underline"
                >
                  ارسال مجدد کد
                </button>
              )}
            </div>

            <p
              onClick={resetToPhone}
              className="text-blue-500 text-[13px] cursor-pointer hover:underline mt-2"
            >
              تغییر شماره تماس
            </p>
          </div>
        )}
      </div>
    </AuthLayout>
  );
}
