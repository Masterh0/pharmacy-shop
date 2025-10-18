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
  res.json(await categoryService.getById(Number(req.params.id)));
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
