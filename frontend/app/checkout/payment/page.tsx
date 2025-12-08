"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ChevronLeft,
  MapPin,
  Truck,
  CreditCard,
  ShoppingBag,
  Tag,
} from "lucide-react";

import { addressApi } from "@/lib/api/address";
import { useCart } from "@/lib/hooks/useAddToCart";
import { useShippingCost } from "@/lib/hooks/useShippingCost";
import { useOrders } from "@/lib/hooks/useOrders";

export default function PaymentPage() {
  const router = useRouter();
  const params = useSearchParams();
  const addressId = params.get("addressId");

  // States
  const [address, setAddress] = useState<any>(null);
  const [addressLoading, setAddressLoading] = useState(true);

  // Hooks
  const { cart, isLoading: isCartLoading } = useCart();
  const { data: shipping, isLoading: isShippingLoading } = useShippingCost(
    addressId ? Number(addressId) : undefined
  );
  const { createOrder, isCreating } = useOrders();

  // Load address
  useEffect(() => {
    if (!addressId) {
      toast.error("آدرس انتخاب نشده است");
      router.push("/checkout/address");
      return;
    }

    async function loadAddress() {
      try {
        setAddressLoading(true);
        const addr = await addressApi.get(addressId);
        setAddress(addr);
      } catch {
        toast.error("خطا در بارگذاری آدرس");
        router.push("/checkout/address");
      } finally {
        setAddressLoading(false);
      }
    }

    loadAddress();
  }, [addressId, router]);

  // Calculation
  const calculateTotals = () => {
    let itemsTotal = 0;
    let totalDiscount = 0;

    if (cart?.items) {
      itemsTotal = cart.items.reduce((sum, item) => {
        const discountPrice =
          Number(item.variant?.discountPrice || item.variant?.price || 0);
        return sum + discountPrice * item.quantity;
      }, 0);

      totalDiscount = cart.items.reduce((sum, item) => {
        const price = Number(item.variant?.price || 0);
        const discount = Number(item.variant?.discountPrice || price);
        return sum + (price - discount) * item.quantity;
      }, 0);
    }

    return { itemsTotal, totalDiscount };
  };

  const { itemsTotal, totalDiscount } = calculateTotals();
  const shippingCost = shipping?.shippingCost || 0;
  const finalPayable = itemsTotal + shippingCost;
  const loading = addressLoading || isCartLoading || isShippingLoading;

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center py-12 px-4">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-[#00B4D8]" />
          <p className="text-lg text-gray-600">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  // Empty cart
  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-20 px-4 flex items-center justify-center">
        <div className="max-w-md w-full text-center bg-white/80 backdrop-blur-sm rounded-3xl p-12 shadow-2xl border border-white/50">
          <ShoppingBag className="w-24 h-24 text-gray-300 mx-auto mb-8" />
          <h2 className="text-3xl font-bold text-gray-900 mb-4">سبد خالی!</h2>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            سبد خرید شما خالی است.
          </p>
          <button
            onClick={() => router.push("/")}
            className="w-full py-4 px-8 bg-gradient-to-r from-[#00B4D8] to-[#0096c7] text-white rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
          >
            بازگشت به فروشگاه
          </button>
        </div>
      </div>
    );
  }

  // Make order
  const handlePay = async () => {
    if (!addressId) {
      toast.error("آدرس انتخاب نشده است");
      router.push("/checkout/address");
      return;
    }

    try {
      toast.loading("در حال ثبت سفارش...");

      createOrder(
        { addressId: Number(addressId), shippingCost },
        {
          onSuccess: (newOrder: any) => {
            toast.dismiss();
            toast.success("✅ سفارش با موفقیت ثبت شد!");
            setTimeout(() => router.push(`/orders/${newOrder.id}`), 1500);
          },
          onError: (err: any) => {
            toast.dismiss();
            toast.error(err?.response?.data?.message || "❌ خطا در ثبت سفارش");
          },
        }
      );
    } catch {
      toast.dismiss();
      toast.error("مشکلی در ثبت سفارش پیش آمد. دوباره تلاش کنید.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto w-full">
        {/* Header */}
        <div className="flex items-center gap-4 mb-12">
          <button
            onClick={() => router.back()}
            className="p-3 bg-white/80 backdrop-blur-sm rounded-xl hover:bg-white hover:shadow-lg transition-all duration-300 border border-gray-200/50"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-[#0077B6] to-[#00B4D8] bg-clip-text text-transparent">
            نهایی کردن سفارش
          </h1>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Address */}
          <div className="lg:col-span-1">
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-gray-200/50">
              <div className="flex items-center gap-3 mb-6">
                <MapPin className="w-7 h-7 text-[#00B4D8]" />
                <h2 className="text-2xl font-bold text-gray-900">آدرس تحویل</h2>
              </div>

              {address ? (
                <div className="space-y-4 text-gray-700 leading-relaxed">
                  <p className="text-xl font-bold text-gray-900">
                    {address.fullName}
                  </p>
                  <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl">
                    <MapPin className="w-5 h-5 text-[#00B4D8]" />
                    <div>
                      <p className="font-semibold text-lg">{address.province}</p>
                      <p className="text-base">{address.city}</p>
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50/50 rounded-2xl">
                    <p className="font-mono text-lg">{address.street}</p>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100/50">
                    <span className="text-sm font-medium text-gray-600">
                      کد پستی
                    </span>
                    <span className="font-bold text-lg text-gray-900">
                      {address.postalCode}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-center py-12 text-gray-500">آدرس پیدا نشد</p>
              )}
            </div>
          </div>

          {/* Payment Summary */}
          <div className="space-y-6">
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-200/50">
              <div className="flex items-center gap-3 mb-4">
                <Truck className="w-6 h-6 text-[#00B4D8]" />
                <h3 className="font-bold text-xl text-gray-900">هزینه ارسال</h3>
              </div>
              <div className="text-2xl font-bold text-[#00B4D8]">
                {shippingCost.toLocaleString("fa-IR")} تومان
              </div>
            </div>

            <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-200/50">
              <div className="flex items-center gap-3 mb-6">
                <CreditCard className="w-7 h-7 text-[#00B4D8]" />
                <h2 className="text-2xl font-bold text-gray-900">
                  خلاصه پرداخت
                </h2>
              </div>

              <div className="space-y-4">
                <SummaryRow label="جمع کل محصولات" value={itemsTotal} icon={ShoppingBag} />
                {totalDiscount > 0 && (
                  <SummaryRow
                    label="سود شما از خرید"
                    value={-totalDiscount}
                    valueClass="text-red-500"
                    icon={Tag}
                  />
                )}
                <SummaryRow label="هزینه ارسال" value={shippingCost} icon={Truck} />

                <div className="border-t border-gray-200 pt-6 mt-4" />
                <SummaryRow
                  bold
                  label="مبلغ نهایی"
                  value={finalPayable}
                  valueClass="text-[#00B4D8]"
                  icon={CreditCard}
                />
              </div>
            </div>

            <button
              disabled={isCreating}
              onClick={handlePay}
              className={`group w-full py-5 px-8 rounded-3xl font-bold text-xl shadow-xl transition-all duration-300 flex items-center justify-center gap-3 ${
                isCreating
                  ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                  : "bg-gradient-to-r from-[#00B4D8] to-[#0096c7] text-white hover:shadow-2xl hover:-translate-y-1 hover:from-[#0096c7] hover:to-[#0077B6]"
              }`}
            >
              {isCreating ? (
                <>
                  <div className="h-5 w-5 animate-spin border-b-2 border-white rounded-full" />
                  <span>در حال پرداخت...</span>
                </>
              ) : (
                <>
                  <span>تأیید و پرداخت</span>
                  <CreditCard className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ✅ Summary Row Component عین PaymentSummary قبلی
function SummaryRow({
  label,
  value,
  valueClass,
  bold,
  icon: Icon,
}: {
  label: string;
  value: number;
  valueClass?: string;
  bold?: boolean;
  icon?: any;
}) {
  return (
    <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50/50 hover:bg-gray-100/50 transition-all duration-200 group">
      <div className="flex items-center gap-3">
        {Icon && (
          <Icon className="w-5 h-5 text-gray-500 group-hover:text-[#00B4D8] transition-colors" />
        )}
        <span
          className={`${bold ? "font-bold text-lg" : "font-semibold"} text-gray-700`}
        >
          {label}
        </span>
      </div>
      <span
        className={`${
          bold ? "text-2xl font-black" : "text-lg font-bold"
        } text-gray-900 ${valueClass || ""}`}
      >
        {value.toLocaleString("fa-IR")}
        <span className="text-sm font-normal text-gray-500 ml-1">تومان</span>
      </span>
    </div>
  );
}
