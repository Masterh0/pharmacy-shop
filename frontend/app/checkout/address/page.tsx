"use client";

import { useEffect, useState } from "react";
import { addressApi } from "@/lib/api/address";
import type { Address } from "@/lib/types/address";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";

export default function AddressPage() {
  const router = useRouter();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<number | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await addressApi.list();
        setAddresses(res);

        const def = res.find((a) => a.isDefault);
        if (def) setSelected(def.id);
      } catch {
        toast.error("مشکلی در بارگذاری آدرس‌ها پیش آمد");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleContinue = () => {
    if (!selected) {
      toast.error("لطفاً یک آدرس انتخاب کنید");
      return;
    }

    router.push("/checkout/payment?addressId=" + selected);
  };

  if (loading)
    return (
      <div className="py-20 text-center text-gray-500">در حال بارگذاری...</div>
    );

  return (
    <div  className="w-full flex justify-center px-4">
      <div className="w-full max-w-[800px]">
        <h1 className="text-xl font-bold mb-6 text-[#0077B6] text-center">
          انتخاب آدرس تحویل
        </h1>

        {addresses.length > 0 ? (
          <>
            <div className="flex flex-col gap-4">
              {addresses.map((addr) => (
                <label
                  key={addr.id}
                  className="flex items-start gap-3 p-4 border border-gray-300 rounded-lg cursor-pointer hover:border-[#00B4D8] transition"
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

            <Link
              href="/customer/addresses"
              className="block w-full mt-4 py-3 border border-[#00B4D8] text-[#00B4D8] rounded-md text-center"
            >
              افزودن آدرس جدید
            </Link>

            <div className="w-full flex justify-center">
              <button
                className="w-full  mt-6 py-3 bg-[#00B4D8] text-white rounded-md font-medium hover:bg-[#0096c7] transition"
                onClick={handleContinue}
              >
                ادامه به مرحله پرداخت
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-col gap-4 p-4 border border-gray-300 rounded-lg text-center">
            <p className="text-gray-600">شما هنوز هیچ آدرسی ثبت نکرده‌اید</p>

            <Link
              href="/customer/addresses"
              className="w-full py-3 bg-[#00B4D8] text-white rounded-md text-center"
            >
              افزودن اولین آدرس
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
