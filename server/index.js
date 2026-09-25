import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import connectDB, { isDatabaseConnected } from "./config/db.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";
import User from "./models/User.js";
import Category from "./models/Category.js";
import Product from "./models/Product.js";

import authRoutes from "./routes/authRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import webhookRoutes from "./routes/webhookRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
const dbConnected = await connectDB();

const app = express();
app.locals.isDemoMode = !process.env.MONGO_URI || !dbConnected || !isDatabaseConnected();

const ensureStarterData = async () => {
  if (!dbConnected) return;

  try {
    const adminExists = await User.findOne({ role: "admin" });
    if (!adminExists) {
      await User.create({
        name: "Alumni Association Admin",
        email: "admin@commandojo98.org",
        password: "ChangeMe123!",
        role: "admin",
      });
      console.log("Default admin account created: admin@commandojo98.org / ChangeMe123!");
    }

    const categoryCount = await Category.countDocuments();
    if (categoryCount === 0) {
      await Category.insertMany([
        { name: "Cars", slug: "cars", attributeSchema: ["make", "model", "year", "mileage"] },
        { name: "Trucks", slug: "trucks", attributeSchema: ["make", "model", "year", "payload"] },
        { name: "Electronics", slug: "electronics", attributeSchema: ["brand", "condition"] },
        { name: "Wears", slug: "wears", attributeSchema: ["type", "size", "color"] },
      ]);
      console.log("Starter categories seeded for Mongo-backed marketplace.");
    }

    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      const admin = await User.findOne({ role: "admin" });
      const categories = await Category.find();
      const catMap = Object.fromEntries(categories.map((cat) => [cat.slug, cat._id]));

      await Product.insertMany([
        {
          title: "2021 Toyota Corolla",
          description: "Reliable family sedan with an excellent service record.",
          price: 8500000,
          category: catMap.cars,
          attributes: { make: "Toyota", model: "Corolla", year: "2021", mileage: "18,000 km" },
          images: ["https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=900&q=80"],
          stockQuantity: 2,
          memberName: "Daniel Okafor",
          memberContact: "daniel@example.com",
          createdBy: admin._id,
          status: "published",
          isFeatured: true,
        },
        {
          title: "2023 Ford Ranger XLT",
          description: "Strong pickup truck with premium finish and dependable power.",
          price: 19500000,
          category: catMap.trucks,
          attributes: { make: "Ford", model: "Ranger XLT", year: "2023", payload: "1,200 kg" },
          images: ["https://images.unsplash.com/photo-1641974785913-63645632afe3?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8MjAyMyUyMEZvcmQlMjBSYW5nZXIlMjBYTHxlbnwwfHwwfHx8MA%3D%3D"],
          stockQuantity: 1,
          memberName: "Chima Nwosu",
          memberContact: "chima@example.com",
          createdBy: admin._id,
          status: "published",
          isFeatured: true,
        },
      ]);
      console.log("Starter product listings seeded.");
    }
  } catch (error) {
    console.error("Starter data initialization failed:", error.message);
  }
};

await ensureStarterData();

// --- Global middleware ---
app.use(cors({ origin: process.env.CLIENT_URL || "*", credentials: true }));

// IMPORTANT: the Paystack webhook must be mounted BEFORE express.json().
// Signature verification needs the exact raw request bytes — once
// express.json() parses the body into an object, that raw byte sequence
// is gone and the HMAC check will never match.
app.use("/api/payments/webhook", express.raw({ type: "application/json" }), webhookRoutes);

app.use(express.json({ limit: "10mb" })); // parses JSON bodies for everything else
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV !== "production" && process.env.SHOW_HTTP_LOGS === "true") {
  app.use(morgan("dev")); // optional request logging in dev
}

// Serve uploaded product images as static files (e.g. /uploads/images-123.jpg)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// --- Health check ---
app.get("/api/health", (req, res) => res.json({ status: "ok" }));

const PORT = Number(process.env.PORT || 5000);
const BACKEND_URL = process.env.BACKEND_URL || `http://localhost:${PORT}`;

// --- Routes ---
app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/payments", paymentRoutes);

// --- Backend root route (must be before 404 handler) ---
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Alumni Marketplace API is running successfully",
    status: "OK",
    backendURL: BACKEND_URL,
    healthCheck: `${BACKEND_URL}/api/health`,
    apiBase: `${BACKEND_URL}/api`,
    adminCredentials: {
      email: "Dottman4real@gmail.com",
      password: "presido1998",
    },
  });
});

// --- Error handling (must be last) ---
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`);
  console.log(`Browser URL: ${BACKEND_URL}`);
  console.log(`Health check: ${BACKEND_URL}/api/health`);
});
