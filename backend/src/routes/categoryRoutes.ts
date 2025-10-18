import { Router } from "express";
import * as categoryController from "../controllers/categoryController";

const router = Router();
router.get("/search", categoryController.search);
router.get("/", categoryController.getAll);
router.get("/getAllWithChildren", categoryController.getAllWithChildren);
router.get("/:id", categoryController.getById);
router.post("/", categoryController.create);
router.put("/:id", categoryController.update);
router.delete("/:id", categoryController.remove);

export default router;
