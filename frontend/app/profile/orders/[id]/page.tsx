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
function resolveImageUrl(url?: string | null) {
  if (!url) return "/pic/placeholder-product.png";
  return url.startsWith("http") ? url : `${baseUrl}/${url.replace(/^\/+/, "")}`;
}

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = Number(params.id);

  const { data, isLoading } = useQuery({
    queryKey: ["order", orderId],
    queryFn: () => orderApi.getById(orderId),
    enabled: Number.isFinite(orderId),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-[#00B4D8]/30 border-t-[#00B4D8] rounded-full animate-spin" />
          <p className="text-gray-500">در حال بارگذاری جزئیات...</p>
        </div>
      </div>
    );
  }

  if (!data?.order)
    return (
      <div className="text-center py-20">
        <Package className="w-20 h-20 mx-auto text-gray-300" />
        <h2 className="text-xl font-bold mt-4">سفارش یافت نشد</h2>
      </div>
    );

  const order = data.order;
  const statusConfig = getStatusConfig(order.status);
  const orderItems: any[] = order.orderItems ?? [];
  const shippingInfo = {
    fullName: order.shippingFullName || order.address?.fullName || "نامشخص",
    phone: order.shippingPhone || order.address?.phone || "ثبت نشده",
    province: order.shippingProvince || order.address?.province || "",
    city: order.shippingCity || order.address?.city || "",
    street: order.shippingStreet || order.address?.street || "",
    postalCode: order.shippingPostalCode || order.address?.postalCode || "",
    notes: order.shippingNotes || "",
  };

  const formatPrice = (price: any) =>
    (Number(price) || 0).toLocaleString("fa-IR");

  return (
    // حذف پدینگ اضافی
    <div dir="rtl" className="w-full">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-600 hover:text-[#00B4D8] mb-6 transition"
      >
        <ArrowRight className="w-5 h-5" />
        <span>بازگشت</span>
      </button>

      <div className="bg-gradient-to-br from-[#00B4D8]/5 to-transparent border border-gray-200 rounded-2xl p-6 sm:p-8 mb-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-2xl ${statusConfig.bgColor}`}>
              {statusConfig.icon}
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-[#242424] mb-1">
                {statusConfig.label}
              </h1>
              <p className="text-gray-500 flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4" />
                {order.createdAt
                  ? format(new Date(order.createdAt), "d MMMM yyyy - HH:mm")
                  : ""}
              </p>
            </div>
          </div>
          <div className="text-left mt-2 md:mt-0">
            <p className="text-sm text-gray-500 mb-1">کد پیگیری</p>
            <p className="text-xl sm:text-2xl font-mono font-bold text-[#00B4D8]">
              #{order.trackingCode ?? order.id}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-6">
            <h2 className="text-xl font-bold text-[#242424] mb-4 flex items-center gap-2">
              <Package className="w-6 h-6 text-[#00B4D8]" />
              محصولات ({orderItems.length.toLocaleString("fa-IR")})
            </h2>
            <div className="space-y-4">
              {orderItems.map((item: any) => (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition"
                >
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden border-2 border-white shadow-sm flex-shrink-0 self-start sm:self-auto">
                    <Image
                      src={resolveImageUrl(
                        item.imageUrl ?? item.product?.imageUrl,
                      )}
                      alt={item.productName ?? "نامشخص"}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-[#242424] mb-1 truncate">
                      {item.productName ?? item.product?.name ?? "نامشخص"}
                    </h3>
                    <p className="text-sm text-gray-600">
                      تعداد:{" "}
                      {Number(item.quantity ?? 0).toLocaleString("fa-IR")}
                    </p>
                    {item.unitPrice != null && (
                      <p className="text-xs text-gray-400 mt-1">
                        قیمت واحد: {formatPrice(item.unitPrice)} تومان
                      </p>
                    )}
                  </div>
                  <div className="text-right sm:text-left shrink-0 mt-2 sm:mt-0 border-t sm:border-t-0 pt-2 sm:pt-0">
                    <p className="font-bold text-[#00B4D8] text-lg">
                      {formatPrice(item.totalPrice)} تومان
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-6">
            <h2 className="text-xl font-bold text-[#242424] mb-4 flex items-center gap-2">
              <MapPin className="w-6 h-6 text-[#00B4D8]" />
              آدرس تحویل
            </h2>
            <div className="p-5 bg-gradient-to-br from-blue-50 to-transparent rounded-xl border border-blue-100">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg">
                    <User className="w-5 h-5 text-[#00B4D8]" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">گیرنده</p>
                    <p className="font-medium text-gray-900">
                      {shippingInfo.fullName}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg">
                    <Phone className="w-5 h-5 text-[#00B4D8]" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">تلفن</p>
                    <p
                      className="font-medium text-gray-900 font-mono"
                      dir="ltr"
                    >
                      {shippingInfo.phone}
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-white rounded-lg">
                <p className="text-gray-700 leading-relaxed">
                  {shippingInfo.province} - {shippingInfo.city}
                  <br />
                  <span className="mt-2 block">{shippingInfo.street}</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-[#242424] mb-4 flex items-center gap-2">
              <CreditCard className="w-6 h-6 text-[#00B4D8]" />
              اطلاعات مالی
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between text-gray-600">
                <span>جمع کل:</span>
                <span className="font-medium">
                  {formatPrice(order.subtotal)} تومان
                </span>
              </div>
              {Number(order.discountTotal) > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>تخفیف:</span>
                  <span className="font-medium">
                    −{formatPrice(order.discountTotal)} تومان
                  </span>
                </div>
              )}
              {Number(order.shippingFee) > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>هزینه ارسال:</span>
                  <span className="font-medium">
                    {formatPrice(order.shippingFee)} تومان
                  </span>
                </div>
              )}
              <div className="border-t border-gray-200 pt-3 mt-3">
                <div className="flex justify-between text-lg font-bold">
                  <span>مبلغ نهایی:</span>
                  <span className="text-[#00B4D8]">
                    {formatPrice(order.finalTotal)} تومان
                  </span>
                </div>
              </div>
            </div>
          </div>
          {order.shipment && (
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-[#242424] mb-4 flex items-center gap-2">
                <Truck className="w-6 h-6 text-[#00B4D8]" />
                وضعیت ارسال
              </h2>
              <div className="space-y-3">
                <div className="p-3 bg-blue-50 rounded-lg text-center">
                  <p className="text-sm text-gray-600 mb-1">وضعیت</p>
                  <p className="font-bold text-[#00B4D8]">
                    {order.shipment.status}
                  </p>
                </div>
                {order.shipment.trackingCode && (
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">بارکد مرسوله</p>
                    <p className="font-mono text-lg font-bold text-[#242424]">
                      {order.shipment.trackingCode}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function getStatusConfig(status: string) {
  const configs: Record<string, any> = {
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
