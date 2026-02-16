import { prisma } from "../config/db";
import {
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
} from "@prisma/client";

/**
 * Order Service
 * - createOrder: ایجاد سفارش در حالت PENDING
 * - verifyPayment: شبیه‌سازی پرداخت موفق (mock)
 * - cancelOrder: لغو سفارش قبل از پرداخت
 * - getUserOrders / getOrderById
 */
export const orderService = {
  // ---------------------------------------------------------------------------
  // CREATE ORDER (PENDING)
  // ---------------------------------------------------------------------------
  async createOrder(options: {
    userId: number;
    addressId: number;
    shippingCost: number;
  }) {
    const { userId, addressId, shippingCost } = options;

    // 1️⃣ دریافت سبد
    const cart = await prisma.cart.findFirst({
      where: { userId },
      include: {
        items: {
          include: {
            product: true,
            variant: true,
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      throw new Error("سبد خرید خالی است");
    }

    // 2️⃣ بررسی بلاک بودن محصولات
    const blocked = cart.items.filter((i) => i.product.isBlock);
    if (blocked.length) {
      throw new Error(
        `محصولات غیرفعال: ${blocked.map((i) => i.product.name).join(", ")}`
      );
    }

    // 3️⃣ soft stock check
    for (const item of cart.items) {
      if (item.variant.stock < item.quantity) {
        throw new Error(
          `موجودی ${item.product.name} کافی نیست (موجودی: ${item.variant.stock})`
        );
      }
    }

    // 4️⃣ محاسبه قیمت‌ها
    const subtotal = cart.items.reduce(
      (sum, item) => sum + Number(item.variant.price) * item.quantity,
      0
    );

    const discountTotal = cart.items.reduce((sum, item) => {
      const price = Number(item.variant.price);
      const discounted =
        item.variant.discountPrice &&
        Number(item.variant.discountPrice) > 0
          ? Number(item.variant.discountPrice)
          : price;
      return sum + (price - discounted) * item.quantity;
    }, 0);

    const finalTotal = subtotal + shippingCost - discountTotal;
    const trackingCode = `ORD-${Date.now()}-${userId}`;

    // 5️⃣ Transaction
    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          userId,
          addressId,
          subtotal,
          discountTotal,
          shippingFee: shippingCost,
          finalTotal,
          trackingCode,
          status: OrderStatus.PENDING,
        },
      });

      // order items
      for (const item of cart.items) {
        const unitPrice =
          item.variant.discountPrice &&
          Number(item.variant.discountPrice) > 0
            ? Number(item.variant.discountPrice)
            : Number(item.variant.price);

        await tx.orderItem.create({
          data: {
            orderId: newOrder.id,
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
            unitPrice,
            totalPrice: unitPrice * item.quantity,
          },
        });
      }

      // پاک کردن سبد
      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
      await tx.cart.delete({ where: { id: cart.id } });

      // shipment اولیه
      await tx.shipment.create({
        data: {
          orderId: newOrder.id,
          status: "در انتظار پرداخت",
        },
      });

      // payment mock
      await tx.payment.create({
        data: {
          orderId: newOrder.id,
          amount: finalTotal,
          method: PaymentMethod.GATEWAY,
          status: PaymentStatus.INITIATED,
        },
      });

      return newOrder;
    });

    return order;
  },

  // ---------------------------------------------------------------------------
  // VERIFY PAYMENT (MOCK)
  // ---------------------------------------------------------------------------
  async verifyPayment(orderId: number) {
    return prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: { orderItems: true },
      });

      if (!order || order.status !== OrderStatus.PENDING) {
        throw new Error("سفارش نامعتبر است");
      }

      // hard stock check + decrement
      for (const item of order.orderItems) {
        const variant = await tx.productVariant.findUnique({
          where: { id: item.variantId },
          select: { stock: true },
        });

        if (!variant || variant.stock < item.quantity) {
          throw new Error("موجودی کافی نیست");
        }

        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { stock: { decrement: item.quantity } },
        });

        await tx.product.update({
          where: { id: item.productId },
          data: { soldCount: { increment: item.quantity } },
        });
      }

      // update order
      await tx.order.update({
        where: { id: orderId },
        data: {
          status: OrderStatus.PAID,
          paidAt: new Date(),
        },
      });

      // update payment
      await tx.payment.updateMany({
        where: { orderId },
        data: {
          status: PaymentStatus.PAID,
          paidAt: new Date(),
        },
      });

      // update shipment
      await tx.shipment.updateMany({
        where: { orderId },
        data: {
          status: "در انتظار ارسال",
        },
      });

      return { success: true };
    });
  },

  // ---------------------------------------------------------------------------
  // CANCEL ORDER (ONLY PENDING)
  // ---------------------------------------------------------------------------
  async cancelOrder(orderId: number, userId: number) {
    const order = await prisma.order.findFirst({
      where: { id: orderId, userId },
    });

    if (!order) throw new Error("سفارش یافت نشد");

    if (order.status !== OrderStatus.PENDING) {
      throw new Error("فقط سفارشات در انتظار پرداخت قابل لغو هستند");
    }

    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: orderId },
        data: { status: OrderStatus.CANCELED },
      });

      await tx.payment.updateMany({
        where: { orderId },
        data: { status: PaymentStatus.FAILED },
      });

      await tx.shipment.updateMany({
        where: { orderId },
        data: { status: "لغو شده" },
      });
    });

    return { success: true };
  },

  // ---------------------------------------------------------------------------
  // GET USER ORDERS
  // ---------------------------------------------------------------------------
  async getUserOrders(userId: number) {
    return prisma.order.findMany({
      where: { userId },
      include: {
        orderItems: {
          include: {
            product: { include: { brand: true, category: true } },
            variant: true,
          },
        },
        address: true,
        payments: true,
        shipment: true,
      },
      orderBy: { createdAt: "desc" },
    });
  },

  // ---------------------------------------------------------------------------
  // GET ORDER BY ID
  // ---------------------------------------------------------------------------
  async getOrderById(orderId: number, userId: number) {
    const order = await prisma.order.findFirst({
      where: { id: orderId, userId },
      include: {
        orderItems: {
          include: {
            product: { include: { brand: true, category: true } },
            variant: true,
          },
        },
        address: true,
        payments: true,
        shipment: true,
      },
    });

    if (!order) throw new Error("سفارش یافت نشد");
    return order;
  },
};
