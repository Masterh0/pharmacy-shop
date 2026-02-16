// lib/api/adminOrderApi.ts
import api from "@/lib/axios";
import type { Order, OrderStatus, RefundStatus } from "@/lib/types/order";

interface AdminOrderFilters {
  status?: OrderStatus;
  userId?: number;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  search?: string;
}

interface AdminOrderListResponse {
  orders: Order[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface OrderStatistics {
  totalOrders: number;
  pendingOrders: number;
  paidOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  canceledOrders: number;
  totalRevenue: number;
}

/** ✅ Payload ریفاند */
interface CreateRefundPayload {
  type: "full" | "partial";
  amount?: number; // برای partial
  reason?: string;
  restock?: boolean;
}

/** ✅ Response ریفاند */
interface RefundResponse {
  success: boolean;
  refundStatus: RefundStatus;
  refundedAmount: number;
  order: Order;
}

export const adminOrderApi = {
  /** 📊 لیست سفارشات */
  async getAllOrders(
    filters?: AdminOrderFilters
  ): Promise<AdminOrderListResponse> {
    const { data } = await api.get("/admin/orders", { params: filters });
    return data;
  },

  /** 🔍 جزئیات سفارش */
  async getOrderDetails(orderId: number): Promise<Order> {
    const { data } = await api.get(`/admin/orders/${orderId}`);
    return data;
  },

  /** ✏️ تغییر وضعیت سفارش */
  async updateOrderStatus(
    orderId: number,
    status: OrderStatus
  ): Promise<{ success: boolean; order: Order }> {
    const { data } = await api.patch(`/admin/orders/${orderId}/status`, {
      status,
    });
    return data;
  },

  /** 💸 ✅ ایجاد ریفاند (جدید) */
  async createRefund(
    orderId: number,
    payload: CreateRefundPayload
  ): Promise<RefundResponse> {
    const { data } = await api.post(`/admin/orders/${orderId}/refund`, payload);
    return data;
  },

  /** 📈 آمار سفارشات */
  async getStatistics(): Promise<OrderStatistics> {
    const { data } = await api.get("/admin/orders/statistics");
    return data;
  },

  /** 🗑️ حذف سفارش */
  async deleteOrder(orderId: number): Promise<{ success: boolean }> {
    const { data } = await api.delete(`/admin/orders/${orderId}`);
    return data;
  },
};
