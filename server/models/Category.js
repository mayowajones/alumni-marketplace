import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    // Free-form attribute keys expected for products in this category
    // e.g. Cars -> ["make","model","year","mileage"], Clothing -> ["size","color","material"]
    attributeSchema: { type: [String], default: [] },
  },
  { timestamps: true }
);

const Category = mongoose.model("Category", categorySchema);
export default Category;
