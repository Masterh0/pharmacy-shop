"use client";

import { useEffect, useState } from "react";
import { addressApi } from "@/lib/api/address";
import type { Address } from "@/lib/types/address";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { useLoginRequired } from "@/lib/hooks/useLoginRequired";
import LoginRequiredModal from "@/src/components/modals/LoginRequiredModal";
import ProvinceSelect from "../../profile/addresses/ProvinceSelect";
import CitySelect from "../../profile/addresses/CitySelect";
import { Check, Plus, MapPin } from "lucide-react";
import { useCheckout } from "@/lib/context/CheckoutContext";

const isValidIranPhone = (value: string) => /^09\d{9}$/.test(value);

export default function AddressPage() {
  const router = useRouter();
  const { setAddressId } = useCheckout();
  const {
    user,
    isLoading: isAuthLoading,
    showModal,
    requireLogin,
    goToLogin,
    goToSignup,
    closeModal,
  } = useLoginRequired();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<number | null>(null);

  // ── فرم افزودن آدرس ──
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
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

  // 🔐 چک لاگین
  useEffect(() => {
    if (!isAuthLoading) requireLogin("/checkout/address");
  }, [isAuthLoading, requireLogin]);

  // بارگذاری آدرس‌ها
  useEffect(() => {
    if (!user) return;
    async function load() {
      try {
        const res = await addressApi.list();
        setAddresses(res);
        const def = res.find((a) => a.isDefault);
        if (def) setSelected(def.id);
        // اگر آدرسی نداشت، فرم رو باز کن
        if (res.length === 0) setShowForm(true);
      } catch {
        toast.error("مشکلی در بارگذاری آدرس‌ها پیش آمد");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

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
    setErrors({});
    setPhoneValid(false);
    setPhoneTouched(false);
  };

  const handleAddAddress = async () => {
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

    setSubmitting(true);
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

      // ✅ اضافه کردن به لیست + انتخاب خودکار
      setAddresses((prev) => [...prev, newAddr]);
      setSelected(newAddr.id);
      toast.success("آدرس با موفقیت اضافه شد");
      resetForm();
      setShowForm(false);
    } catch (err: unknown) {
      const axiosErr = err as {
        response?: {
          data?: { errors?: Array<{ path: string[]; message: string }> };
        };
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
    } finally {
      setSubmitting(false);
    }
  };

  const handleContinue = () => {
    if (!selected) {
      toast.error("لطفاً یک آدرس انتخاب کنید");
      return;
    }
    setAddressId(selected); // ✅ ذخیره در Context
    router.push("/checkout/payment"); // ✅ هدایت به صفحه پرداخت
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#00B4D8] border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <p className="text-[#666] font-IRANYekanX">
            لطفاً برای ادامه وارد شوید
          </p>
        </div>
        <LoginRequiredModal
          isOpen={showModal}
          onClose={closeModal}
          onLogin={goToLogin}
          onSignup={goToSignup}
        />
      </>
    );
  }

  if (loading) {
    return (
      <div className="py-20 text-center text-gray-500">در حال بارگذاری...</div>
    );
  }

  return (
    <div className="w-full flex justify-center px-4 py-8">
      <div className="w-full max-w-[800px]">
        <h1 className="text-xl font-bold mb-6 text-[#0077B6] text-center">
          انتخاب آدرس تحویل
        </h1>

        {/* ── لیست آدرس‌ها ── */}
        {addresses.length > 0 && (
          <div className="flex flex-col gap-4 mb-4">
            {addresses.map((addr) => (
              <label
                key={addr.id}
                className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition ${
                  selected === addr.id
                    ? "border-[#00B4D8] bg-blue-50"
                    : "border-gray-300 hover:border-[#00B4D8]"
                }`}
              >
                <input
                  type="radio"
                  name="address"
                  checked={selected === addr.id}
                  onChange={() => setSelected(addr.id)}
                  className="mt-1"
                />
                <div>
                  <p className="font-semibold text-[#0077B6]">
                    {addr.fullName}
                  </p>
                  <p className="text-sm text-gray-600">
                    {addr.province}، {addr.city}، {addr.street}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    کد پستی: {addr.postalCode}
                  </p>
                  {addr.isDefault && (
                    <span className="inline-block mt-2 text-xs text-white bg-[#00B4D8] px-2 py-1 rounded">
                      آدرس پیش‌فرض
                    </span>
                  )}
                </div>
              </label>
            ))}
          </div>
        )}

        {/* ── دکمه نمایش فرم ── */}
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="w-full py-3 border border-dashed border-[#00B4D8] text-[#00B4D8] rounded-lg hover:bg-[#F0F9FF] transition flex items-center justify-center gap-2 mb-6"
          >
            <Plus size={18} />
            افزودن آدرس جدید
          </button>
        )}

        {/* ── فرم افزودن آدرس ── */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow border border-gray-100 p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
              <MapPin size={20} className="text-[#00B4D8]" />
              {addresses.length === 0 ? "ثبت اولین آدرس" : "افزودن آدرس جدید"}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                label="نام و نام خانوادگی *"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                error={errors.fullName}
              />

              <FormInput
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
                  onChange={(v: string) =>
                    setForm({ ...form, province: v, city: "" })
                  }
                />
                {errors.province && (
                  <p className="text-red-500 text-xs mt-1 text-right">
                    {errors.province}
                  </p>
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
                  <p className="text-red-500 text-xs mt-1 text-right">
                    {errors.city}
                  </p>
                )}
              </div>

              <FormInput
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
                <FormInput
                  label="آدرس کامل *"
                  value={form.street}
                  onChange={(e) => setForm({ ...form, street: e.target.value })}
                  error={errors.street}
                  placeholder="مثال: خیابان آزادی، کوچه بهار، بن‌بست اول"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 mt-4">
              <input
                type="checkbox"
                id="default"
                checked={form.isDefault}
                onChange={(e) =>
                  setForm({ ...form, isDefault: e.target.checked })
                }
                className="w-4 h-4 text-[#00B4D8] rounded"
              />
              <label
                htmlFor="default"
                className="text-sm text-gray-700 cursor-pointer"
              >
                تنظیم به عنوان آدرس پیش‌فرض
              </label>
            </div>

            <div className="flex gap-3 mt-6">
              {addresses.length > 0 && (
                <button
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  className="px-5 py-2.5 border border-gray-300 rounded-xl hover:bg-gray-50 transition text-sm"
                >
                  انصراف
                </button>
              )}
              <button
                onClick={handleAddAddress}
                disabled={submitting}
                className="flex-1 py-2.5 bg-[#00B4D8] text-white rounded-xl hover:bg-[#0096c7] transition font-medium flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {submitting ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    <Check size={18} />
                    ثبت آدرس
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ── دکمه ادامه ── */}
        {addresses.length > 0 && !showForm && (
          <button
            onClick={handleContinue}
            className="w-full py-3 bg-[#00B4D8] text-white rounded-lg font-medium hover:bg-[#0096c7] transition"
          >
            ادامه به مرحله پرداخت
          </button>
        )}
      </div>
    </div>
  );
}

/* ── کامپوننت Input ── */
interface FormInputProps {
  label: string;
  value: string;
  error?: string;
  valid?: boolean;
  invalid?: boolean;
  placeholder?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

function FormInput({
  label,
  value,
  onChange,
  error,
  valid,
  invalid,
  placeholder,
}: FormInputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-gray-700 text-right">
        {label}
      </label>
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full px-4 py-2.5 rounded-xl border transition-all outline-none ${
            valid
              ? "border-green-500"
              : invalid || error
                ? "border-red-500"
                : "border-gray-300 focus:border-[#00B4D8]"
          }`}
        />
        {valid && (
          <Check
            className="absolute left-3 top-1/2 -translate-y-1/2 text-green-600"
            size={18}
          />
        )}
        {invalid && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-red-600 text-lg">
            ×
          </span>
        )}
      </div>
      {error && <p className="text-red-500 text-xs text-right">{error}</p>}
    </div>
  );
}
