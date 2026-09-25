import asyncHandler from "express-async-handler";
import axios from "axios";
import crypto from "crypto";
import Order from "../models/Order.js";

const PAYSTACK_BASE_URL = "https://api.paystack.co";

const paystackClient = axios.create({
  baseURL: PAYSTACK_BASE_URL,
  headers: {
    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
    "Content-Type": "application/json",
  },
});

// @desc    Initialize a Paystack transaction for an existing order
// @route   POST /api/payments/initialize
// @access  Private
// The client only sends the orderId — the amount is read from the order
// that was already created server-side, so it can't be tampered with.
export const initializePayment = asyncHandler(async (req, res) => {
  const { orderId } = req.body;

  const order = await Order.findById(orderId);
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }
  if (order.buyer.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("You do not own this order");
  }
  if (order.isPaid) {
    res.status(400);
    throw new Error("Order is already paid");
  }

  // Paystack expects amount in kobo (smallest currency unit) — multiply by 100.
  const { data } = await paystackClient.post("/transaction/initialize", {
    email: req.user.email,
    amount: Math.round(order.itemsTotal * 100),
    reference: `order_${order._id}_${Date.now()}`,
    callback_url: `${process.env.CLIENT_URL}/payment/verify`,
    metadata: { orderId: order._id.toString() },
  });

  // Persist the reference now so we can match it up on verification.
  order.paymentReference = data.data.reference;
  await order.save();

  res.json({
    authorizationUrl: data.data.authorization_url,
    reference: data.data.reference,
  });
});

// @desc    Verify a Paystack transaction after redirect back from checkout
// @route   GET /api/payments/verify/:reference
// @access  Private
export const verifyPayment = asyncHandler(async (req, res) => {
  const { reference } = req.params;

  const { data } = await paystackClient.get(`/transaction/verify/${reference}`);

  if (data.data.status !== "success") {
    res.status(400);
    throw new Error("Payment was not successful");
  }

  const order = await Order.findOne({ paymentReference: reference });
  if (!order) {
    res.status(404);
    throw new Error("Order matching this payment was not found");
  }

  // Re-check the amount actually paid matches what we expected — never
  // trust the redirect alone, always verify server-side against Paystack.
  const expectedKobo = Math.round(order.itemsTotal * 100);
  if (data.data.amount !== expectedKobo) {
    res.status(400);
    throw new Error("Payment amount mismatch — flagged for manual review");
  }

  order.isPaid = true;
  order.paidAt = new Date();
  await order.save();

  res.json({ message: "Payment verified", order });
});

// @desc    Receive Paystack webhook events (server-to-server, no user session)
// @route   POST /api/payments/webhook
// @access  Public — but cryptographically verified via the signature header
// This is the reliable path: it fires even if the buyer closes their browser
// tab before the redirect-based /verify flow ever runs.
export const paystackWebhook = asyncHandler(async (req, res) => {
  // req.body is a raw Buffer here — this route is mounted with express.raw()
  // in index.js specifically so we can hash the exact bytes Paystack sent.
  const signature = req.headers["x-paystack-signature"];
  const expectedHash = crypto
    .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY)
    .update(req.body)
    .digest("hex");

  if (signature !== expectedHash) {
    // Someone hitting this endpoint without a valid Paystack signature —
    // ignore silently, don't leak info about why it failed.
    return res.sendStatus(401);
  }

  const event = JSON.parse(req.body.toString());

  if (event.event === "charge.success") {
    const { reference, amount } = event.data;

    const order = await Order.findOne({ paymentReference: reference });
    if (order && !order.isPaid) {
      const expectedKobo = Math.round(order.itemsTotal * 100);
      if (amount === expectedKobo) {
        order.isPaid = true;
        order.paidAt = new Date();
        await order.save();
      }
      // Amount mismatch: intentionally left unpaid for manual review rather
      // than silently trusting a webhook payload.
    }
  }

  // Always acknowledge receipt quickly — Paystack retries if you don't 200.
  res.sendStatus(200);
});
