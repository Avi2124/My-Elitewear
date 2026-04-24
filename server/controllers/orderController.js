import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import Stripe from "stripe";
import razorpay from "razorpay";
import couponModel from "../models/couponModel.js";

// Global variables
const currency = "inr";
const deliveryCharge = 10;

// Gateway Initialize
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const razorpayInstance = new razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Placing Order using COD Method
const placeOrder = async (req, res) => {
  try {
    const userId = req.userId;
    const { items, amount, address } = req.body;

    if (!userId) {
      return res.json({
        success: false,
        message: "Unauthorized user",
      });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.json({
        success: false,
        message: "Order items are required",
      });
    }

    if (!amount || !address) {
      return res.json({
        success: false,
        message: "Amount and address are required",
      });
    }

    const orderData = {
      userId,
      items,
      amount,
      paymentMethod: "COD",
      payment: false,
      status: "Pending",
      date: Date.now(),
      address,
    };

    const newOrder = new orderModel(orderData);
    await newOrder.save();

    await userModel.findByIdAndUpdate(userId, { cartData: {} });

    res.json({
      success: true,
      message: "Order placed successfully",
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Placing Order using Stripe Method
const placeOrderStripe = async (req, res) => {
  try {
    const userId = req.userId;
    const { items, amount, address } = req.body;
    const origin = req.headers.origin || process.env.FRONTEND_URL;

    if (!userId) {
      return res.json({
        success: false,
        message: "Unauthorized user",
      });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.json({
        success: false,
        message: "Order items are required",
      });
    }

    if (!amount || !address) {
      return res.json({
        success: false,
        message: "Amount and address are required",
      });
    }

    const orderData = {
      userId,
      items,
      amount,
      paymentMethod: "Stripe",
      payment: false,
      date: Date.now(),
      address,
    };

    const newOrder = new orderModel(orderData);
    await newOrder.save();

    const line_items = [
  {
    price_data: {
      currency,
      product_data: {
        name: "Order Payment",
      },
      unit_amount: amount * 100, // ✅ FULL DYNAMIC FINAL AMOUNT
    },
    quantity: 1,
  },
];

    // line_items.push({
    //   price_data: {
    //     currency,
    //     product_data: {
    //       name: "Delivery Charges",
    //     },
    //     unit_amount: deliveryCharge * 100,
    //   },
    //   quantity: 1,
    // });

    const session = await stripe.checkout.sessions.create({
      success_url: `${origin}/verify?success=true&orderId=${newOrder._id}`,
      cancel_url: `${origin}/verify?success=false&orderId=${newOrder._id}`,
      line_items,
      mode: "payment",
    });

    res.json({
      success: true,
      session_url: session.url,
      message: "Order placed successfully",
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Verify Stripe
const verifyStripe = async (req, res) => {
  try {
    const userId = req.userId;
    const { orderId, success } = req.body;

    if (!userId) {
      return res.json({
        success: false,
        message: "Unauthorized user",
      });
    }

    if (!orderId) {
      return res.json({
        success: false,
        message: "Order ID is required",
      });
    }

    if (success === "true") {
      const updatedOrder = await orderModel.findOneAndUpdate(
        { _id: orderId, userId },
        { payment: true },
        { new: true }
      );

      if (!updatedOrder) {
        return res.json({
          success: false,
          message: "Order not found",
        });
      }

      await userModel.findByIdAndUpdate(userId, { cartData: {} });

      return res.json({
        success: true,
        message: "Payment verified successfully",
      });
    } else {
      const deletedOrder = await orderModel.findOneAndDelete({
        _id: orderId,
        userId,
      });

      if (!deletedOrder) {
        return res.json({
          success: false,
          message: "Order not found",
        });
      }

      return res.json({
        success: false,
        message: "Payment cancelled",
      });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Placing Order using Razorpay Method
const placeOrderRazorpay = async (req, res) => {
  try {
    const userId = req.userId;
    const { items, amount, address } = req.body;

    if (!userId) {
      return res.json({
        success: false,
        message: "Unauthorized user",
      });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.json({
        success: false,
        message: "Order items are required",
      });
    }

    if (!amount || !address) {
      return res.json({
        success: false,
        message: "Amount and address are required",
      });
    }

    const orderData = {
      userId,
      items,
      amount,
      paymentMethod: "Razorpay",
      payment: false,
      date: Date.now(),
      address,
    };

    const newOrder = new orderModel(orderData);
    await newOrder.save();

    const options = {
      amount: amount * 100,
      currency: currency.toUpperCase(),
      receipt: newOrder._id.toString(),
    };

    const order = await razorpayInstance.orders.create(options);

    res.json({
      success: true,
      order,
      message: "Razorpay order created successfully",
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const verifyRazorpay = async (req, res) => {
  try {
    const userId = req.userId;
    const { razorpay_order_id } = req.body;

    if (!userId) {
      return res.json({
        success: false,
        message: "Unauthorized user",
      });
    }

    if (!razorpay_order_id) {
      return res.json({
        success: false,
        message: "Razorpay order ID is required",
      });
    }

    const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id);

    if (orderInfo.status === "paid") {
      const updatedOrder = await orderModel.findOneAndUpdate(
        { _id: orderInfo.receipt, userId },
        { payment: true },
        { new: true }
      );

      if (!updatedOrder) {
        return res.json({
          success: false,
          message: "Order not found",
        });
      }

      await userModel.findByIdAndUpdate(userId, { cartData: {} });

      return res.json({
        success: true,
        message: "Payment successful",
      });
    } else {
      return res.json({
        success: false,
        message: "Payment failed",
      });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// All Orders Data for Admin Panel
const allOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({}).sort({ date: -1 });
    res.json({ success: true, orders });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// User Orders Data for Frontend
const usersOrders = async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.json({
        success: false,
        message: "Unauthorized user",
      });
    }

    const orders = await orderModel.find({ userId }).sort({ date: -1 });

    res.json({
      success: true,
      orders,
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const updateStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;

    if (!orderId || !status) {
      return res.json({
        success: false,
        message: "Order ID and status are required",
      });
    }

    // ✅ FETCH ORDER FIRST
    const order = await orderModel.findById(orderId);

    if (!order) {
      return res.json({
        success: false,
        message: "Order not found",
      });
    }

    let paymentStatus = order.payment; // existing value

    // ✅ COD logic
    if (order.paymentMethod === "COD" && status === "Delivered") {
      paymentStatus = true;
    }

    await orderModel.findByIdAndUpdate(orderId, {
      status,
      payment: paymentStatus,
    });

    res.json({
      success: true,
      message: "Order status updated",
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const applyCoupon = async (req, res) => {
  try {
    const userId = req.userId;
    const { code, amount } = req.body;

    const coupon = await couponModel.findOne({
      code: code.toUpperCase().trim(),
    });

    if (!coupon) return res.json({ success: false, message: "Invalid Coupon" });

    if (coupon.expiryDate < new Date())
      return res.json({ success: false, message: "Expired" });

    if (coupon.usedBy.includes(userId))
      return res.json({ success: false, message: "Already used" });

    if (amount < coupon.minOrderAmount)
      return res.json({ success: false, message: "Minimum amount not met" });

    let discount =
      coupon.discountType === "percentage"
        ? (amount * coupon.discountValue) / 100
        : coupon.discountValue;

    const finalAmount = amount - discount;

    res.json({ success: true, discount, finalAmount });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};

export {
  placeOrder,
  placeOrderStripe,
  placeOrderRazorpay,
  allOrders,
  usersOrders,
  updateStatus,
  verifyStripe,
  verifyRazorpay,
  applyCoupon,
};