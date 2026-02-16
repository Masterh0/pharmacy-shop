// src/services/adminOrderService.ts
import { prisma } from "../config/db";
import { OrderStatus, RefundStatus } from "@prisma/client";

export const adminOrderService = {
  // ===============================
  // دریافت همه سفارشات با فیلترها
  // ===============================
  async getAllOrders(filters?: {
    status?: OrderStatus;
    userId?: number;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
  }) {
    const {
      status,
      userId,
      startDate,
      endDate,
      page = 1,
      limit = 20,
    } = filters || {};

    const where: any = {};

    if (status) where.status = status;
    if (userId) where.userId = userId;

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
          address: true,
          orderItems: {
            include: {
              product: true,
              variant: true,
            },
          },
          shipment: true,
          payments: true,
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    return {
      orders,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  // ===============================
  // دریافت جزئیات کامل یک سفارش
  // ===============================
  async getOrderDetails(orderId: number) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        address: true,
        orderItems: {
          include: {
            product: {
              include: {
                brand: true,
                category: true,
              },
            },
            variant: true,
          },
        },
        shipment: true,
        payments: true,
        discountRedemptions: {
          include: {
            discount: true,
          },
        },
      },
    });

    if (!order) throw new Error("سفارش یافت نشد");
    return order;
  },

  // ===============================
  // تغییر وضعیت سفارش (Safe)
  // ===============================
  async updateOrderStatus(
    orderId: number,
    status: OrderStatus,
    adminNote?: string
  ) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { orderItems: true },
    });

    if (!order) throw new Error("سفارش یافت نشد");

    /**
     * ✅ Restock فقط وقتی:
     * - سفارش کنسل می‌شود
     * - قبلاً کنسل نشده
     * - پرداخت شده
     * - ریفاند انجام نشده
     */
    const shouldRestock =
      status === OrderStatus.CANCELED &&
      order.status !== OrderStatus.CANCELED &&
      order.paidAt &&
      order.refundStatus === RefundStatus.NONE;

    if (shouldRestock) {
      await prisma.$transaction(async (tx) => {
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

        await tx.order.update({
          where: { id: orderId },
          data: {
            status,
            adminNotes: adminNote,
          },
        });
      });
    } else {
      await prisma.order.update({
        where: { id: orderId },
        data: {
          status,
          adminNotes: adminNote,
          ...(status === OrderStatus.PAID &&
            !order.paidAt && { paidAt: new Date() }),
        },
      });
    }

    // ===============================
    // وضعیت ارسال
    // ===============================
    if (status === OrderStatus.SHIPPED) {
      await prisma.shipment.update({
        where: { orderId },
        data: { status: "در حال ارسال" },
      });
    }

    if (status === OrderStatus.DELIVERED) {
      await prisma.shipment.update({
        where: { orderId },
        data: {
          status: "تحویل داده شده",
          deliveredAt: new Date(),
        },
      });
    }

    return this.getOrderDetails(orderId);
  },

  // ===============================
  // آمار سفارشات
  // ===============================
  async getOrderStatistics(startDate?: Date, endDate?: Date) {
    const where: any = {};

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const [
      totalOrders,
      pendingOrders,
      paidOrders,
      shippedOrders,
      deliveredOrders,
      canceledOrders,
      totalRevenue,
    ] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.count({ where: { ...where, status: OrderStatus.PENDING } }),
      prisma.order.count({ where: { ...where, status: OrderStatus.PAID } }),
      prisma.order.count({ where: { ...where, status: OrderStatus.SHIPPED } }),
      prisma.order.count({ where: { ...where, status: OrderStatus.DELIVERED } }),
      prisma.order.count({ where: { ...where, status: OrderStatus.CANCELED } }),
      prisma.order.aggregate({
        where: {
          ...where,
          status: {
            in: [
              OrderStatus.PAID,
              OrderStatus.SHIPPED,
              OrderStatus.DELIVERED,
            ],
          },
        },
        _sum: { finalTotal: true },
      }),
    ]);

    return {
      totalOrders,
      pendingOrders,
      paidOrders,
      shippedOrders,
      deliveredOrders,
      canceledOrders,
      totalRevenue: totalRevenue._sum.finalTotal || 0,
    };
  },
};
