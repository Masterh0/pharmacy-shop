// src/components/admin/orders/AdminOrderCard.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { Order, OrderItem, OrderStatus } from "@/lib/types/order";
import { adminOrderApi } from "@/lib/api/adminOrder";
import {
  CheckCircle2,
  Clock,
  Package,
  Truck,
  XCircle,
  Eye,
  RotateCcw,
  AlertTriangle,
} from "lucide-react";
import toast from "react-hot-toast";
import PartialRefundModal from "./PartialRefundModal";

const statusConfig: Record<
  OrderStatus,
  { label: string; color: string; icon: React.ElementType }
> = {
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
  isUpdating?: boolean;
}

interface ConfirmState {
  open: boolean;
  targetStatus: OrderStatus | null;
}

function getAllowedStatuses(order: Order): OrderStatus[] {
  const { status, refundStatus } = order;
  if (status === "CANCELED" || refundStatus === "REFUNDED") return [status];
  if (status === "DELIVERED") return [status, "CANCELED"];
  if (status === "SHIPPED") return [status, "DELIVERED", "CANCELED"];
  if (status === "PAID") return [status, "SHIPPED", "CANCELED"];
  if (status === "PENDING") return [status, "PAID", "CANCELED"];
  return [status];
}

const BASE_URL =
  typeof window === "undefined"
    ? (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001")
    : (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001");

function getImageUrl(item: OrderItem): string {
  const raw = item.imageUrl ?? item.product?.imageUrl ?? null;
  if (!raw) return "/pic/placeholder-product.png";
  if (raw.startsWith("http")) return raw;
  return `${BASE_URL}/${raw.replace(/^\/+/, "")}`;
}

function formatPrice(price: number | null | undefined): string {
  return new Intl.NumberFormat("fa-IR").format(Number(price ?? 0)) + " تومان";
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ── Confirm Modal ────────────────────────────────────────────────────────────
interface StatusConfirmModalProps {
  orderId: number;
  from: OrderStatus;
  to: OrderStatus;
  onConfirm: () => void;
  onCancel: () => void;
  isBusy: boolean;
}

function StatusConfirmModal({
  orderId,
  from,
  to,
  onConfirm,
  onCancel,
  isBusy,
}: StatusConfirmModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-2xl shadow-xl max-w-sm w-full mx-4 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
          </div>
          <h3 className="text-base font-semibold text-gray-900">
            تأیید تغییر وضعیت
          </h3>
        </div>

        <p className="text-sm text-gray-600 mb-1 leading-relaxed">
          وضعیت سفارش{" "}
          <span className="font-medium text-gray-900">#{orderId}</span> از
        </p>
        <div className="flex items-center gap-2 my-3">
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig[from].color}`}
          >
            {statusConfig[from].label}
          </span>
          <span className="text-gray-400 text-sm">←</span>
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig[to].color}`}
          >
            {statusConfig[to].label}
          </span>
        </div>
        <p className="text-sm text-gray-500 mb-6">
          آیا از این تغییر مطمئن هستید؟
        </p>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isBusy}
            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            انصراف
          </button>
          <button
            onClick={onConfirm}
            disabled={isBusy}
            className="flex-1 px-4 py-2.5 bg-[#00B4D8] hover:bg-[#0096B4] text-white rounded-xl text-sm font-medium disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
          >
            {isBusy ? <RotateCcw className="w-4 h-4 animate-spin" /> : null}
            تأیید
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────
export default function AdminOrderCard({
  order,
  onUpdated,
  isUpdating,
}: AdminOrderCardProps) {
  const [localUpdating, setLocalUpdating] = useState(false);
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const [confirm, setConfirm] = useState<ConfirmState>({
    open: false,
    targetStatus: null,
  });

  const orderItems = order.orderItems ?? [];
  const displayItems = orderItems.slice(0, 5);
  const remainingCount = Math.max(0, orderItems.length - 5);

  const currentStatus = statusConfig[order.status];
  const StatusIcon = currentStatus.icon;

  const allowedStatuses = getAllowedStatuses(order);
  const canChangeStatus = allowedStatuses.length > 1;

  const isBusy = localUpdating || !!isUpdating;

  // وقتی کاربر status جدید انتخاب می‌کنه فقط مودال باز می‌شه
  const handleSelectStatus = (newStatus: OrderStatus) => {
    if (newStatus === order.status || isBusy) return;
    setConfirm({ open: true, targetStatus: newStatus });
  };

  // بعد از تأیید اجرا می‌شه
  const handleConfirmChange = async () => {
    if (!confirm.targetStatus) return;
    setLocalUpdating(true);
    try {
      await adminOrderApi.updateOrderStatus(order.id, confirm.targetStatus);
      toast.success("وضعیت سفارش با موفقیت تغییر یافت!");
      onUpdated?.();
    } catch (error: unknown) {
      const msg =
        error instanceof Error ? error.message : "خطا در تغییر وضعیت سفارش";
      toast.error(msg);
    } finally {
      setLocalUpdating(false);
      setConfirm({ open: false, targetStatus: null });
    }
  };

  const handleCancelConfirm = () => {
    if (!localUpdating) setConfirm({ open: false, targetStatus: null });
  };

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
        {/* هدر */}
        <div className="flex items-start justify-between mb-4 pb-4 border-b border-gray-100">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <h3 className="text-lg font-bold text-gray-900">
                سفارش #{order.id}
              </h3>
              <div
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${currentStatus.color}`}
              >
                <StatusIcon className="w-4 h-4" />
                <span>{currentStatus.label}</span>
              </div>
              {order.refundStatus === "REFUNDED" && (
                <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full">
                  ریفاند شده
                </span>
              )}
              {order.refundStatus === "PARTIALLY_REFUNDED" && (
                <span className="px-2 py-0.5 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                  ریفاند جزئی
                </span>
              )}
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600 flex-wrap">
              <span>👤 {order.user?.name ?? "کاربر ناشناس"}</span>
              <span>📅 {formatDate(order.createdAt)}</span>
            </div>
          </div>
          <Link
            href={`/manager/profile/orders/${order.id}`}
            className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-gray-700 text-sm font-medium flex-shrink-0"
          >
            <Eye className="w-4 h-4" />
            مشاهده جزئیات
          </Link>
        </div>

        {/* محصولات */}
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            محصولات ({orderItems.length})
          </h4>
          <div className="flex items-center gap-2 flex-wrap">
            {displayItems.map((item) => (
              <div
                key={item.id}
                className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0"
                title={item.productName ?? item.product?.name}
              >
                <Image
                  src={getImageUrl(item)}
                  alt={item.productName ?? item.product?.name ?? "محصول"}
                  width={64}
                  height={64}
                  className="object-cover w-full h-full"
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
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-gray-50 rounded-lg mb-4 text-sm">
          <div>
            <p className="text-gray-500 mb-0.5"> مبلغ کل</p>
            <p className="font-semibold text-gray-900">
              {formatPrice(order.subtotal )}
            </p>
          </div>
          <div>
            <p className="text-gray-500 mb-0.5">هزینه ارسال</p>
            <p className="font-semibold text-gray-900">
              {formatPrice(order.shippingFee)}
            </p>
          </div>
          {Number(order.discountTotal) > 0 && (
            <div>
              <p className="text-gray-500 mb-0.5">تخفیف</p>
              <p className="font-semibold text-green-600">
                -{formatPrice(order.discountTotal)}
              </p>
            </div>
          )}
          <div>
            <p className="text-gray-500 mb-0.5">مبلغ نهایی</p>
            <p className="text-lg font-bold text-blue-600">
              {formatPrice(order.finalTotal)}
            </p>
          </div>
        </div>

        {/* تغییر وضعیت */}
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-gray-700 min-w-max">
            تغییر وضعیت:
          </label>
          <select
            value={order.status}
            onChange={(e) => handleSelectStatus(e.target.value as OrderStatus)}
            disabled={!canChangeStatus || isBusy}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00B4D8] disabled:bg-gray-100 disabled:cursor-not-allowed text-sm"
          >
            {allowedStatuses.map((s) => (
              <option key={s} value={s}>
                {statusConfig[s].label}
              </option>
            ))}
          </select>
          {isBusy && (
            <RotateCcw
              className="animate-spin text-gray-400 flex-shrink-0"
              size={20}
            />
          )}
        </div>

        {/* دکمه ریفاند */}
        {(["PAID", "SHIPPED", "DELIVERED"] as OrderStatus[]).includes(
          order.status,
        ) && (
          <div className="mt-4">
            <button
              className="px-4 py-2 border border-blue-500 text-blue-500 rounded-lg hover:bg-blue-50 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={order.refundStatus === "REFUNDED" || isBusy}
              onClick={() => setIsRefundModalOpen(true)}
            >
              ریفاند سفارش
            </button>
          </div>
        )}

        {/* یادداشت ریفاند */}
        {order.refundNote && (
          <div className="mt-3 text-xs text-blue-700 bg-blue-50 border border-blue-100 px-3 py-2 rounded-lg">
            توضیحات ریفاند: {order.refundNote}
          </div>
        )}
      </div>

      {/* مودال کانفیرم تغییر وضعیت */}
      {confirm.open && confirm.targetStatus && (
        <StatusConfirmModal
          orderId={order.id}
          from={order.status}
          to={confirm.targetStatus}
          onConfirm={handleConfirmChange}
          onCancel={handleCancelConfirm}
          isBusy={localUpdating}
        />
      )}

      <PartialRefundModal
        order={order}
        isOpen={isRefundModalOpen}
        onClose={() => setIsRefundModalOpen(false)}
        onSubmit={async ({ amount, note }) => {
          await adminOrderApi.createRefund(order.id, { amount, note });
          onUpdated?.();
        }}
      />
    </>
  );
}
