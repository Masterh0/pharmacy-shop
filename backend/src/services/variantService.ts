import { prisma } from "../config/db";
import { CreateVariantDTO, UpdateVariantDTO } from "../../dto/variantDto";

export const variantService = {
  /** -------------------------
   * 📦 دریافت تمام واریانت‌ها (مدیریتی)
   * فقط برای admin-dashboard استفاده بشه
   --------------------------*/
  async getAll() {
    return prisma.productVariant.findMany({
      include: { product: { select: { id: true, name: true, sku: true } } },
      orderBy: { id: "desc" },
    });
  },

  /** -------------------------
   * 📦 دریافت واریانت‌های مربوط به یک محصول خاص
   * endpoint: GET /api/products/:productId/variants
   --------------------------*/
  async getByProductId(productId: number) {
    return prisma.productVariant.findMany({
      where: { productId },
      orderBy: { id: "desc" },
    });
  },

  /** -------------------------
   * 📦 دریافت جزئیات یک واریانت خاص
   --------------------------*/
  async getById(id: number) {
    return prisma.productVariant.findUnique({
      where: { id },
      include: { product: { select: { id: true, name: true } } },
    });
  },

  /** -------------------------
   * ➕ ایجاد واریانت جدید برای یک محصول
   --------------------------*/
  async create(data: CreateVariantDTO) {
    const {
      productId,
      packageQuantity,
      packageType,
      price,
      discountPrice,
      stock,
      expiryDate,
    } = data;

    const variantData = {
      packageQuantity,
      packageType,
      price,
      discountPrice,
      stock,
      expiryDate: expiryDate ? new Date(expiryDate) : null,
      productId,
    };

    return prisma.productVariant.create({ data: variantData });
  },

  /** -------------------------
   * ✏️ به‌روزرسانی واریانت
   --------------------------*/
  async update(id: number, data: UpdateVariantDTO) {
    const safeData = {
      packageQuantity: data.packageQuantity,
      packageType: data.packageType,
      price: data.price,
      discountPrice: data.discountPrice,
      stock: data.stock,
      expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
    };

    return prisma.productVariant.update({
      where: { id },
      data: safeData,
    });
  },

  /** -------------------------
   * 🗑 حذف واریانت
   --------------------------*/
  async delete(id: number) {
    return prisma.productVariant.delete({
      where: { id },
    });
  },
};
