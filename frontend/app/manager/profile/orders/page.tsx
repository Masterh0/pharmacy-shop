// app/(admin)/manager/profile/orders/page.tsx
"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { adminOrderApi } from "@/lib/api/adminOrder";
import type { OrderStatus } from "@/lib/types/order";

import AdminOrderCard from "@/src/components/admin/orders/AdminOrderCard";
import OrderFilters from "@/src/components/admin/orders/OrderFilters";
import OrderStatistics from "@/src/components/admin/orders/OrderStatistics";

import { SearchNormal1 } from "iconsax-react";

interface OrderFiltersState {
  status?: OrderStatus;
  search?: string;
  page: number;
  limit: number;
}

const DEBOUNCE_MS = 400;

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

export default function AdminOrdersPage() {
  const queryClient = useQueryClient();

  // مقدار لحظه‌ای input (برای نمایش)
  const [searchInput, setSearchInput] = useState("");

  const [filters, setFilters] = useState<OrderFiltersState>({
    status: undefined,
    search: "",
    page: 1,
    limit: 10,
  });

  // مقدار debounce‌شده برای ارسال به API
  const debouncedSearch = useDebounce(searchInput, DEBOUNCE_MS);

  // هر بار که debouncedSearch عوض شد، filters رو sync کن و به صفحه ۱ برگرد
  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      search: debouncedSearch,
      page: 1,
    }));
  }, [debouncedSearch]);

  const ordersQueryKey = useMemo(
    () => [
      "admin-orders",
      filters.status,
      filters.search,
      filters.page,
      filters.limit,
    ],
    [filters],
  );

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ordersQueryKey,
    queryFn: () => adminOrderApi.getAllOrders(filters),
    placeholderData: (prev) => prev,
  });

  const { data: stats } = useQuery({
    queryKey: ["order-statistics"],
    queryFn: adminOrderApi.getStatistics,
  });

  const updateFilter = useCallback(
    <K extends keyof OrderFiltersState>(
      key: K,
      value: OrderFiltersState[K],
    ) => {
      setFilters((prev) => ({
        ...prev,
        [key]: value,
        page: key === "page" ? (value as number) : 1,
      }));
    },
    [],
  );

  const handleOrderUpdated = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
    queryClient.invalidateQueries({ queryKey: ["order-statistics"] });
  }, [queryClient]);

  const orders = data?.orders ?? [];
  const pagination = data?.pagination;
  const totalPages = pagination?.totalPages ?? 1;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">مدیریت سفارشات</h1>
        <p className="text-sm text-gray-500 mt-1">
          مشاهده و مدیریت تمام سفارشات فروشگاه
        </p>
      </div>

      {stats && <OrderStatistics stats={stats} />}

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <SearchNormal1
              size="20"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="جستجو در کد سفارش یا نام کاربر..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pr-10 pl-4 py-2.5 border border-gray-300 rounded-lg
                         focus:outline-none focus:ring-2 focus:ring-[#00B4D8]"
            />
          </div>

          <OrderFilters
            selectedStatus={filters.status}
            onStatusChange={(status) => updateFilter("status", status)}
          />
        </div>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse h-28"
            />
          ))
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <p className="text-gray-500">هیچ سفارشی یافت نشد</p>
          </div>
        ) : (
          <>
            <div
              className={
                isFetching
                  ? "opacity-60 pointer-events-none transition-opacity"
                  : ""
              }
            >
              {orders.map((order) => (
                <AdminOrderCard
                  key={order.id}
                  order={order}
                  onUpdated={handleOrderUpdated}
                  isUpdating={isFetching}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-6 flex-wrap">
                <button
                  disabled={filters.page === 1}
                  onClick={() => updateFilter("page", filters.page - 1)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm
                             disabled:opacity-40 hover:bg-gray-50 transition-colors"
                >
                  قبلی
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => updateFilter("page", page)}
                      className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                        page === filters.page
                          ? "bg-[#00B4D8] text-white shadow-sm"
                          : "border border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {page}
                    </button>
                  ),
                )}

                <button
                  disabled={filters.page === totalPages}
                  onClick={() => updateFilter("page", filters.page + 1)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm
                             disabled:opacity-40 hover:bg-gray-50 transition-colors"
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
