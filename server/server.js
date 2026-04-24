import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./config/mangodb.js";
import connectCloudinary from "./config/cloudinary.js";
import userRouter from "./routes/userRoutes.js";
import productRouter from "./routes/productRoute.js";
import cartRouter from "./routes/cartRoute.js";
import orderRouter from "./routes/orderRoute.js";
import contactRouter from "./routes/contactRoute.js";
import reviewRouter from "./routes/reviewRoute.js";
import couponRouter from "./routes/couponRoute.js";

// App Config
const app = express();
const port = process.env.PORT || 5000;

connectDB();
connectCloudinary();

// Middleware configuration
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Api Endpoints
app.use("/api/user", userRouter);
app.use("/api/product", productRouter);
app.use("/api/cart", cartRouter);
app.use("/api/order", orderRouter);
app.use("/api/contact", contactRouter);
app.use("/api/review", reviewRouter);
app.use("/api/coupon", couponRouter);

app.get("/", (req, res) => {
  res.send("API Working");
});

// Global error handler
app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({
    success: false,
    message: error.message || "Internal Server Error",
  });
});

app.listen(port, () => console.log("Server Started on PORT :" + port));