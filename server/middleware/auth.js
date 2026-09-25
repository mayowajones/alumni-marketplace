import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import User from "../models/User.js";

const getJwtSecret = () => process.env.JWT_SECRET || "demo-marketplace-secret";

// Verifies the Bearer token and attaches the requesting user to req.user.
export const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, getJwtSecret());

      if (process.env.MONGO_URI) {
        req.user = await User.findById(decoded.id).select("-password");

        if (!req.user || !req.user.isActive) {
          res.status(401);
          throw new Error("Not authorized — account not found or disabled");
        }
        return next();
      }

      const demoUser = {
        _id: decoded.id,
        name: decoded.id.startsWith("demo-admin") ? "Demo Admin" : "Demo User",
        email: decoded.id.startsWith("demo-admin") ? "admin@demo.com" : "member@demo.com",
        role: decoded.id.startsWith("demo-admin") ? "admin" : "member",
        isActive: true,
      };

      req.user = demoUser;
      return next();
    } catch (error) {
      res.status(401);
      throw new Error("Not authorized — invalid or expired token");
    }
  }

  res.status(401);
  throw new Error("Not authorized — no token provided");
});

// Restricts a route to admins only. Must run after `protect`.
export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    return next();
  }
  res.status(403);
  throw new Error("Access denied — admin privileges required");
};
