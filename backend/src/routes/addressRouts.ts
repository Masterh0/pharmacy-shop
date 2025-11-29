import { Router } from "express";
import { AddressController } from "../controllers/addressController";
import { verifyAccessToken  } from "../middlewares/auth";

const router = Router();
const controller = new AddressController();
router.use((req, res, next) => {
  console.log("➡️ [addressRoutes] Middleware called.");
  console.log("🍪 req.cookies:", req.cookies);
  next();
});
router.use(verifyAccessToken );

router.post("/", controller.create.bind(controller));
router.get("/", controller.list.bind(controller));
router.get("/:id", controller.get.bind(controller));
router.put("/:id", controller.update.bind(controller));
router.delete("/:id", controller.delete.bind(controller));
router.put("/:id/default", controller.setDefault.bind(controller));

export default router;
