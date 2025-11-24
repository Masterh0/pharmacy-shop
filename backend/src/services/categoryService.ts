import { prisma } from "../config/db";
import { CreateCategoryDTO, UpdateCategoryDTO } from "../../dto/categoryDto";
import { makeSlug } from "../utils/slugify";
import { getPagination, buildPaginationMeta } from "../utils/pagination";
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
  async getAllProductsByCategory(
    categoryId: number,
    sort?: string,
    page: number = 1,
    limit: number = 12
  ) {
    // ۱. گرفتن همه زیر‌دسته‌ها
    const subCategoryIds = await this.getAllSubCategoryIds(categoryId);
    const uniqueIds = Array.from(new Set([...subCategoryIds, categoryId]));

    // ۲. واکشی کل محصولات مرتبط بدون پیجینیشن (برای سورت دقیق کل دیتا)
    const allProducts = await prisma.product.findMany({
      where: {
        categoryId: { in: uniqueIds },
        isBlock: false,
      },
      include: {
        category: true,
        variants: true,
      },
    });

    const getPrice = (product: any, mode: "min" | "max" = "min") => {
      if (!product.variants?.length) return Infinity; // اگر هیچ واریانتی نبود

      const prices = product.variants.map((v: any) => {
        // اگر تخفیف وجود داره، همون ملاکه وگرنه قیمت اصلی
        const basePrice =
          v.discountPrice && Number(v.discountPrice) > 0
            ? Number(v.discountPrice)
            : Number(v.price) || 0;
        return basePrice;
      });

      // در حالت min یا max مقدار نهایی رو برمی‌گردونیم
      return mode === "min" ? Math.min(...prices) : Math.max(...prices);
    };

    // ۳. سورت روی کل محصولات
    switch (sort) {
      case "cheapest":
        allProducts.sort((a, b) => getPrice(a, "min") - getPrice(b, "min"));
        break;
      case "expensive":
        allProducts.sort((a, b) => getPrice(b, "max") - getPrice(a, "max"));
        break;
      case "bestseller":
        allProducts.sort((a, b) => (b.soldCount ?? 0) - (a.soldCount ?? 0));
        break;
      case "mostViewed":
        allProducts.sort((a, b) => (b.viewCount ?? 0) - (a.viewCount ?? 0));
        break;
      default:
        // جدیدترین
        allProducts.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }

    // ۴. پیجینیشن بعد از سورت
    const totalCount = allProducts.length;
    const { skip, take } = getPagination(page, limit);
    const paginatedProducts = allProducts.slice(skip, skip + take);
    const pagination = buildPaginationMeta(totalCount, page, limit);

    return { products: paginatedProducts, pagination };
  },
};
