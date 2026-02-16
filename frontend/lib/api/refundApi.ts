// lib/api/refundApi.ts
import api from "@/lib/axios";
import type { Order, RefundStatus } from "@/lib/types/order";

export interface RefundPayload {
  amount: number;
  reason: string;
  restock?: boolean;
}

export interface RefundResponse {
  message: string;
  data: {
    order: Order;
    refundedAmount: number;
    refundStatus: RefundStatus;
  };
}

/**
 * 💸 ریفاند سفارش
 * دسترسی: ADMIN / STAFF
 *
 * POST /orders/:orderId/refund
 */
export const refundApi = {
  async refundOrder(
    orderId: number,
    payload: RefundPayload
  ): Promise<RefundResponse> {
    const { data } = await api.post(
      `/orders/${orderId}/refund`,
      payload
    );
    return data;
  },
};
