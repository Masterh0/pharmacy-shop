"use client";

import React, { useEffect, useState, useRef } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "react-hot-toast";
import { me, updateProfile, changePassword, User } from "@/lib/api/auth";
import { Calendar, Key, Profile } from "iconsax-react";
import DatePicker, { DateObject } from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import PersianDatePicker from "@/src/components/PersianDatePicker";
// یا از watch استفاده کن:

interface ProfileFormData {
  displayName: string;
  phone: string;
  currentPassword?: string;
  newPassword?: string;
  birthday?: string;
}

const AccountInfo = () => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [dateValue, setDateValue] = useState<DateObject | null>(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const datePickerRef = useRef<DatePicker>(null);

  const {
    watch,
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProfileFormData>();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await me();
        console.log("🔍 User data:", data.user);

        setUser(data.user);

        const fullName =
          `${data.user.name || ""} ${data.user.familyName || ""}`.trim();
        setValue("displayName", fullName || data.user.name || "");
        setValue("phone", data.user.phone || "");

        if (data.user.birthday) {
          try {
            const date = new DateObject({
              date: data.user.birthday,
              calendar: persian,
              locale: persian_fa,
            });
            console.log("📅 Parsed birthday:", date);
            setDateValue(date);
            setValue("birthday", date.format("YYYY/MM/DD"));
          } catch (err) {
            console.log("❌ Birthday parse error:", err);
          }
        }
      } catch (error) {
        toast.error("خطا در بارگذاری اطلاعات");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [setValue]);

  const onSubmit = async (data: ProfileFormData) => {
    setIsSubmitting(true);
    try {
      const [name, familyName] = data.displayName.trim().split(" ", 2);

      await updateProfile({
        name: name || "",
        familyName: familyName || "",
        birthday: data.birthday || undefined,
      });

      if (data.currentPassword && data.newPassword) {
        await changePassword({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        });
        toast.success("رمز عبور تغییر کرد");
      }

      toast.success("اطلاعات با موفقیت بروزرسانی شد");
    } catch (error: any) {
      toast.error(error.response?.data?.error || "خطایی رخ داد");
    } finally {
      setIsSubmitting(false);
    }
  };

  const DatePickerInput = ({ openCalendar, value }: any) => {
    let displayValue = "انتخاب تاریخ تولد";

    if (value) {
      try {
        if (value instanceof DateObject) {
          displayValue = value.format("YYYY/MM/DD");
        } else if (typeof value === "string") {
          displayValue = value;
        }
      } catch (err) {
        displayValue = "خطا در نمایش";
      }
    }

    return (
      <div
        className="flex items-center w-full h-16 px-4 border-2 border-gray-300 rounded-xl bg-white cursor-pointer hover:border-blue-500 hover:shadow-md transition-all duration-200"
        onClick={openCalendar}
      >
        <div className="flex-1 text-right pr-4">
          <input
            readOnly
            value={displayValue}
            className="w-full text-xl font-bold text-gray-900 bg-transparent border-none outline-none cursor-pointer py-2"
            placeholder="انتخاب تاریخ تولد"
          />
        </div>
        <Calendar className="w-7 h-7 text-blue-500" />
      </div>
    );
  };

  if (loading) {
    return <div className="text-center py-20 text-xl">در حال بارگذاری...</div>;
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-8 font-['IRANYekanX']">
      <div className="text-4xl font-bold text-gray-900 mb-12 text-right">
        اطلاعات حساب کاربری
      </div>

      <div className="border border-gray-200 rounded-3xl p-10 bg-gradient-to-br from-white to-gray-50 shadow-2xl">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
          {/* نام کامل */}
          <div className="space-y-3">
            <label className="block text-lg font-bold text-gray-800 text-right">
              نام کامل
            </label>
            <div className="relative">
              <input
                {...register("displayName", {
                  required: "نام کامل الزامی است",
                })}
                className="w-full h-16 px-6 pr-12 border-2 border-gray-300 rounded-2xl text-xl font-bold text-right focus:outline-none focus:border-blue-500 focus:shadow-lg transition-all duration-300 bg-white"
                placeholder="نام و نام خانوادگی"
              />
              <Profile className="absolute right-6 top-6 w-7 h-7 text-blue-500" />
            </div>
            {errors.displayName && (
              <p className="text-red-500 text-lg font-medium">
                {errors.displayName.message}
              </p>
            )}
          </div>

          {/* شماره موبایل */}
          <div className="space-y-3">
            <label className="block text-lg font-bold text-gray-800 text-right">
              شماره موبایل
            </label>
            <input
              {...register("phone")}
              disabled
              className="w-full h-16 px-6 border-2 border-gray-400 rounded-2xl text-xl text-right bg-gray-100 cursor-not-allowed"
            />
          </div>

          {/* تاریخ تولد */}
          <div className="space-y-3">
            <label className="block text-lg font-bold text-gray-800 text-right">
              تاریخ تولد
            </label>
            <PersianDatePicker
              value={watch("birthday")} // ISO format از دیتابیس
              onChange={(val) => setValue("birthday", val)} // ذخیره ISO
              placeholder="انتخاب تاریخ تولد"
            />
          </div>

          {/* رمز عبور */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="block text-lg font-bold text-gray-800 text-right">
                رمز عبور فعلی {user?.hasPassword ? "🔒" : "(اختیاری)"}
              </label>
              <div className="relative">
                <input
                  {...register("currentPassword")}
                  type={showCurrentPassword ? "text" : "password"}
                  className="w-full h-16 px-6 pr-12 pl-16 border-2 border-gray-300 rounded-2xl text-xl text-right focus:outline-none focus:border-blue-500 transition-all bg-white"
                  placeholder={
                    user?.hasPassword
                      ? "رمز عبور فعلی"
                      : "رمز عبور فعلی (اختیاری)"
                  }
                />
                <Key className="absolute right-6 top-6 w-7 h-7 text-gray-500" />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-gray-200 hover:bg-gray-300 rounded-lg flex items-center justify-center transition-all duration-200"
                >
                  <span className="text-2xl">
                    {showCurrentPassword ? "🙈" : "👁️"}
                  </span>
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-lg font-bold text-gray-800 text-right">
                رمز عبور جدید
              </label>
              <div className="relative">
                <input
                  {...register("newPassword")}
                  type={showNewPassword ? "text" : "password"}
                  className="w-full h-16 px-6 pr-12 pl-16 border-2 border-gray-300 rounded-2xl text-xl text-right focus:outline-none focus:border-blue-500 transition-all bg-white"
                  placeholder="رمز عبور جدید"
                />
                <Key className="absolute right-6 top-6 w-7 h-7 text-gray-500" />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-gray-200 hover:bg-gray-300 rounded-lg flex items-center justify-center transition-all duration-200"
                >
                  <span className="text-2xl">
                    {showNewPassword ? "🙈" : "👁️"}
                  </span>
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-20 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold text-2xl rounded-3xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 disabled:opacity-50 flex items-center justify-center gap-3"
          >
            {isSubmitting ? "در حال ثبت..." : "✅ ثبت اطلاعات"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AccountInfo;
