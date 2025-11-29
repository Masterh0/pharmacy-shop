"use client";

import { useEffect, useState } from "react";
import { addressApi } from "@/lib/api/address";
import type { Address } from "@/lib/types/address";
import ProvinceSelect from "./ProvinceSelect";
import CitySelect from "./CitySelect";

// Zod Schema (مسیر درست)
import { addressClientSchema } from "@/lib/validators/address";

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(false);

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

  const [clientErrors, setClientErrors] = useState<string[]>([]);

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    setLoading(true);
    try {
      const data = await addressApi.list();
      setAddresses(data);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    // Validate before sending
    const parsed = addressClientSchema.safeParse(form);

    if (!parsed.success) {
      setClientErrors(parsed.error.issues.map((e) => e.message));
      return;
    }

    setClientErrors([]);

    const validData = parsed.data;

    const newAddress = await addressApi.create(validData);
    setAddresses([...addresses, newAddress]);

    resetForm();
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
  };

  return (
    <div className="max-w-[808px] mx-auto border border-[#EDEDED] rounded-xl p-6 font-[IRANYekanX] relative">
      <h2 className="text-[#242424] text-xl font-bold mb-4 text-right">
        افزودن آدرس
      </h2>

      {/* نمایش خطاهای Zod */}
      {clientErrors.length > 0 && (
        <div className="bg-red-100 border border-red-300 text-red-700 p-3 rounded mb-4 text-right">
          {clientErrors.map((err, i) => (
            <p key={i}>• {err}</p>
          ))}
        </div>
      )}

      <div className="space-y-4">
        {/* فرم ایجاد آدرس */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="نام و نام خانوادگی"
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
          />

          <Input
            label="شماره تماس"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />

          <Input
            label="کد پستی"
            value={form.postalCode}
            onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
          />

          <ProvinceSelect
            value={form.province}
            onChange={(province) => setForm({ ...form, province, city: "" })}
          />

          <CitySelect
            province={form.province}
            value={form.city}
            onChange={(city) => setForm({ ...form, city })}
          />

          <div className="col-span-2">
            <Input
              label="آدرس کامل"
              value={form.street}
              onChange={(e) => setForm({ ...form, street: e.target.value })}
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

      {/* لیست آدرس‌ها */}
      <div className="mt-8 border-t border-[#EDEDED] pt-4 space-y-3">
        آدرس‌ها
        {loading ? (
          <p className="text-center text-gray-500">در حال بارگذاری...</p>
        ) : addresses.length === 0 ? (
          <p className="text-center text-gray-500">هیچ آدرس ثبت نشده است.</p>
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
                <p className="text-sm text-gray-600">{addr.postalCode}</p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() =>
                    addressApi.setDefault(addr.id).then(fetchAddresses)
                  }
                  className={`px-3 py-1 rounded text-sm ${
                    addr.isDefault ? "bg-green-500 text-white" : "bg-gray-200"
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

function Input({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (e: any) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[#656565] text-sm">{label}</label>
      <input
        value={value}
        onChange={onChange}
        className="border border-[#656565] rounded-lg px-3 py-2 text-sm text-[#656565] focus:outline-none"
      />
    </div>
  );
}
