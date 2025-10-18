import { prisma } from "../config/db";
import { CreateVariantDTO, UpdateVariantDTO } from "../../dto/variantDto";

export const variantService = {
  async getAll() {
    return prisma.productVariant.findMany({ include: { product: true } });
  },

  async getById(id: number) {
    return prisma.productVariant.findUnique({ where: { id }, include: { product: true } });
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
    return prisma.productVariant.create({ data: variantData });
  },

  async update(id: number, data: UpdateVariantDTO) {
    return prisma.productVariant.update({ where: { id }, data });
  },

  async delete(id: number) {
    return prisma.productVariant.delete({ where: { id } });
  },
};
