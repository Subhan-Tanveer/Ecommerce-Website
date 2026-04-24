import express from "express";
import {
  loginUser,
  registerUser,
  loginAdmin,
  getAllUsers,
  updateUserAccess,
  getMe,
  updateUserPermissions,
} from "../controllers/userController.js";
import adminAuth from "../middleware/adminAuth.js";

const userRouter = express.Router();

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.post("/admin", loginAdmin);
userRouter.get("/all", adminAuth, getAllUsers);
userRouter.post("/access", adminAuth, updateUserAccess);
userRouter.post("/permissions", adminAuth, updateUserPermissions);
userRouter.get("/me", getMe);

export default userRouter;
