"use client";

import { useEffect, useState } from "react";
import { addressApi } from "@/lib/api/address";
import type { Address } from "@/lib/types/address";
import ProvinceSelect from "./ProvinceSelect";
import CitySelect from "./CitySelect";
import { toast } from "sonner";
import { Edit2, Trash2, MapPin, Plus, Check } from "lucide-react";

const isValidIranPhone = (value: string) => /^09\d{9}$/.test(value);

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    setLoading(true);
    try {
      const data = await addressApi.list();
      setAddresses(data);
    } catch {
      toast.error("خطا در بارگذاری آدرس‌ها");
    } finally {
      setLoading(false);
    }
  };

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
      const newAddr = await addressApi.create({
        fullName: form.fullName,
        phone: form.phone,
        province: form.province || null,
        city: form.city,
        street: form.street,
        postalCode: form.postalCode || null,
        isDefault: form.isDefault,
      });

      setAddresses((prev) => [...prev, newAddr]);
      toast.success("آدرس با موفقیت اضافه شد");
      resetForm();
    } catch (err: unknown) {
      const axiosErr = err as {
        response?: { data?: { errors?: Array<{ path: string[]; message: string }> } };
      };

      const issues = axiosErr.response?.data?.errors;
      if (Array.isArray(issues)) {
        const newErrs: Record<string, string> = {};
        issues.forEach((i) => {
          if (i.path?.[0]) newErrs[i.path[0]] = i.message;
        });
        setErrors(newErrs);
      } else {
        toast.error("خطا در ثبت آدرس");
      }
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
  };

  const handleDelete = async (id: number) => {
    if (!confirm("مطمئنید می‌خواهید این آدرس را حذف کنید؟")) return;
    try {
      await addressApi.remove(id);
      setAddresses((prev) => prev.filter((a) => a.id !== id));
      toast.success("آدرس حذف شد");
    } catch {
      toast.error("حذف انجام نشد");
    }
  };

  const handleSetDefault = async (id: number) => {
    try {
      await addressApi.setDefault(id);
      setAddresses((prev) =>
        prev.map((a) => ({ ...a, isDefault: a.id === id }))
      );
      toast.success("آدرس پیش‌فرض تغییر کرد");
    } catch {
      toast.error("تغییر پیش‌فرض انجام نشد");
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-8 text-right flex items-center gap-3">
        <MapPin className="text-[#00B4D8]" size={28} />
        مدیریت آدرس‌ها
      </h1>

      {/* فرم افزودن آدرس */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-10">
        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <Plus size={22} className="text-[#00B4D8]" />
          افزودن آدرس جدید
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Input
            label="نام و نام خانوادگی *"
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            error={errors.fullName}
          />

          <Input
            label="شماره موبایل *"
            value={form.phone}
            onChange={(e) => {
              const v = e.target.value.replace(/[^\d]/g, "").slice(0, 11);
              setForm({ ...form, phone: v });
              setPhoneTouched(true);
              setPhoneValid(isValidIranPhone(v));
            }}
            valid={phoneValid && phoneTouched}
            invalid={phoneTouched && !phoneValid && form.phone.length > 0}
            error={errors.phone}
            placeholder="09123456789"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
              استان *
            </label>
            <ProvinceSelect
              value={form.province}
              onChange={(v: string) => setForm({ ...form, province: v, city: "" })}
            />
            {errors.province && (
              <p className="text-red-500 text-xs mt-1 text-right">{errors.province}</p>
            )}
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
            {errors.city && (
              <p className="text-red-500 text-xs mt-1 text-right">{errors.city}</p>
            )}
          </div>

          <Input
            label="کد پستی *"
            value={form.postalCode}
            onChange={(e) =>
              setForm({
                ...form,
                postalCode: e.target.value.replace(/[^\d]/g, ""),
              })
            }
            error={errors.postalCode}
            placeholder="1234567890"
          />

          <div className="md:col-span-2">
            <Input
              label="آدرس کامل *"
              value={form.street}
              onChange={(e) => setForm({ ...form, street: e.target.value })}
              error={errors.street}
              placeholder="مثال: خیابان آزادی، کوچه بهار، بن‌بست اول"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 mt-6">
          <input
            type="checkbox"
            id="default"
            checked={form.isDefault}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setForm({ ...form, isDefault: e.target.checked })
            }
            className="w-5 h-5 text-[#00B4D8] rounded"
          />
          <label htmlFor="default" className="text-sm text-gray-700 cursor-pointer">
            این آدرس را به عنوان پیش‌فرض تنظیم کن
          </label>
        </div>

        <div className="flex justify-end gap-4 mt-8">
          <button
            onClick={resetForm}
            className="px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition"
          >
            انصراف
          </button>
          <button
            onClick={handleSubmit}
            className="px-8 py-3 bg-[#00B4D8] text-white rounded-xl hover:bg-[#0096c7] transition font-medium flex items-center gap-2"
          >
            <Check size={20} />
            ثبت آدرس
          </button>
        </div>
      </div>

      {/* لیست آدرس‌ها */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-800 mb-5">آدرس‌های من</h2>

        {loading ? (
          <div className="text-center py-12 text-gray-500">در حال بارگذاری...</div>
        ) : addresses.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-2xl">
            <p className="text-gray-500 mb-6">هنوز آدرسی ثبت نکرده‌اید</p>
          </div>
        ) : (
          addresses.map((addr) => (
            <div
              key={addr.id}
              className={`p-6 rounded-2xl border-2 transition-all ${
                addr.isDefault
                  ? "border-[#00B4D8] bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-bold text-lg">{addr.fullName}</h3>
                    {addr.isDefault && (
                      <span className="bg-[#00B4D8] text-white text-xs px-3 py-1 rounded-full flex items-center gap-1">
                        <Check size={14} />
                        پیش‌فرض
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-gray-500 mt-1">کد پستی: {addr.postalCode}</p>
                  <p className="text-sm text-gray-600 mt-2">موبایل: {addr.phone}</p>
                </div>

                <div className="flex gap-3">
                  {!addr.isDefault && (
                    <button
                      onClick={() => handleSetDefault(addr.id)}
                      className="px-4 py-2 text-sm bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                    >
                      پیش‌فرض
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(addr.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
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

/* ------------------------------------------
   کامپوننت Input بدون any
------------------------------------------ */

interface InputProps {
  label: string;
  value: string;
  error?: string;
  valid?: boolean;
  invalid?: boolean;
  placeholder?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

function Input({
  label,
  value,
  onChange,
  error,
  valid,
  invalid,
  placeholder,
}: InputProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-gray-700 text-right">{label}</label>

      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full px-4 py-3 rounded-xl border transition-all outline-none ${
            valid
              ? "border-green-500"
              : invalid
              ? "border-red-500"
              : "border-gray-300 focus:border-[#00B4D8]"
          } ${error ? "border-red-500" : ""}`}
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
