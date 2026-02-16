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
  Box1,
  Calendar,
  DollarCircle,
  TruckFast,
} from "iconsax-react";
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";

export default function AdminOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = Number(params.id);

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
    onError: () => {
      toast.error("خطا در به‌روزرسانی وضعیت");
    },
  });

  // ✅ اضافه شد: بررسی console
  console.log("Order data:", order);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00B4D8] mx-auto"></div>
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

  // ✅ اصلاح: استفاده از orderItems به جای items
  const orderItems = order.orderItems || [];

  // ✅ محاسبات مالی با بررسی مقادیر
  const formatPrice = (price: number | undefined | null) => {
    const validPrice = Number(price) || 0;
    return validPrice.toLocaleString("fa-IR");
  };

  return (
    <div className="p-6 space-y-6">
      {/* هدر */}
      <div className="flex items-center justify-between">
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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ستون اصلی */}
        <div className="lg:col-span-2 space-y-6">
          {/* اطلاعات مشتری */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              اطلاعات مشتری
            </h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <User size="20" className="text-gray-500" />
                <span className="text-gray-700">
                  {order.user?.name || "نامشخص"}
                </span>
                <span className="text-gray-700">
                  شماره کابر: {order.user?.phone || "نامشخص"}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <Call size="20" className="text-gray-500" />
                <span className="text-gray-700 font-english">
                  شماره ثبت در آدرس: {order.address?.phone || "ثبت نشده"}
                </span>
              </div>
              <div className="flex items-start gap-3">
                <Location size="20" className="text-gray-500 mt-1" />
                <p className="text-gray-700 flex-1">
                  {order.address ? (
                    <>
                      {order.address.province}, {order.address.city},{" "}
                      {order.address.street}
                      <br />
                      کد پستی: {order.address.postalCode}
                    </>
                  ) : (
                    "آدرس ثبت نشده"
                  )}
                </p>
              </div>
            </div>
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
                {/* ✅ اصلاح شد */}
                {orderItems.map((item: any) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
                      <Image
                        src={
                          item.product?.imageUrl
                            ? item.product.imageUrl.startsWith("http")
                              ? item.product.imageUrl
                              : `${baseUrl}/${item.product.imageUrl.replace(
                                  /^\/+/,
                                  ""
                                )}`
                            : "/pic/placeholder-product.png"
                        }
                        alt={item.product?.name ?? "محصول"}
                        width={64}
                        height={64}
                        className="rounded-lg object-cover"
                        unoptimized
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">
                        {item.product?.name || "نامشخص"}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        تعداد سفارش: {item.quantity}
                      </p>
                      {item.variant?.flavor && (
                        <p className="text-sm text-gray-500 mt-1">
                          طعم: {item.variant?.flavor}
                        </p>
                      )}
                      {item.variant?.packageQuantity > 1 && (
                        <p className="text-sm text-gray-500 mt-1">
                          تعداد در بسته: {item.variant?.packageQuantity}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">
                        قیمت واحد: {formatPrice(item.unitPrice)} تومان
                      </p>
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-gray-900">
                        {formatPrice(item.totalPrice)} تومان
                      </p>
                    </div>
                  </div>
                ))}
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
            <select
              value={order.status}
              onChange={(e) =>
                updateStatusMutation.mutate(e.target.value as OrderStatus)
              }
              disabled={updateStatusMutation.isPending}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00B4D8] focus:border-transparent outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="PENDING">در انتظار پرداخت</option>
              <option value="PAID">پرداخت شده</option>
              <option value="SHIPPED">ارسال شده</option>
              <option value="DELIVERED">تحویل داده شده</option>
              <option value="CANCELED">لغو شده</option>
            </select>

            {updateStatusMutation.isPending && (
              <p className="text-sm text-gray-500 mt-2 text-center">
                در حال به‌روزرسانی...
              </p>
            )}
          </div>

          {/* خلاصه مالی */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">خلاصه مالی</h2>
            <div className="space-y-3">
              <div className="flex justify-between text-gray-700">
                <span>جمع کل:</span>
                <span>{formatPrice(order.subtotal)} تومان</span>
              </div>

              {/* ✅ بررسی اگر تخفیف داشت نمایش بده */}
              {order.discountTotal > 0 && (
                <div className="flex justify-between text-red-600">
                  <span>تخفیف:</span>
                  <span>−{formatPrice(order.discountTotal)} تومان</span>
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
            </div>
          </div>

          {/* اطلاعات تاریخ */}
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

              {order.updatedAt && (
                <div className="flex items-center gap-2">
                  <TruckFast size="18" className="text-gray-500" />
                  <span className="text-gray-600">آخرین به‌روزرسانی:</span>
                  <span className="text-gray-900">
                    {format(new Date(order.updatedAt), "yyyy/MM/dd HH:mm")}
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
