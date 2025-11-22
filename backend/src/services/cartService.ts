// src/services/cart.service.ts
import { prisma } from "../config/db";
export class CartService {
  /**
   * پیدا کردن سبد فعال کاربر یا ساخت سبد جدید
   */
  async getOrCreateCart(userId?: number, sessionId?: string) {
    let cart: any;

    if (userId) {
      cart = await prisma.cart.findFirst({ where: { userId } });
      if (!cart) {
        cart = await prisma.cart.create({ data: { userId } });
      }
    } else if (sessionId) {
      cart = await prisma.cart.findUnique({ where: { sessionId } });
      if (!cart) {
        cart = await prisma.cart.create({ data: { sessionId } });
      }
    } else {
      throw new Error("UserId or sessionId is required");
    }

    return cart;
  }

  /**
   * افزودن یا افزایش آیتم در سبد
   */
  async addItem({
    userId,
    sessionId,
    productId,
    variantId,
    quantity,
  }: {
    userId?: number;
    sessionId?: string;
    productId: number;
    variantId: number;
    quantity: number;
  }) {
    const cart = await this.getOrCreateCart(userId, sessionId);

    // پیدا کردن اگر آیتم وجود دارد
    const existingItem = await prisma.cartItem.findUnique({
      where: {
        cartId_variantId: {
          cartId: cart.id,
          variantId,
        },
      },
    });

    if (existingItem) {
      return prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
      });
    }

    // گرفتن اطلاعات قیمت از variant
    const variant = await prisma.productVariant.findUnique({
      where: { id: variantId },
    });
    if (!variant) {
      throw new Error("Variant not found");
    }

    return prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId,
        variantId,
        quantity,
        priceAtAdd: variant.price,
      },
    });
  }

  /**
   * واکشی سبد کامل با آیتم‌ها
   */
  async getCart(userId?: number, sessionId?: string) {
    const cart = userId
      ? await prisma.cart.findFirst({
          where: { userId },
          include: { items: { include: { product: true, variant: true } } },
        })
      : await prisma.cart.findUnique({
          where: { sessionId },
          include: { items: { include: { product: true, variant: true } } },
        });

    return cart || { items: [] };
  }

  /**
   * حذف آیتم خاص از سبد
   */
  async removeItem(itemId: number) {
    return prisma.cartItem.delete({ where: { id: itemId } });
  }
}
