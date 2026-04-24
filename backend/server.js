import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./config/mongodb.js";
import connectCloudinary from "./config/cloudinary.js";
import userRouter from "./routes/userRoute.js";
import productRouter from "./routes/productRoute.js";
import cartRouter from "./routes/cartRoute.js";
import orderRouter from "./routes/orderRoute.js";
import categoryRouter from "./routes/categoryRoute.js";
import { seedAdmin } from "./controllers/userController.js";

// INFO: Create express app mern stack
const app = express();
const port = process.env.PORT || 4000;

// INFO: Middleware — CORS must be before everything
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

connectDB().then(() => seedAdmin());
connectCloudinary();

// INFO: API endpoints
app.use("/api/user", userRouter);
app.use("/api/product", productRouter);
app.use('/api/cart',cartRouter)
app.use('/api/order',orderRouter)
app.use('/api/category', categoryRouter)
// INFO: Default route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// INFO: Start server
app.listen(port, () =>
  console.log(`Server is running on at http://localhost:${port}`)
);
