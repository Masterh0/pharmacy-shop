"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { orderApi } from "@/lib/api/order";
import type { Order } from "@/lib/types/order";

/**
 * 🧾 useOrders - مدیریت کامل سفارش‌ها با React Query
 * شامل:
 *  - لیست سفارش‌ها
 *  - جزئیات سفارش خاص
 *  - ایجاد سفارش جدید
 */
export function useOrders() {
  const queryClient = useQueryClient();

  /** 📋 لیست همه سفارش‌های کاربر جاری */
  const ordersQuery = useQuery<Order[]>({
    queryKey: ["orders"],
    queryFn: orderApi.list,
  });

  /** 🔍 هوک داخلی برای دریافت جزئیات یک سفارش خاص */
  const useOrderById = (orderId: number | undefined) =>
    useQuery<Order>({
      queryKey: ["orders", orderId],
      queryFn: () => orderApi.getById(orderId as number),
      enabled: !!orderId,
    });

  /** 🧩 Mutation برای ساخت سفارش جدید */
  const createOrder = useMutation({
    mutationFn: orderApi.create,
    onSuccess: (newOrder: Order) => {
      toast.success("سفارش با موفقیت ثبت شد 🎉");
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "خطا در ثبت سفارش 😢");
    },
  });

  return {
    // لیست سفارش‌ها
    orders: ordersQuery.data,
    isLoadingOrders: ordersQuery.isLoading,
    isOrdersError: ordersQuery.isError,

    // جزئیات سفارش
    useOrderById,

    // ایجاد سفارش
    createOrder: createOrder.mutate,
    isCreating: createOrder.isPending,
    isCreated: createOrder.isSuccess,
  };
}
