// src/services/adminOrderService.ts
import { prisma } from "../config/db";
import { Prisma, OrderStatus, RefundStatus } from "@prisma/client";

export const adminOrderService = {
  // ===============================
  // دریافت همه سفارشات با فیلترها
  // ===============================
  async getAllOrders(filters?: {
    status?: OrderStatus;
    userId?: number;
    search?: string; // ← اضافه شد
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
  }) {
    const {
      status,
      userId,
      search,
      startDate,
      endDate,
      page = 1,
      limit = 20,
    } = filters || {};

    const where: Prisma.OrderWhereInput = {};

    if (status) where.status = status;
    if (userId) where.userId = userId;

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) (where.createdAt as Prisma.DateTimeFilter).gte = startDate;
      if (endDate) (where.createdAt as Prisma.DateTimeFilter).lte = endDate;
    }

    // جستجو در id یا نام کاربر
    if (search) {
      const searchNum = parseInt(search, 10);
      const isValidOrderId =
        /^\d+$/.test(search) && !isNaN(searchNum) && searchNum <= 2_147_483_647;

      where.OR = [
        ...(isValidOrderId ? [{ id: searchNum }] : []),
        { user: { name: { contains: search, mode: "insensitive" as const } } },
        { user: { phone: { contains: search } } },
      ];
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          user: {
            select: { id: true, name: true, email: true, phone: true },
          },
          address: true,
          orderItems: true, // ← بدون include product/variant (snapshot کافیه)
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
    adminNote?: string,
  ) {
    return prisma.$transaction(async (tx) => {
      // fresh read داخل transaction برای جلوگیری از race condition
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: { orderItems: true },
      });

      if (!order) throw new Error("سفارش یافت نشد");

      const isMovingToPaid =
        status === OrderStatus.PAID &&
        order.status !== OrderStatus.PAID &&
        !order.paidAt;

      const isMovingToCancel =
        status === OrderStatus.CANCELED &&
        order.status !== OrderStatus.CANCELED;

      if (isMovingToPaid) {
        for (const item of order.orderItems) {
          if (!item.variantId) continue;

          const variant = await tx.productVariant.findUnique({
            where: { id: item.variantId },
            select: { stock: true, product: { select: { name: true } } },
          });

          if (!variant || variant.stock < item.quantity) {
            throw new Error(
              `موجودی کافی نیست برای ${variant?.product?.name ?? item.productName ?? `آیتم #${item.id}`} (موجود: ${variant?.stock ?? 0})`,
            );
          }

          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stock: { decrement: item.quantity } },
          });

          if (item.productId) {
            await tx.product.update({
              where: { id: item.productId },
              data: { soldCount: { increment: item.quantity } },
            });
          }
        }
      }

      if (isMovingToCancel) {
        const shouldRestock =
          order.paidAt !== null && order.refundStatus === RefundStatus.NONE;

        if (shouldRestock) {
          for (const item of order.orderItems) {
            if (item.variantId) {
              await tx.productVariant.update({
                where: { id: item.variantId },
                data: { stock: { increment: item.quantity } },
              });
            }

            if (item.productId) {
              await tx.product.update({
                where: { id: item.productId },
                data: { soldCount: { decrement: item.quantity } },
              });
            }
          }
        }
      }

      // آپدیت وضعیت سفارش
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: {
          status,
          adminNotes: adminNote,
          ...(isMovingToPaid ? { paidAt: new Date() } : {}),
        },
      });

      // shipment داخل همین transaction
      if (status === OrderStatus.SHIPPED) {
        await tx.shipment.updateMany({
          where: { orderId },
          data: { status: "در حال ارسال" },
        });
      }

      if (status === OrderStatus.DELIVERED) {
        await tx.shipment.updateMany({
          where: { orderId },
          data: {
            status: "تحویل داده شده",
            deliveredAt: new Date(),
          },
        });
      }

      return updatedOrder;
    });
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
      prisma.order.count({
        where: { ...where, status: OrderStatus.DELIVERED },
      }),
      prisma.order.count({ where: { ...where, status: OrderStatus.CANCELED } }),
      prisma.order.aggregate({
        where: {
          ...where,
          status: {
            in: [OrderStatus.PAID, OrderStatus.SHIPPED, OrderStatus.DELIVERED],
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
