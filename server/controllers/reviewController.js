import reviewModel from "../models/reviewModel.js";
import productModel from "../models/productModel.js";
import userModel from "../models/userModel.js";
import orderModel from "../models/orderModel.js";

const updateProductReviewStats = async (productId) => {
  const reviews = await reviewModel.find({
    productId,
    status: "approved",
  });

  const reviewCount = reviews.length;

  const averageRating =
    reviewCount > 0
      ? reviews.reduce((sum, item) => sum + item.rating, 0) / reviewCount
      : 0;

  await productModel.findByIdAndUpdate(productId, {
    averageRating: Number(averageRating.toFixed(1)),
    reviewCount,
  });
};

const hasDeliveredOrderForProduct = async (userId, productId) => {
  const orders = await orderModel.find({
    userId: String(userId),
    status: "Delivered",
  });

  for (const order of orders) {
    const items = order.items || [];

    const found = items.some((item) => {
      const itemProductId =
        item.productId ||
        item._id ||
        item.id ||
        item.itemId;

      return itemProductId?.toString() === productId.toString();
    });

    if (found) return true;
  }

  return false;
};

const addReview = async (req, res) => {
  try {
    const userId = req.userId;
    const { productId, rating, comment } = req.body;

    if (!productId || !rating || !comment) {
      return res.json({
        success: false,
        message: "Product, rating and comment are required",
      });
    }

    const product = await productModel.findById(productId);
    if (!product) {
      return res.json({
        success: false,
        message: "Product not found",
      });
    }

    const user = await userModel.findById(userId);
    if (!user) {
      return res.json({
        success: false,
        message: "User not found",
      });
    }

    const canReview = await hasDeliveredOrderForProduct(userId, productId);

    if (!canReview) {
      return res.json({
        success: false,
        message:
          "You can review this product only after purchasing it and once it is delivered",
      });
    }

    const existingReview = await reviewModel.findOne({
      productId,
      userId,
    });

    if (existingReview) {
      return res.json({
        success: false,
        message: "You already reviewed this product",
      });
    }

    const review = await reviewModel.create({
      productId,
      userId,
      name: user.name,
      rating,
      comment,
      status: "approved",
    });

    await updateProductReviewStats(productId);

    res.json({
      success: true,
      message: "Review added successfully",
      review,
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await productModel.findById(productId);

    if (!product) {
      return res.json({
        success: false,
        message: "Product not found",
      });
    }

    const reviews = await reviewModel
      .find({ productId, status: "approved" })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      reviews,
      averageRating: product.averageRating || 0,
      reviewCount: product.reviewCount || 0,
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const deleteReview = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    const review = await reviewModel.findById(id);

    if (!review) {
      return res.json({
        success: false,
        message: "Review not found",
      });
    }

    if (review.userId.toString() !== userId.toString()) {
      return res.json({
        success: false,
        message: "You can delete only your own review",
      });
    }

    const productId = review.productId;

    await reviewModel.findByIdAndDelete(id);
    await updateProductReviewStats(productId);

    res.json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const canReviewOrderItem = async (req, res) => {
  try {
    const userId = req.userId;
    const { productId } = req.params;

    if (!userId) {
      return res.json({
        success: false,
        message: "Unauthorized user",
      });
    }

    if (!productId) {
      return res.json({
        success: false,
        message: "Product ID is required",
      });
    }

    const canReview = await hasDeliveredOrderForProduct(userId, productId);

    if (!canReview) {
      return res.json({
        success: true,
        canReview: false,
      });
    }

    const existingReview = await reviewModel.findOne({
      productId,
      userId,
    });

    if (existingReview) {
      return res.json({
        success: true,
        canReview: false,
      });
    }

    return res.json({
      success: true,
      canReview: true,
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const canReviewProduct = async (req, res) => {
  try {
    const userId = req.userId;
    const { productId } = req.params;

    if (!userId) {
      return res.json({
        success: false,
        message: "Unauthorized user",
      });
    }

    const canReview = await hasDeliveredOrderForProduct(userId, productId);

    if (!canReview) {
      return res.json({
        success: true,
        canReview: false,
      });
    }

    const existingReview = await reviewModel.findOne({
      productId,
      userId,
    });

    if (existingReview) {
      return res.json({
        success: true,
        canReview: false,
      });
    }

    res.json({
      success: true,
      canReview: true,
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const getAllReviews = async (req, res) => {
  try {
    const reviews = await reviewModel
      .find({})
      .sort({ createdAt: -1 })
      .populate("productId", "name")
      .populate("userId", "name email");

    res.json({
      success: true,
      reviews,
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const adminDeleteReview = async (req, res) => {
  try {
    const { id } = req.params;

    const review = await reviewModel.findById(id);

    if (!review) {
      return res.json({
        success: false,
        message: "Review not found",
      });
    }

    const productId = review.productId;

    await reviewModel.findByIdAndDelete(id);
    await updateProductReviewStats(productId);

    res.json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const updateReviewStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.json({
        success: false,
        message: "Invalid status value",
      });
    }

    const review = await reviewModel.findById(id);

    if (!review) {
      return res.json({
        success: false,
        message: "Review not found",
      });
    }

    review.status = status;
    await review.save();

    await updateProductReviewStats(review.productId);

    res.json({
      success: true,
      message: "Status updated successfully",
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export {
  addReview,
  getProductReviews,
  deleteReview,
  canReviewProduct,
  getAllReviews,
  adminDeleteReview,
  updateReviewStatus,
  canReviewOrderItem,
};