"use client";

import { useEffect, useState } from "react";
import { addressApi } from "@/lib/api/address";
import type { Address } from "@/lib/types/address";
import ProvinceSelect from "./ProvinceSelect";
import CitySelect from "./CitySelect";
import { toast } from "sonner";

const isValidIranPhone = (value: string) => /^09\d{9}$/.test(value);

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(false);

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [phoneValid, setPhoneValid] = useState(false);
  const [phoneInvalid, setPhoneInvalid] = useState(false);

  const [form, setForm] = useState<
    Omit<Address, "id" | "userId" | "createdAt" | "updatedAt">
  >({
    fullName: "",
    phone: "",
    province: "",
    city: "",
    postalCode: "",
    street: "",
    isDefault: false,
    lat: undefined,
    lng: undefined,
  });

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    setLoading(true);
    try {
      const data = await addressApi.list();
      setAddresses(data);
    } catch {
      toast.error("خطا در دریافت اطلاعات");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    setFieldErrors({});

    try {
      const newAddress = await addressApi.create(form);
      setAddresses([...addresses, newAddress]);
      toast.success("آدرس ثبت شد");
      resetForm();
    } catch (err: any) {
      const issues = err?.response?.data?.errors;

      if (Array.isArray(issues)) {
        const newE: Record<string, string> = {};
        issues.forEach((i) => {
          const f = i.path?.[0];
          if (f) newE[f] = i.message;
        });

        setFieldErrors(newE);
        return;
      }

      toast.error(err?.response?.data?.message || "خطای ناشناخته");
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
      isDefault: false,
      lat: undefined,
      lng: undefined,
    });

    setPhoneValid(false);
    setPhoneInvalid(false);
    setFieldErrors({});
  };

  return (
    <div className="max-w-[808px] mx-auto border border-[#EDEDED] rounded-xl p-6 font-[IRANYekanX]">
      <h2 className="text-[#242424] text-xl font-bold mb-4 text-right">
        افزودن آدرس
      </h2>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">

          <Input
            label="نام و نام خانوادگی"
            value={form.fullName}
            error={fieldErrors.fullName}
            onChange={(e) =>
              setForm({ ...form, fullName: e.target.value })
            }
          />

          <Input
            label="شماره تماس"
            value={form.phone}
            valid={phoneValid}
            invalid={phoneInvalid}
            error={fieldErrors.phone}
            onChange={(e) => {
              let v = e.target.value;

              if (!/^\d*$/.test(v)) return;
              if (v.length > 11) return;

              setForm({ ...form, phone: v });

              const ok = isValidIranPhone(v);
              setPhoneValid(ok);

              setPhoneInvalid(!ok && v.length > 0);

              if (ok) {
                setFieldErrors((p) => ({ ...p, phone: "" }));
              }
            }}
          />

          <Input
            label="کد پستی"
            value={form.postalCode}
            error={fieldErrors.postalCode}
            onChange={(e) =>
              setForm({ ...form, postalCode: e.target.value })
            }
          />

          <div>
            <ProvinceSelect
              value={form.province}
              onChange={(province) =>
                setForm({ ...form, province, city: "" })
              }
            />
            {fieldErrors.province && (
              <p className="text-xs text-red-500 mt-1 text-right">
                {fieldErrors.province}
              </p>
            )}
          </div>

          <div>
            <CitySelect
              province={form.province}
              value={form.city}
              onChange={(city) => setForm({ ...form, city })}
            />
            {fieldErrors.city && (
              <p className="text-xs text-red-500 mt-1 text-right">
                {fieldErrors.city}
              </p>
            )}
          </div>

          <div className="col-span-2">
            <Input
              label="آدرس کامل"
              value={form.street}
              error={fieldErrors.street}
              onChange={(e) =>
                setForm({ ...form, street: e.target.value })
              }
            />
          </div>

        </div>

        <div className="flex justify-center mt-4">
          <button
            onClick={handleCreate}
            className="bg-[#00B4D8] text-white rounded-lg px-6 py-2 hover:bg-[#0096c7] transition"
          >
            ثبت آدرس
          </button>
        </div>
      </div>

      <div className="mt-8 border-t border-[#EDEDED] pt-4 space-y-3">
        آدرس‌ها
        {loading ? (
          <p className="text-center text-gray-500">در حال بارگذاری...</p>
        ) : addresses.length === 0 ? (
          <p className="text-center text-gray-500">
            هیچ آدرسی ثبت نشده است
          </p>
        ) : (
          addresses.map((addr) => (
            <div
              key={addr.id}
              className="border border-[#D6D6D6] p-4 rounded-lg flex justify-between items-center"
            >
              <div className="text-right">
                <p className="font-bold">{addr.fullName}</p>
                <p className="text-sm text-gray-600">{addr.street}</p>
                <p className="text-sm text-gray-600">
                  {addr.city}, {addr.province}
                </p>
                <p className="text-sm text-gray-600">
                  {addr.postalCode}
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() =>
                    addressApi.setDefault(addr.id).then(fetchAddresses)
                  }
                  className={`px-3 py-1 rounded text-sm ${
                    addr.isDefault
                      ? "bg-green-500 text-white"
                      : "bg-gray-200"
                  }`}
                >
                  پیش‌فرض
                </button>

                <button
                  onClick={() =>
                    addressApi.remove(addr.id).then(fetchAddresses)
                  }
                  className="px-3 py-1 rounded bg-red-500 text-white text-sm"
                >
                  حذف
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function Input({ label, value, onChange, error, valid, invalid }) {
  return (
    <div className="flex flex-col gap-1 relative">
      <label className="text-[#656565] text-sm text-right">{label}</label>

      <div className="relative">
        <input
          value={value}
          onChange={onChange}
          className={`
            border rounded-lg px-3 py-2 text-sm w-full focus:outline-none transition
            ${
              valid
                ? "border-green-500 text-green-700"
                : invalid
                ? "border-red-500 text-red-700"
                : "border-[#656565] text-[#656565]"
            }
          `}
        />

        {valid && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-green-600 text-xl">
            ✓
          </span>
        )}

        {invalid && !valid && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-red-600 text-xl">
            ✕
          </span>
        )}
      </div>

      {error && (
        <span className="text-xs text-red-500 mt-1 text-right">
          {error}
        </span>
      )}
    </div>
  );
}
