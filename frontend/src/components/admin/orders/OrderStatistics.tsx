// src/components/admin/orders/OrderStatistics.tsx
import {
  Bag2,
  Clock,
  TickCircle,
  TruckFast,
  Box,
  CloseCircle,
  DollarCircle,
} from "iconsax-react";

interface OrderStatistics {
  totalOrders: number;
  pendingOrders: number;
  paidOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  canceledOrders: number;
  totalRevenue: number;
}

interface Props {
  stats: OrderStatistics;
}

export default function OrderStatistics({ stats }: Props) {
  const cards = [
    {
      label: "کل سفارشات",
      value: stats.totalOrders,
      icon: Bag2,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "در انتظار",
      value: stats.pendingOrders,
      icon: Clock,
      color: "text-yellow-600",
      bg: "bg-yellow-50",
    },
    {
      label: "پرداخت شده",
      value: stats.paidOrders,
      icon: TickCircle,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "ارسال شده",
      value: stats.shippedOrders,
      icon: TruckFast,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    },
    {
      label: "تحویل داده شده",
      value: stats.deliveredOrders,
      icon: Box,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "لغو شده",
      value: stats.canceledOrders,
      icon: CloseCircle,
      color: "text-red-600",
      bg: "bg-red-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${card.bg}`}>
                <Icon size="24" className={card.color} variant="Bold" />
              </div>
              <div>
                <p className="text-xs text-gray-500">{card.label}</p>
                <p className="text-xl font-bold text-gray-900">{card.value}</p>
              </div>
            </div>
          </div>
        );
      })}

      {/* درآمد کل */}
      <div className="bg-gradient-to-br from-[#00B4D8] to-[#0090A8] rounded-xl p-4 text-white hover:shadow-md transition-shadow">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-white/20">
            <DollarCircle size="24" className="text-white" variant="Bold" />
          </div>
          <div>
            <p className="text-xs text-white/80">درآمد کل</p>
            <p className="text-xl font-bold">
              {stats.totalRevenue.toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
