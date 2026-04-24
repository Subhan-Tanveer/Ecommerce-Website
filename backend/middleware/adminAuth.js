import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";

const adminAuth = async (req, res, next) => {
  try {
    const { token } = req.headers;
    if (!token) return res.status(401).json({ success: false, message: "Unauthorized!" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (typeof decoded === 'string') {
      // Old admin app token format
      if (decoded !== process.env.ADMIN_EMAIL + process.env.ADMIN_PASSWORD)
        return res.status(401).json({ success: false, message: "Unauthorized!" });
    } else {
      const user = await userModel.findById(decoded.id);
      if (!user || (user.role !== 'admin' && user.role !== 'vendor'))
        return res.status(401).json({ success: false, message: "Unauthorized!" });
      req.user = user; // attach user to request for downstream use
    }
    next();
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export default adminAuth;
