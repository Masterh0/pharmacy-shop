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
      console.log("📦 [ProductService.create] داده خام:", {
        name: data.name,
        brandId: data.brandId,
        categoryId: data.categoryId,
        variants: data.variants,
        imageUrl: data.imageUrl,
        isBlock: data.isBlock,
      });

      // 🧩 سازگاری با اطلاعات ارسالی از فرانت
      let variants: any[] = [];

      if (typeof data.variants === "string") {
        try {
          variants = JSON.parse(data.variants);
        } catch (err) {
          console.error("❌ خطا در parse کردن variants:", err);
          throw new BadRequestError("فرمت واریانت‌ها نادرست است.");
        }
      } else if (Array.isArray(data.variants)) {
        variants = data.variants;
      } else if (data.variant) {
        variants = [data.variant];
      }

      const variant = variants?.[0];
      if (!variant) {
        throw new BadRequestError(
          "واریانت محصول الزامی است و نباید خالی باشد."
        );
      }

      // 🧠 ساخت slug از name
      const slug = makeSlug(data.name);

      // 🧩 بررسی تکراری بودن محصول
      const OR: Prisma.ProductWhereInput[] = [];
      if (data.sku) OR.push({ sku: data.sku });
      if (data.name) OR.push({ name: data.name.trim() });
      if (slug) OR.push({ slug });

      console.log("🔍 بررسی تکراری بودن:", OR);

      const existing = await prisma.product.findFirst({ where: { OR } });
      if (existing) {
        console.error("⚠️ محصول مشابه وجود دارد:", existing);
        throw new BadRequestError(
          "محصولی با این شناسه، نام یا slug وجود دارد."
        );
      }

      // 🔢 پاک‌سازی و تبدیل انواع
      const isBlock =
        typeof data.isBlock === "string"
          ? data.isBlock === "true"
          : Boolean(data.isBlock);

      const basePrice = Number(variant.price);

      // ✅ ساخت محصول اصلی
      const product = await prisma.product.create({
        data: {
          name: data.name.trim(),
          description: data.description?.trim() || "",
          sku: data.sku?.trim() || "",
          slug,
          imageUrl: data.imageUrl ?? "",
          brandId: Number(data.brandId),
          categoryId: Number(data.categoryId),
          isBlock,
          price: basePrice, // قیمت از واریانت اول گرفته می‌شود
        },
      });

      console.log("🎯 محصول ساخته شد:", product);

      // 🧩 ساخت واریانت
      const variantRecord = await prisma.productVariant.create({
        data: {
          productId: product.id,
          packageQuantity: Number(variant.packageQuantity ?? 1),
          packageType: variant.packageType || "بسته پیش‌فرض",
          price: new Prisma.Decimal(variant.price),
          discountPrice: variant.discountPrice
            ? new Prisma.Decimal(variant.discountPrice)
            : null,
          stock: Number(variant.stock ?? 0),
          expiryDate: variant.expiryDate ? new Date(variant.expiryDate) : null,
          flavor: variant.flavor ?? null,
        },
      });

      console.log("📦 واریانت ثبت شد:", variantRecord);

      // 🧾 بازگرداندن محصول با واریانت‌هایش
      const result = await prisma.product.findUnique({
        where: { id: product.id },
        include: { variants: true },
      });

      console.log("✅ خروجی نهایی:", result);
      return result;
    } catch (error: any) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        const target =
          (error.meta?.target as string[])?.join("، ") || "فیلد منحصربه‌فرد";
        throw new BadRequestError(`مقدار تکراری در ${target}.`);
      }

      console.error("🔥 خطای غیرمنتظره در ProductService.create:", error);
      throw error;
    }
  },

  // ۴. update: مدیریت خطای پیدا نشدن و بازگرداندن رکورد به‌روز شده
  update: async (id: number, data: Partial<Product>): Promise<Product> => {
    try {
      // 🔹 یافتن محصول فعلی برای تصمیم در مورد اسلاگ
      const existing = await prisma.product.findUnique({
        where: { id },
        select: { name: true, slug: true, imageUrl: true },
      });

      if (!existing) {
        throw new NotFoundError(
          `Cannot update: Product with ID ${id} not found.`
        );
      }

      // 🔹 تعیین اسلاگ جدید فقط در صورتی که نام تغییر کرده باشد
      const slug =
        data.name && data.name !== existing.name
          ? makeSlug(data.name)
          : existing.slug;

      // 🔹 نرمال‌سازی داده‌های ورودی (از FormData)
      const normalizedData = {
        ...data,
        brandId: data.brandId ? Number(data.brandId) : undefined,
        categoryId: data.categoryId ? Number(data.categoryId) : undefined,
        isBlock:
          typeof data.isBlock === "string"
            ? data.isBlock === "true"
            : Boolean(data.isBlock),
        imageUrl:
          typeof data.imageUrl === "string" &&
          data.imageUrl.trim() !== "" &&
          !["undefined", "null"].includes(data.imageUrl.trim().toLowerCase())
            ? data.imageUrl
            : existing.imageUrl,
      };
      const cleanedData = { ...normalizedData };
      delete cleanedData.brandId;
      delete cleanedData.categoryId;
      // 🔹 ساخت آبجکت آپدیت نهایی
      const updateData: any = {
        name: normalizedData.name,
        sku: normalizedData.sku,
        description: normalizedData.description,
        isBlock: normalizedData.isBlock,
        imageUrl: normalizedData.imageUrl,
        slug,
        // ✅ ارتباط‌ها با connect
        brand: normalizedData.brandId
          ? { connect: { id: normalizedData.brandId } }
          : undefined,
        category: normalizedData.categoryId
          ? { connect: { id: normalizedData.categoryId } }
          : undefined,
      };

      // 🔹 پاک کردن فیلدهای ناخواسته تا Prisma ارور نده
      delete updateData.brandId;
      delete updateData.categoryId;

      // 🔹 اجرای آپدیت
      const updated = await prisma.product.update({
        where: { id },
        data: updateData,
      });
      console.log("🧩 Final updateData going to Prisma:", updated);
      return updated;
    } catch (error) {
      // خطای P2025 = محصول پیدا نشد
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2025"
      ) {
        throw new NotFoundError(
          `Cannot update: Product with ID ${id} not found.`
        );
      }

      // سایر خطاهای احتمالی
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
