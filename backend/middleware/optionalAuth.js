import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";

// Like adminAuth but doesn't block — just attaches user to req if token is valid
const optionalAuth = async (req, res, next) => {
  try {
    const { token } = req.headers;
    if (!token) return next(); // no token = guest, continue

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (typeof decoded !== 'string' && decoded.id) {
      const user = await userModel.findById(decoded.id);
      if (user) req.user = user;
    }
    next();
  } catch {
    next(); // invalid token = treat as guest
  }
};

export default optionalAuth;
