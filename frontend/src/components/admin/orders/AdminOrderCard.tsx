// src/components/admin/orders/AdminOrderCard.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { Order, OrderStatus, RefundStatus } from "@/lib/types/order";
import { adminOrderApi } from "@/lib/api/adminOrder";
import {
  CheckCircle2,
  Clock,
  Package,
  Truck,
  XCircle,
  Eye,
  RotateCcw,
} from "lucide-react";
import toast from "react-hot-toast";
import PartialRefundModal from "./PartialRefundModal";
// Config هر وضعیت سفارش
const statusConfig = {
  PENDING: {
    label: "در انتظار پرداخت",
    color: "bg-yellow-100 text-yellow-800",
    icon: Clock,
  },
  PAID: {
    label: "پرداخت شده",
    color: "bg-blue-100 text-blue-800",
    icon: CheckCircle2,
  },
  SHIPPED: {
    label: "ارسال شده",
    color: "bg-purple-100 text-purple-800",
    icon: Truck,
  },
  DELIVERED: {
    label: "تحویل داده شده",
    color: "bg-green-100 text-green-800",
    icon: Package,
  },
  CANCELED: {
    label: "لغو شده",
    color: "bg-red-100 text-red-800",
    icon: XCircle,
  },
};

interface AdminOrderCardProps {
  order: Order;
  onUpdated?: () => void;
  isUpdating?: boolean; // از parent بیا!
}

// وضعیت‌هایی که قابل انتخاب‌اند (بر اساس منطق کسب‌وکار و ریفاند)
function getAllowedStatuses(order: Order): OrderStatus[] {
  const { status, refundStatus } = order;
  // اگر سفارش لغو شده یا ریفاند کامل شده، هیچ چیزی قابل تغییر نیست!
  if (status === "CANCELED" || refundStatus === "REFUNDED") return [status];
  // اگر تحویل داده شده فقط قابل لغو هست (اختیاری)
  if (status === "DELIVERED") return [status, "CANCELED"];
  // حین ارسال، فقط قابل لغو یا ارسال است
  if (status === "SHIPPED") return [status, "DELIVERED", "CANCELED"];
  // پرداختی‌ها فقط قابل ارسال یا لغو است
  if (status === "PAID") return [status, "SHIPPED", "CANCELED"];
  // معلق فقط قابل پرداخت یا لغو است
  if (status === "PENDING") return [status, "PAID", "CANCELED"];
  return [status];
}

export default function AdminOrderCard({
  order,
  onUpdated,
  isUpdating,
}: AdminOrderCardProps) {
  const [localUpdating, setLocalUpdating] = useState(false);
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);

  const orderItems = order.orderItems || [];
  const displayItems = orderItems.slice(0, 5);
  const remainingCount = Math.max(0, orderItems.length - 5);

  const currentStatus = statusConfig[order.status as OrderStatus];
  const StatusIcon = currentStatus.icon;

  // منطقی برای Guard status
  const allowedStatuses = getAllowedStatuses(order);

  // Guard: فقط تغییر وضعیت‌های منطقی
  const canChangeStatus = allowedStatuses.length > 1;

  const handleStatusChange = async (newStatus: OrderStatus) => {
    if (newStatus === order.status) return;
    setLocalUpdating(true);
    try {
      await adminOrderApi.updateOrderStatus(order.id, newStatus);
      toast.success("وضعیت سفارش با موفقیت تغییر یافت!");
      onUpdated?.();
    } catch (error: any) {
      toast.error(error?.message || "خطا در تغییر وضعیت سفارش");
      console.error(error);
    } finally {
      setLocalUpdating(false);
    }
  };

  // تاریخ
  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("fa-IR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  // قیمت
  const formatPrice = (price: number = 0) =>
    new Intl.NumberFormat("fa-IR").format(price) + " تومان";

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
      {/* هدر */}
      <div className="flex items-start justify-between mb-4 pb-4 border-b border-gray-100">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-bold text-gray-900">
              سفارش #{order.id}
            </h3>
            <div
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${currentStatus.color}`}
            >
              <StatusIcon className="w-4 h-4" />
              <span>{currentStatus.label}</span>
              {/* ریفاند شده */}
              {order.refundStatus === "REFUNDED" && (
                <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded">
                  ریفاند شده
                </span>
              )}
              {order.refundStatus === "PARTIALLY_REFUNDED" && (
                <span className="ml-2 px-2 py-0.5 text-xs bg-yellow-100 text-yellow-800 rounded">
                  ریفاند جزئی
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>👤 {order.user?.name || "کاربر ناشناس"}</span>
            <span>📅 {formatDate(order.createdAt)}</span>
          </div>
        </div>
        <Link
          href={`/manager/profile/orders/${order.id}`}
          className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-gray-700 text-sm font-medium"
        >
          <Eye className="w-4 h-4" />
          مشاهده جزئیات
        </Link>
      </div>
      {/* محصولات سفارش */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">
          محصولات ({orderItems.length})
        </h4>
        <div className="flex items-center gap-2">
          {displayItems.map((item) => (
            <div
              key={item.id}
              className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0"
            >
              <Image
                src={
                  item.product?.imageUrl
                    ? item.product.imageUrl.startsWith("http")
                      ? item.product.imageUrl
                      : `/` + item.product.imageUrl.replace(/^\/+/, "")
                    : "/pic/placeholder-product.png"
                }
                alt={item.product?.name || "محصول"}
                width={64}
                height={64}
                className="rounded-lg object-cover"
                unoptimized
              />
              {item.quantity > 1 && (
                <div className="absolute top-1 right-1 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
                  {item.quantity}×
                </div>
              )}
            </div>
          ))}
          {remainingCount > 0 && (
            <div className="w-16 h-16 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-600 font-medium text-sm flex-shrink-0">
              +{remainingCount}
            </div>
          )}
        </div>
      </div>
      {/* مالی */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg mb-4">
        <div className="flex items-center gap-6 text-sm">
          <div>
            <span className="text-gray-600">مبلغ کل:</span>
            <span className="font-bold text-gray-900 mr-2">
              {formatPrice(order.subtotal)}
            </span>
          </div>
          <div>
            <span className="text-gray-600">هزینه ارسال:</span>
            <span className="font-bold text-gray-900 mr-2">
              {formatPrice(order.shippingFee)}
            </span>
          </div>
        </div>
        {order.discountTotal > 0 && (
          <div>
            <span className="text-gray-600">تخفیف:</span>
            <span className="font-bold text-green-600 mr-2">
              {formatPrice(order.discountTotal)}
            </span>
          </div>
        )}
        <div className="text-left">
          <div className="text-sm text-gray-600 mb-1">مبلغ نهایی</div>
          <div className="text-xl font-bold text-blue-600">
            {formatPrice(order.finalTotal)}
          </div>
        </div>
      </div>
      {/* تغییر وضعیت (با Guard, UX) */}
      <div className="flex items-center gap-3 mt-3">
        <label className="text-sm font-medium text-gray-700 min-w-max">
          تغییر وضعیت:
        </label>
        <select
          value={order.status}
          onChange={(e) => handleStatusChange(e.target.value as OrderStatus)}
          disabled={!canChangeStatus || isUpdating || localUpdating}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00B4D8] disabled:bg-gray-100 disabled:cursor-not-allowed text-sm"
        >
          {allowedStatuses.map((status) => (
            <option key={status} value={status}>
              {statusConfig[status].label}
            </option>
          ))}
        </select>
        {(localUpdating || isUpdating) && (
          <RotateCcw className="animate-spin ml-2 text-gray-400" size={20} />
        )}
      </div>
      {/* ریفاند: فقط اگر پرداخت شده/ارسال شده/تحویل داده شده */}
      {["PAID", "SHIPPED", "DELIVERED"].includes(order.status) && (
        <div className="mt-4 flex gap-3">
          <button
            className="px-4 py-2 border border-blue-500 text-blue-500 rounded-lg hover:bg-blue-50 transition-colors text-sm"
            disabled={order.refundStatus === "REFUNDED" || isUpdating}
            onClick={() => setIsRefundModalOpen(true)} // این رو بعداً اضافه کن!
          >
            ریفاند سفارش
          </button>
        </div>
      )}
      {/* نمایش پیام وضعیت ریفاند اگر هست */}
      {order.refundNote && (
        <div className="mt-2 text-xs text-blue-600 bg-blue-50 px-3 py-2 rounded">
          توضیحات ریفاند: {order.refundNote}
        </div>
      )}
      <PartialRefundModal
        order={order}
        isOpen={isRefundModalOpen}
        onClose={() => setIsRefundModalOpen(false)}
        onSubmit={async ({ amount, note }) => {
          await adminOrderApi.createRefund(order.id, {
            amount,
            note,
          });
          onUpdated?.();
        }}
      />
    </div>
  );
}
