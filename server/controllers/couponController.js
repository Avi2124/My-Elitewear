import couponModel from "../models/couponModel.js";

// CREATE COUPON
export const createCoupon = async (req, res) => {
  try {
    const {
      code,
      discountType,
      discountValue,
      minOrderAmount,
      expiryDate,
    } = req.body;

    const exists = await couponModel.findOne({ code: code.toUpperCase() });
    if (exists) {
      return res.json({ success: false, message: "Coupon already exists" });
    }

    const coupon = new couponModel({
      code: code.toUpperCase(),
      discountType,
      discountValue,
      minOrderAmount,
      expiryDate,
    });

    await coupon.save();

    res.json({ success: true, message: "Coupon created" });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};

// GET ALL COUPONS
export const getCoupons = async (req, res) => {
  try {
    const coupons = await couponModel.find().sort({ createdAt: -1 });
    res.json({ success: true, coupons });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};

// DELETE COUPON
export const deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;

    await couponModel.findByIdAndDelete(id);

    res.json({ success: true, message: "Coupon deleted" });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};