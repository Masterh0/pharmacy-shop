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
    // 🔸 دریافت تمام زیردسته‌ها به‌صورت بازگشتی
    const subCategoryIds = await this.getAllSubCategoryIds(categoryId);
    const allIds = [categoryId, ...subCategoryIds];

    // 🔸 واکشی محصولات دسته و زیرشاخه‌ها (بدون مرتب‌سازی از Prisma)
    const products = await prisma.product.findMany({
      where: { categoryId: { in: allIds }, isBlock: false },
      include: {
        category: true,
        variants: true,
      },
    });

    // 🔸 مرتب‌سازی سمت جاوااسکریپت
    switch (sort) {
      case "cheapest": {
        // ارزان‌ترین بر اساس کمترین قیمت variant
        products.sort((a, b) => {
          const aPrice = Math.min(
            ...a.variants.map((v) => (v.price ? v.price.toNumber() : 0))
          );
          const bPrice = Math.min(
            ...b.variants.map((v) => (v.price ? v.price.toNumber() : 0))
          );
          return aPrice - bPrice;
        });
        break;
      }
      case "expensive": {
        // گران‌ترین بر اساس بیشترین قیمت variant
        products.sort((a, b) => {
          const aPrice = Math.max(
            ...a.variants.map((v) => (v.price ? v.price.toNumber() : 0))
          );
          const bPrice = Math.max(
            ...b.variants.map((v) => (v.price ? v.price.toNumber() : 0))
          );
          return bPrice - aPrice;
        });
        break;
      }
      case "bestseller": {
        // پرفروش‌ترین
        products.sort((a, b) => (b.soldCount ?? 0) - (a.soldCount ?? 0));
        break;
      }
      default: {
        // جدیدترین (بر اساس تاریخ ساخت)
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
