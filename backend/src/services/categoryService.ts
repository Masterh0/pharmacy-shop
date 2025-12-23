import { prisma } from "../config/db";
import { CreateCategoryDTO, UpdateCategoryDTO } from "../../dto/categoryDto";
import { makeSlug } from "../utils/slugify";
import { getPagination, buildPaginationMeta } from "../utils/pagination";
import { Prisma } from "@prisma/client";
type ProductSort = "cheapest" | "expensive" | "default";

const normalizeSort = (sort?: string): ProductSort => {
  if (sort === "cheapest" || sort === "expensive") return sort;
  return "default";
};
const sortProducts = (products: any[], sort: ProductSort) => {
  return [...products].sort((a, b) => {
    const aInStock = a.variants?.some((v: any) => v.stock > 0);
    const bInStock = b.variants?.some((v: any) => v.stock > 0);

    if (aInStock !== bInStock) {
      return aInStock ? -1 : 1;
    }

    switch (sort) {
      case "cheapest":
        return (
          categoryService._getEffectiveProductPrice(a, "min") -
          categoryService._getEffectiveProductPrice(b, "min")
        );

      case "expensive":
        return (
          categoryService._getEffectiveProductPrice(b, "max") -
          categoryService._getEffectiveProductPrice(a, "max")
        );

      default:
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }
  });
};
export const categoryService = {
  async getAllWithChildren(parentId: number | null = null): Promise<any[]> {
    const categories = await prisma.category.findMany({
      where: { parentId },
    });

    const nested = await Promise.all(
      categories.map(async (category) => {
        const subCategories = await this.getAllWithChildren(category.id);
        return { ...category, subCategories };
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
        slug: slug || undefined,
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
      select: { id: true, name: true, slug: true },
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

  _getEffectiveProductPrice(product: any, mode: "min" | "max" = "min"): number {
    if (!product.variants?.length) return mode === "min" ? Infinity : -Infinity;

    const prices = product.variants.map((v: any) =>
      v.discountPrice && Number(v.discountPrice) > 0
        ? Number(v.discountPrice)
        : Number(v.price) || 0
    );

    return mode === "min" ? Math.min(...prices) : Math.max(...prices);
  },

  // ✅ MAIN METHOD
  async getFilteredProducts(
    categorySlug: string,
    filters: {
      brand?: number | number[];
      discount?: any;
      available?: any;
      page?: any;
      limit?: any;
      minPrice?: number;
      maxPrice?: number;
      sort?: string;
    }
  ) {
    /* ========================
   ✅ NORMALIZE
  ======================== */
    const parseBoolean = (v: any): boolean | undefined => {
      if (Array.isArray(v)) v = v[0];

      if (v === "1" || v === 1 || v === true || v === "true" || v === "on") {
        return true;
      }

      if (v === "0" || v === 0 || v === false || v === "false") {
        return false;
      }

      return undefined;
    };

    const brandIds = filters.brand
      ? Array.isArray(filters.brand)
        ? filters.brand.map(Number).filter(Boolean)
        : [Number(filters.brand)]
      : undefined;

    const hasDiscount = parseBoolean(filters.discount);
    const inStock = parseBoolean(filters.available);

    const page = Number(filters.page) || 1;
    const limit = Number(filters.limit) || 12;

    const minPrice =
      filters.minPrice !== undefined && !isNaN(Number(filters.minPrice))
        ? Number(filters.minPrice)
        : undefined;

    const maxPrice =
      filters.maxPrice !== undefined && !isNaN(Number(filters.maxPrice))
        ? Number(filters.maxPrice)
        : undefined;

    /* ======================== */

    const category = await prisma.category.findUnique({
      where: { slug: categorySlug },
      select: { id: true, name: true },
    });
    if (!category) throw new Error("Category not found");

    const categoryIds = await this.getAllSubCategoryIds(category.id);

    /* ========================
   ✅ PRODUCT WHERE
  ======================== */
    const where: Prisma.ProductWhereInput = {
      categoryId: { in: categoryIds },
      isBlock: false,
    };

    if (brandIds?.length) {
      where.brandId = { in: brandIds };
    }

    /* ========================
   ✅ VARIANT WHERE — FIXED
  ======================== */
    /* ========================
 /* ========================
 ✅ VARIANT WHERE — FINAL
======================== */

    const variantWhere: Prisma.ProductVariantWhereInput = {};

    // ✅ intent واقعی URL
    const hasVariantFilter =
      inStock ||
      hasDiscount ||
      minPrice !== undefined ||
      maxPrice !== undefined;

    if (inStock) {
      variantWhere.stock = { gt: 0 };
    }

    if (hasDiscount) {
      variantWhere.discountPrice = { gt: 0 };
    }

    const hasMin = typeof minPrice === "number";
    const hasMax = typeof maxPrice === "number";

    if (hasMin || hasMax) {
      variantWhere.OR = [
        // ✅ variants تخفیف‌دار
        {
          discountPrice: {
            gt: 0,
            ...(hasMin && { gte: minPrice }),
            ...(hasMax && { lte: maxPrice }),
          },
        },
        // ✅ variants بدون تخفیف
        {
          discountPrice: { equals: 0 },
          price: {
            ...(hasMin && { gte: minPrice }),
            ...(hasMax && { lte: maxPrice }),
          },
        },
      ];
    }

    // ✅ فقط این attach
    if (hasVariantFilter) {
      where.variants = { some: variantWhere };
    }
    const products = await prisma.product.findMany({
      where,
      include: {
        brand: true,
        category: true,
        variants: true,
      },
    });

    /* ========================
   ✅ SORT
  ======================== */
    const sort = normalizeSort(filters.sort);
    const sorted = sortProducts(products, sort);
    // ✅ 1. همیشه اول کالاهای موجود
    const total = sorted.length;
    const { skip, take } = getPagination(page, limit);

    return {
      category,
      products: sorted.slice(skip, skip + take),
      pagination: buildPaginationMeta(total, page, limit),
    };
  },

  async getAllProductsByCategoryBySlug(
    slug: string,
    sort?: string,
    page = 1,
    limit = 12
  ) {
    return this.getFilteredProducts(slug, { sort, page, limit });
  },

  async getAllProductsByCategory(
    categoryId: number,
    sort?: string,
    page = 1,
    limit = 12
  ) {
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      select: { slug: true },
    });

    if (!category?.slug) throw new Error("Category not found or slug missing");

    return this.getFilteredProducts(category.slug, { sort, page, limit });
  },

  async getCategoryFilters(categoryId: number) {
    const subCategoryIds = await this.getAllSubCategoryIds(categoryId);
    const categoryIds = [...new Set([categoryId, ...subCategoryIds])];

    const products = await prisma.product.findMany({
      where: {
        categoryId: { in: categoryIds },
        isBlock: false,
      },
      include: {
        brand: true,
        variants: true,
      },
    });

    const brandMap = new Map<
      number,
      { id: number; name: string; count: number }
    >();

    let minPrice = Infinity;
    let maxPrice = 0;
    let hasDiscount = false;
    let hasInStock = false;

    for (const product of products) {
      if (product.brand) {
        const current = brandMap.get(product.brand.id);
        if (current) current.count += 1;
        else {
          brandMap.set(product.brand.id, {
            id: product.brand.id,
            name: product.brand.name,
            count: 1,
          });
        }
      }

      for (const v of product.variants) {
        const price =
          v.discountPrice && Number(v.discountPrice) > 0
            ? Number(v.discountPrice)
            : Number(v.price);

        if (price > 0) {
          minPrice = Math.min(minPrice, price);
          maxPrice = Math.max(maxPrice, price);
        }

        if (v.discountPrice && Number(v.discountPrice) > 0) hasDiscount = true;
        if (v.stock && v.stock > 0) hasInStock = true;
      }
    }

    return {
      brands: Array.from(brandMap.values()),
      price: {
        min: minPrice === Infinity ? 0 : minPrice,
        max: maxPrice,
      },
      hasDiscount,
      hasInStock,
    };
  },
  async getFilteredProductsForAdmin(
    categorySlug: string,
    filters: {
      brand?: number | number[];
      discount?: any;
      available?: any;
      page?: any;
      limit?: any;
      minPrice?: number;
      maxPrice?: number;
      sort?: string;
    }
  ) {
    /* ========================
   ✅ NORMALIZE
  ======================== */
    const parseBoolean = (v: any): boolean | undefined => {
      if (Array.isArray(v)) v = v[0];

      if (v === "1" || v === 1 || v === true || v === "true" || v === "on") {
        return true;
      }

      if (v === "0" || v === 0 || v === false || v === "false") {
        return false;
      }

      return undefined;
    };

    const brandIds = filters.brand
      ? Array.isArray(filters.brand)
        ? filters.brand.map(Number).filter(Boolean)
        : [Number(filters.brand)]
      : undefined;

    const hasDiscount = parseBoolean(filters.discount);
    const inStock = parseBoolean(filters.available);

    const page = Number(filters.page) || 1;
    const limit = Number(filters.limit) || 12;

    const minPrice =
      filters.minPrice !== undefined && !isNaN(Number(filters.minPrice))
        ? Number(filters.minPrice)
        : undefined;

    const maxPrice =
      filters.maxPrice !== undefined && !isNaN(Number(filters.maxPrice))
        ? Number(filters.maxPrice)
        : undefined;

    /* ======================== */

    const category = await prisma.category.findUnique({
      where: { slug: categorySlug },
      select: { id: true, name: true },
    });

    if (!category) throw new Error("Category not found");

    const categoryIds = await this.getAllSubCategoryIds(category.id);

    /* ========================
   ✅ PRODUCT WHERE (ADMIN)
  ======================== */
    const where: Prisma.ProductWhereInput = {
      categoryId: { in: categoryIds },
      // ✅ isBlock عمداً حذف شده
    };

    if (brandIds?.length) {
      where.brandId = { in: brandIds };
    }

    /* ========================
   ✅ VARIANT WHERE — FINAL
  ======================== */
    const variantWhere: Prisma.ProductVariantWhereInput = {};

    const hasVariantFilter =
      inStock ||
      hasDiscount ||
      minPrice !== undefined ||
      maxPrice !== undefined;

    if (inStock) {
      variantWhere.stock = { gt: 0 };
    }

    if (hasDiscount) {
      variantWhere.discountPrice = { gt: 0 };
    }

    const hasMin = typeof minPrice === "number";
    const hasMax = typeof maxPrice === "number";

    if (hasMin || hasMax) {
      variantWhere.OR = [
        {
          discountPrice: {
            gt: 0,
            ...(hasMin && { gte: minPrice }),
            ...(hasMax && { lte: maxPrice }),
          },
        },
        {
          discountPrice: { equals: 0 },
          price: {
            ...(hasMin && { gte: minPrice }),
            ...(hasMax && { lte: maxPrice }),
          },
        },
      ];
    }

    if (hasVariantFilter) {
      where.variants = { some: variantWhere };
    }

    /* ========================
   ✅ FETCH
  ======================== */
    const products = await prisma.product.findMany({
      where,
      include: {
        brand: true,
        category: true,
        variants: true,
      },
    });

    /* ========================
   ✅ SORT
  ======================== */
    const sort = normalizeSort(filters.sort);
    const sorted = sortProducts(products, sort);

    const total = sorted.length;
    const { skip, take } = getPagination(page, limit);

    return {
      category,
      products: sorted.slice(skip, skip + take),
      pagination: buildPaginationMeta(total, page, limit),
    };
  },
  async getFilteredBlockedProductsForAdmin(filters: {
    brand?: number | number[];
    discount?: any;
    available?: any;
    page?: any;
    limit?: any;
    minPrice?: number;
    maxPrice?: number;
    sort?: string;
  }) {
    /* ========================
     ✅ NORMALIZE
  ======================== */
    const parseBoolean = (v: any): boolean | undefined => {
      if (Array.isArray(v)) v = v[0];

      if (v === "1" || v === 1 || v === true || v === "true" || v === "on") {
        return true;
      }

      if (v === "0" || v === 0 || v === false || v === "false") {
        return false;
      }

      return undefined;
    };

    const brandIds = filters.brand
      ? Array.isArray(filters.brand)
        ? filters.brand.map(Number).filter(Boolean)
        : [Number(filters.brand)]
      : undefined;

    const hasDiscount = parseBoolean(filters.discount);
    const inStock = parseBoolean(filters.available);

    const page = Number(filters.page) || 1;
    const limit = Number(filters.limit) || 12;

    const minPrice =
      filters.minPrice !== undefined && !isNaN(Number(filters.minPrice))
        ? Number(filters.minPrice)
        : undefined;

    const maxPrice =
      filters.maxPrice !== undefined && !isNaN(Number(filters.maxPrice))
        ? Number(filters.maxPrice)
        : undefined;

    /* ========================
     ✅ PRODUCT WHERE (ADMIN / BLOCKED)
  ======================== */
    const where: Prisma.ProductWhereInput = {
      isBlock: true, // ✅ فقط بلاک‌شده‌ها
    };

    if (brandIds?.length) {
      where.brandId = { in: brandIds };
    }

    /* ========================
     ✅ VARIANT WHERE
  ======================== */
    const variantWhere: Prisma.ProductVariantWhereInput = {};

    const hasVariantFilter =
      inStock ||
      hasDiscount ||
      minPrice !== undefined ||
      maxPrice !== undefined;

    if (inStock) {
      variantWhere.stock = { gt: 0 };
    }

    if (hasDiscount) {
      variantWhere.discountPrice = { gt: 0 };
    }

    const hasMin = typeof minPrice === "number";
    const hasMax = typeof maxPrice === "number";

    if (hasMin || hasMax) {
      variantWhere.OR = [
        {
          discountPrice: {
            gt: 0,
            ...(hasMin && { gte: minPrice }),
            ...(hasMax && { lte: maxPrice }),
          },
        },
        {
          discountPrice: { equals: 0 },
          price: {
            ...(hasMin && { gte: minPrice }),
            ...(hasMax && { lte: maxPrice }),
          },
        },
      ];
    }

    if (hasVariantFilter) {
      where.variants = { some: variantWhere };
    }

    /* ========================
     ✅ FETCH
  ======================== */
    const products = await prisma.product.findMany({
      where,
      include: {
        brand: true,
        category: true,
        variants: true,
      },
    });

    /* ========================
     ✅ SORT
  ======================== */
    const sort = normalizeSort(filters.sort);
    const sorted = sortProducts(products, sort);

    const total = sorted.length;
    const { skip, take } = getPagination(page, limit);

    return {
      products: sorted.slice(skip, skip + take),
      pagination: buildPaginationMeta(total, page, limit),
    };
  },
};
