import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    // Flexible key/value bag so a car and a t-shirt can share one schema.
    // e.g. { make: "Toyota", year: "2019" } or { size: "L", color: "Navy" }
    attributes: { type: Map, of: String, default: {} },
    images: {
      type: [String], // URLs (uploaded via /uploads or a CDN)
      validate: [(arr) => arr.length > 0, "At least one image is required"],
    },
    stockQuantity: { type: Number, required: true, min: 0, default: 1 },
    // The alumnus this item belongs to — admin lists it on their behalf.
    memberName: { type: String, required: true },
    memberContact: { type: String, required: true },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Approval pipeline: nothing is publicly visible until "published".
    status: {
      type: String,
      enum: ["draft", "pending", "published", "rejected"],
      default: "draft",
    },
    isFeatured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

productSchema.index({ title: "text", description: "text" });

const Product = mongoose.model("Product", productSchema);
export default Product;
