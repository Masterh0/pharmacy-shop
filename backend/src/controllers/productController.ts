import { Request, Response, NextFunction } from "express";
import { productService } from "../services/productService";
import { prisma } from "../config/db";
export const getAll = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        variants: {
          orderBy: { id: "asc" }, // تا اولین واریانت قابل پیش‌بینی باشه
          take: 1, // فقط اولین واریانت
        },
      },
      orderBy: { id: "desc" },
    });

    res.status(200).json({ data: products });
  } catch (err) {
    next(err);
  }
};

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    const product = await productService.getById(id);
    res.json(product);
  } catch (error) {
    next(error);
  }
}

export const create = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const imageUrl = req.file
      ? `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`
      : undefined;
    const payload = req.body;

    // اگر variant به صورت JSON string اومده (به خاطر FormData)
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

export const update = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (req.file) {
  // اگر فایل جدید انتخاب شده، مسیر یا نامش رو به data اضافه کن
  req.body.image = req.file.filename;
  console.log("✅ فایل جدید ضمیمه شد:", req.body.image);
}
    
    console.log("🔸 req.file:", req.file);
    console.log("🔸 req.body:", req.body);
    const result = await productService.update(id, req.body);

    return res.status(200).json(result);
  } catch (error) {
    console.error("❌ SERVER ERROR در update:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
};

export const remove = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  await productService.delete(id);
  res.status(204).send();
};
