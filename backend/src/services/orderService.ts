import { prisma } from "../config/db";
import { OrderStatus, PaymentMethod, PaymentStatus } from "@prisma/client";
import { calcShippingFee } from "../lib/shipping";
import {
  InsufficientStockError,
  BlockedProductError,
  EmptyCartError,
  InvalidAddressError,
  OrderError,
} from "../errors/OrderErrors";
export const orderService = {
  // ---------------------------------------------------------------------------
  // CREATE ORDER (PENDING)
  // ---------------------------------------------------------------------------
  async createOrder(options: {
    userId: number;
    addressId: number;
    paymentMethod?: PaymentMethod;
  }) {
    const {
      userId,
      addressId,
      paymentMethod = PaymentMethod.GATEWAY,
    } = options;

    const address = await prisma.address.findUnique({
      where: { id: addressId },
    });
    if (!address || address.userId !== userId) throw new InvalidAddressError();

    // هزینه ارسال بر اساس آدرس
    const shippingFee = calcShippingFee(address.province, address.city);

    const cart = await prisma.cart.findFirst({
      where: { userId },
      include: {
        items: {
          include: {
            variant: {
              include: {
                images: true,
                attributes: {
                  include: { value: { include: { attribute: true } } },
                },
              },
            },
            product: { include: { brand: true, category: true } },
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) throw new EmptyCartError();

    // بررسی بلاک
    const blocked = cart.items.filter((i) => i.product?.isBlock);
    if (blocked.length) {
      throw new BlockedProductError(blocked.map((i) => i.product!.name));
    }
    const originalTotal = cart.items.reduce((sum, item) => {
      return sum + Number(item.variant.price) * item.quantity;
    }, 0);
    // بررسی قیمت و موجودی
    // محاسبه مبالغ — همه سمت سرور
    const subtotal = cart.items.reduce((sum, item) => {
      return sum + Number(item.variant.price) * item.quantity;
    }, 0);

    const discountTotal = cart.items.reduce((sum, item) => {
      const price = Number(item.variant.price);

      const discounted =
        item.variant.discountPrice && Number(item.variant.discountPrice) > 0
          ? Number(item.variant.discountPrice)
          : price;

      return sum + (price - discounted) * item.quantity;
    }, 0);

    const finalTotal = subtotal - discountTotal + shippingFee;
    const trackingCode = `ORD-${Date.now()}-${userId}`;

    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          userId,
          addressId,
          shippingFullName: address.fullName,
          shippingPhone: address.phone,
          shippingProvince: address.province,
          shippingCity: address.city,
          shippingPostalCode: address.postalCode,
          shippingNotes: address.notes,
          shippingAddress: address.street,
          subtotal,

          discountTotal,
          shippingFee,
          finalTotal,
          trackingCode,
          status: OrderStatus.PENDING,
        },
      });

      for (const item of cart.items) {
        if (!item.product)
          throw new OrderError("محصول حذف شده است.", "PRODUCT_DELETED");
        if (!item.variant)
          throw new OrderError("این تنوع دیگر موجود نیست.", "VARIANT_DELETED");
        if (item.variant.stock < item.quantity) {
          throw new InsufficientStockError(
            item.product.name,
            item.variant.stock,
          );
        }

        const unitPrice =
          item.variant.discountPrice && Number(item.variant.discountPrice) > 0
            ? Number(item.variant.discountPrice)
            : Number(item.variant.price);

        const variantName = item.variant.attributes.length
          ? item.variant.attributes.map((va) => va.value.value).join(" / ")
          : null;

        // snapshot کامل — بدون وابستگی به جداول دیگر
        const variantAttributesSummary = item.variant.attributes.length
          ? item.variant.attributes
              .map((va) => `${va.value.attribute.name}: ${va.value.value}`)
              .join(" | ")
          : null;

        await tx.orderItem.create({
          data: {
            orderId: newOrder.id,
            productId: item.productId,
            variantId: item.variantId,
            sku: item.variant.sku ?? "",
            quantity: item.quantity,
            productName: item.product!.name,
            variantName,
            variantAttributesSummary,
            brandName: item.product!.brand?.name ?? null,
            categoryName: item.product!.category?.name ?? null,
            imageUrl:
              item.variant.images[0]?.url ?? item.product!.imageUrl ?? null,
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
        if (!item.variantId || !item.productId) {
          // محصول/واریانت حذف شده — نباید برای سفارش PENDING پیش بیاد، اما برای اطمینان skip می‌کنیم
          console.warn(`OrderItem ${item.id} فاقد productId/variantId است`);
          continue;
        }

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
