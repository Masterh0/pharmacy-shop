"use client";
import React, { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query"; // ✅ اضافه شد
import { sendLoginOtp, verifyLoginOtp } from "@/lib/api/auth"; // ⚠️ مطمئن شوید این توابع در auth.ts اکسپورت شده‌اند
import { useRouter } from "next/navigation";
import type { AxiosError } from "axios";
import { toast } from "sonner";
import AuthLayout from "../../authComponents/AuthLayout";
import BackButton from "@/app/authComponents/BackButton";
import { useAuthRedirect } from "@/lib/hooks/useAuthRedirect";
import { AUTH_KEY } from "@/lib/constants/auth";
// ✅ تعریف AUTH_KEY برای Invalidate کردن کش

// ---------------------------
// ✅ تعریف تایپ‌های پاسخ API
// ---------------------------
type SendOtpResponse = {
  expiresAt?: string;
  remainingMs?: number;
};

type VerifyOtpResponse = {
  user: {
    id: number;
    role: "ADMIN" | "CUSTOMER" | "STAFF"; // یا همان UserRole شما
    phone: string;
    name: string;
  };
};

// ---------------------------
// ✅ تعریف تایپ خطای API (برای تمیزکاری)
// ---------------------------
type ApiError = AxiosError<{
  error?: string;
  message?: string;
  remainingMs?: number;
  expiresAt?: string;
}>;

export default function LoginOtpPage() {
  // --------------------
  // ✅ Hooks (همه در بالا و مرتب)
  // --------------------
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [countdown, setCountdown] = useState(0);
  // REMOVE: const [expiresAt, setExpiresAt] = useState<string | null>(null);

  const qc = useQueryClient(); // ✅ اضافه شد
  const router = useRouter();
  const status = useAuthRedirect(); // ✅ استفاده از خروجی هوک برای گارد

  /* 🟦 Mutation ارسال OTP */
  const sendOtp = useMutation<SendOtpResponse, ApiError, { phone: string }>({
    mutationFn: sendLoginOtp,
    onSuccess: (data) => {
      setStep("otp");
      if (data.expiresAt) {
        const remain = new Date(data.expiresAt).getTime() - Date.now();
        setCountdown(Math.floor(remain / 1000));
        // REMOVE: setExpiresAt(data.expiresAt); // ✅ حذف شد
      }
      toast.success("کد ارسال شد ✅");
    },
    onError: (err) => {
      const msg = err.response?.data?.error || err.response?.data?.message;
      if (err.response?.status === 429 && msg?.includes("کد فعال ارسال شده")) {
        const { expiresAt, remainingMs } = err.response?.data || {};
        setStep("otp");
        setCountdown(Math.floor((remainingMs || 0) / 1000));
        // REMOVE: setExpiresAt(expiresAt || null); // ✅ حذف شد
        toast.info(msg);
      } else {
        toast.error(msg || "خطایی رخ داد.");
      }
    },
  });

  /* 🟦 Mutation تأیید OTP */
  const verifyOtp = useMutation<
    VerifyOtpResponse,
    ApiError,
    { phone: string; code: string }
  >({
    mutationFn: verifyLoginOtp,
    onSuccess: (data) => {
      // ✅ معماری جدید: وضعیت کاربر را از سرور واکشی کنید
      qc.setQueryData(AUTH_KEY, data.user);
      console.log("✅ AUTH CACHE:", qc.getQueryData(AUTH_KEY));
      toast.success("ورود موفقیت‌آمیز ✅");
      router.push(data.user.role === "ADMIN" ? "/admin/dashboard" : "/");
    },
    onError: (err) => {
      toast.error(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "کد وارد شده نادرست است."
      );
    },
  });

  /* 🕒 شمارش معکوس */
  useEffect(() => {
    if (!countdown) return;
    const timer = setInterval(
      () => setCountdown((t) => (t > 0 ? t - 1 : 0)),
      1000
    );
    return () => clearInterval(timer);
  }, [countdown]);

  /* 🔘 هندل ارسال و تأیید */
  const handleSend = () => {
    if (phone && !sendOtp.isPending) sendOtp.mutate({ phone });
  };

  const handleVerify = () => {
    if (code && !verifyOtp.isPending) verifyOtp.mutate({ phone, code });
  };

  const handleResend = () => {
    if (!countdown) sendOtp.mutate({ phone });
  };

  const resetToPhone = () => {
    setStep("phone");
    setCode("");
    setCountdown(0);
  };

  // --------------------
  // ✅ Guards (بعد از Hooks)
  // --------------------
  if (status === "checking") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <p className="animate-pulse text-[#00B4D8]">
          در حال بررسی وضعیت ورود...
        </p>
      </div>
    );
  }

  if (status === "redirecting") return null;

  return (
    <AuthLayout>
      <BackButton fallback="/" />
      <div className="flex flex-col items-center justify-center w-full mt-24 px-6 text-center">
        {step === "phone" && (
          <div className="flex flex-col gap-4 items-center w-[288px]">
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
              onChange={(e) => setPhone(e.target.value)}
              className="w-full h-[40px] border border-[#656565] rounded-[8px] px-[8px] text-right text-[14px] focus:ring-2 focus:ring-[#00B4D8]"
              placeholder="مثلاً 09123456789"
            />
            <button
              onClick={handleSend}
              disabled={sendOtp.isPending || !phone}
              className="w-full h-[40px] bg-[#00B4D8] text-white rounded-[8px] text-[14px] font-[500]"
            >
              {sendOtp.isPending ? "در حال ارسال..." : "ارسال کد"}
            </button>
          </div>
        )}

        {step === "otp" && (
          <div className="flex flex-col gap-4 items-center w-[288px] relative">
            {verifyOtp.isPending && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm rounded-lg">
                <div className="animate-spin w-8 h-8 border-4 border-[#00B4D8] border-t-transparent rounded-full" />
                <p className="mt-4 text-[#171717] text-[16px] font-medium">
                  در حال بررسی کد و ورود...
                </p>
              </div>
            )}

            {!verifyOtp.isPending && (
              <>
                <p className="text-[#171717] text-[16px] mb-1">
                  کد به شماره زیر ارسال شد:
                </p>
                <p className="font-[500] text-[#00B4D8]">
                  {phone.replace(/^(\d{3})(\d{3})(\d{4})$/, "09*** *** $3")}
                </p>

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
                  onClick={handleVerify}
                  disabled={!code}
                  className="w-full h-[40px] bg-[#00B4D8] text-white rounded-[8px] text-[14px] font-[500]"
                >
                  تأیید کد
                </button>

                <div className="text-[12px] text-[#434343] mt-1">
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
              </>
            )}
          </div>
        )}
      </div>
    </AuthLayout>
  );
}
