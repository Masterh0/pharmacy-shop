// app/(admin)/manager/profile/orders/[id]/page.tsx
"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { adminOrderApi } from "@/lib/api/adminOrder";
import { useParams, useRouter } from "next/navigation";
import { OrderStatus } from "@/lib/types/order";
import { toast } from "sonner";
import { format } from "date-fns-jalali";
import Image from "next/image";
import {
  ArrowRight,
  User,
  Location,
  Call,
  Calendar,
  DollarCircle,
  TruckFast,
} from "iconsax-react";
import { useState } from "react";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";

const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: "در انتظار پرداخت",
  PAID: "پرداخت شده",
  SHIPPED: "ارسال شده",
  DELIVERED: "تحویل داده شده",
  CANCELED: "لغو شده",
};

const STATUS_FLOW: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ["PAID", "CANCELED"],
  PAID: ["SHIPPED", "CANCELED"],
  SHIPPED: ["DELIVERED", "CANCELED"],
  DELIVERED: [],
  CANCELED: [],
};

export default function AdminOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = Number(params.id);
  const [pendingStatus, setPendingStatus] = useState<OrderStatus | null>(null);

  const {
    data: order,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["admin-order-detail", orderId],
    queryFn: () => adminOrderApi.getOrderDetails(orderId),
  });

  const updateStatusMutation = useMutation({
    mutationFn: (newStatus: OrderStatus) =>
      adminOrderApi.updateOrderStatus(orderId, newStatus),
    onSuccess: () => {
      toast.success("وضعیت سفارش به‌روزرسانی شد");
      refetch();
    },
    onError: (error: any) => {
      toast.error(error?.message || "خطا در به‌روزرسانی وضعیت");
    },
  });

  const handleStatusChange = (newStatus: OrderStatus) => {
    if (!order) return;
    const allowed = STATUS_FLOW[order.status as OrderStatus] ?? [];
    if (!allowed.includes(newStatus)) {
      toast.error(
        `انتقال از "${STATUS_LABELS[order.status as OrderStatus]}" به "${STATUS_LABELS[newStatus]}" مجاز نیست`,
      );
      return;
    }
    setPendingStatus(newStatus);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00B4D8] mx-auto" />
          <p className="mt-4 text-gray-600">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-600">سفارش یافت نشد</p>
        <button
          onClick={() => router.back()}
          className="mt-4 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
        >
          بازگشت
        </button>
      </div>
    );
  }

  const orderItems = order.orderItems || [];
  const currentStatus = order.status as OrderStatus;
  const allowedNextStatuses = STATUS_FLOW[currentStatus] ?? [];

  const formatPrice = (price: number | undefined | null) =>
    (Number(price) || 0).toLocaleString("fa-IR");

  // snapshot — مطابق با Order model در schema
  const shippingInfo = {
    fullName: order.shippingFullName ?? "نامشخص",
    phone: order.shippingPhone ?? "ثبت نشده",
    province: order.shippingProvince ?? "",
    city: order.shippingCity ?? "",
    address: order.shippingAddress ?? "", // ← shippingAddress نه shippingStreet
    postalCode: order.shippingPostalCode ?? "",
    notes: order.shippingNotes ?? "",
  };

  return (
    <div className="p-6 space-y-6">
      {/* هدر */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowRight size="24" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">جزئیات سفارش</h1>
          <p className="text-sm text-gray-500 mt-1">
            کد سفارش: {order.trackingCode || `#${order.id}`}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ستون اصلی */}
        <div className="lg:col-span-2 space-y-6">
          {/* اطلاعات مشتری */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              اطلاعات مشتری و آدرس تحویل
            </h2>

            <div className="mb-6 pb-6 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-600 mb-3">
                اطلاعات کاربر (در زمان ثبت سفارش)
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <User size="20" className="text-gray-500" />
                  <span className="text-gray-700">
                    {order.shippingFullName ?? "نامشخص"}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Call size="20" className="text-gray-500" />
                  <span className="text-gray-700 font-english">
                    {order.shippingPhone ?? "نامشخص"}
                  </span>
                </div>
              </div>
            </div>

            {/* آدرس تحویل */}
            <div>
              <h3 className="text-sm font-semibold text-gray-600 mb-3">
                آدرس تحویل (در زمان ثبت سفارش)
              </h3>
              <div className="bg-blue-50 rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <User size="20" className="text-blue-600" />
                  <span className="font-medium text-gray-900">
                    گیرنده: {shippingInfo.fullName}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Call size="20" className="text-blue-600" />
                  <span className="text-gray-700 font-english">
                    {shippingInfo.phone}
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <Location size="20" className="text-blue-600 mt-1" />
                  <div className="flex-1 text-gray-700 leading-relaxed">
                    {shippingInfo.province && (
                      <span>{shippingInfo.province} - </span>
                    )}
                    {shippingInfo.city && <span>{shippingInfo.city}</span>}
                    {shippingInfo.address && (
                      <>
                        <br />
                        <span>{shippingInfo.address}</span>
                      </>
                    )}
                    {shippingInfo.postalCode && (
                      <>
                        <br />
                        <span className="text-sm text-gray-600">
                          کد پستی: {shippingInfo.postalCode}
                        </span>
                      </>
                    )}
                    {shippingInfo.notes && (
                      <>
                        <br />
                        <span className="text-sm text-gray-600 italic">
                          توضیحات: {shippingInfo.notes}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* یادداشت مشتری — اگر ثبت شده باشد */}
            {order.customerNote && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <h3 className="text-sm font-semibold text-gray-600 mb-2">
                  یادداشت مشتری
                </h3>
                <p className="text-sm text-gray-700 bg-yellow-50 rounded-lg p-3">
                  {order.customerNote}
                </p>
              </div>
            )}
          </div>

          {/* محصولات */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              محصولات ({orderItems.length})
            </h2>

            {orderItems.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                محصولی یافت نشد
              </div>
            ) : (
              <div className="space-y-4">
                {orderItems.map((item: any) => {
                  // snapshot — مطابق OrderItem schema
                  const productName = item.productName ?? "نامشخص";
                  const rawImage = item.imageUrl ?? null;
                  const imageSrc = rawImage
                    ? rawImage.startsWith("http")
                      ? rawImage
                      : `${baseUrl}/${rawImage.replace(/^\/+/, "")}`
                    : "/pic/placeholder-product.png";

                  return (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                    >
                      <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
                        <Image
                          src={imageSrc}
                          alt={productName}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900">
                          {productName}
                        </h3>
                        {/* برند و دسته‌بندی از snapshot */}
                        {(item.brandName || item.categoryName) && (
                          <p className="text-xs text-gray-400 mt-0.5">
                            {[item.brandName, item.categoryName]
                              .filter(Boolean)
                              .join(" · ")}
                          </p>
                        )}
                        {/* خلاصه آتریبیوت‌های واریانت — فیلد واقعی: variantAttributesSummary */}
                        {item.variantAttributesSummary && (
                          <p className="text-xs text-gray-500 mt-0.5">
                            {item.variantAttributesSummary}
                          </p>
                        )}
                        {item.sku && (
                          <p className="text-xs text-gray-400 mt-0.5 font-english">
                            SKU: {item.sku}
                          </p>
                        )}
                        <p className="text-sm text-gray-500 mt-1">
                          تعداد: {item.quantity}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          قیمت واحد: {formatPrice(item.unitPrice)} تومان
                        </p>
                      </div>
                      <div className="text-left flex-shrink-0">
                        <p className="font-bold text-gray-900">
                          {formatPrice(item.totalPrice)} تومان
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ستون کناری */}
        <div className="space-y-6">
          {/* وضعیت سفارش */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              وضعیت سفارش
            </h2>

            <div className="mb-3 px-3 py-2 bg-gray-50 rounded-lg text-sm text-gray-700">
              وضعیت فعلی:{" "}
              <span className="font-semibold">
                {STATUS_LABELS[currentStatus]}
              </span>
            </div>

            {allowedNextStatuses.length > 0 ? (
              <div className="space-y-2">
                <p className="text-xs text-gray-500 mb-2">انتقال به:</p>
                {allowedNextStatuses.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleStatusChange(s)}
                    disabled={updateStatusMutation.isPending}
                    className={`w-full px-4 py-2.5 rounded-lg text-sm font-medium transition
                      disabled:opacity-50 disabled:cursor-not-allowed
                      ${
                        s === "CANCELED"
                          ? "bg-red-50 text-red-700 hover:bg-red-100 border border-red-200"
                          : "bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200"
                      }`}
                  >
                    {STATUS_LABELS[s]}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 text-center py-2">
                این سفارش به مرحله نهایی رسیده است
              </p>
            )}

            {updateStatusMutation.isPending && (
              <p className="text-sm text-gray-500 mt-2 text-center">
                در حال به‌روزرسانی...
              </p>
            )}

            {/* Confirmation Dialog */}
            {pendingStatus && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4 shadow-xl">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    تأیید تغییر وضعیت
                  </h3>
                  <p className="text-gray-600 mb-6">
                    وضعیت سفارش از{" "}
                    <span className="font-semibold">
                      {STATUS_LABELS[currentStatus]}
                    </span>{" "}
                    به{" "}
                    <span
                      className={`font-semibold ${
                        pendingStatus === "CANCELED"
                          ? "text-red-600"
                          : "text-blue-600"
                      }`}
                    >
                      {STATUS_LABELS[pendingStatus]}
                    </span>{" "}
                    تغییر می‌کند. آیا مطمئنید؟
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        updateStatusMutation.mutate(pendingStatus);
                        setPendingStatus(null);
                      }}
                      className={`flex-1 text-white py-2 px-4 rounded-lg transition font-medium
                        ${
                          pendingStatus === "CANCELED"
                            ? "bg-red-600 hover:bg-red-700"
                            : "bg-blue-600 hover:bg-blue-700"
                        }`}
                    >
                      بله، تأیید می‌کنم
                    </button>
                    <button
                      onClick={() => setPendingStatus(null)}
                      className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition font-medium"
                    >
                      انصراف
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* یادداشت ادمین */}
          {order.adminNotes && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-3">
                یادداشت ادمین
              </h2>
              <p className="text-sm text-gray-700 bg-orange-50 rounded-lg p-3">
                {order.adminNotes}
              </p>
            </div>
          )}

          {/* خلاصه مالی */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">خلاصه مالی</h2>
            <div className="space-y-3">
              <div className="flex justify-between text-gray-700">
                <span>جمع کل:</span>
                <span>{formatPrice(order.subtotal)} تومان</span>
              </div>
              {Number(order.discountTotal) > 0 && (
                <div className="flex justify-between text-red-600">
                  <span>تخفیف:</span>
                  <span>−{formatPrice(order.discountTotal)} تومان</span>
                </div>
              )}
              {Number(order.taxAmount) > 0 && (
                <div className="flex justify-between text-gray-700">
                  <span>مالیات:</span>
                  <span>{formatPrice(order.taxAmount)} تومان</span>
                </div>
              )}
              <div className="flex justify-between text-gray-700">
                <span>هزینه ارسال:</span>
                <span>{formatPrice(order.shippingFee)} تومان</span>
              </div>
              <div className="border-t border-gray-200 pt-3 flex justify-between font-bold text-lg">
                <span>مبلغ نهایی:</span>
                <span className="text-[#00B4D8]">
                  {formatPrice(order.finalTotal)} تومان
                </span>
              </div>
              {/* وضعیت ریفاند */}
              {order.refundStatus !== "NONE" && (
                <div className="border-t border-gray-200 pt-3 space-y-1">
                  <div className="flex justify-between text-orange-600">
                    <span>مبلغ بازگشتی:</span>
                    <span>{formatPrice(order.refundedAmount)} تومان</span>
                  </div>
                  {order.refundNote && (
                    <p className="text-xs text-gray-500 mt-1">
                      {order.refundNote}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* اطلاعات تاریخی */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              اطلاعات تاریخی
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <Calendar size="18" className="text-gray-500" />
                <span className="text-gray-600">ثبت:</span>
                <span className="text-gray-900">
                  {format(new Date(order.createdAt), "yyyy/MM/dd HH:mm")}
                </span>
              </div>
              {order.paidAt && (
                <div className="flex items-center gap-2">
                  <DollarCircle size="18" className="text-gray-500" />
                  <span className="text-gray-600">پرداخت:</span>
                  <span className="text-gray-900">
                    {format(new Date(order.paidAt), "yyyy/MM/dd HH:mm")}
                  </span>
                </div>
              )}
              {order.refundedAt && (
                <div className="flex items-center gap-2">
                  <DollarCircle size="18" className="text-orange-500" />
                  <span className="text-gray-600">بازگشت وجه:</span>
                  <span className="text-gray-900">
                    {format(new Date(order.refundedAt), "yyyy/MM/dd HH:mm")}
                  </span>
                </div>
              )}
              {order.updatedAt && (
                <div className="flex items-center gap-2">
                  <TruckFast size="18" className="text-gray-500" />
                  <span className="text-gray-600">آخرین به‌روزرسانی:</span>
                  <span className="text-gray-900">
                    {format(new Date(order.updatedAt), "yyyy/MM/dd HH:mm")}
                  </span>
                </div>
              )}
              {order.discountCode && (
                <div className="pt-2 border-t border-gray-100">
                  <span className="text-gray-600">کد تخفیف: </span>
                  <span className="font-english text-gray-900 font-medium">
                    {order.discountCode}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
