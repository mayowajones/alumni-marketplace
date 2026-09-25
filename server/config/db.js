import mongoose from "mongoose";

const getMongoUri = () => process.env.MONGO_URI || "mongodb://127.0.0.1:27017/alumni_marketplace";

export const isDatabaseConnected = () => mongoose.connection.readyState === 1;

export const isDemoMode = () => !process.env.MONGO_URI || !isDatabaseConnected();

// Run in demo mode only when the database is unavailable, so local Mongo works
// without extra configuration and the storefront still keeps a safe fallback.
const connectDB = async () => {
  const mongoUri = getMongoUri();

  if (!process.env.MONGO_URI) {
    console.log("MONGO_URI not set. Trying the default local MongoDB connection at mongodb://127.0.0.1:27017/alumni_marketplace");
  }

  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
    return true;
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    console.log("Continuing in demo mode because no live database is available.");
    return false;
  }
};

export default connectDB;
