import { Decimal } from "@prisma/client/runtime/library";
import { prisma } from "../config/db";
import { BusinessError } from "./errors/BusinessError";
import { Prisma } from "@prisma/client";
export class BadRequestException extends Error {
  statusCode = 400;
  constructor(message: string) {
    super(message);
    this.name = "BadRequestException";
  }
}
export function getEffectivePrice(variant: {
  price: Decimal | number;
  discountPrice?: Decimal | number | null;
}): number {
  if (variant.discountPrice && Number(variant.discountPrice) > 0) {
    return Number(variant.discountPrice);
  }
  return Number(variant.price);
}

const STALE_DAYS = 7;
const MAX_CART_ITEMS = 50;
const MAX_QUANTITY = 99;

type UnavailableReason =
  | "OUT_OF_STOCK"
  | "PRODUCT_BLOCKED"
  | "PRODUCT_DELETED"
  | "VARIANT_DELETED"
  | null;

const cartInclude = {
  items: {
    include: {
      product: {
        include: {
          brand: true,
          category: true,
        },
      },
      variant: {
        include: {
          images: { orderBy: { displayOrder: "asc" as const } },
          attributes: {
            include: {
              value: { include: { attribute: true } },
            },
          },
        },
      },
    },
    orderBy: { id: "asc" as const },
  },
};

function buildCartItemResponse(item: any) {
  const variant = item.variant;
  const product = item.product;

  if (!variant) {
    return {
      ...item,
      currentPrice: Number(item.priceAtAdd),
      priceChanged: false,
      stock: 0,
      isAvailable: false,
      quantityExceedsStock: false,
      isStale: false,
      unavailableReason: "VARIANT_DELETED" as UnavailableReason,
    };
  }

  if (!product) {
    return {
      ...item,
      currentPrice: getEffectivePrice(variant),
      priceChanged: false,
      stock: variant.stock,
      isAvailable: false,
      quantityExceedsStock: false,
      isStale: false,
      unavailableReason: "PRODUCT_DELETED" as UnavailableReason,
    };
  }

  const currentPrice = getEffectivePrice(variant);
  const priceChanged = currentPrice !== Number(item.priceAtAdd);
  const stock: number = variant.stock;
  const quantityExceedsStock = item.quantity > stock;

  let unavailableReason: UnavailableReason = null;
  let isAvailable = true;

  if (product.isBlock) {
    isAvailable = false;
    unavailableReason = "PRODUCT_BLOCKED";
  } else if (stock === 0) {
    isAvailable = false;
    unavailableReason = "OUT_OF_STOCK";
  }

  const isStale =
    Date.now() - new Date(item.createdAt).getTime() >
    STALE_DAYS * 24 * 60 * 60 * 1000;

  return {
    ...item,
    currentPrice,
    priceChanged,
    stock,
    isAvailable,
    quantityExceedsStock,
    isStale,
    unavailableReason,
  };
}

export class CartService {
  async getOrCreateCart(userId?: number, sessionId?: string) {
    if (userId !== undefined && sessionId !== undefined) {
      throw new BusinessError(
        "شناسه کاربر و نشست نمی‌توانند همزمان باشند",
        400,
      );
    }

    if (userId !== undefined) {
      return prisma.cart.upsert({
        where: { userId },
        update: {},
        create: { userId },
      });
    }

    if (sessionId) {
      return prisma.cart.upsert({
        where: { sessionId },
        update: {},
        create: { sessionId },
      });
    }

    throw new BusinessError("شناسه کاربر یا نشست نامعتبر است", 400);
  }

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
    if (!Number.isInteger(quantity) || quantity < 1) {
      throw new BusinessError("تعداد محصول نامعتبر است", 400);
    }

    const cart = await this.getOrCreateCart(userId, sessionId);

    const variant = await prisma.productVariant.findUnique({
      where: { id: variantId },
      select: {
        id: true,
        productId: true,
        price: true,
        discountPrice: true,
        stock: true,
        product: {
          select: {
            id: true,
            isBlock: true,
          },
        },
      },
    });

    if (!variant) {
      throw new BadRequestException("این محصول در دسترس نیست");
    }

    if (variant.productId !== productId) {
      throw new BusinessError(
        "واریانت انتخاب‌شده متعلق به این محصول نیست",
        400,
      );
    }

    if (variant.product.isBlock) {
      throw new BusinessError("این محصول در حال حاضر قابل خرید نیست", 400);
    }

    if (variant.stock < 1) {
      throw new BadRequestException("این محصول ناموجود است");
    }

    const maxAllowed = Math.min(variant.stock, MAX_QUANTITY);

    if (quantity > maxAllowed) {
      throw new BadRequestException(
        `فقط ${maxAllowed} عدد از این محصول موجود است`,
      );
    }

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        return await prisma.$transaction(
          async (tx) => {
            const existingItem = await tx.cartItem.findUnique({
              where: {
                cartId_variantId: {
                  cartId: cart.id,
                  variantId,
                },
              },
            });

            const currentCartQuantity = existingItem?.quantity ?? 0;
            const newQuantity = currentCartQuantity + quantity;

            if (newQuantity > maxAllowed) {
              throw new BusinessError(
                `حداکثر تعداد قابل سفارش برای این واریانت ${maxAllowed} عدد است`,
                422,
              );
            }

            if (existingItem) {
              return tx.cartItem.update({
                where: {
                  id: existingItem.id,
                },
                data: {
                  quantity: newQuantity,
                },
              });
            }

            const itemsCount = await tx.cartItem.count({
              where: {
                cartId: cart.id,
              },
            });

            if (itemsCount >= MAX_CART_ITEMS) {
              throw new BusinessError(
                `سبد خرید نمی‌تواند بیش از ${MAX_CART_ITEMS} قلم کالا داشته باشد`,
                422,
              );
            }

            return tx.cartItem.create({
              data: {
                cartId: cart.id,
                productId: variant.productId,
                variantId: variant.id,
                quantity,
                priceAtAdd: getEffectivePrice(variant),
              },
            });
          },
          {
            isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
          },
        );
      } catch (error: any) {
        // Transaction conflict caused by concurrent requests
        if (error?.code === "P2034" && attempt < 3) {
          continue;
        }

        // In case another concurrent request created the same item
        // between the read and create.
        if (error?.code === "P2002" && attempt < 3) {
          continue;
        }

        throw error;
      }
    }

    throw new BusinessError(
      "افزودن محصول به سبد خرید انجام نشد. دوباره تلاش کنید.",
      500,
    );
  }

  async getCart(userId?: number, sessionId?: string) {
    const cart = await this.getOrCreateCart(userId, sessionId);

    const fullCart = await prisma.cart.findUnique({
      where: { id: cart.id },
      include: cartInclude,
    });

    if (!fullCart) throw new BusinessError("سبد خرید یافت نشد", 404);

    const items = fullCart.items.map(buildCartItemResponse);

    const subtotal = items
      .filter((i) => i.isAvailable && !i.quantityExceedsStock)
      .reduce((sum, i) => sum + i.currentPrice * i.quantity, 0);

    return {
      ...fullCart,
      items,
      subtotal,
      totalItems: items.reduce((sum, i) => sum + i.quantity, 0),
      uniqueItemCount: items.length,
    };
  }

  async updateItemQuantity({
    userId,
    sessionId,
    itemId,
    quantity,
  }: {
    userId?: number;
    sessionId?: string;
    itemId: number;
    quantity: number;
  }) {
    if (!userId && !sessionId) {
      throw new BusinessError("شناسه کاربر یا نشست نامعتبر است", 400);
    }

    if (quantity < 1) return this.removeItem({ userId, sessionId, itemId });

    if (!Number.isInteger(quantity)) {
      throw new BusinessError("تعداد نامعتبر است", 400);
    }

    if (quantity > MAX_QUANTITY) {
      throw new BusinessError(`حداکثر تعداد مجاز ${MAX_QUANTITY} عدد است`, 422);
    }

    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id: itemId,
        cart: userId ? { userId } : { sessionId },
      },
      include: { variant: { select: { id: true, stock: true } } },
    });

    if (!cartItem) throw new BusinessError("آیتم در سبد یافت نشد", 404);
    let adjusted = false;
    const variant = cartItem.variant; // از include موجود

    if (variant.stock === 0) {
      throw new BadRequestException("این محصول ناموجود است");
    }
    if (quantity > variant.stock) {
      throw new BadRequestException(
        `فقط ${variant.stock} عدد از این محصول موجود است`,
      );
    }

    await prisma.cartItem.update({ where: { id: itemId }, data: { quantity } });
    const cart = await this.getCart(userId, sessionId);
    return {
      ...cart,
      adjusted,
      adjustedQuantity: adjusted ? quantity : undefined,
    };
  }

  async removeItem({
    userId,
    sessionId,
    itemId,
  }: {
    userId?: number;
    sessionId?: string;
    itemId: number;
  }) {
    if (!userId && !sessionId) {
      throw new BusinessError("شناسه کاربر یا نشست نامعتبر است", 400);
    }

    const item = await prisma.cartItem.findFirst({
      where: {
        id: itemId,
        cart: userId ? { userId } : { sessionId },
      },
      select: { id: true },
    });

    if (!item) {
      throw new BusinessError("آیتم در سبد یافت نشد", 404);
    }

    await prisma.cartItem.delete({
      where: { id: itemId },
    });

    return {
      message: "از سبد حذف شد",
    };
  }
  async mergeGuestCartToUserCart(sessionId: string, userId: number) {
    if (!sessionId || !userId) {
      throw new BusinessError("اطلاعات سبد نامعتبر است", 400);
    }

    type AdjustedItem = {
      variantId: number;
      requestedQuantity: number;
      finalQuantity: number;
      reason: string;
    };
    type UnavailableItem = { variantId: number; reason: string };
    const result = await prisma.$transaction(async (tx) => {
      const adjustedItems: AdjustedItem[] = [];
      const unavailableItems: UnavailableItem[] = [];

      const guestCart = await tx.cart.findUnique({
        where: { sessionId },
        include: { items: true },
      });

      if (!guestCart) return;

      const userCart = await tx.cart.upsert({
        where: { userId },
        update: {},
        create: { userId },
      });

      for (const item of guestCart.items) {
        const variant = await tx.productVariant.findUnique({
          where: { id: item.variantId },
          select: {
            id: true,
            productId: true,
            stock: true,
            product: { select: { id: true, isBlock: true } },
          },
        });

        if (!variant) {
          unavailableItems.push({
            variantId: item.variantId,
            reason: "VARIANT_DELETED",
          });
          continue;
        }

        if (variant.product?.isBlock) {
          unavailableItems.push({
            variantId: item.variantId,
            reason: "PRODUCT_BLOCKED",
          });
          continue;
        }

        if (variant.stock < 1) {
          unavailableItems.push({
            variantId: item.variantId,
            reason: "OUT_OF_STOCK",
          });
          continue;
        }

        const existing = await tx.cartItem.findUnique({
          where: {
            cartId_variantId: {
              cartId: userCart.id,
              variantId: item.variantId,
            },
          },
        });

        const requested = (existing?.quantity ?? 0) + item.quantity;
        const maxAllowed = Math.min(variant.stock, MAX_QUANTITY);
        const finalQuantity = Math.min(requested, maxAllowed);

        if (finalQuantity < requested) {
          adjustedItems.push({
            variantId: item.variantId,
            requestedQuantity: requested,
            finalQuantity,
            reason: "STOCK_LIMIT",
          });
        }

        if (existing) {
          await tx.cartItem.update({
            where: { id: existing.id },
            data: { quantity: finalQuantity },
          });
        } else {
          await tx.cartItem.create({
            data: {
              cartId: userCart.id,
              productId: variant.productId,
              variantId: item.variantId,
              quantity: finalQuantity,
              priceAtAdd: item.priceAtAdd,
            },
          });
        }
      }

      await tx.cart.delete({ where: { id: guestCart.id } });

      return { adjustedItems, unavailableItems };
    });
    return { success: true, ...result };
  }
}

export const cartService = new CartService();
