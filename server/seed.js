// Run once with: node seed.js
// Creates the initial admin account and starter categories so the
// dashboard isn't empty on first login.
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import User from "./models/User.js";
import Category from "./models/Category.js";
import Product from "./models/Product.js";

dotenv.config();

// Deterministic placeholder photo per product — same seed string always
// returns the same image, so re-running this script gives stable results.
const img = (seed) => `https://picsum.photos/seed/${seed}/600/600`;

const run = async () => {
  await connectDB();

  let admin = await User.findOne({ role: "admin" });
  if (!admin) {
    admin = await User.create({
      name: "Alumni Association Admin",
      email: "admin@commandojo98.org",
      password: "ChangeMe123!", // hashed automatically — change on first login
      role: "admin",
    });
    console.log("Admin user created: admin@commandojo98.org / ChangeMe123!");
  }

  // The full category list the storefront needs. attributeSchema drives the
  // extra fields shown dynamically in ProductForm.jsx for that category.
  const starterCategories = [
    { name: "Electronics", slug: "electronics", attributeSchema: ["brand", "condition"] },
    { name: "Cars", slug: "cars", attributeSchema: ["make", "model", "year", "mileage"] },
    { name: "Watches", slug: "watches", attributeSchema: ["brand", "model", "condition"] },
    { name: "Food", slug: "food", attributeSchema: ["brand", "weight"] },
    { name: "Cosmetics", slug: "cosmetics", attributeSchema: ["brand", "skinType", "volume"] },
    { name: "Groceries", slug: "groceries", attributeSchema: ["brand", "unit"] },
    { name: "Drinks", slug: "drinks", attributeSchema: ["brand", "volume"] },
    { name: "Toys", slug: "toys", attributeSchema: ["brand", "ageRange"] },
    // One flexible "Wears" category covers shirts/trousers/shoes via the
    // "type" attribute, rather than three near-duplicate categories.
    { name: "Wears", slug: "wears", attributeSchema: ["type", "size", "color"] },
  ];

  const categoryDocs = {};
  for (const cat of starterCategories) {
    const doc = await Category.findOneAndUpdate({ slug: cat.slug }, cat, {
      upsert: true,
      new: true,
    });
    categoryDocs[cat.slug] = doc;
  }
  console.log(`Categories seeded (${starterCategories.length})`);

  // Sample published products — several per category, a couple deliberately
  // out of stock so you can see that state render correctly end-to-end.
  const starterProducts = [
    // Electronics
    { title: "Voltek 55\" 4K Smart TV", description: "Crisp 4K display with built-in streaming apps.", price: 350000, categorySlug: "electronics", attributes: { brand: "Voltek", condition: "New" }, stockQuantity: 5, imgSeed: "elec-tv" },
    { title: "NovaTech Laptop 8GB/512GB SSD", description: "Fast everyday laptop, great for students and remote work.", price: 280000, categorySlug: "electronics", attributes: { brand: "NovaTech", condition: "Used" }, stockQuantity: 0, imgSeed: "elec-laptop" },
    { title: "ClearView Smartphone 128GB", description: "128GB storage, dual camera, all-day battery.", price: 190000, categorySlug: "electronics", attributes: { brand: "ClearView", condition: "Used" }, stockQuantity: 3, imgSeed: "elec-phone" },

    // Cars
    { title: "2018 Toyota Corolla", description: "Well maintained, single owner, full service history.", price: 6500000, categorySlug: "cars", attributes: { make: "Toyota", model: "Corolla", year: "2018", mileage: "45,000 km" }, stockQuantity: 1, imageUrl: "https://images.unsplash.com/photo-1638618164682-12b986ec2a75?auto=format&fit=crop&w=900&q=80" },
    { title: "Toyota Sedan", description: "Toyota vehicle listing with a clean exterior and comfortable cabin.", price: 9200000, categorySlug: "cars", attributes: { make: "Toyota", model: "Sedan", year: "2022", mileage: "22,000 km" }, stockQuantity: 1, imageUrl: "https://images.unsplash.com/photo-1613859492095-85d9944f09f6?auto=format&fit=crop&w=900&q=80" },
    { title: "Toyota Car Listing", description: "Toyota vehicle available to browse and purchase through the marketplace.", price: 7800000, categorySlug: "cars", attributes: { make: "Toyota", model: "Passenger car", year: "2020", mileage: "31,000 km" }, stockQuantity: 1, imageUrl: "https://images.unsplash.com/photo-1631858109510-685566373403?auto=format&fit=crop&w=900&q=80" },
    { title: "2015 Honda Accord", description: "Reliable family sedan, recently serviced.", price: 4200000, categorySlug: "cars", attributes: { make: "Honda", model: "Accord", year: "2015", mileage: "80,000 km" }, stockQuantity: 0, imgSeed: "car-accord" },

    // Food
    { title: "5kg Bag of Rice", description: "Premium long-grain parboiled rice.", price: 6500, categorySlug: "food", attributes: { brand: "Golden Fields", weight: "5kg" }, stockQuantity: 40, imgSeed: "food-rice" },
    { title: "Carton of Instant Noodles (40 packs)", description: "Quick and easy family meal pack.", price: 4200, categorySlug: "food", attributes: { brand: "QuickChop", weight: "40 packs" }, stockQuantity: 20, imgSeed: "food-noodles" },

    // Cosmetics
    { title: "Shea Butter Body Cream 500ml", description: "Deep moisturizing cream for all skin types.", price: 3500, categorySlug: "cosmetics", attributes: { brand: "PureGlow", skinType: "All", volume: "500ml" }, stockQuantity: 15, imgSeed: "cos-cream" },
    { title: "Vitamin C Facial Serum 30ml", description: "Brightening serum for daily use.", price: 6000, categorySlug: "cosmetics", attributes: { brand: "PureGlow", skinType: "All", volume: "30ml" }, stockQuantity: 0, imgSeed: "cos-serum" },

    // Groceries
    { title: "Vegetable Oil 5L", description: "Pure vegetable cooking oil.", price: 9500, categorySlug: "groceries", attributes: { brand: "FarmPride", unit: "5L" }, stockQuantity: 25, imgSeed: "grocery-oil" },
    { title: "Tomato Paste (24-pack)", description: "Rich concentrated tomato paste, carton of 24 tins.", price: 8800, categorySlug: "groceries", attributes: { brand: "FarmPride", unit: "24 tins" }, stockQuantity: 12, imgSeed: "grocery-tomato" },

    // Drinks
    { title: "Bottled Water (12-pack)", description: "Pure table water, pack of 12 bottles.", price: 1800, categorySlug: "drinks", attributes: { brand: "AquaLife", volume: "12 x 75cl" }, stockQuantity: 50, imgSeed: "drink-water" },
    { title: "Assorted Soft Drinks (Crate)", description: "Crate of 24 assorted soft drink bottles.", price: 5200, categorySlug: "drinks", attributes: { brand: "FizzCo", volume: "24 x 35cl" }, stockQuantity: 18, imgSeed: "drink-soda" },

    // Toys
    { title: "Building Blocks Set (200pcs)", description: "Creative building block set for ages 4+.", price: 7500, categorySlug: "toys", attributes: { brand: "PlayWorks", ageRange: "4+" }, stockQuantity: 10, imgSeed: "toy-blocks" },
    { title: "Remote Control Car", description: "Rechargeable RC car with working headlights.", price: 12000, categorySlug: "toys", attributes: { brand: "PlayWorks", ageRange: "6+" }, stockQuantity: 0, imgSeed: "toy-rccar" },

    // Wears
    { title: "Classic Cotton Shirt", description: "Breathable cotton shirt, smart-casual fit.", price: 8500, categorySlug: "wears", attributes: { type: "Shirt", size: "L", color: "Blue" }, stockQuantity: 20, imgSeed: "wear-shirt" },
    { title: "Slim Fit Trousers", description: "Comfortable stretch-fit trousers for everyday wear.", price: 9500, categorySlug: "wears", attributes: { type: "Trouser", size: "32", color: "Black" }, stockQuantity: 14, imgSeed: "wear-trouser" },
    { title: "Leather Sneakers", description: "Durable leather sneakers with cushioned sole.", price: 15000, categorySlug: "wears", attributes: { type: "Shoe", size: "42", color: "White" }, stockQuantity: 0, imgSeed: "wear-shoe" },
    { title: "Everyday Joggers", description: "Comfortable joggers suited to casual wear and light training.", price: 18000, categorySlug: "wears", attributes: { type: "Joggers", size: "L", color: "Black" }, stockQuantity: 8, imageUrl: "https://images.unsplash.com/photo-1540736103035-48f02f47e90d?auto=format&fit=crop&w=900&q=80" },
    { title: "Premium Joggers", description: "Soft, relaxed-fit joggers for everyday comfort.", price: 22000, categorySlug: "wears", attributes: { type: "Joggers", size: "M", color: "Grey" }, stockQuantity: 5, imageUrl: "https://images.unsplash.com/premium_photo-1673356302169-574db56b52cd?auto=format&fit=crop&w=900&q=80" },
    { title: "Athletic Joggers", description: "Lightweight joggers with an easy fit for active days.", price: 19500, categorySlug: "wears", attributes: { type: "Joggers", size: "XL", color: "Navy" }, stockQuantity: 6, imageUrl: "https://images.unsplash.com/photo-1715890292755-1ad3b05d7770?auto=format&fit=crop&w=900&q=80" },

    // Watches
    { title: "Rolex Wristwatch", description: "Classic wristwatch listing with a polished, timeless design.", price: 1250000, categorySlug: "watches", attributes: { brand: "Rolex", model: "Classic", condition: "Used" }, stockQuantity: 1, imageUrl: "https://images.unsplash.com/photo-1730757679771-b53e798846cf?auto=format&fit=crop&w=900&q=80" },
    { title: "Rolex Dress Watch", description: "Dress watch listing with a refined profile for formal and everyday wear.", price: 1450000, categorySlug: "watches", attributes: { brand: "Rolex", model: "Dress watch", condition: "Used" }, stockQuantity: 1, imageUrl: "https://images.unsplash.com/photo-1788125856699-ddd59e4f24c6?auto=format&fit=crop&w=900&q=80" },
    { title: "Rolex Classic Watch", description: "Classic wristwatch listing with a versatile metal finish.", price: 1380000, categorySlug: "watches", attributes: { brand: "Rolex", model: "Classic", condition: "Used" }, stockQuantity: 1, imageUrl: "https://images.unsplash.com/photo-1636081671112-04a4113ba1fc?auto=format&fit=crop&w=900&q=80" },
  ];

  for (const p of starterProducts) {
    const category = categoryDocs[p.categorySlug];
    await Product.findOneAndUpdate(
      { title: p.title },
      {
        title: p.title,
        description: p.description,
        price: p.price,
        category: category._id,
        attributes: p.attributes,
        images: [p.imageUrl || img(p.imgSeed)],
        stockQuantity: p.stockQuantity,
        memberName: "Alumni Association",
        memberContact: "admin@commandojo98.org",
        createdBy: admin._id,
        status: "published", // must be "published" to appear on the public storefront
        isFeatured: p.stockQuantity > 0 && Math.random() > 0.6,
      },
      { upsert: true, new: true }
    );
  }
  console.log(`Products seeded (${starterProducts.length})`);

  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
