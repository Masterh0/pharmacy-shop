import { prisma } from "../config/db";
import { CreateVariantDTO, UpdateVariantDTO } from "../../dto/variantDto";
import { Prisma } from "@prisma/client";
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
    const discountPrice = data.discountPrice
      ? Number(data.discountPrice)
      : null;

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
    if (!id || isNaN(id)) throw new Error("❌ شناسه واریانت معتبر نیست");

    // ساختن آبجکت آپدیت به صورت داینامیک (فقط فیلدهای ارسال شده آپدیت شوند)
    const updateData: Prisma.ProductVariantUpdateInput = {};
    if (data.packageType !== undefined)
      updateData.packageType = data.packageType;
    if (data.flavor !== undefined) updateData.flavor = data.flavor;

    if (data.packageQuantity !== undefined) {
      const qty = Number(data.packageQuantity);
      if (isNaN(qty)) throw new Error("❌ تعداد بسته نامعتبر است");
      updateData.packageQuantity = qty;
    }

    if (data.stock !== undefined) {
      const stk = Number(data.stock);
      if (isNaN(stk)) throw new Error("❌ موجودی نامعتبر است");
      updateData.stock = stk;
    }

    if (data.price !== undefined) {
      const prc = Number(data.price);
      if (isNaN(prc)) throw new Error("❌ قیمت نامعتبر است");
      updateData.price = prc;
    }

    if (data.discountPrice !== undefined) {
      updateData.discountPrice = data.discountPrice
        ? Number(data.discountPrice)
        : null;
    }

    // بررسی تاریخ انقضا
    if (data.expiryDate !== undefined) {
      updateData.expiryDate =
        data.expiryDate && String(data.expiryDate).trim() !== ""
          ? new Date(data.expiryDate)
          : null;
    }

    // یک بررسی منطقی: اگر هم قیمت و هم تخفیف در حال آپدیت هستند یا یکی از قبل موجود است
    // (این بخش پیچیده است، ساده‌ترین حالت چک کردن مقادیر موجود در Payload است)
    if (
      updateData.price !== undefined &&
      updateData.discountPrice !== undefined &&
      updateData.discountPrice !== null
    ) {
      if (Number(updateData.discountPrice) > Number(updateData.price)) {
        throw new Error("❌ قیمت با تخفیف نباید از قیمت اصلی بیشتر باشد");
      }
    }

    return prisma.productVariant.update({
      where: { id },
      data: updateData,
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
