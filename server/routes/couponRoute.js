import express from "express";
import { createCoupon, getCoupons, deleteCoupon } from "../controllers/couponController.js";
import adminAuth from "../middleware/adminAuth.js";

const couponRouter = express.Router();

couponRouter.post("/create", adminAuth, createCoupon);
couponRouter.get("/list", getCoupons);
couponRouter.delete("/delete/:id", adminAuth, deleteCoupon);

export default couponRouter;