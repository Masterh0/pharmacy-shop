// src/controllers/productController.ts
import { Request, Response, NextFunction } from "express";
import { productService } from "../services/productService";
import { prisma } from "../config/db";

// ✅ همه کاربران (بدون احراز هویت)
export const getAll = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const products = await prisma.product.findMany({
      where: { isBlock: false }, // فقط محصولات فعال
      include: {
        variants: {
          orderBy: { id: "asc" },
          take: 1,
        },
      },
      orderBy: { id: "desc" },
    });

    res.status(200).json({ data: products });
  } catch (err) {
    next(err);
  }
};

// ✅ همه کاربران
export const getById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = Number(req.params.id);
    const product = await productService.getById(id);
    res.json(product);
  } catch (error) {
    next(error);
  }
};

// 🔒 فقط ادمین
export const create = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const imageUrl = req.file
      ? `/uploads/${req.file.filename}` // ✅ مسیر نسبی
      : undefined;

    const payload = req.body;

    if (typeof payload.variant === "string") {
      payload.variant = JSON.parse(payload.variant);
    }

    const product = await productService.create({
      ...payload,
      imageUrl,
    });

    res.status(201).json({
      status: "success",
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

// 🔒 فقط ادمین
export const update = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = Number(req.params.id);

    const existingProduct = await productService.getById(id);
    if (!existingProduct) {
      return res.status(404).json({ message: "محصول یافت نشد" });
    }

    let imageUrl: string | undefined | null;

    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    } else if (
      req.body.imageUrl &&
      req.body.imageUrl !== "undefined" &&
      req.body.imageUrl !== "null" &&
      req.body.imageUrl.trim() !== ""
    ) {
      imageUrl = req.body.imageUrl;
    } else {
      imageUrl = existingProduct.imageUrl; // حفظ عکس قبلی
    }

    const updateData = { ...req.body, imageUrl };
    const result = await productService.update(id, updateData);

    return res.status(200).json({
      status: "success",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// 🔒 فقط ادمین
export const remove = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = Number(req.params.id);
    await productService.delete(id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

// ✅ همه کاربران
export const increaseViewCount = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const result = await productService.increaseViewCount(Number(id));
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

// 🔒 فقط ادمین
export const blockProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = Number(req.params.id);
    const { isBlock } = req.body;

    if (typeof isBlock !== "boolean") {
      return res.status(400).json({ message: "isBlock باید boolean باشد" });
    }

    const result = await productService.block(id, isBlock);

    res.status(200).json({
      status: "success",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// 🔒 فقط ادمین
export const getAllForAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        variants: {
          orderBy: { id: "asc" },
          take: 1,
        },
      },
      orderBy: [
        { isBlock: "asc" },
        { id: "desc" },
      ],
    });

    res.status(200).json({ data: products });
  } catch (err) {
    next(err);
  }
};
