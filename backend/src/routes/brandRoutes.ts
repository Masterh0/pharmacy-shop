import { Router, Request, Response } from "express";
import { brandService } from "../services/brandService";
import { verifyAccessToken, isAdmin } from "../middlewares/auth";
import { getBrandProductsBySlug } from "../controllers/brandController";

const brandRouter = Router();
brandRouter.get("/:slug/products", getBrandProductsBySlug);
// ✅ عمومی
brandRouter.get("/", async (_req, res, next) => {
  try {
    res.json(await brandService.getAll());
  } catch (err) {
    next(err);
  }
});
brandRouter.get("/active", async (_req, res, next) => {
  try {
    res.json(await brandService.getActiveBrands());
  } catch (err) {
    next(err);
  }
});

brandRouter.get("/:id", async (req, res, next) => {
  try {
    res.json(await brandService.getById(Number(req.params.id)));
  } catch (err) {
    next(err);
  }
});

// 🔒 فقط ادمین
brandRouter.post("/", verifyAccessToken, isAdmin, async (req, res, next) => {
  try {
    res.status(201).json(await brandService.create(req.body));
  } catch (err) {
    next(err);
  }
});

brandRouter.put("/:id", verifyAccessToken, isAdmin, async (req, res, next) => {
  try {
    res.json(await brandService.update(Number(req.params.id), req.body));
  } catch (err) {
    next(err);
  }
});

brandRouter.delete(
  "/:id",
  verifyAccessToken,
  isAdmin,
  async (req, res, next) => {
    try {
      res.json(await brandService.delete(Number(req.params.id)));
    } catch (err) {
      next(err);
    }
  },
);

export default brandRouter;
