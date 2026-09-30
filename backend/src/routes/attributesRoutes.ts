import { Router } from "express";
import { attributeController } from "../controllers/attribiuteController";

const router = Router();

// لیست ویژگی‌های واریانت
router.get("/variation", attributeController.getVariationAttributes);
router.get("/product", attributeController.getProductAttributes);
// Attribute
router.get("/", attributeController.getAttributes);
router.get("/:id", attributeController.getAttributeById);
router.post("/", attributeController.createAttribute);
router.patch("/:id", attributeController.updateAttribute);
router.delete("/:id", attributeController.deleteAttribute);

// Attribute Values
router.get("/:id/values", attributeController.getAttributeValues);
router.post("/:id/values", attributeController.createAttributeValue);

router.patch("/values/:id", attributeController.updateAttributeValue);
router.delete("/values/:id", attributeController.deleteAttributeValue);

export default router;
