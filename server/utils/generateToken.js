import jwt from "jsonwebtoken";

const getJwtSecret = () => process.env.JWT_SECRET || "demo-marketplace-secret";

// Keep token creation in one place so the payload shape never drifts
// between login, register, and refresh flows.
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, getJwtSecret(), {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

export default generateToken;
