import { prisma } from "../config/db";
import { OrderStatus, PaymentStatus, RefundStatus } from "@prisma/client";

interface RefundOptions {
  orderId: number;
  amount: number;
  reason: string;
  restock?: boolean; // آیا موجودی برگردد؟
}

export const refundService = {
  async refundOrder(options: RefundOptions) {
    const { orderId, amount, reason, restock = false } = options;

    return prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: {
          orderItems: true,
          payments: true,
        },
      });

      if (!order) {
        throw new Error("سفارش یافت نشد");
      }

      if (order.status !== OrderStatus.PAID) {
        throw new Error("فقط سفارشات پرداخت‌شده قابل ریفاند هستند");
      }

      const refundable =
        Number(order.finalTotal) - Number(order.refundedAmount);

      if (amount <= 0 || amount > refundable) {
        throw new Error("مبلغ ریفاند نامعتبر است");
      }

      const newRefundedAmount = Number(order.refundedAmount) + Number(amount);

      const isFullRefund = newRefundedAmount >= Number(order.finalTotal);

      // ✅ برگشت موجودی فقط در FULL refund
      if (restock && isFullRefund) {
        for (const item of order.orderItems) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stock: { increment: item.quantity } },
          });

          await tx.product.update({
            where: { id: item.productId },
            data: { soldCount: { decrement: item.quantity } },
          });
        }
      }

      // ✅ تعیین وضعیت ریفاند
      const refundStatus = isFullRefund
        ? RefundStatus.REFUNDED
        : RefundStatus.PARTIALLY_REFUNDED;

      await tx.order.update({
        where: { id: orderId },
        data: {
          refundedAmount: newRefundedAmount,
          refundStatus,
          refundNote: reason,
          refundedAt: new Date(),
          status: isFullRefund ? OrderStatus.CANCELED : OrderStatus.PAID,
        },
      });

      // ✅ MVP: آپدیت پرداخت
      await tx.payment.updateMany({
        where: {
          orderId,
          status: PaymentStatus.PAID,
        },
        data: {
          status: isFullRefund ? PaymentStatus.REFUNDED : PaymentStatus.PAID,
        },
      });

      return {
        success: true,
        refundedAmount: newRefundedAmount,
        refundStatus,
        isFullRefund,
      };
    });
  },
};
