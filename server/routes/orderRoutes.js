import express from "express";
import {
  createOrder,
  markOrderPaid,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
} from "../controllers/orderController.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = express.Router();

router.route("/").post(protect, createOrder).get(protect, adminOnly, getAllOrders);
router.get("/mine", protect, getMyOrders);
router.put("/:id/pay", protect, markOrderPaid);
router.put("/:id/status", protect, adminOnly, updateOrderStatus);

export default router;
