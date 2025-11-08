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
    // پاکسازی فیلدها برای اطمینان
    const variantData = {
      packageQuantity: data.packageQuantity,
      packageType: data.packageType,
      price: data.price,
      discountPrice: data.discountPrice,
      stock: data.stock,
      expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
      productId: data.productId,
    };
    if (
      variantData.discountPrice &&
      variantData.discountPrice > variantData.price
    ) {
      throw new Error("❌ قیمت با تخفیف نباید از قیمت اصلی بیشتر باشد");
    }
    return prisma.productVariant.create({ data: variantData });
  },

  async update(id: number, data: any) {
    if (isNaN(id)) throw new Error("Invalid variant id");

    const expiryDate =
      data.expiryDate && data.expiryDate.trim() !== ""
        ? new Date(data.expiryDate)
        : null;
    const price = Number(data.price);
    const discountPrice = Number(data.discountPrice);
    if (discountPrice && discountPrice > price) {
      throw new Error("❌ قیمت با تخفیف نباید از قیمت اصلی بیشتر باشد");
    }
    return prisma.productVariant.update({
      where: { id },
      data: {
        packageType: data.packageType,
        packageQuantity: Number(data.packageQuantity),
        price: Number(data.price),
        discountPrice: Number(data.discountPrice),
        stock: Number(data.stock),
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
      throw new Error("محصول نمی‌تواند بدون واریانت باشد ❌");
    }
    await prisma.productVariant.delete({ where: { id } });
    return { success: true };
  },
};
