import asyncHandler from "express-async-handler";
import Order from "../models/Order.js";
import Product from "../models/Product.js";

// @desc    Create a new order from the buyer's cart
// @route   POST /api/orders
// @access  Private
export const createOrder = asyncHandler(async (req, res) => {
  const { items, shippingAddress, paymentMethod } = req.body;

  if (!items || items.length === 0) {
    res.status(400);
    throw new Error("No order items provided");
  }

  // Re-verify price and stock server-side — never trust the cart total
  // sent from the client, it can be tampered with in devtools.
  let itemsTotal = 0;
  const verifiedItems = [];

  for (const item of items) {
    const product = await Product.findById(item.product);
    if (!product || product.status !== "published") {
      res.status(400);
      throw new Error(`Product unavailable: ${item.product}`);
    }
    if (product.stockQuantity < item.quantity) {
      res.status(400);
      throw new Error(`Insufficient stock for ${product.title}`);
    }

    itemsTotal += product.price * item.quantity;
    verifiedItems.push({
      product: product._id,
      title: product.title,
      quantity: item.quantity,
      price: product.price,
    });
  }

  const order = await Order.create({
    buyer: req.user._id,
    items: verifiedItems,
    shippingAddress,
    itemsTotal,
    paymentMethod,
  });

  // Decrement stock now that the order is placed
  for (const item of verifiedItems) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stockQuantity: -item.quantity },
    });
  }

  res.status(201).json(order);
});

// @desc    Mark an order as paid (called after payment gateway confirms)
// @route   PUT /api/orders/:id/pay
// @access  Private
export const markOrderPaid = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  order.isPaid = true;
  order.paidAt = Date.now();
  order.paymentReference = req.body.paymentReference;
  const updated = await order.save();

  res.json(updated);
});

// @desc    Get logged-in user's own orders
// @route   GET /api/orders/mine
// @access  Private
export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ buyer: req.user._id }).sort({ createdAt: -1 });
  res.json(orders);
});

// @desc    Get all orders (admin)
// @route   GET /api/orders
// @access  Private/Admin
export const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find().populate("buyer", "name email").sort({ createdAt: -1 });
  res.json(orders);
});

// @desc    Update order fulfillment status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }
  order.orderStatus = req.body.orderStatus;
  const updated = await order.save();
  res.json(updated);
});
