import asyncHandler from "express-async-handler";
import Product from "../models/Product.js";
import Category from "../models/Category.js";
import { demoCategories, demoProducts, filterDemoProducts, getDemoProductById } from "../data/demoData.js";
import { isDemoMode as isDbDemoMode } from "../config/db.js";

const getDemoProductStore = () => {
  if (!globalThis.__demoProducts) {
    globalThis.__demoProducts = structuredClone(demoProducts);
  }
  return globalThis.__demoProducts;
};

const ensureAuthenticatedUser = (req) => {
  if (!req.user || !["admin", "member"].includes(req.user.role)) {
    throw Object.assign(new Error("Authentication required to manage listings"), {
      statusCode: 401,
    });
  }
};

const ensureAdminOrOwner = (req, product) => {
  if (!req.user) {
    throw Object.assign(new Error("Authentication required to manage listings"), {
      statusCode: 401,
    });
  }

  const isAdmin = req.user.role === "admin";
  const isOwner = product && String(product.createdBy || "") === String(req.user._id || "");

  if (!isAdmin && !isOwner) {
    throw Object.assign(new Error("You are not allowed to edit this listing"), {
      statusCode: 403,
    });
  }
};

const isDemoMode = () => isDbDemoMode();

// @desc    Get published products (public storefront) — supports search,
//          category filter, and pagination so the homepage stays fast.
// @route   GET /api/products?keyword=&category=&page=
// @access  Public
export const getProducts = asyncHandler(async (req, res) => {
  if (isDemoMode()) {
    const keyword = String(req.query.keyword || "");
    const category = String(req.query.category || "");
    const filtered = filterDemoProducts({ keyword, category });

    res.json({
      products: filtered,
      page: 1,
      pages: 1,
      total: filtered.length,
    });
    return;
  }

  const pageSize = 12;
  const page = Number(req.query.page) || 1;

  const filter = { status: "published" };

  if (req.query.keyword) {
    filter.$text = { $search: req.query.keyword };
  }
  if (req.query.category) {
    const categoryValue = String(req.query.category).trim();

    if (categoryValue === "featured") {
      filter.isFeatured = true;
    } else {
      const matchingCategory = await Category.findOne({
        $or: [{ _id: categoryValue }, { slug: categoryValue }],
      }).select("_id");

      if (matchingCategory) {
        filter.category = matchingCategory._id;
      } else {
        filter.category = categoryValue;
      }
    }
  }

  const count = await Product.countDocuments(filter);
  const products = await Product.find(filter)
    .populate("category", "name slug")
    .sort({ isFeatured: -1, createdAt: -1 })
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.json({ products, page, pages: Math.ceil(count / pageSize), total: count });
});

// @desc    Get a single published product
// @route   GET /api/products/:id
// @access  Public
export const getProductById = asyncHandler(async (req, res) => {
  if (isDemoMode()) {
    const product = getDemoProductById(req.params.id);

    if (!product) {
      res.status(404);
      throw new Error("Product not found");
    }

    res.json(product);
    return;
  }

  const product = await Product.findById(req.params.id).populate("category", "name slug");

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }
  res.json(product);
});

// @desc    Create a product on behalf of a member (starts as "pending")
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = asyncHandler(async (req, res) => {
  ensureAuthenticatedUser(req);

  if (isDemoMode()) {
    const {
      title,
      description,
      price,
      category,
      attributes,
      images,
      stockQuantity,
      memberName,
      memberContact,
      isFeatured,
    } = req.body;
    const product = {
      _id: `prod-${Date.now()}`,
      title,
      description,
      price: Number(price),
      category: demoCategories.find((cat) => cat._id === category) || demoCategories[0],
      attributes: attributes || {},
      images: Array.isArray(images) && images.length ? images : ["https://picsum.photos/seed/demo/600/600"],
      stockQuantity: Number(stockQuantity) || 1,
      memberName: memberName || "Demo Seller",
      memberContact: memberContact || "demo@example.com",
      status: "published",
      isFeatured: Boolean(isFeatured),
    };

    getDemoProductStore().unshift(product);
    res.status(201).json(product);
    return;
  }

  const {
    title,
    description,
    price,
    category,
    attributes,
    images,
    stockQuantity,
    memberName,
    memberContact,
    isFeatured,
  } = req.body;

  const product = await Product.create({
    title,
    description,
    price,
    category,
    attributes,
    images,
    stockQuantity,
    memberName,
    memberContact,
    createdBy: req.user._id,
    status: "pending",
    isFeatured: Boolean(isFeatured),
  });

  res.status(201).json(product);
});

// @desc    Update a product (fields + status transitions)
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = asyncHandler(async (req, res) => {
  ensureAuthenticatedUser(req);

  if (isDemoMode()) {
    const products = getDemoProductStore();
    const index = products.findIndex((product) => product._id === req.params.id);

    if (index === -1) {
      res.status(404);
      throw new Error("Product not found");
    }

    ensureAdminOrOwner(req, products[index]);
    products[index] = { ...products[index], ...req.body };
    res.json(products[index]);
    return;
  }

  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  ensureAdminOrOwner(req, product);
  Object.assign(product, {
    ...req.body,
    isFeatured: req.body.isFeatured !== undefined ? Boolean(req.body.isFeatured) : product.isFeatured,
  });
  const updated = await product.save();
  res.json(updated);
});

// @desc    Publish / approve a pending product
// @route   PATCH /api/products/:id/publish
// @access  Private/Admin
export const publishProduct = asyncHandler(async (req, res) => {
  if (!req.user || req.user.role !== "admin") {
    res.status(403);
    throw new Error("Access denied — admin privileges required");
  }

  if (isDemoMode()) {
    const products = getDemoProductStore();
    const product = products.find((item) => item._id === req.params.id);
    if (!product) {
      res.status(404);
      throw new Error("Product not found");
    }
    product.status = "published";
    res.json(product);
    return;
  }

  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }
  product.status = "published";
  await product.save();
  res.json(product);
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = asyncHandler(async (req, res) => {
  ensureAuthenticatedUser(req);

  if (isDemoMode()) {
    const products = getDemoProductStore();
    const index = products.findIndex((product) => product._id === req.params.id);

    if (index === -1) {
      res.status(404);
      throw new Error("Product not found");
    }

    ensureAdminOrOwner(req, products[index]);
    products.splice(index, 1);
    res.json({ message: "Product removed" });
    return;
  }

  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  ensureAdminOrOwner(req, product);
  await product.deleteOne();
  res.json({ message: "Product removed" });
});

// @desc    Admin view of ALL products regardless of status (for the review queue)
// @route   GET /api/products/admin/all
// @access  Private/Admin
export const getAllProductsForAdmin = asyncHandler(async (req, res) => {
  if (!req.user || req.user.role !== "admin") {
    res.status(403);
    throw new Error("Access denied — admin privileges required");
  }

  if (isDemoMode()) {
    res.json(getDemoProductStore());
    return;
  }

  const products = await Product.find()
    .populate("category", "name slug")
    .sort({ createdAt: -1 });
  res.json(products);
});
