import { prisma } from "../config/db";
import { CreateCategoryDTO, UpdateCategoryDTO } from "../../dto/categoryDto";
import { makeSlug } from "../utils/slugify";

export const categoryService = {
  async getAllWithChildren(parentId: number | null = null): Promise<any[]> {
    const categories = await prisma.category.findMany({
      where: { parentId },
      include: {
        // ممکنه لازم نباشد اینجا include کنی چون ما بازگشتی خودمون می‌سازیم
      },
    });

    const nested = await Promise.all(
      categories.map(async (category) => {
        const subCategories = await this.getAllWithChildren(category.id);
        return {
          ...category,
          subCategories,
        };
      })
    );

    return nested;
  },
  async getAll() {
    return prisma.category.findMany({
      where: { parentId: null },
      include: { subCategories: { include: { subCategories: true } } },
    });
  },

  async getById(id: number) {
    return prisma.category.findUnique({
      where: { id },
      include: { subCategories: true, parent: true },
    });
  },

  async create(data: CreateCategoryDTO) {
    const slug = data.slug
      ? makeSlug(data.slug)
      : data.name
      ? makeSlug(data.name)
      : null;

    if (!data.name) {
      throw new Error("Category name is required");
    }

    return prisma.category.create({
      data: {
        ...data,
        slug: slug || undefined, // تا اگه خالی بود، Prisma خطا نده
      },
    });
  },

  async update(id: number, data: UpdateCategoryDTO) {
    const slug = data.slug || (data.name ? makeSlug(data.name) : undefined);
    return prisma.category.update({ where: { id }, data: { ...data, slug } });
  },

  async delete(id: number) {
    return prisma.category.delete({ where: { id } });
  },
  async search(query: string) {
    const text = query?.trim();
    if (!text) return [];

    return prisma.category.findMany({
      where: {
        OR: [
          { name: { contains: text, mode: "insensitive" } },
          { slug: { contains: text, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        name: true,
        slug: true,
      },
      take: 10,
    });
  },
  async getAllSubCategoryIds(categoryId: number): Promise<number[]> {
    const subCategories = await prisma.category.findMany({
      where: { parentId: categoryId },
      select: { id: true },
    });

    if (subCategories.length === 0) return [categoryId];

    const nestedIds = await Promise.all(
      subCategories.map((c) => this.getAllSubCategoryIds(c.id))
    );

    return [categoryId, ...nestedIds.flat()];
  },

  // 🆕 گرفتن همه محصولات متصل به دسته و زیر‌دسته‌ها
  async getAllProductsByCategory(categoryId: number, sort?: string) {
    // ✅ دریافت تمام زیر‌دسته‌ها به‌صورت بازگشتی
    const subCategoryIds = await this.getAllSubCategoryIds(categoryId);

    // ⚠️ حذف categoryId تکراری (چون خودش داخل با recursion ممکنه برگرده)
    const uniqueIds = Array.from(new Set([...subCategoryIds, categoryId]));

    // ✅ واکشی محصولات فعال از همه دسته‌ها و زیرشاخه‌ها
    const products = await prisma.product.findMany({
      where: {
        categoryId: { in: uniqueIds },
        isBlock: false,
      },
      include: {
        category: true,
        variants: true,
      },
    });

    // ✅ تابع کمکی برای گرفتن قیمت قابل محاسبه از واریانت‌ها
    const getPrice = (product: any, mode: "min" | "max" = "min") => {
      if (!product.variants?.length) return Infinity;
      const prices = product.variants.map((v: any) =>
        v.price ? Number(v.price) : 0
      );
      return mode === "min" ? Math.min(...prices) : Math.max(...prices);
    };

    // ✅ منطق مرتب‌سازی سمت جاوااسکریپت
    switch (sort) {
      case "cheapest": {
        products.sort((a, b) => getPrice(a, "min") - getPrice(b, "min"));
        break;
      }
      case "expensive": {
        products.sort((a, b) => getPrice(b, "max") - getPrice(a, "max"));
        break;
      }
      case "bestseller": {
        products.sort((a, b) => (b.soldCount ?? 0) - (a.soldCount ?? 0));
        break;
      }
      case "mostViewed": {
        // 👈 اضافه شد
        products.sort((a, b) => (b.viewCount ?? 0) - (a.viewCount ?? 0));
        break;
      }
      default: {
        // جدیدترین بر اساس تاریخ ساخت
        products.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      }
    }

    return products;
  },
};
