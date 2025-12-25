import { Request, Response } from "express";
import { variantService } from "../services/variantService"; // مسیر را چک کنید که درست باشد

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
    const result = await variantService.create(req.body);
    res.status(201).json(result);
  } catch (error: any) {
    console.error("Create Variant Error:", error);
    // اگر خطا از سمت سرویس با علامت ❌ شروع شده باشد، یعنی خطای اعتبارسنجی است (۴۰۰)
    if (error.message && error.message.startsWith("❌")) {
      return res.status(400).json({
        status: "error",
        message: error.message,
      });
    }
    res.status(500).json({ message: "خطای سرور در ایجاد واریانت" });
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "شناسه واریانت نامعتبر است" });
    }

    // جدا کردن dbId اگر در بادی ارسال شده باشد تا باعث خطا نشود
    const { dbId, ...updatePayload } = req.body;

    const result = await variantService.update(id, updatePayload);

    res.json({
      status: "success",
      message: "واریانت با موفقیت ویرایش شد",
      data: result,
    });
  } catch (error: any) {
    console.error("Update Variant Error:", error);

    // ✅ نکته مهم: گرفتن خطاهای منطقی سرویس و ارسال کد ۴۰۰
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
    // معمولاً برای حذف موفق 200 یا 204 برمی‌گردانند
    res.status(200).json({ message: "واریانت با موفقیت حذف شد" });
  } catch (error: any) {
    if (error.message && error.message.startsWith("❌")) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "خطای سرور در حذف واریانت" });
  }
};
