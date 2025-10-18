// src/services/product.service.ts

import { prisma } from "../config/db";
import { Product } from "@prisma/client";
import { NotFoundError, BadRequestError } from "../utils/ApiError"; // وارد کردن کلاس‌های خطا
import { Prisma } from "@prisma/client"; // وارد کردن Prisma برای دسترسی به کد خطا
import { makeSlug } from "../utils/slugify";
export const productService = {
  // ۱. getAll: بدون تغییر خاص
  getAll: async (): Promise<Product[]> => {
    return prisma.product.findMany();
  },

  // ۲. getById: اگر null برگردد، 404 پرتاب کن
  getById: async (id: number) => {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        brand: { select: { id: true, name: true } },
        category: { select: { id: true, name: true } },
        variants: true,
      },
    });

    if (!product) {
      throw new NotFoundError(`Product with ID ${id} not found.`);
    }

    return product;
  },


  // ۳. create: مدیریت خطای Unique Constraint
  create: async (data: any) => {
    try {
      const isBlock =
        typeof data.isBlock === "string"
          ? data.isBlock === "true"
          : Boolean(data.isBlock);
      const slug = data.slug || makeSlug(data.name);

      const product = await prisma.product.create({
        data: {
          name: data.name,
          description: data.description,
          sku: data.sku,
          slug,
          imageUrl: data.imageUrl ?? "",
          brandId: Number(data.brandId),
          categoryId: Number(data.categoryId),
          isBlock,
        },
      });

      // 📦 دریافت اطلاعات واریانت (اگر کاربر فرستاد)
      const varData = data.variant;
      if (varData) {
        await prisma.productVariant.create({
          data: {
            productId: product.id,
            packageQuantity: Number(varData.packageQuantity ?? 1),
            packageType: varData.packageType || "بسته پیش‌فرض",
            price: new Prisma.Decimal(varData.price ?? 0),
            stock: Number(varData.stock ?? 0),
            discountPrice: varData.discountPrice
              ? new Prisma.Decimal(varData.discountPrice)
              : null,
          },
        });
      }

      return product;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new BadRequestError("محصولی با این شناسه یا نام وجود دارد.");
      }
      throw error;
    }
  },

  // ۴. update: مدیریت خطای پیدا نشدن و بازگرداندن رکورد به‌روز شده
  update: async (id: number, data: Partial<Product>): Promise<Product> => {
    try {
      let slug = data.slug;
      if (!slug && data.name) {
        slug = makeSlug(data.name);
      }
      return await prisma.product.update({
        where: { id },
        data: { ...data, slug },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2025"
      ) {
        throw new NotFoundError(
          `Cannot update: Product with ID ${id} not found.`
        );
      }
      throw error;
    }
  },

  // ۵. delete: مدیریت خطای پیدا نشدن و بازگرداندن رکورد حذف شده
  delete: async (id: number): Promise<Product> => {
    try {
      // از delete استفاده می‌کنیم. اگر رکورد پیدا نشود، Prisma خطای P2025 پرتاب می‌کند.
      return await prisma.product.delete({ where: { id } });
    } catch (error) {
      // مدیریت خطای پیدا نشدن رکورد برای عملیات Delete (کد P2025 در Prisma)
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2025"
      ) {
        throw new NotFoundError(
          `Cannot delete: Product with ID ${id} not found.`
        );
      }
      throw error;
    }
  },
};
