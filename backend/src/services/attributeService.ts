import { Prisma } from "@prisma/client";
import { prisma } from "../config/db";
import { BadRequestError, NotFoundError } from "../utils/ApiError";
import { makeSlug } from "../utils/slugify";
import { CreateAttributeDTO } from "../dto/Createattribute";
import { UpdateAttributeDTO } from "../dto/Updateattribute";
import { CreateAttributeValueDTO } from "../dto/CreateAttributeValue";
import { UpdateAttributeValueDTO } from "../dto/Updateattributevalue";

interface GetAttributesQuery {
  page?: number;
  limit?: number;
  search?: string;
}

export const attributeService = {
  async getAttributes(query: GetAttributesQuery) {
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? query.limit : 10;
    const skip = (page - 1) * limit;

    const where: Prisma.AttributeWhereInput = query.search
      ? {
          name: {
            contains: query.search,
            mode: "insensitive",
          },
        }
      : {};

    const [items, total] = await Promise.all([
      prisma.attribute.findMany({
        where,
        include: { values: true },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.attribute.count({ where }),
    ]);

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async getAttributeById(id: number) {
    const attribute = await prisma.attribute.findUnique({
      where: { id },
      include: { values: true },
    });

    if (!attribute) {
      throw new NotFoundError("ویژگی مورد نظر یافت نشد.");
    }

    return attribute;
  },

  async createAttribute(dto: CreateAttributeDTO) {
    const slug = dto.slug ? dto.slug : makeSlug(dto.name);

    const existing = await prisma.attribute.findFirst({
      where: {
        OR: [{ name: dto.name }, { slug }],
      },
    });

    if (existing) {
      throw new BadRequestError("ویژگی با این نام یا اسلاگ قبلاً ثبت شده است.");
    }

    return prisma.attribute.create({
      data: {
        name: dto.name,
        slug,
        variation: dto.variation ?? false,
        filterable: dto.filterable ?? true,
        visible: dto.visible ?? true,
      },
    });
  },

  async updateAttribute(id: number, dto: UpdateAttributeDTO) {
    const attribute = await prisma.attribute.findUnique({ where: { id } });

    if (!attribute) {
      throw new NotFoundError("ویژگی مورد نظر یافت نشد.");
    }

    let slug = dto.slug;

    if (dto.name && dto.name !== attribute.name && !dto.slug) {
      slug = makeSlug(dto.name);
    }

    if (dto.name || slug) {
      const existing = await prisma.attribute.findFirst({
        where: {
          id: { not: id },
          OR: [
            ...(dto.name ? [{ name: dto.name }] : []),
            ...(slug ? [{ slug }] : []),
          ],
        },
      });

      if (existing) {
        throw new BadRequestError(
          "ویژگی با این نام یا اسلاگ قبلاً ثبت شده است.",
        );
      }
    }

    return prisma.attribute.update({
      where: { id },
      data: {
        name: dto.name ?? undefined,
        slug: slug ?? undefined,
        variation: dto.variation ?? undefined,
        filterable: dto.filterable ?? undefined,
        visible: dto.visible ?? undefined,
      },
    });
  },

  async deleteAttribute(id: number) {
    const attribute = await prisma.attribute.findUnique({ where: { id } });

    if (!attribute) {
      throw new NotFoundError("ویژگی مورد نظر یافت نشد.");
    }

    const [productAttributeUsage, variantAttributeUsage] = await Promise.all([
      prisma.productAttribute.findFirst({
        where: { value: { attributeId: id } },
      }),
      prisma.productVariantAttribute.findFirst({
        where: { value: { attributeId: id } },
      }),
    ]);

    if (productAttributeUsage || variantAttributeUsage) {
      throw new BadRequestError(
        "این ویژگی در محصولات استفاده شده و قابل حذف نیست.",
      );
    }

    await prisma.attribute.delete({ where: { id } });

    return { success: true };
  },

  async getAttributeValues(attributeId: number) {
    const attribute = await prisma.attribute.findUnique({
      where: { id: attributeId },
    });

    if (!attribute) {
      throw new NotFoundError("ویژگی مورد نظر یافت نشد.");
    }

    return prisma.attributeValue.findMany({
      where: { attributeId },
      orderBy: { createdAt: "desc" },
    });
  },

  async createAttributeValue(
    attributeId: number,
    dto: CreateAttributeValueDTO,
  ) {
    const attribute = await prisma.attribute.findUnique({
      where: { id: attributeId },
    });

    if (!attribute) {
      throw new NotFoundError("ویژگی مورد نظر یافت نشد.");
    }

    const existing = await prisma.attributeValue.findFirst({
      where: { attributeId, value: dto.value },
    });

    if (existing) {
      throw new BadRequestError("این مقدار قبلاً برای این ویژگی ثبت شده است.");
    }

    return prisma.attributeValue.create({
      data: {
        attributeId,
        value: dto.value,
      },
    });
  },

  async updateAttributeValue(id: number, dto: UpdateAttributeValueDTO) {
    const attributeValue = await prisma.attributeValue.findUnique({
      where: { id },
    });

    if (!attributeValue) {
      throw new NotFoundError("مقدار ویژگی مورد نظر یافت نشد.");
    }

    const existing = await prisma.attributeValue.findFirst({
      where: {
        id: { not: id },
        attributeId: attributeValue.attributeId,
        value: dto.value,
      },
    });

    if (existing) {
      throw new BadRequestError("این مقدار قبلاً برای این ویژگی ثبت شده است.");
    }

    return prisma.attributeValue.update({
      where: { id },
      data: { value: dto.value },
    });
  },

  async deleteAttributeValue(id: number) {
    const attributeValue = await prisma.attributeValue.findUnique({
      where: { id },
    });

    if (!attributeValue) {
      throw new NotFoundError("مقدار ویژگی مورد نظر یافت نشد.");
    }

    const [productAttributeUsage, variantAttributeUsage] = await Promise.all([
      prisma.productAttribute.findFirst({ where: { valueId: id } }),
      prisma.productVariantAttribute.findFirst({ where: { valueId: id } }),
    ]);

    if (productAttributeUsage || variantAttributeUsage) {
      throw new BadRequestError(
        "این مقدار در محصولات استفاده شده و قابل حذف نیست.",
      );
    }

    await prisma.attributeValue.delete({ where: { id } });

    return { success: true };
  },
  async getVariationAttributes() {
    return prisma.attribute.findMany({
      where: {
        variation: true,
        values: {
          some: {},
        },
      },
      include: {
        values: {
          orderBy: {
            value: "asc",
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });
  },
  async getProductAttributes() {
    return prisma.attribute.findMany({
      where: {
        variation: false,
        values: {
          some: {},
        },
      },
      include: {
        values: {
          orderBy: {
            value: "asc",
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });
  },
};
