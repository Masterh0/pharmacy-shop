import { Router } from "express";
import * as variantController from "../controllers/variantController";

const router = Router();

router.get("/", variantController.getAll);
router.get("/:id", variantController.getById);
router.post("/", variantController.create);
router.put("/:id", variantController.update);
router.delete("/:id", variantController.remove);

export default router;
