import express from "express";
import upload from "../middleware/upload.js";
import { uploadImages } from "../controllers/uploadController.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = express.Router();

// "images" must match the FormData field name the client sends.
// Max 5 images per product.
router.post("/", protect, adminOnly, upload.array("images", 5), uploadImages);

export default router;
