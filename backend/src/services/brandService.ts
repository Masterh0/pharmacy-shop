import { prisma } from "../config/db";
import { makeSlug } from "../utils/slugify";
import { CreateBrandDto, UpdateBrandDto } from "../../dto/brandDto";
import { ApiError, NotFoundError, BadRequestError } from "../utils/ApiError";
import { productService } from "./productService";

export const brandService = {
  /** 🟦 دریافت تمام برندها */
  async getAll() {
    return prisma.brand.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
      },
      orderBy: {
        name: "asc",
      },
    });
  },

  /** 🟦 دریافت یک برند بر اساس ID */
  async getById(id: number) {
    const brand = await prisma.brand.findUnique({
      where: { id },
      include: { products: true },
    });
    if (!brand) throw new NotFoundError("برند یافت نشد");
    return brand;
  },

  /** 🟩 ایجاد برند جدید */
  async create(data: CreateBrandDto) {
    const slug = data.slug ? makeSlug(data.slug) : makeSlug(data.name);
    try {
      return await prisma.brand.create({
        data: { name: data.name, slug },
      });
    } catch (error: any) {
      // Unique constraint (duplicate name or slug)
      if (error.code === "P2002")
        throw new BadRequestError("نام یا اسلاگ برند تکراری است");

      // سایر خطاهای دیتابیس
      throw new ApiError("خطا در ایجاد برند.", 500);
    }
  },

  /** 🟨 ویرایش برند */
  async update(id: number, data: UpdateBrandDto) {
    const slug = data.slug ? makeSlug(data.slug) : undefined;

    try {
      return await prisma.brand.update({
        where: { id },
        data: { ...data, ...(slug && { slug }) },
      });
    } catch (error: any) {
      // رکورد وجود ندارد
      if (error.code === "P2025") throw new NotFoundError("برند یافت نشد");

      // مقدار تکراری
      if (error.code === "P2002")
        throw new BadRequestError("نام یا اسلاگ تکراری است");

      throw new ApiError("خطا در ویرایش برند.", 500);
    }
  },

  /** 🟥 حذف برند */
  async delete(id: number) {
    try {
      return await prisma.brand.delete({ where: { id } });
    } catch (error: any) {
      // برند متصل به محصولات
      if (
        error.code === "P2003" || // Foreign key در Prisma
        error.code === "23001" || // PostgreSQL violation
        (error.message && error.message.includes("violates RESTRICT"))
      ) {
        throw new BadRequestError(
          "این برند به یک یا چند محصول متصل است و نمی‌توان آن را حذف کرد.",
        );
      }

      // برند وجود ندارد
      if (error.code === "P2025") {
        throw new NotFoundError("برند مورد نظر یافت نشد.");
      }

      throw new ApiError("خطا در حذف برند.", 500);
    }
  },
  async getActiveBrands() {
    const brands = await prisma.brand.findMany({
      where: {
        products: {
          some: {
            isBlock: false,
          },
        },
      },
      orderBy: {
        products: {
          _count: "desc",
        },
      },
      select: {
        id: true,
        name: true,
        slug: true,
        _count: {
          select: {
            products: {
              where: {
                isBlock: false,
              },
            },
          },
        },
      },
    });

    return brands.map((brand) => ({
      id: brand.id,
      name: brand.name,
      slug: brand.slug,
      count: brand._count.products,
    }));
  },
  async getProductsBySlug(slug: string, filters: any) {
    const brand = await prisma.brand.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        slug: true,
      },
    });

    if (!brand) {
      throw new NotFoundError("Brand not found");
    }

    const result = await productService.getFilteredProducts({
      ...filters,
      brand: brand.id,
    });

    return {
      brand,
      ...result,
    };
  },
};
