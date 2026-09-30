"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import {
  updateProfile,
  changePassword,
  sendLoginOtp,
  verifyLoginOtp,
} from "@/lib/api/auth";
import {
  Key,
  Profile,
  Calendar,
  Lock,
  Edit2,
  ShieldTick,
  Eye,
  EyeSlash,
} from "iconsax-react";
import PersianDatePicker from "@/src/components/PersianDatePicker";
import { useAuth } from "@/lib/context/AuthContext";
import { useRouter } from "next/navigation";
import { toJalaali } from "jalaali-js";

export const formatToPersianDate = (isoString?: string | null): string => {
  if (!isoString) return "ثبت نشده";
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return "ثبت نشده";
    const j = toJalaali(d.getFullYear(), d.getMonth() + 1, d.getDate());
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${j.jy}/${pad(j.jm)}/${pad(j.jd)}`.replace(
      /\d/g,
      (d) => "۰۱۲۳۴۵۶۷۸۹"[+d],
    );
  } catch {
    return "ثبت نشده";
  }
};
interface ProfileFormData {
  name: string;
  email: string;
  birthday?: string;
  currentPassword?: string;
  newPassword?: string;
}

export default function AccountInfo() {
  const router = useRouter();
  const { user, refreshUser, isLoading: isAuthLoading, logout } = useAuth();

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isEditingBirthday, setIsEditingBirthday] = useState(false);

  // وضعیت‌های OTP
  const [otpStep, setOtpStep] = useState<"idle" | "sent" | "verified">("idle");
  const [otpCode, setOtpCode] = useState("");
  const [otpTimer, setOtpTimer] = useState(0);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProfileFormData>();

  const selectedBirthday = watch("birthday");

  useEffect(() => {
    if (!user) return;
    setValue("name", user.name || "");
    setValue("email", user.email || "");
    setValue("birthday", user.birthday || "");
  }, [user, setValue]);

  // تایمر OTP
  useEffect(() => {
    if (otpTimer <= 0) return;
    const timer = setInterval(() => setOtpTimer((p) => p - 1), 1000);
    return () => clearInterval(timer);
  }, [otpTimer]);

  // Mutations با استفاده از TanStack Query
  const updateProfileMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: async () => {
      toast.success("اطلاعات پروفایل با موفقیت بروزرسانی شد");
      setIsEditingBirthday(false);
      await refreshUser();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || "خطا در ذخیره اطلاعات پروفایل");
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: changePassword,
    onSuccess: async () => {
      toast.success("رمز عبور تغییر یافت. جهت امنیت بیشتر مجدداً وارد شوید");
      if (logout) {
        await logout();
      }
      router.push("/login");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || "خطا در تغییر رمز عبور");
    },
  });

  const sendOtpMutation = useMutation({
    mutationFn: sendLoginOtp,
    onSuccess: () => {
      setOtpStep("sent");
      setOtpTimer(120);
      toast.success("کد تایید به شماره شما پیامک شد");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || "خطا در ارسال کد تایید");
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: verifyLoginOtp,
    onSuccess: () => {
      setOtpStep("verified");
      toast.success("هویت شما تایید شد. اکنون رمز جدید را وارد کنید");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || "کد وارد شده نامعتبر است");
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    // ۱. آپدیت اطلاعات کاربری
    await updateProfileMutation.mutateAsync({
      name: data.name || undefined,
      email: data.email || undefined,
      birthday: data.birthday || undefined,
    });

    // ۲. تغییر پسورد (اگر پر شده باشد)
    if (data.newPassword) {
      if (!user?.hasPassword && otpStep !== "verified") {
        toast.error("لطفاً ابتدا کد تایید پیامک‌شده را وارد کنید");
        return;
      }
      if (user?.hasPassword && !data.currentPassword) {
        toast.error("وارد کردن رمز عبور فعلی الزامی است");
        return;
      }

      await changePasswordMutation.mutateAsync({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
    }
  };

  const isSaving =
    updateProfileMutation.isPending || changePasswordMutation.isPending;

  if (isAuthLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-[#00B4D8]/30 border-t-[#00B4D8] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-6 sm:mb-8 border-b border-gray-100 pb-4">
        <h1 className="text-xl sm:text-2xl font-bold text-[#242424] flex items-center gap-2">
          <Profile className="text-[#00B4D8]" size={24} />
          اطلاعات حساب کاربری
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          مشخصات هویتی و رمز عبور خود را مدیریت کنید
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* مشخصات عمومی */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {/* نام */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              نام و نام خانوادگی *
            </label>
            <div className="relative">
              <input
                {...register("name", { required: "وارد کردن نام الزامی است" })}
                className="w-full h-12 px-4 pr-10 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-[#00B4D8] transition-colors"
                placeholder="نام کامل خود را وارد کنید"
              />
              <Profile
                className="absolute right-3 top-3.5 text-gray-400"
                size={18}
              />
            </div>
            {errors.name && (
              <p className="text-red-500 text-xs mt-1.5">
                {errors.name.message}
              </p>
            )}
          </div>

          {/* ایمیل */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ایمیل
            </label>
            <input
              {...register("email", {
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "فرمت ایمیل نامعتبر است",
                },
              })}
              type="email"
              dir="ltr"
              className="w-full h-12 px-4 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-[#00B4D8] transition-colors text-right"
              placeholder="example@mail.com"
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1.5">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* شماره موبایل */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              شماره موبایل (غیرقابل تغییر)
            </label>
            <input
              value={user?.phone || ""}
              disabled
              dir="ltr"
              className="w-full h-12 px-4 border border-gray-200 rounded-xl text-sm bg-gray-100 text-gray-500 cursor-not-allowed text-right font-mono"
            />
          </div>

          {/* تاریخ تولد همراه با امکان ویرایش صریح */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">
                تاریخ تولد
              </label>
              {user?.birthday && !isEditingBirthday && (
                <button
                  type="button"
                  onClick={() => setIsEditingBirthday(true)}
                  className="text-xs text-[#00B4D8] hover:underline flex items-center gap-1"
                >
                  <Edit2 size={12} /> ویرایش تاریخ
                </button>
              )}
            </div>

            {user?.birthday && !isEditingBirthday ? (
              <div className="w-full h-12 px-4 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-between text-sm text-gray-700">
                <span className="font-medium text-gray-800">
                  {formatToPersianDate(user.birthday)}
                </span>
                <Calendar size={18} className="text-gray-400" />
              </div>
            ) : (
              <div className="relative">
                <PersianDatePicker
                  value={selectedBirthday}
                  onChange={(val) => setValue("birthday", val)}
                  placeholder="انتخاب تاریخ تولد"
                />
              </div>
            )}
          </div>
        </div>

        {/* بخش رمز عبور */}
        <div className="border-t border-gray-100 pt-6 mt-6">
          <h2 className="text-base sm:text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Lock className="text-[#00B4D8]" size={20} />
            {user?.hasPassword ? "تغییر رمز عبور" : "تعیین رمز عبور برای حساب"}
          </h2>

          {/* کاربر بدون پسورد (احراز با OTP) */}
          {!user?.hasPassword && (
            <div className="bg-[#E0F7FA]/40 border border-[#00B4D8]/20 rounded-xl p-4 mb-5">
              <p className="text-xs sm:text-sm text-[#0077B6] mb-3">
                برای ثبت کلمه عبور ابتدا باید هویت شما از طریق ارسال پیامک تایید
                شود.
              </p>

              {otpStep === "idle" && (
                <button
                  type="button"
                  onClick={() =>
                    user?.phone && sendOtpMutation.mutate({ phone: user.phone })
                  }
                  disabled={sendOtpMutation.isPending}
                  className="h-10 px-4 bg-[#00B4D8] text-white text-xs sm:text-sm font-medium rounded-lg hover:bg-[#0090A8] transition disabled:opacity-50"
                >
                  {sendOtpMutation.isPending
                    ? "در حال ارسال..."
                    : "ارسال پیامک تایید"}
                </button>
              )}

              {otpStep === "sent" && (
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <input
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    maxLength={6}
                    dir="ltr"
                    className="w-full sm:w-40 h-11 px-3 border border-[#00B4D8] rounded-lg text-center font-mono text-base focus:outline-none"
                    placeholder="کد ۶ رقمی"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      user?.phone &&
                      verifyOtpMutation.mutate({
                        phone: user.phone,
                        code: otpCode,
                      })
                    }
                    disabled={verifyOtpMutation.isPending || otpCode.length < 4}
                    className="w-full sm:w-auto h-11 px-5 bg-green-600 text-white text-xs sm:text-sm font-medium rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                  >
                    {verifyOtpMutation.isPending
                      ? "در حال بررسی..."
                      : "تایید کد"}
                  </button>

                  <span className="text-xs text-gray-500">
                    {otpTimer > 0 ? (
                      `ارسال مجدد تا ${otpTimer} ثانیه`
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          user?.phone &&
                          sendOtpMutation.mutate({ phone: user.phone })
                        }
                        className="text-[#00B4D8] hover:underline"
                      >
                        ارسال مجدد کد
                      </button>
                    )}
                  </span>
                </div>
              )}

              {otpStep === "verified" && (
                <div className="flex items-center gap-1.5 text-green-700 text-xs sm:text-sm font-medium">
                  <ShieldTick size={18} /> هویت شما با موفقیت تایید شد. رمز جدید
                  را در کادر زیر وارد کنید.
                </div>
              )}
            </div>
          )}

          {/* فیلدهای پسورد */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {user?.hasPassword && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  رمز عبور فعلی
                </label>
                <div className="relative">
                  <input
                    {...register("currentPassword")}
                    type={showCurrentPassword ? "text" : "password"}
                    dir="ltr"
                    className="w-full h-12 px-4 pr-10 pl-10 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-[#00B4D8]"
                    placeholder="••••••••"
                  />
                  <Key
                    className="absolute right-3 top-3.5 text-gray-400"
                    size={18}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute left-3 top-3.5 text-gray-400 hover:text-gray-600"
                  >
                    {showCurrentPassword ? (
                      <EyeSlash size={18} color="black" />
                    ) : (
                      <Eye size={18} color="black" />
                    )}
                  </button>
                </div>
              </div>
            )}

            {(user?.hasPassword || otpStep === "verified") && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  رمز عبور جدید
                </label>
                <div className="relative">
                  <input
                    {...register("newPassword", {
                      minLength: {
                        value: 6,
                        message: "رمز عبور باید حداقل ۶ کاراکتر باشد",
                      },
                    })}
                    type={showNewPassword ? "text" : "password"}
                    dir="ltr"
                    className="w-full h-12 px-4 pr-10 pl-10 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-[#00B4D8]"
                    placeholder="حداقل ۶ کاراکتر"
                  />
                  <Key
                    className="absolute right-3 top-3.5 text-gray-400"
                    size={18}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute left-3 top-3.5 text-gray-400 hover:text-gray-600"
                  >
                    {showNewPassword ? (
                      <EyeSlash size={18} color="black" />
                    ) : (
                      <Eye size={18} color="black"/>
                    )}
                  </button>
                </div>
                {errors.newPassword && (
                  <p className="text-red-500 text-xs mt-1.5">
                    {errors.newPassword.message}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* دکمه ثبت فرم */}
        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="w-full sm:w-auto min-w-[180px] h-12 bg-[#00B4D8] hover:bg-[#0090A8] text-white font-medium text-sm sm:text-base rounded-xl transition shadow-md hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                <span>در حال ذخیره...</span>
              </>
            ) : (
              <span>ذخیره تغییرات</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
