import express from "express";
import {
  addReview,
  getProductReviews,
  deleteReview,
  canReviewProduct,
  canReviewOrderItem,
  getAllReviews,
  adminDeleteReview,
  updateReviewStatus,
} from "../controllers/reviewController.js";
import authUser from "../middleware/auth.js";
import adminAuth from "../middleware/adminAuth.js";

const reviewRouter = express.Router();

reviewRouter.post("/add", authUser, addReview);
reviewRouter.get("/product/:productId", getProductReviews);
reviewRouter.get("/can-review/:productId", authUser, canReviewProduct);
reviewRouter.get("/can-review-order-item/:productId", authUser, canReviewOrderItem);
reviewRouter.delete("/delete/:id", authUser, deleteReview);

// admin
reviewRouter.get("/list", adminAuth, getAllReviews);
reviewRouter.delete("/admin-delete/:id", adminAuth, adminDeleteReview);
reviewRouter.put("/status/:id", adminAuth, updateReviewStatus);

export default reviewRouter;