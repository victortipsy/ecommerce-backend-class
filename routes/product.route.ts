import { Router } from "express";
import {
  createProduct,
  getAllProduct,
} from "../controllers/product.controller";
import { userAuth } from "../middlewares/authorization/user.auth";
import { productValidation } from "../middlewares/validation/productValidation/productValidation";

const router = Router();

router.route("/").get(userAuth, getAllProduct);
router.route("/create").post(productValidation, createProduct);

export default router;
