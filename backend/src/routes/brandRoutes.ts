import { Router, Request, Response } from "express";
import { brandService } from "../services/brandService";

 const brandRouter = Router();

brandRouter.get("/", async (_req: Request, res: Response, next) => {
  try {
    res.json(await brandService.getAll());
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

brandRouter.post("/", async (req, res, next) => {
  try {
    res.status(201).json(await brandService.create(req.body));
  } catch (err) {
    next(err);
  }
});

brandRouter.put("/:id", async (req, res, next) => {
  try {
    res.json(await brandService.update(Number(req.params.id), req.body));
  } catch (err) {
    next(err);
  }
});

brandRouter.delete("/:id", async (req, res, next) => {
  try {
    res.json(await brandService.delete(Number(req.params.id)));
  } catch (err) {
    next(err);
  }
});
export default brandRouter;