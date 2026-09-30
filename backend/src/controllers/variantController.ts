import { Request, Response } from "express";
import { variantService } from "../services/variantService";

export const getAll = async (req: Request, res: Response) => {
  try {
    const result = await variantService.getAll();
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "خطا در دریافت واریانت‌ها" });
  }
};

export const getById = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "شناسه نامعتبر است" });
    }
    const result = await variantService.getById(id);
    if (!result) {
      return res.status(404).json({ message: "واریانت یافت نشد" });
    }
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "خطای سرور" });
  }
};

export const getByProductId = async (req: Request, res: Response) => {
  try {
    const productId = Number(req.params.id);

    if (isNaN(productId)) {
      return res.status(400).json({ message: "شناسه محصول نامعتبر است" });
    }
    const variants = await variantService.getByProductId(productId);
    return res.json(variants);
  } catch (error) {
    res.status(500).json({ message: "خطای سرور" });
  }
};

export const create = async (req: Request, res: Response) => {
  try {
    // ⭐ تبدیل productId از string به number
    const productId = Number(req.body.productId);

    if (isNaN(productId) || !productId) {
      return res.status(400).json({
        status: "error",
        message: "❌ شناسه محصول نامعتبر است",
      });
    }

    // 📸 مسیرهای تصاویر آپلود شده
    const images =
      (req.files as Express.Multer.File[])?.map(
        (file) => `/uploads/${file.filename}`,
      ) || [];
    let attributes: number[] = [];

    if (req.body.attributes) {
      try {
        attributes =
          typeof req.body.attributes === "string"
            ? JSON.parse(req.body.attributes)
            : req.body.attributes;
      } catch {
        return res.status(400).json({
          message: "فرمت attributes نامعتبر است",
        });
      }
    }
    // 📦 ساخت payload
    const payload = {
      ...req.body,
      productId, // ✅ حالا به صورت number هست
      packageQuantity: Number(req.body.packageQuantity),
      price: Number(req.body.price),
      discountPrice: req.body.discountPrice
        ? Number(req.body.discountPrice)
        : undefined,
      stock: Number(req.body.stock),
      images,
    };

    console.log("📦 Payload ارسالی به service:", payload);

    const result = await variantService.create(payload);

    res.status(201).json({
      status: "success",
      message: "✅ واریانت با موفقیت ایجاد شد",
      data: result,
    });
  } catch (error: any) {
    console.error("❌ Create Variant Error:", error);

    if (error.message && error.message.startsWith("❌")) {
      return res.status(400).json({
        status: "error",
        message: error.message,
      });
    }

    res.status(500).json({
      status: "error",
      message: "خطای سرور در ایجاد واریانت",
    });
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "شناسه واریانت نامعتبر است" });
    }

    // ⭐ فایل‌های جدید آپلود شده
    const files = req.files as Express.Multer.File[];

    // ⭐ پارس کردن existingImages (اگه به صورت JSON string اومده)
    type ExistingImage = {
      id: number;
      url: string;
      displayOrder: number;
      isPrimary: boolean;
    };

    let existingImages: ExistingImage[] | undefined;
    if (req.body.existingImages) {
      try {
        existingImages =
          typeof req.body.existingImages === "string"
            ? JSON.parse(req.body.existingImages)
            : req.body.existingImages;
      } catch (e) {
        console.error("❌ خطا در پارس existingImages:", e);
      }
    }

    const { dbId, ...updatePayload } = req.body;
    let attributes: number[] | undefined;

    if (updatePayload.attributes) {
      attributes =
        typeof updatePayload.attributes === "string"
          ? JSON.parse(updatePayload.attributes)
          : updatePayload.attributes;
    }

    const payload = {
      ...updatePayload,
      attributes,
      existingImages,
    };

    // ⭐ ارسال files به سرویس
    const result = await variantService.update(id, payload, files);

    res.json({
      status: "success",
      message: "واریانت با موفقیت ویرایش شد",
      data: result,
    });
  } catch (error: any) {
    console.error("Update Variant Error:", error);

    if (error.message && error.message.startsWith("❌")) {
      return res.status(400).json({
        status: "error",
        message: error.message,
      });
    }

    res.status(500).json({
      status: "error",
      message: "خطای داخلی سرور",
    });
  }
};

export const remove = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "شناسه نامعتبر است" });
    }
    await variantService.delete(id);
    res.status(200).json({ message: "واریانت با موفقیت حذف شد" });
  } catch (error: any) {
    if (error.message && error.message.startsWith("❌")) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "خطای سرور در حذف واریانت" });
  }
};
