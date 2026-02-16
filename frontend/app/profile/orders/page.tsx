// app/(customer)/profile/orders/page.tsx
"use client";

import { useState } from "react";
import { orderApi } from "@/lib/api/order";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns-jalali";
import { 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Package,
  ChevronLeft,
  Calendar,
  CreditCard,
  ShoppingBag
} from "lucide-react";

type OrderTab = "all" | "pending" | "delivered" | "canceled";
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";

export default function OrdersHistoryPage() {
  const [activeTab, setActiveTab] = useState<OrderTab>("all");

  const { data, isLoading } = useQuery({
    queryKey: ["user-orders"],
    queryFn: () => orderApi.list(),
  });

  const orders = data?.orders || [];

  const filteredOrders = orders.filter((order) => {
    if (activeTab === "all") return true;
    if (activeTab === "pending")
      return order.status === "PENDING" || order.status === "PAID";
    if (activeTab === "delivered") return order.status === "DELIVERED";
    if (activeTab === "canceled") return order.status === "CANCELED";
    return true;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-[#00B4D8]/30 border-t-[#00B4D8] rounded-full animate-spin" />
          <p className="text-gray-500">در حال بارگذاری سفارشات...</p>
        </div>
      </div>
    );
  }

  return (
    <div dir="rtl" className="max-w-6xl mx-auto px-4 py-8">
      {/* هدر با گرادیانت */}
      <div className="bg-gradient-to-br from-[#00B4D8]/5 to-transparent border border-[#EDEDED] rounded-2xl p-8 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-[#242424] mb-2">
              تاریخچه سفارشات
            </h1>
            <p className="text-gray-500">
              {orders.length.toLocaleString("fa-IR")} سفارش ثبت شده
            </p>
          </div>
          <ShoppingBag className="w-12 h-12 text-[#00B4D8]/20" />
        </div>

        {/* تب‌های فیلتر - طراحی مدرن */}
        <div className="flex gap-3">
          <FilterTab
            active={activeTab === "all"}
            onClick={() => setActiveTab("all")}
            label="همه"
            count={orders.length}
            icon={<Package className="w-4 h-4" />}
          />
          <FilterTab
            active={activeTab === "pending"}
            onClick={() => setActiveTab("pending")}
            label="جاری"
            count={
              orders.filter(
                (o) => o.status === "PENDING" || o.status === "PAID"
              ).length
            }
            icon={<Clock className="w-4 h-4" />}
            color="yellow"
          />
          <FilterTab
            active={activeTab === "delivered"}
            onClick={() => setActiveTab("delivered")}
            label="تحویل شده"
            count={orders.filter((o) => o.status === "DELIVERED").length}
            icon={<CheckCircle2 className="w-4 h-4" />}
            color="green"
          />
          <FilterTab
            active={activeTab === "canceled"}
            onClick={() => setActiveTab("canceled")}
            label="لغو شده"
            count={orders.filter((o) => o.status === "CANCELED").length}
            icon={<XCircle className="w-4 h-4" />}
            color="red"
          />
        </div>
      </div>

      {/* لیست سفارشات */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <EmptyState activeTab={activeTab} />
        ) : (
          filteredOrders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))
        )}
      </div>
    </div>
  );
}

// کامپوننت تب فیلتر پیشرفته
function FilterTab({
  active,
  onClick,
  label,
  count,
  icon,
  color = "blue",
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
  icon: React.ReactNode;
  color?: "blue" | "yellow" | "green" | "red";
}) {
  const colors = {
    blue: "bg-[#00B4D8] text-white",
    yellow: "bg-yellow-500 text-white",
    green: "bg-green-500 text-white",
    red: "bg-red-500 text-white",
  };

  const inactiveColors = {
    blue: "hover:bg-[#00B4D8]/5 hover:text-[#00B4D8]",
    yellow: "hover:bg-yellow-50 hover:text-yellow-600",
    green: "hover:bg-green-50 hover:text-green-600",
    red: "hover:bg-red-50 hover:text-red-600",
  };

  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all duration-300 ${
        active
          ? `${colors[color]} shadow-lg scale-105`
          : `bg-white text-gray-600 border border-gray-200 ${inactiveColors[color]}`
      }`}
    >
      {icon}
      <span>{label}</span>
      <span
        className={`text-xs px-2 py-0.5 rounded-full ${
          active ? "bg-white/20" : "bg-gray-100"
        }`}
      >
        {count.toLocaleString("fa-IR")}
      </span>
    </button>
  );
}

// کامپوننت کارت سفارش - طراحی مدرن و زیبا
function OrderCard({ order }: { order: any }) {
  const statusConfig = getStatusConfig(order.status);

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 group">
      {/* هدر با وضعیت */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl ${statusConfig.bgColor}`}>
            {statusConfig.icon}
          </div>
          <div>
            <h3 className="font-bold text-[#242424]">{statusConfig.label}</h3>
            <p className="text-sm text-gray-500 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {format(new Date(order.createdAt), "d MMMM yyyy - HH:mm")}
            </p>
          </div>
        </div>

        <div className="text-left">
          <p className="text-xs text-gray-500">کد پیگیری</p>
          <p className="font-mono font-bold text-[#00B4D8]">
            #{order.trackingCode || order.id}
          </p>
        </div>
      </div>

      {/* خلاصه مالی */}
      <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-gradient-to-br from-gray-50 to-transparent rounded-xl">
        <div>
          <p className="text-xs text-gray-500 mb-1">مبلغ کل</p>
          <p className="font-bold text-[#242424]">
            {Number(order.subtotal).toLocaleString("fa-IR")} تومان
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">تخفیف</p>
          <p className="font-bold text-green-600">
            {Number(order.discountTotal).toLocaleString("fa-IR")} تومان
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
            <CreditCard className="w-3 h-3" />
            مبلغ نهایی
          </p>
          <p className="font-bold text-[#00B4D8] text-lg">
            {Number(order.finalTotal).toLocaleString("fa-IR")} تومان
          </p>
        </div>
      </div>

      {/* تصاویر محصولات - گرید زیبا */}
      <div className="mb-6">
        <p className="text-sm text-gray-500 mb-3">
          {order.orderItems.length.toLocaleString("fa-IR")} محصول
        </p>
        <div className="grid grid-cols-6 gap-3">
          {order.orderItems.slice(0, 5).map((item: any) => (
            <div
              key={item.id}
              className="relative aspect-square rounded-lg overflow-hidden border-2 border-gray-100 hover:border-[#00B4D8] transition-all group"
            >
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
                className="object-cover group-hover:scale-110 transition-transform duration-300"
                unoptimized
              />
              {item.quantity > 1 && (
                <div className="absolute top-1 left-1 bg-[#00B4D8] text-white text-xs px-2 py-0.5 rounded-full font-bold">
                  ×{item.quantity.toLocaleString("fa-IR")}
                </div>
              )}
            </div>
          ))}

          {order.orderItems.length > 5 && (
            <div className="relative aspect-square rounded-lg overflow-hidden border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center">
              <p className="text-2xl font-bold text-gray-400">
                +{(order.orderItems.length - 5).toLocaleString("fa-IR")}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* دکمه مشاهده */}
      <Link
        href={`/customer/orders/${order.id}`}
        className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gradient-to-l from-[#00B4D8] to-[#0090A8] text-white font-medium hover:shadow-lg hover:scale-[1.02] transition-all group"
      >
        <span>مشاهده جزئیات سفارش</span>
        <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
      </Link>
    </div>
  );
}

// حالت خالی بودن لیست
function EmptyState({ activeTab }: { activeTab: OrderTab }) {
  const messages = {
    all: "هنوز سفارشی ثبت نکرده‌اید",
    pending: "سفارش جاری وجود ندارد",
    delivered: "سفارش تحویل شده‌ای ندارید",
    canceled: "سفارش لغو شده‌ای ندارید",
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
      <Package className="w-20 h-20 mx-auto mb-4 text-gray-300" />
      <h3 className="text-xl font-bold text-gray-400 mb-2">
        {messages[activeTab]}
      </h3>
      <p className="text-gray-500 mb-6">
        {activeTab === "all"
          ? "با خرید محصولات، اولین سفارش خود را ثبت کنید"
          : "در این بخش سفارشی یافت نشد"}
      </p>
      {activeTab === "all" && (
        <Link
          href="/products"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#00B4D8] text-white rounded-xl hover:bg-[#0090A8] transition"
        >
          <ShoppingBag className="w-5 h-5" />
          <span>مشاهده محصولات</span>
        </Link>
      )}
    </div>
  );
}

// پیکربندی وضعیت‌ها
function getStatusConfig(status: string) {
  const configs: Record<
    string,
    { label: string; icon: React.ReactNode; bgColor: string }
  > = {
    PENDING: {
      label: "در انتظار پرداخت",
      icon: <Clock className="w-5 h-5 text-yellow-600" />,
      bgColor: "bg-yellow-50",
    },
    PAID: {
      label: "پرداخت شده",
      icon: <CheckCircle2 className="w-5 h-5 text-blue-600" />,
      bgColor: "bg-blue-50",
    },
    SHIPPED: {
      label: "ارسال شده",
      icon: <Package className="w-5 h-5 text-purple-600" />,
      bgColor: "bg-purple-50",
    },
    DELIVERED: {
      label: "تحویل شده",
      icon: <CheckCircle2 className="w-5 h-5 text-green-600" />,
      bgColor: "bg-green-50",
    },
    CANCELED: {
      label: "لغو شده",
      icon: <XCircle className="w-5 h-5 text-red-600" />,
      bgColor: "bg-red-50",
    },
  };

  return (
    configs[status] || {
      label: status,
      icon: <Package className="w-5 h-5" />,
      bgColor: "bg-gray-50",
    }
  );
}
