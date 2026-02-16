// src/components/admin/orders/OrderFilters.tsx
import { OrderStatus } from "@/lib/types/order";

interface Props {
  selectedStatus?: OrderStatus;
  onStatusChange: (status?: OrderStatus) => void;
}

const filters = [
  { label: "همه", value: undefined },
  { label: "در انتظار", value: "PENDING" as OrderStatus },
  { label: "پرداخت شده", value: "PAID" as OrderStatus },
  { label: "ارسال شده", value: "SHIPPED" as OrderStatus },
  { label: "تحویل داده شده", value: "DELIVERED" as OrderStatus },
  { label: "لغو شده", value: "CANCELED" as OrderStatus },
];

export default function OrderFilters({ selectedStatus, onStatusChange }: Props) {
  return (
    <div className="flex gap-2 flex-wrap">
      {filters.map((filter) => (
        <button
          key={filter.label}
          onClick={() => onStatusChange(filter.value)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            selectedStatus === filter.value
              ? "bg-[#00B4D8] text-white shadow-md"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}
