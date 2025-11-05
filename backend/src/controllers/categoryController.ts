
import { Request, Response } from "express";
import { categoryService } from "../services/categoryService";

export const getAll = async (req: Request, res: Response) => {
  res.json(await categoryService.getAll());
};
export const getAllWithChildren = async (req: Request, res: Response) => {
  res.json(await categoryService.getAllWithChildren());
};
export const search = async (req: Request, res: Response) => {
  try {
    const { q } = req.query;
    const result = await categoryService.search(q as string);
    res.json(result);
  } catch (err) {
    console.error("Category search error:", err);
    res.status(500).json({ message: "خطای سرور در جستجوی دسته‌بندی" });
  }
};
export const getById = async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  // 👇 چک مقدار و اعتبار عدد
  if (!id || isNaN(id)) {
    return res.status(400).json({ message: "شناسه معتبر نیست یا وجود ندارد." });
  }

  try {
    const category = await categoryService.getById(id);
    if (!category) {
      return res.status(404).json({ message: "دسته‌بندی یافت نشد." });
    }
    res.json(category);
  } catch (error) {
    console.error("SERVER ERROR:", error);
    res.status(500).json({ error: "خطای سرور در دریافت دسته‌بندی." });
  }
};

export const create = async (req: Request, res: Response) => {
  res.status(201).json(await categoryService.create(req.body));
};

export const update = async (req: Request, res: Response) => {
  res.json(await categoryService.update(Number(req.params.id), req.body));
};

export const remove = async (req: Request, res: Response) => {
  await categoryService.delete(Number(req.params.id));
  res.status(204).send();

};
export const getCategoryProducts = async (req: Request, res: Response) => {
  try {
    const categoryId = Number(req.params.id);
    if (isNaN(categoryId)) {
      return res.status(400).json({ message: "شناسه دسته معتبر نیست" });
    }

    const sort = (req.query.sort as string) || "newest";
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 24;
    const {products,pagination} = await categoryService.getAllProductsByCategory(categoryId, sort, page, limit);

    res.json({
      success: true,
      data: products,
      pagination,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "خطا در دریافت محصولات دسته‌بندی" });
  }
};
