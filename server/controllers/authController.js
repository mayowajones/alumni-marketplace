import asyncHandler from "express-async-handler";
import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import { demoUsers } from "../data/demoData.js";
import { isDemoMode as isDbDemoMode } from "../config/db.js";

const getDemoUserStore = () => {
  if (!globalThis.__demoUsers) {
    globalThis.__demoUsers = structuredClone(demoUsers);
  }
  return globalThis.__demoUsers;
};

const isDemoMode = () => isDbDemoMode();

// @desc    Register a new member
// @route   POST /api/auth/register
// @access  Public
export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, graduationYear, phone } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Name, email, and password are required");
  }

  if (isDemoMode()) {
    const users = getDemoUserStore();
    const normalizedEmail = String(email).trim().toLowerCase();
    const existing = users.find((user) => user.email.toLowerCase() === normalizedEmail);

    if (existing) {
      res.status(400);
      throw new Error("An account with this email already exists");
    }

    const user = {
      _id: `user-${Date.now()}`,
      name: String(name).trim(),
      email: normalizedEmail,
      password: String(password),
      graduationYear: graduationYear ? Number(graduationYear) : undefined,
      phone: phone || "",
      role: "member",
      isActive: true,
    };

    users.push(user);

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
    return;
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error("An account with this email already exists");
  }

  const user = await User.create({ name, email, password, graduationYear, phone });

  res.status(201).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    token: generateToken(user._id),
  });
});

// @desc    Authenticate member & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error("Email and password are required");
  }

  if (isDemoMode()) {
    const users = getDemoUserStore();
    const user = users.find(
      (member) => member.email.toLowerCase() === String(email).trim().toLowerCase()
    );

    if (user && user.password === String(password)) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
      return;
    }

    res.status(401);
    throw new Error("Invalid email or password");
  }

  const user = await User.findOne({ email }).select("+password");

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error("Invalid email or password");
  }
});

// @desc    Get logged-in user's profile
// @route   GET /api/auth/profile
// @access  Private
export const getProfile = asyncHandler(async (req, res) => {
  res.json(req.user);
});
