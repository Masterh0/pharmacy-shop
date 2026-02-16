// app/(admin)/manager/profile/orders/page.tsx
"use client";

import { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { adminOrderApi } from "@/lib/api/adminOrder";
import type { OrderStatus } from "@/lib/types/order";

import AdminOrderCard from "@/src/components/admin/orders/AdminOrderCard";
import OrderFilters from "@/src/components/admin/orders/OrderFilters";
import OrderStatistics from "@/src/components/admin/orders/OrderStatistics";

import { SearchNormal1 } from "iconsax-react";

/* =======================
   Types
======================= */
interface OrderFiltersState {
  status?: OrderStatus;
  search?: string;
  page: number;
  limit: number;
}

/* =======================
   Page
======================= */
export default function AdminOrdersPage() {
  const queryClient = useQueryClient();

  const [filters, setFilters] = useState<OrderFiltersState>({
    status: undefined,
    search: "",
    page: 1,
    limit: 10,
  });

  /** ✅ queryKey پایدار */
  const ordersQueryKey = useMemo(
    () => ["admin-orders", filters.status, filters.search, filters.page, filters.limit],
    [filters]
  );

  /* =======================
     Queries
  ======================= */
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ordersQueryKey,
    queryFn: () => adminOrderApi.getAllOrders(filters),
    keepPreviousData: true,
  });

  const { data: stats } = useQuery({
    queryKey: ["order-statistics"],
    queryFn: adminOrderApi.getStatistics,
  });

  /* =======================
     Handlers
  ======================= */
  const updateFilter = <K extends keyof OrderFiltersState>(
    key: K,
    value: OrderFiltersState[K]
  ) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: key === "page" ? (value as number) : 1,
    }));
  };

  const handleOrderUpdated = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
    queryClient.invalidateQueries({ queryKey: ["order-statistics"] });
  };

  /* =======================
     Render
  ======================= */
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">مدیریت سفارشات</h1>
        <p className="text-sm text-gray-500 mt-1">
          مشاهده و مدیریت تمام سفارشات فروشگاه
        </p>
      </div>

      {/* Statistics */}
      {stats && <OrderStatistics stats={stats} />}

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <SearchNormal1
              size="20"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="جستجو در کد سفارش یا نام کاربر..."
              value={filters.search}
              onChange={(e) => updateFilter("search", e.target.value)}
              className="w-full pr-10 pl-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00B4D8]"
            />
          </div>

          {/* Status Filter */}
          <OrderFilters
            selectedStatus={filters.status}
            onStatusChange={(status) => updateFilter("status", status)}
          />
        </div>
      </div>

      {/* Orders */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="py-12 text-center text-gray-500">
            در حال بارگذاری سفارشات...
          </div>
        ) : data?.orders.length === 0 ? (
          <div className="bg-white rounded-xl border p-12 text-center">
            <p className="text-gray-500">هیچ سفارشی یافت نشد</p>
          </div>
        ) : (
          <>
            {data?.orders.map((order) => (
              <AdminOrderCard
                key={order.id}
                order={order}
                onUpdated={handleOrderUpdated}
                isUpdating={isFetching}
              />
            ))}

            {/* Pagination */}
            {data && data.pagination.totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                <button
                  disabled={filters.page === 1}
                  onClick={() => updateFilter("page", filters.page - 1)}
                  className="px-4 py-2 border rounded-lg disabled:opacity-50"
                >
                  قبلی
                </button>

                {Array.from(
                  { length: data.pagination.totalPages },
                  (_, i) => i + 1
                ).map((page) => (
                  <button
                    key={page}
                    onClick={() => updateFilter("page", page)}
                    className={`w-10 h-10 rounded-lg ${
                      page === filters.page
                        ? "bg-[#00B4D8] text-white"
                        : "border hover:bg-gray-50"
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  disabled={filters.page === data.pagination.totalPages}
                  onClick={() => updateFilter("page", filters.page + 1)}
                  className="px-4 py-2 border rounded-lg disabled:opacity-50"
                >
                  بعدی
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
