import { brandService } from "../services/brandService";
import { Request, Response } from "express";
export const getBrandProductsBySlug = async (req: Request, res: Response) => {
  try {
    const result = await brandService.getProductsBySlug(
      req.params.slug,
      req.query,
    );

    res.json({
      success: true,
      brand: result.brand,
      data: result.products,
      pagination: result.pagination,
    });
  } catch (err: any) {
    if (err.message === "Brand not found") {
      return res.status(404).json({ message: "برند یافت نشد" });
    }

    res.status(500).json({
      message: "خطا در دریافت محصولات برند",
    });
  }
};
