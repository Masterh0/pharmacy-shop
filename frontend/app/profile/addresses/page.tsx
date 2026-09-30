"use client";

import { useState } from "react";
import { addressApi } from "@/lib/api/address";
import type { Address } from "@/lib/types/address";
import ProvinceSelect from "./ProvinceSelect";
import CitySelect from "./CitySelect";
import { toast } from "sonner";
import { Edit2, Trash2, MapPin, Plus, Check, X } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const isValidIranPhone = (value: string) => /^09\d{9}$/.test(value);

export default function AddressesPage() {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    province: "",
    city: "",
    postalCode: "",
    street: "",
    isDefault: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [phoneValid, setPhoneValid] = useState(false);
  const [phoneTouched, setPhoneTouched] = useState(false);
  const queryClient = useQueryClient();

  const { data: addresses = [], isLoading: loading } = useQuery({
    queryKey: ["addresses"],
    queryFn: addressApi.list,
    staleTime: 5 * 60 * 1000,
  });

  const handleSubmit = async () => {
    setErrors({});
    if (
      !form.fullName ||
      !form.phone ||
      !form.province ||
      !form.city ||
      !form.street ||
      !form.postalCode
    ) {
      toast.error("لطفاً همه فیلدهای اجباری را پر کنید");
      return;
    }
    if (!isValidIranPhone(form.phone)) {
      toast.error("شماره موبایل معتبر نیست");
      return;
    }
    try {
      if (editingId) {
        await addressApi.update(editingId, {
          ...form,
          province: form.province || null,
          postalCode: form.postalCode || null,
        });
        toast.success("آدرس با موفقیت ویرایش شد");
      } else {
        await addressApi.create({
          ...form,
          province: form.province || null,
          postalCode: form.postalCode || null,
        });
        toast.success("آدرس با موفقیت اضافه شد");
      }
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
      resetForm();
    } catch (err: any) {
      toast.error("خطایی رخ داد");
    }
  };

  const resetForm = () => {
    setForm({
      fullName: "",
      phone: "",
      province: "",
      city: "",
      postalCode: "",
      street: "",
      isDefault: true,
    });
    setPhoneValid(false);
    setPhoneTouched(false);
    setErrors({});
    setEditingId(null);
  };

  const handleEdit = (addr: Address) => {
    setForm({
      fullName: addr.fullName,
      phone: addr.phone,
      province: addr.province || "",
      city: addr.city,
      postalCode: addr.postalCode || "",
      street: addr.street,
      isDefault: addr.isDefault,
    });
    setEditingId(addr.id);
    setPhoneValid(isValidIranPhone(addr.phone));
    setPhoneTouched(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: number) => {
    if (!confirm("مطمئنید می‌خواهید این آدرس را حذف کنید؟")) return;
    try {
      await addressApi.remove(id);
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
      toast.success("آدرس حذف شد");
      if (editingId === id) resetForm();
    } catch {
      toast.error("حذف انجام نشد");
    }
  };

  const handleSetDefault = async (id: number) => {
    try {
      await addressApi.setDefault(id);
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
      toast.success("آدرس پیش‌فرض تغییر کرد");
    } catch {
      toast.error("تغییر پیش‌فرض انجام نشد");
    }
  };

  return (
    // حذف پدینگ اضافی برای هماهنگی با لایوت
    <div className="w-full">
      <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6 sm:mb-8 text-right flex items-center gap-3">
        <MapPin className="text-[#00B4D8]" size={28} /> مدیریت آدرس‌ها
      </h1>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-8 mb-10">
        <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          {editingId ? (
            <>
              <Edit2 size={22} className="text-[#00B4D8]" />
              ویرایش آدرس
            </>
          ) : (
            <>
              <Plus size={22} className="text-[#00B4D8]" />
              افزودن آدرس جدید
            </>
          )}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          <Input
            label="نام و نام خانوادگی *"
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            error={errors.fullName}
          />
          <Input
            label="شماره موبایل *"
            value={form.phone}
            placeholder="09123456789"
            onChange={(e) => {
              const v = e.target.value.replace(/[^\d]/g, "").slice(0, 11);
              setForm({ ...form, phone: v });
              setPhoneTouched(true);
              setPhoneValid(isValidIranPhone(v));
            }}
            valid={phoneValid && phoneTouched}
            invalid={phoneTouched && !phoneValid && form.phone.length > 0}
            error={errors.phone}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
              استان *
            </label>
            <ProvinceSelect
              value={form.province}
              onChange={(v: string) =>
                setForm({ ...form, province: v, city: "" })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
              شهر *
            </label>
            <CitySelect
              province={form.province}
              value={form.city}
              onChange={(v: string) => setForm({ ...form, city: v })}
            />
          </div>

          <Input
            label="کد پستی *"
            value={form.postalCode}
            placeholder="1234567890"
            onChange={(e) =>
              setForm({
                ...form,
                postalCode: e.target.value.replace(/[^\d]/g, ""),
              })
            }
            error={errors.postalCode}
          />
          <div className="md:col-span-2">
            <Input
              label="آدرس کامل *"
              value={form.street}
              placeholder="مثال: خیابان آزادی، کوچه بهار، بن‌بست اول"
              onChange={(e) => setForm({ ...form, street: e.target.value })}
              error={errors.street}
            />
          </div>
        </div>

        <div className="flex items-center gap-3 mt-6">
          <input
            type="checkbox"
            id="default"
            checked={form.isDefault}
            onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
            className="w-5 h-5 text-[#00B4D8] rounded"
          />
          <label
            htmlFor="default"
            className="text-sm text-gray-700 cursor-pointer"
          >
            این آدرس را به عنوان پیش‌فرض تنظیم کن
          </label>
        </div>

        {/* دکمه‌ها در موبایل زیر هم قرار می‌گیرند */}
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 sm:gap-4 mt-8">
          <button
            onClick={resetForm}
            className="w-full sm:w-auto px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition flex items-center justify-center gap-2"
          >
            <X size={18} /> {editingId ? "لغو ویرایش" : "انصراف"}
          </button>
          <button
            onClick={handleSubmit}
            className="w-full sm:w-auto px-8 py-3 bg-[#00B4D8] text-white rounded-xl hover:bg-[#0096c7] transition font-medium flex items-center justify-center gap-2"
          >
            <Check size={20} /> {editingId ? "به‌روزرسانی" : "ثبت آدرس"}
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-800 mb-5">آدرس‌های من</h2>
        {loading ? (
          <div className="text-center py-12 text-gray-500">
            در حال بارگذاری...
          </div>
        ) : addresses.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-2xl">
            <p className="text-gray-500 mb-6">هنوز آدرسی ثبت نکرده‌اید</p>
          </div>
        ) : (
          addresses.map((addr) => (
            <div
              key={addr.id}
              className={`p-4 sm:p-6 rounded-2xl border-2 transition-all ${editingId === addr.id ? "border-yellow-400 bg-yellow-50" : addr.isDefault ? "border-[#00B4D8] bg-blue-50" : "border-gray-200"}`}
            >
              {/* در موبایل دکمه‌های عملیات به خط پایین می‌روند */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div className="flex-1 w-full">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <h3 className="font-bold text-lg">{addr.fullName}</h3>
                    {addr.isDefault && (
                      <span className="bg-[#00B4D8] text-white text-[11px] sm:text-xs px-2 py-1 rounded-full flex items-center gap-1">
                        <Check size={14} /> پیش‌فرض
                      </span>
                    )}
                    {editingId === addr.id && (
                      <span className="bg-yellow-500 text-white text-[11px] sm:text-xs px-2 py-1 rounded-full">
                        در حال ویرایش
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    {addr.province && `${addr.province}، `}
                    {addr.city}
                  </p>
                  <p className="text-sm text-gray-700 mt-1">{addr.street}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    کد پستی: {addr.postalCode}
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    موبایل: {addr.phone}
                  </p>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end border-t sm:border-0 pt-3 sm:pt-0 mt-2 sm:mt-0 border-gray-200">
                  <button
                    onClick={() => handleEdit(addr)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                    title="ویرایش"
                  >
                    <Edit2 size={20} />
                  </button>
                  {!addr.isDefault && (
                    <button
                      onClick={() => handleSetDefault(addr.id)}
                      className="px-3 py-2 text-sm bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                    >
                      پیش‌فرض
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(addr.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                    title="حذف"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  error,
  valid,
  invalid,
  placeholder,
}: any) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-gray-700 text-right">
        {label}
      </label>
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full px-4 py-3 rounded-xl border transition-all outline-none ${valid ? "border-green-500" : invalid ? "border-red-500" : "border-gray-300 focus:border-[#00B4D8]"}`}
        />
        {valid && (
          <Check
            className="absolute left-4 top-1/2 -translate-y-1/2 text-green-600"
            size={20}
          />
        )}
        {invalid && (
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-red-600 text-xl">
            ×
          </span>
        )}
      </div>
      {error && <p className="text-red-500 text-xs text-right">{error}</p>}
    </div>
  );
}
