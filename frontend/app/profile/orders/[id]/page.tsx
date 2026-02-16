// app/(customer)/profile/orders/[id]/page.tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import { orderApi } from "@/lib/api/order";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { format } from "date-fns-jalali";
import {
  ArrowRight,
  Package,
  MapPin,
  CreditCard,
  Truck,
  CheckCircle2,
  Clock,
  XCircle,
  Phone,
  User,
  Calendar,
} from "lucide-react";
import Link from "next/link";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = Number(params.id);

  const { data, isLoading } = useQuery({
    queryKey: ["order", orderId],
    queryFn: () => orderApi.getById(orderId),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-[#00B4D8]/30 border-t-[#00B4D8] rounded-full animate-spin" />
          <p className="text-gray-500">در حال بارگذاری جزئیات...</p>
        </div>
      </div>
    );
  }

  if (!data?.order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Package className="w-20 h-20 mx-auto mb-4 text-gray-300" />
          <h2 className="text-2xl font-bold text-gray-400 mb-2">
            سفارش یافت نشد
          </h2>
          <Link
            href="/profile/orders"
            className="text-[#00B4D8] hover:underline"
          >
            بازگشت به لیست سفارشات
          </Link>
        </div>
      </div>
    );
  }

  const order = data.order;
  const statusConfig = getStatusConfig(order.status);

  return (
    <div dir="rtl" className="max-w-6xl mx-auto px-4 py-8">
      {/* دکمه بازگشت */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-600 hover:text-[#00B4D8] mb-6 transition"
      >
        <ArrowRight className="w-5 h-5" />
        <span>بازگشت</span>
      </button>

      {/* هدر سفارش */}
      <div className="bg-gradient-to-br from-[#00B4D8]/5 to-transparent border border-gray-200 rounded-2xl p-8 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-2xl ${statusConfig.bgColor}`}>
              {statusConfig.icon}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#242424] mb-1">
                {statusConfig.label}
              </h1>
              <p className="text-gray-500 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                ثبت شده در {format(new Date(order.createdAt), "d MMMM yyyy - HH:mm")}
              </p>
            </div>
          </div>

          <div className="text-left">
            <p className="text-sm text-gray-500 mb-1">کد پیگیری</p>
            <p className="text-2xl font-mono font-bold text-[#00B4D8]">
              #{order.trackingCode || order.id}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ستون اصلی */}
        <div className="lg:col-span-2 space-y-6">
          {/* محصولات */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-[#242424] mb-4 flex items-center gap-2">
              <Package className="w-6 h-6 text-[#00B4D8]" />
              محصولات ({order.orderItems.length.toLocaleString("fa-IR")})
            </h2>

            <div className="space-y-4">
              {order.orderItems.map((item: any) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition"
                >
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden border-2 border-white shadow-sm flex-shrink-0">
                    <Image
                      src={
                        item.product?.imageUrl
                          ? item.product.imageUrl.startsWith("http")
                            ? item.product.imageUrl
                            : `${baseUrl}/${item.product.imageUrl.replace(/^\/+/, "")}`
                          : "/pic/placeholder-product.png"
                      }
                      alt={item.product?.name ?? "محصول"}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>

                  <div className="flex-1">
                    <h3 className="font-bold text-[#242424] mb-1">
                      {item.product?.name}
                    </h3>
                    {item.variant && (
                      <p className="text-sm text-gray-500">
                        {item.variant.options.join(" - ")}
                      </p>
                    )}
                    <p className="text-sm text-gray-600 mt-1">
                      تعداد: {item.quantity.toLocaleString("fa-IR")}
                    </p>
                  </div>

                  <div className="text-left">
                    {item.discountPrice && item.discountPrice < item.price && (
                      <p className="text-sm text-gray-400 line-through">
                        {Number(item.price).toLocaleString("fa-IR")} تومان
                      </p>
                    )}
                    <p className="font-bold text-[#00B4D8]">
                      {Number(item.finalPrice).toLocaleString("fa-IR")} تومان
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* آدرس تحویل */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-[#242424] mb-4 flex items-center gap-2">
              <MapPin className="w-6 h-6 text-[#00B4D8]" />
              آدرس تحویل
            </h2>

            {order.address ? (
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">
                      {order.address.receiverName}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600 font-mono" dir="ltr">
                      {order.address.phoneNumber}
                    </span>
                  </div>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  {order.address.province} - {order.address.city} -{" "}
                  {order.address.fullAddress}
                </p>
                {order.address.postalCode && (
                  <p className="text-sm text-gray-500 mt-2">
                    کد پستی: {order.address.postalCode}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-gray-500">آدرسی ثبت نشده است</p>
            )}
          </div>
        </div>

        {/* ستون جانبی */}
        <div className="space-y-6">
          {/* خلاصه مالی */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-[#242424] mb-4 flex items-center gap-2">
              <CreditCard className="w-6 h-6 text-[#00B4D8]" />
              اطلاعات مالی
            </h2>

            <div className="space-y-3">
              <div className="flex justify-between text-gray-600">
                <span>مبلغ کل محصولات:</span>
                <span className="font-medium">
                  {Number(order.subtotal).toLocaleString("fa-IR")} تومان
                </span>
              </div>

              <div className="flex justify-between text-green-600">
                <span>تخفیف:</span>
                <span className="font-medium">
                  {Number(order.discountTotal).toLocaleString("fa-IR")} تومان
                </span>
              </div>

              {order.shippingCost > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>هزینه ارسال:</span>
                  <span className="font-medium">
                    {Number(order.shippingCost).toLocaleString("fa-IR")} تومان
                  </span>
                </div>
              )}

              <div className="border-t border-gray-200 pt-3 mt-3">
                <div className="flex justify-between text-lg font-bold">
                  <span>مبلغ قابل پرداخت:</span>
                  <span className="text-[#00B4D8]">
                    {Number(order.finalTotal).toLocaleString("fa-IR")} تومان
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* وضعیت ارسال */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-[#242424] mb-4 flex items-center gap-2">
              <Truck className="w-6 h-6 text-[#00B4D8]" />
              وضعیت ارسال
            </h2>

            {order.shipment ? (
              <div className="space-y-3">
                <div className="p-3 bg-blue-50 rounded-lg text-center">
                  <p className="text-sm text-gray-600 mb-1">وضعیت ارسال</p>
                  <p className="font-bold text-[#00B4D8]">
                    {order.shipment.status}
                  </p>
                </div>

                {order.shipment.trackingCode && (
                  <div className="text-center">
                    <p className="text-sm text-gray-500 mb-1">بارکد مرسوله</p>
                    <p className="font-mono text-lg font-bold text-[#242424]">
                      {order.shipment.trackingCode}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500 text-center">
                اطلاعات ارسال ثبت نشده است
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// همان تابع getStatusConfig از فایل قبلی
function getStatusConfig(status: string) {
  const configs: Record<
    string,
    { label: string; icon: React.ReactNode; bgColor: string }
  > = {
    PENDING: {
      label: "در انتظار پرداخت",
      icon: <Clock className="w-6 h-6 text-yellow-600" />,
      bgColor: "bg-yellow-50",
    },
    PAID: {
      label: "پرداخت شده",
      icon: <CheckCircle2 className="w-6 h-6 text-blue-600" />,
      bgColor: "bg-blue-50",
    },
    SHIPPED: {
      label: "ارسال شده",
      icon: <Package className="w-6 h-6 text-purple-600" />,
      bgColor: "bg-purple-50",
    },
    DELIVERED: {
      label: "تحویل شده",
      icon: <CheckCircle2 className="w-6 h-6 text-green-600" />,
      bgColor: "bg-green-50",
    },
    CANCELED: {
      label: "لغو شده",
      icon: <XCircle className="w-6 h-6 text-red-600" />,
      bgColor: "bg-red-50",
    },
  };

  return (
    configs[status] || {
      label: status,
      icon: <Package className="w-6 h-6" />,
      bgColor: "bg-gray-50",
    }
  );
}
