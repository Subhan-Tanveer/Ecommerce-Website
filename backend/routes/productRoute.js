import express from "express";
import {
  addProduct,
  listProducts,
  removeProduct,
  getSingleProduct,
  updateProduct,
  toggleProduct,
} from "../controllers/productController.js";
import upload from "../middleware/multer.js";
import adminAuth from "../middleware/adminAuth.js";
import optionalAuth from "../middleware/optionalAuth.js";

const productRouter = express.Router();

productRouter.post(
  "/add",
  adminAuth,
  upload.fields([
    { name: "image1", maxCount: 1 },
    { name: "image2", maxCount: 1 },
    { name: "image3", maxCount: 1 },
    { name: "image4", maxCount: 1 },
    { name: "image5", maxCount: 1 },
    { name: "image6", maxCount: 1 },
  ]),
  addProduct
);
productRouter.post("/remove", adminAuth, removeProduct);
productRouter.post("/single", getSingleProduct);
productRouter.get("/list", optionalAuth, listProducts);
productRouter.post("/update", adminAuth, updateProduct);
productRouter.post("/toggle", adminAuth, toggleProduct);

export default productRouter;
