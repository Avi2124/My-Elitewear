import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import {
  TicketPercent,
  Tag,
  IndianRupee,
  CalendarDays,
  Percent,
  List,
} from "lucide-react";

const AddCoupon = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    code: "",
    discountType: "percentage",
    discountValue: "",
    minOrderAmount: "",
    expiryDate: "",
  });

  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const token = localStorage.getItem("token");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();

    if (
      !form.code.trim() ||
      !form.discountValue ||
      !form.minOrderAmount ||
      !form.expiryDate
    ) {
      toast.error("Please fill all coupon fields");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        ...form,
        code: form.code.trim().toUpperCase(),
      };

      const res = await axios.post(
        `${backendUrl}/api/coupon/create`,
        payload,
        { headers: { token } }
      );

      if (res.data.success) {
        toast.success("Coupon created successfully");

        setForm({
          code: "",
          discountType: "percentage",
          discountValue: "",
          minOrderAmount: "",
          expiryDate: "",
        });
      } else {
        toast.error(res.data.message || "Failed to create coupon");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="bg-gradient-to-r from-indigo-900 to-purple-800 p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-light tracking-wide flex items-center">
              <TicketPercent className="h-8 w-8 mr-3 text-indigo-200" />
              Add Coupon
            </h1>
            <p className="text-indigo-200 mt-1">
              Create a new discount coupon for your store
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/coupons-list")}
            className="flex items-center gap-2 bg-white/10 border border-white/30 rounded-full py-2 px-5 text-white hover:bg-white/20 transition"
          >
            <List className="h-4 w-4" />
            View Coupons
          </button>
        </div>
      </div>

      <form onSubmit={handleCreate} className="p-6 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT */}
          <div className="lg:col-span-6 space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Coupon Code
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                  <Tag className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  name="code"
                  value={form.code}
                  onChange={handleChange}
                  placeholder="e.g. SAVE20"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none uppercase"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Discount Type
              </label>
              <select
                name="discountType"
                value={form.discountType}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="percentage">Percentage</option>
                <option value="fixed">Flat</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Discount Value
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                  {form.discountType === "percentage" ? (
                    <Percent className="h-4 w-4" />
                  ) : (
                    <IndianRupee className="h-4 w-4" />
                  )}
                </span>
                <input
                  type="number"
                  name="discountValue"
                  value={form.discountValue}
                  onChange={handleChange}
                  placeholder={
                    form.discountType === "percentage" ? "e.g. 20" : "e.g. 200"
                  }
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="lg:col-span-6 space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Order Amount
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                  <IndianRupee className="h-4 w-4" />
                </span>
                <input
                  type="number"
                  name="minOrderAmount"
                  value={form.minOrderAmount}
                  onChange={handleChange}
                  placeholder="e.g. 999"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expiry Date
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                  <CalendarDays className="h-4 w-4" />
                </span>
                <input
                  type="date"
                  name="expiryDate"
                  value={form.expiryDate}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>

            <div className="rounded-xl border border-indigo-100 bg-gradient-to-r from-indigo-50 to-purple-50 p-5">
              <p className="text-sm font-medium text-gray-600 mb-2">
                Coupon Preview
              </p>

              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xl font-bold text-gray-900">
                    {form.code ? form.code.toUpperCase() : "NEWCODE"}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {form.discountType === "percentage"
                      ? `${form.discountValue || 0}% off`
                      : `₹${form.discountValue || 0} off`}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Min order: ₹{form.minOrderAmount || 0}
                  </p>
                </div>

                <div className="px-3 py-1 rounded-full bg-indigo-600 text-white text-xs font-medium">
                  Active
                </div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full sm:w-auto px-6 py-3 rounded-lg font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition ${
              loading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Creating..." : "Create Coupon"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddCoupon;