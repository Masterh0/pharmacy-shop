// src/services/cart.service.ts
import { prisma } from "../config/db";
import { BusinessError } from "./errors/BusinessError";

export class CartService {
  /**
   * پیدا کردن سبد فعال کاربر یا مهمان، یا ساختن آن در صورت نبود
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
      throw new BusinessError("شناسه کاربر یا نشست نامعتبر است", 400);
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

    // 🔍 چک واریانت و موجودی
    const variant = await prisma.productVariant.findUnique({
      where: { id: variantId },
      select: {
        id: true,
        price: true,
        stock: true,
        flavor: true,
      },
    });

    if (!variant) {
      throw new BusinessError("واریانت مورد نظر یافت نشد");
    }

    // چک آیتم موجود در سبد
    const existingItem = await prisma.cartItem.findUnique({
      where: {
        cartId_variantId: {
          cartId: cart.id,
          variantId,
        },
      },
    });

    const currentCartQuantity = existingItem?.quantity || 0;
    const totalRequested = currentCartQuantity + quantity;

    // 🔍 چک موجودی کل
    if (variant.stock < totalRequested) {
      throw new BusinessError(
        `موجودی کافی نیست! موجودی فعلی: ${variant.stock} - در سبد: ${currentCartQuantity}`,
        422 // یا 409 اگر تداخل
      );
    }

    // اگه از قبل داشتیم، افزایش بده
    if (existingItem) {
      return prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: totalRequested },
      });
    }

    // ایجاد آیتم جدید
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
   * واکشی کامل سبد
   */
  async getCart(userId?: number, sessionId?: string) {
    const cart = userId
      ? await prisma.cart.findFirst({
          where: { userId },
          include: {
            items: {
              include: { product: true, variant: true },
              orderBy: { id: "asc" },
            },
          },
        })
      : await prisma.cart.findUnique({
          where: { sessionId },
          include: {
            items: {
              include: { product: true, variant: true },
              orderBy: { id: "asc" },
            },
          },
        });

    return cart || { items: [] };
  }

  /**
   * حذف یک آیتم از سبد
   */
  async removeItem(itemId: number) {
    return prisma.cartItem.delete({ where: { id: itemId } });
  }

  /**
   * ✅ مرج کردن سبد مهمان به سبد کاربر موقع لاگین
   * - اگر سبد مهمان وجود داشته باشد → تمام آیتم‌هایش را به سبد کاربر اضافه یا افزایش می‌کند
   * - سبد مهمان را بعد از مرج حذف می‌کند
   */
  async updateItemQuantity(itemId: number, quantity: number) {
    if (quantity < 1) {
      return this.removeItem(itemId);
    }

    // پیدا کردن آیتم
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: itemId },
      include: {
        variant: {
          select: {
            stock: true,
            flavor: true,
          },
        },
      },
    });

    if (!cartItem) {
      throw new BusinessError("آیتم در سبد یافت نشد");
    }

    // 🔍 چک موجودی
    if (cartItem.variant.stock < quantity) {
      throw new BusinessError(
        `موجودی کافی نیست! موجودی فعلی: ${cartItem.variant.stock}`,
        422
      );
    }

    return prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
    });
  }

  async mergeGuestCartToUserCart(sessionId: string, userId: number) {
    if (!sessionId || !userId) {
      console.log("mergeGuestCartToUserCart: Missing sessionId or userId");
      return;
    }

    try {
      const guestCart = await prisma.cart.findUnique({
        where: { sessionId },
        include: { items: true },
      });

      if (!guestCart) {
        console.log("mergeGuestCartToUserCart: No guest cart found");
        return;
      }

      if (guestCart.items.length === 0) {
        // اگر cart خالی است، فقط cart را حذف می‌کنیم
        await prisma.cart.delete({
          where: { id: guestCart.id },
        });
        return;
      }

      // گرفتن یا ساختن cart کاربر
      const userCart = await this.getOrCreateCart(userId, undefined);

      // اول تمام آیتم‌ها را merge می‌کنیم
      for (const item of guestCart.items) {
        // چک کنیم این variant در cart کاربر هست یا نه
        const existing = await prisma.cartItem.findUnique({
          where: {
            cartId_variantId: {
              cartId: userCart.id,
              variantId: item.variantId,
            },
          },
        });

        if (existing) {
          // اگر وجود داشت فقط quantity افزایش پیدا می‌کند
          await prisma.cartItem.update({
            where: { id: existing.id },
            data: { quantity: existing.quantity + item.quantity },
          });
        } else {
          // اگر نبود آیتم جدید برای کاربر ساخته می‌شود
          await prisma.cartItem.create({
            data: {
              cartId: userCart.id,
              productId: item.productId,
              variantId: item.variantId,
              quantity: item.quantity,
              priceAtAdd: item.priceAtAdd,
            },
          });
        }
      }

      // پاک کردن کامل cart مهمان
      // اول باید CartItem ها را حذف کنیم، بعد Cart را
      // استفاده از raw query برای اطمینان از حذف کامل

      // روش 1: حذف تک‌تک CartItem ها
      const cartItemsToDelete = await prisma.cartItem.findMany({
        where: { cartId: guestCart.id },
        select: { id: true },
      });

      console.log(
        `Found ${cartItemsToDelete.length} cart items to delete from guest cart ${guestCart.id}`
      );

      // حذف تک‌تک CartItem ها
      for (const item of cartItemsToDelete) {
        try {
          await prisma.cartItem.delete({
            where: { id: item.id },
          });
        } catch (deleteError: any) {
          console.error(
            `Error deleting cart item ${item.id}:`,
            deleteError?.message
          );
          // Continue with other items
        }
      }

      // بررسی نهایی که آیا همه CartItem ها حذف شدند
      const remainingItems = await prisma.cartItem.count({
        where: { cartId: guestCart.id },
      });

      if (remainingItems > 0) {
        console.warn(
          `Warning: ${remainingItems} cart items still exist for cart ${guestCart.id}`
        );
        // استفاده از raw query برای حذف مستقیم
        await prisma.$executeRaw`
          DELETE FROM "CartItem" WHERE "cartId" = ${guestCart.id}
        `;
      }

      // حالا می‌توانیم Cart را حذف کنیم
      await prisma.cart.delete({
        where: { id: guestCart.id },
      });

      console.log(`Deleted guest cart ${guestCart.id}`);
    } catch (error) {
      console.error("Error in mergeGuestCartToUserCart:", error);
      throw error; // Re-throw to be caught by controller
    }
  }
}
