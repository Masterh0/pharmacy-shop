// src/services/product.service.ts
import { prisma } from "../config/db";
import { Product, Prisma } from "@prisma/client";
import { NotFoundError, BadRequestError } from "../utils/ApiError";
import { makeSlug } from "../utils/slugify";

export const productService = {
  getAll: async (): Promise<Product[]> => {
    return prisma.product.findMany({
      include: { brand: true, category: true, variants: true },
      orderBy: { id: "desc" },
    });
  },

  getById: async (id: number) => {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        brand: { select: { id: true, name: true } },
        category: { select: { id: true, name: true } },
        variants: true,
      },
    });
    if (!product) throw new NotFoundError(`Product with ID ${id} not found.`);
    return product;
  },

  create: async (data: any) => {
    try {
      const slug = makeSlug(data.name);

      const isBlock = Boolean(data.isBlock);
      const sku =
        data.sku && data.sku.trim() !== "" ? data.sku : `SKU-${Date.now()}`;

      // 🔹 اطمینان از اینکه variants آرایه است
      let variants: any[] = [];

      if (data.variants) {
        if (typeof data.variants === "string") {
          try {
            variants = JSON.parse(data.variants);
          } catch (err) {
            console.warn("❌ خطا در parse کردن variants:", err);
            variants = [];
          }
        } else if (Array.isArray(data.variants)) {
          variants = data.variants;
        }
      }
      
      // 🔹 ایجاد محصول
      const product = await prisma.product.create({
        data: {
          name: data.name,
          description: data.description || "",
          sku,
          slug,
          brandId: Number(data.brandId),
          categoryId: Number(data.categoryId),
          imageUrl: data.imageUrl ?? "",
          isBlock,
        },
      });

      // 🔹 افزودن واریانت‌ها (در صورت وجود)
      if (variants.length > 0) {
        const formattedVariants = variants.map((v: any) => ({
          productId: product.id,
          packageQuantity: Number(v.packageQuantity ?? 1),
          packageType: v.packageType ?? "بسته",
          price: new Prisma.Decimal(v.price ?? 0),
          discountPrice: v.discountPrice
            ? new Prisma.Decimal(v.discountPrice)
            : null,
          stock: Number(v.stock ?? 0),
          expiryDate: v.expiryDate ? new Date(v.expiryDate) : null,
        }));

        await prisma.productVariant.createMany({
          data: formattedVariants,
        });
      }

      // 🔹 برگرداندن محصول با روابطش
      return await prisma.product.findUnique({
        where: { id: product.id },
        include: { variants: true, brand: true, category: true },
      });
    } catch (error: any) {
      if (error.code === "P2002") {
        throw new BadRequestError("محصولی با این نام یا SKU وجود دارد.");
      }
      console.error("❌ خطا در ایجاد محصول:", error);
      throw error;
    }
  },

  update: async (id: number, data: any): Promise<Product> => {
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError(`محصول با شناسه ${id} یافت نشد.`);

    const slug = data.slug || makeSlug(data.name);
    const isBlock = Boolean(data.isBlock);

    // ✅ مرحله ۱: ویرایش مشخصات خود محصول
    await prisma.product.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        slug,
        sku: data.sku,
        brandId: Number(data.brandId),
        categoryId: Number(data.categoryId),
        imageUrl: data.imageUrl,
        isBlock,
      },
    });

    // ✅ مرحله ۲: جایگزینی واریانت‌ها
    if (Array.isArray(data.variants)) {
      await prisma.productVariant.deleteMany({ where: { productId: id } });

      const formatted = data.variants.map((v: any) => ({
        productId: id,
        packageQuantity: Number(v.packageQuantity ?? 1),
        packageType: v.packageType ?? "بسته",
        price: new Prisma.Decimal(v.price ?? 0),
        discountPrice: v.discountPrice
          ? new Prisma.Decimal(v.discountPrice)
          : null,
        stock: Number(v.stock ?? 0),
        expiryDate: v.expiryDate ? new Date(v.expiryDate) : null,
      }));

      if (formatted.length > 0)
        await prisma.productVariant.createMany({ data: formatted });
    }

    // ✅ نتیجه نهایی
    return (
      (await prisma.product.findUnique({
        where: { id },
        include: { variants: true, brand: true, category: true },
      })) ?? existing
    );
  },

  delete: async (id: number): Promise<Product> => {
    try {
      return await prisma.product.delete({ where: { id } });
    } catch (error: any) {
      if (error.code === "P2025")
        throw new NotFoundError(`محصول با شناسه ${id} یافت نشد.`);
      throw error;
    }
  },
};
