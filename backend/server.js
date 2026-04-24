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
connectDB().then(() => seedAdmin());
connectCloudinary();

// INFO: Middleware
app.use(express.json());
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin) res.header('Access-Control-Allow-Origin', origin);
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, token');
  res.header('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});
app.use(cors({ origin: true, credentials: true }));

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
