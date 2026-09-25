import express from "express";
import { paystackWebhook } from "../controllers/paymentController.js";

const router = express.Router();

// No `protect` middleware — Paystack calls this directly, server-to-server.
// Trust is established via HMAC signature verification inside the
// controller, not via a session/JWT.
router.post("/", paystackWebhook);

export default router;
