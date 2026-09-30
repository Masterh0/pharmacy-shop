// src/controllers/productController.ts
import { Request, Response, NextFunction } from "express";
import { productService } from "../services/productService";

// ✅ همه کاربران (بدون احراز هویت)
export const getAll = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const products = await productService.getAllActiveProducts();

    res.status(200).json({ data: products });
  } catch (err) {
    next(err);
  }
};

// ✅ همه کاربران
export const getById = async (
  req: Request,
  res: Response,
  next: NextFunction,
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
  next: NextFunction,
) => {
  try {
    const files = req.files as
      | Record<string, Express.Multer.File[]>
      | undefined;

    // عکس اصلی محصول
    const imageUrl = files?.["image"]?.[0]
      ? `/uploads/${files["image"][0].filename}`
      : undefined;

    const payload = { ...req.body };
    
    if (typeof payload.attributes === "string") {
      try {
        payload.attributes = JSON.parse(payload.attributes);
      } catch {
        return res.status(400).json({
          message: "فرمت attributes نادرست است",
        });
      }
    }
    // parse واریانت‌ها از JSON string
    if (typeof payload.variants === "string") {
      try {
        payload.variants = JSON.parse(payload.variants);
      } catch {
        return res.status(400).json({ message: "فرمت واریانت‌ها نادرست است" });
      }
    }

    // تزریق عکس‌ها به هر واریانت بر اساس ایندکس
    if (Array.isArray(payload.variants)) {
      payload.variants = payload.variants.map((variant: any, index: number) => {
        const variantFiles = files?.[`variantImages_${index}`] ?? [];

        console.log(
          `📸 واریانت ${index}: ${variantFiles.length} فایل دریافت شد`,
        );

        const images = variantFiles.map((f, i) => ({
          url: `/uploads/${f.filename}`,
          altText: variant.flavor ?? "",
          displayOrder: i,
          isPrimary: i === 0,
        }));

        return { ...variant, images };
      });
    }

    const product = await productService.create({ ...payload, imageUrl });

    res.status(201).json({ status: "success", data: product });
  } catch (error) {
    next(error);
  }
};

// 🔒 فقط ادمین
export const update = async (
  req: Request,
  res: Response,
  next: NextFunction,
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
    const payload = { ...req.body };

    if (typeof payload.attributes === "string") {
      try {
        payload.attributes = JSON.parse(payload.attributes);
      } catch {
        return res.status(400).json({
          message: "فرمت attributes نادرست است",
        });
      }
    }

    const updateData = {
      ...payload,
      imageUrl,
    };
    const result = await productService.update(id, updateData);

    return res.status(200).json({
      status: "success",
      data: result,
    });
  } catch (error) {
    console.error("Update product error:", error);

    next(error);
  }
};

// 🔒 فقط ادمین
export const remove = async (
  req: Request,
  res: Response,
  next: NextFunction,
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
  next: NextFunction,
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
  next: NextFunction,
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
  next: NextFunction,
) => {
  try {
    const products = await productService.getAllProductsForAdmin();

    res.status(200).json({ data: products });
  } catch (err) {
    next(err);
  }
};
export const getFilteredProducts = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await productService.getFilteredProducts(req.query);

    res.json(result);
  } catch (err) {
    next(err);
  }
};

// product.controller.ts
export const getSimilarProducts = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const limit = Number(req.query.limit) || 8;
  const products = await productService.getSimilarProducts(id, limit);
  res.json({ success: true, data: products });
};
