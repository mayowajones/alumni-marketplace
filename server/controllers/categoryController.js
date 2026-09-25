import asyncHandler from "express-async-handler";
import Category from "../models/Category.js";
import { demoCategories } from "../data/demoData.js";
import { isDemoMode as isDbDemoMode } from "../config/db.js";

const getDemoCategoryStore = () => {
  if (!globalThis.__demoCategories) {
    globalThis.__demoCategories = structuredClone(demoCategories);
  }
  return globalThis.__demoCategories;
};

const isDemoMode = () => isDbDemoMode();

// @desc    List all categories
// @route   GET /api/categories
// @access  Public
export const getCategories = asyncHandler(async (req, res) => {
  if (isDemoMode()) {
    res.json(getDemoCategoryStore());
    return;
  }

  const categories = await Category.find().sort("name");
  res.json(categories);
});

// @desc    Create a category (e.g. Cars, Clothing, Electronics)
// @route   POST /api/categories
// @access  Private/Admin
export const createCategory = asyncHandler(async (req, res) => {
  const { name, attributeSchema } = req.body;

  if (!name) {
    res.status(400);
    throw new Error("Category name is required");
  }

  if (isDemoMode()) {
    const category = {
      _id: `cat-${Date.now()}`,
      name: String(name).trim(),
      slug: String(name).trim().toLowerCase().replace(/\s+/g, "-"),
      attributeSchema: Array.isArray(attributeSchema) ? attributeSchema : [],
    };

    getDemoCategoryStore().push(category);
    res.status(201).json(category);
    return;
  }

  const slug = name.toLowerCase().trim().replace(/\s+/g, "-");

  const category = await Category.create({ name, slug, attributeSchema });
  res.status(201).json(category);
});

// @desc    Delete a category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
export const deleteCategory = asyncHandler(async (req, res) => {
  if (isDemoMode()) {
    const categories = getDemoCategoryStore();
    const index = categories.findIndex((category) => category._id === req.params.id);

    if (index === -1) {
      res.status(404);
      throw new Error("Category not found");
    }

    categories.splice(index, 1);
    res.json({ message: "Category removed" });
    return;
  }

  const category = await Category.findById(req.params.id);
  if (!category) {
    res.status(404);
    throw new Error("Category not found");
  }
  await category.deleteOne();
  res.json({ message: "Category removed" });
});
