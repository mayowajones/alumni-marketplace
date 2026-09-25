import express from "express";
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  publishProduct,
  deleteProduct,
  getAllProductsForAdmin,
} from "../controllers/productController.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = express.Router();

// IMPORTANT: this specific route must be declared BEFORE "/:id",
// otherwise Express matches "admin" as an :id param.
router.get("/admin/all", protect, adminOnly, getAllProductsForAdmin);

router.route("/").get(getProducts).post(protect, createProduct);

router
  .route("/:id")
  .get(getProductById)
  .put(protect, updateProduct)
  .delete(protect, deleteProduct);

router.patch("/:id/publish", protect, adminOnly, publishProduct);

export default router;
