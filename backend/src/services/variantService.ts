import { prisma } from "../config/db";
import { CreateVariantDTO, UpdateVariantDTO } from "../../dto/variantDto";

export const variantService = {
  async getAll() {
    return prisma.productVariant.findMany({ include: { product: true } });
  },

  async getById(id: number) {
    return prisma.productVariant.findUnique({
      where: { id },
      include: { product: true },
    });
  },

  async getByProductId(productId: number) {
    return prisma.productVariant.findMany({
      where: { productId },
      orderBy: { id: "asc" },
    });
  },

  async create(data: CreateVariantDTO) {
    // 🧹 پاکسازی و اطمینان از انواع عددی
    const price = Number(data.price);
    const discountPrice = data.discountPrice ? Number(data.discountPrice) : null;

    if (discountPrice && discountPrice > price) {
      throw new Error("❌ قیمت با تخفیف نباید از قیمت اصلی بیشتر باشد");
    }

    return prisma.productVariant.create({
      data: {
        productId: data.productId,
        packageType: data.packageType,
        packageQuantity: Number(data.packageQuantity),
        price,
        discountPrice,
        stock: Number(data.stock),
        flavor: data.flavor,
        expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
      },
    });
  },

  async update(id: number, data: UpdateVariantDTO) {
    if (isNaN(id)) throw new Error("❌ شناسه واریانت معتبر نیست");

    const price = Number(data.price);
    const discountPrice = data.discountPrice ? Number(data.discountPrice) : null;

    if (discountPrice && discountPrice > price) {
      throw new Error("❌ قیمت با تخفیف نباید از قیمت اصلی بیشتر باشد");
    }

    const expiryDate =
      data.expiryDate && data.expiryDate.toString().trim() !== ""
        ? new Date(data.expiryDate)
        : null;

    return prisma.productVariant.update({
      where: { id },
      data: {
        packageType: data.packageType,
        packageQuantity: Number(data.packageQuantity),
        price,
        discountPrice,
        stock: Number(data.stock),
        flavor: data.flavor,
        expiryDate,
      },
    });
  },

  async delete(id: number) {
    const variant = await prisma.productVariant.findUnique({
      where: { id },
      include: { product: { include: { variants: true } } },
    });

    if (variant?.product?.variants && variant.product.variants.length <= 1) {
      throw new Error("❌ محصول نمی‌تواند بدون واریانت باشد");
    }

    await prisma.productVariant.delete({ where: { id } });
    return { success: true };
  },
};
