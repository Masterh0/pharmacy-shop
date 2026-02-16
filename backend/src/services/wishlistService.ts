// backend/src/services/wishlistService.ts

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const wishlistService = {
  /**
   * افزودن محصول به لیست علاقه‌مندی‌ها
   */
  async addToWishlist(userId: number, productId: number) {
    // بررسی اینکه محصول وجود داره
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, name: true, isBlock: true },
    });

    if (!product) {
      throw new Error("محصول یافت نشد");
    }

    if (product.isBlock) {
      throw new Error("این محصول غیرفعال است");
    }

    // بررسی اینکه قبلاً اضافه نشده باشه
    const existingItem = await prisma.wishlist.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });

    if (existingItem) {
      throw new Error("این محصول قبلاً به علاقه‌مندی‌ها اضافه شده");
    }

    // Transaction برای اضافه کردن به wishlist و آپدیت wishlistCount
    const [wishlistItem] = await prisma.$transaction([
      prisma.wishlist.create({
        data: {
          userId,
          productId,
        },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              imageUrl: true,
              price: true,
              soldCount: true,
              wishlistCount: true,
            },
          },
        },
      }),
      prisma.product.update({
        where: { id: productId },
        data: {
          wishlistCount: {
            increment: 1,
          },
        },
      }),
    ]);

    return wishlistItem;
  },

  /**
   * حذف محصول از لیست علاقه‌مندی‌ها
   */
  async removeFromWishlist(userId: number, productId: number) {
    const wishlistItem = await prisma.wishlist.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });

    if (!wishlistItem) {
      throw new Error("این محصول در لیست علاقه‌مندی‌های شما نیست");
    }

    // Transaction برای حذف از wishlist و کاهش wishlistCount
    await prisma.$transaction([
      prisma.wishlist.delete({
        where: {
          userId_productId: {
            userId,
            productId,
          },
        },
      }),
      prisma.product.update({
        where: { id: productId },
        data: {
          wishlistCount: {
            decrement: 1,
          },
        },
      }),
    ]);

    return { message: "محصول از لیست علاقه‌مندی‌ها حذف شد" };
  },

  /**
   * دریافت لیست علاقه‌مندی‌های کاربر
   */
  async getUserWishlist(
    userId: number,
    options: {
      page?: number;
      limit?: number;
      sortBy?: "createdAt" | "price" | "soldCount";
      sortOrder?: "asc" | "desc";
    } = {}
  ) {
    const {
      page = 1,
      limit = 20,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = options;

    const skip = (page - 1) * limit;

    // ساخت orderBy برای محصولات
    let productOrderBy: any = {};
    if (sortBy === "createdAt") {
      productOrderBy = { createdAt: sortOrder };
    } else {
      productOrderBy = { product: { [sortBy]: sortOrder } };
    }

    const [items, total] = await Promise.all([
      prisma.wishlist.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: productOrderBy,
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              imageUrl: true,
              price: true,
              soldCount: true,
              wishlistCount: true,
              isBlock: true,
              category: {
                select: {
                  id: true,
                  name: true,
                },
              },
              variants: {
                select: {
                  id: true,
                  price: true,
                  discountPrice: true,
                  stock: true,
                  packageQuantity: true,
                  packageType: true,
                },
              },
              brand: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      }),
      prisma.wishlist.count({
        where: { userId },
      }),
    ]);

    return {
      items,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  /**
   * بررسی اینکه آیا محصول در لیست علاقه‌مندی‌های کاربر هست یا نه
   */
  async isInWishlist(userId: number, productId: number): Promise<boolean> {
    const item = await prisma.wishlist.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });

    return !!item;
  },

  /**
   * بررسی چند محصول یکجا
   */
  async checkMultipleProducts(
    userId: number,
    productIds: number[]
  ): Promise<{ productId: number; isInWishlist: boolean }[]> {
    const wishlistItems = await prisma.wishlist.findMany({
      where: {
        userId,
        productId: {
          in: productIds,
        },
      },
      select: {
        productId: true,
      },
    });

    const wishlistProductIds = new Set(
      wishlistItems.map((item) => item.productId)
    );

    return productIds.map((productId) => ({
      productId,
      isInWishlist: wishlistProductIds.has(productId),
    }));
  },

  /**
   * دریافت تعداد آیتم‌های wishlist کاربر
   */
  async getWishlistCount(userId: number): Promise<number> {
    return prisma.wishlist.count({
      where: { userId },
    });
  },

  /**
   * پاک کردن همه لیست علاقه‌مندی‌های کاربر
   */
  async clearWishlist(userId: number) {
    const items = await prisma.wishlist.findMany({
      where: { userId },
      select: { productId: true },
    });

    if (items.length === 0) {
      return { message: "لیست علاقه‌مندی‌ها خالی است" };
    }

    // Transaction برای حذف همه و کاهش wishlistCount
    await prisma.$transaction([
      prisma.wishlist.deleteMany({
        where: { userId },
      }),
      ...items.map((item) =>
        prisma.product.update({
          where: { id: item.productId },
          data: {
            wishlistCount: {
              decrement: 1,
            },
          },
        })
      ),
    ]);

    return { message: "همه محصولات از لیست علاقه‌مندی‌ها حذف شدند" };
  },
};
