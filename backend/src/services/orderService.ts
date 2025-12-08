// src/services/orderService.ts
import { prisma } from "../config/db";

export const orderService = {
  async createOrder(options: {
    userId: number;
    addressId: number;
    shippingCost: number;
  }) {
    const { userId, addressId, shippingCost } = options;

    // ۱️⃣ دریافت سبد خرید
    const cart = await prisma.cart.findFirst({
      where: { userId },
      include: {
        items: {
          include: {
            variant: true,
            product: true,
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      throw new Error("سبد خرید خالی است");
    }

    // ۲️⃣ محاسبه مجموع‌ها
    const subtotal = cart.items.reduce((sum, item) => {
      const unitPrice = Number(
        item.variant.discountPrice ?? item.variant.price
      );
      return sum + unitPrice * item.quantity;
    }, 0);

    const discountTotal = cart.items.reduce((sum, item) => {
      const price = Number(item.variant.price);
      const discounted = Number(item.variant.discountPrice ?? price);
      return sum + (price - discounted) * item.quantity;
    }, 0);

    const finalTotal = subtotal + shippingCost;

    // ۳️⃣ شروع تراکنش
    const order = await prisma.$transaction(async (tx) => {
      // ۳.۱ Order اصلی
      const newOrder = await tx.order.create({
        data: {
          userId,
          addressId,
          subtotal,
          discountTotal,
          shippingFee: shippingCost,
          finalTotal,
          status: "PAID", // برای تست؛ در آینده بسته به Gateway تغییر کنه
          paidAt: new Date(),
        },
      });

      // ۳.۲ افزودن آیتم‌ها
      for (const item of cart.items) {
        const itemPrice = Number(
          item.variant.discountPrice ?? item.variant.price
        );
        await tx.orderItem.create({
          data: {
            orderId: newOrder.id,
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
            unitPrice: itemPrice,
            totalPrice: itemPrice * item.quantity,
          },
        });

        // کاهش موجودی انبار
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      // ۳.۳ پاک کردن سبد خرید
      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
      await tx.cart.delete({ where: { id: cart.id } });

      // ۳.۴ ایجاد shipment (اختیاری)
      await tx.shipment.create({
        data: {
          orderId: newOrder.id,
          status: "در انتظار ارسال",
        },
      });

      return newOrder;
    });

    return order;
  },

  async getUserOrders(userId: number) {
    return prisma.order.findMany({
      where: { userId },
      include: { orderItems: true, address: true, payments: true },
      orderBy: { createdAt: "desc" },
    });
  },

  async getOrderById(orderId: number, userId: number) {
    const order = await prisma.order.findFirst({
      where: { id: orderId, userId },
      include: {
        orderItems: { include: { product: true, variant: true } },
        address: true,
      },
    });
    if (!order) throw new Error("سفارش یافت نشد");
    return order;
  },
};
