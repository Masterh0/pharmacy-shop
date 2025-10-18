import { prisma } from "../config/db";
import { CreateCategoryDTO, UpdateCategoryDTO } from "../../dto/categoryDto";
import { makeSlug } from "../utils/slugify";

export const categoryService = {
  async getAllWithChildren() {
    return prisma.category.findMany({
      orderBy: { id: "asc" },
    });
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
    const slug = data.slug || makeSlug(data.name);
    return prisma.category.create({ data: { ...data, slug } });
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
};
