// src/services/orderService.ts
import { prisma } from "../config/db";
import { Prisma } from "@prisma/client"; // این import برای استفاده از تراکنش‌ها ضروری است

export const orderService = {
  async createOrder(options: {
    userId: number;
    addressId: number;
    shippingCost: number;
  }) {
    const { userId, addressId, shippingCost } = options;

    // ۱️⃣ دریافت سبد خرید کاربر به همراه Product و ProductVariant برای هر آیتم
    const cart = await prisma.cart.findFirst({
      where: { userId },
      include: {
        items: {
          include: {
            variant: true, // ProductVariant مدل مربوط به CartItem.variantId
            product: true, // Product مدل مربوط به CartItem.productId
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      throw new Error("سبد خرید خالی است");
    }

    // ۲️⃣ محاسبه مجموع‌ها (Subtotal, DiscountTotal, FinalTotal)
    const subtotal = cart.items.reduce((sum, item) => {
      // استفاده از discountPrice اگر معتبر باشد، در غیر این صورت price
      const unitPrice = Number(
        item.variant.discountPrice && Number(item.variant.discountPrice) > 0
          ? item.variant.discountPrice
          : item.variant.price
      );
      return sum + unitPrice * item.quantity;
    }, 0);

    const discountTotal = cart.items.reduce((sum, item) => {
      const price = Number(item.variant.price);
      const discounted = Number(
        item.variant.discountPrice && Number(item.variant.discountPrice) > 0
          ? item.variant.discountPrice
          : price
      );
      return sum + (price - discounted) * item.quantity;
    }, 0);

    const finalTotal = subtotal + shippingCost;

    // ۳️⃣ شروع تراکنش برای اطمینان از اتمیک بودن عملیات (یا همه موفق یا همه ناموفق)
    const order = await prisma.$transaction(async (tx) => {
      // ۳.۱ ایجاد Order اصلی
      const newOrder = await tx.order.create({
        data: {
          userId,
          addressId,
          subtotal,
          discountTotal,
          shippingFee: shippingCost,
          finalTotal,
          status: "PENDING", // وضعیت اولیه PENDING است تا پس از پرداخت نهایی شود
          // paidAt: new Date(), // این فیلد باید پس از تأیید موفق پرداخت به‌روز شود
        },
      });

      // ۳.۲ ایجاد OrderItem ها، کاهش موجودی (stock) و افزایش تعداد فروش (soldCount)
      for (const item of cart.items) {
        const itemPrice = Number(
          item.variant.discountPrice && Number(item.variant.discountPrice) > 0
            ? item.variant.discountPrice
            : item.variant.price
        );

        // ایجاد هر OrderItem برای سفارش جدید
        await tx.orderItem.create({
          data: {
            orderId: newOrder.id,
            productId: item.productId, // Product.id از CartItem
            variantId: item.variantId, // ProductVariant.id از CartItem
            quantity: item.quantity,
            unitPrice: itemPrice,
            totalPrice: itemPrice * item.quantity,
          },
        });

        // کاهش موجودی انبار (stock) برای ProductVariant مربوطه
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { stock: { decrement: item.quantity } },
        });

        // ✅ افزایش soldCount برای Product مرتبط
        // از item.productId استفاده می‌کنیم که به Product.id اشاره دارد
        await tx.product.update({
          where: { id: item.productId },
          data: {
            soldCount: {
              increment: item.quantity, // soldCount به تعداد آیتم‌های فروخته شده افزایش می‌یابد
            },
          },
        });
      }

      // ۳.۳ پاک کردن آیتم‌های سبد خرید و سپس خود سبد خرید کاربر
      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
      await tx.cart.delete({ where: { id: cart.id } });

      // ۳.۴ ایجاد رکورد حمل و نقل (Shipment) اولیه
      await tx.shipment.create({
        data: {
          orderId: newOrder.id,
          status: "در انتظار ارسال", // وضعیت اولیه حمل و نقل
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
