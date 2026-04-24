import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { TicketPercent, Trash2 } from "lucide-react";

const formatDate = (dateString) => {
  const date = new Date(dateString);

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}-${month}-${year}`;
};

const CouponList = () => {
  const [coupons, setCoupons] = useState([]);
  const [fetching, setFetching] = useState(false);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const token = localStorage.getItem("token");

  const fetchCoupons = async () => {
    try {
      setFetching(true);

      const res = await axios.get(`${backendUrl}/api/coupon/list`, {
        headers: { token },
      });

      if (res.data.success) {
        setCoupons(res.data.coupons);
      } else {
        toast.error(res.data.message || "Failed to fetch coupons");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleDelete = async (id) => {
  try {
    const res = await axios.delete(`${backendUrl}/api/coupon/delete/${id}`, {
      headers: { token },
    });

    if (res.data.success) {
      toast.success("Coupon deleted successfully");
      fetchCoupons();
    } else {
      toast.error(res.data.message || "Failed to delete coupon");
    }
  } catch (error) {
    toast.error(error.response?.data?.message || error.message);
  }
};

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="bg-gradient-to-r from-indigo-900 to-purple-800 p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-light tracking-wide flex items-center">
              <TicketPercent className="h-8 w-8 mr-3 text-indigo-200" />
              All Coupons
            </h1>
            <p className="text-indigo-200 mt-1">
              View and delete existing coupons
            </p>
          </div>

          <div className="bg-white/10 border border-white/20 rounded-full px-4 py-2 text-sm text-white w-fit">
            Total Coupons: <span className="font-semibold">{coupons.length}</span>
          </div>
        </div>
      </div>

      <div className="p-6">
        {fetching ? (
          <div className="text-gray-500 text-sm">Loading coupons...</div>
        ) : coupons.length === 0 ? (
          <div className="border border-dashed border-gray-300 rounded-xl p-8 text-center text-gray-500 bg-gray-50">
            No coupons found
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {coupons.map((c) => {
              const isExpired = new Date(c.expiryDate) < new Date();

              return (
                <div
                  key={c._id}
                  className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3 flex-wrap">
                        <p className="text-lg font-bold text-gray-900 tracking-wide">
                          {c.code}
                        </p>

                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                            isExpired
                              ? "bg-red-50 text-red-600"
                              : "bg-green-50 text-green-600"
                          }`}
                        >
                          {isExpired ? "Expired" : "Active"}
                        </span>
                      </div>

                      <p className="text-sm text-gray-700 mt-3">
                        <span className="font-medium">Discount:</span>{" "}
                        {c.discountType === "percentage"
                          ? `${c.discountValue}% off`
                          : `₹${c.discountValue} off`}
                      </p>

                      <p className="text-sm text-gray-700 mt-1">
                        <span className="font-medium">Minimum Order:</span> ₹
                        {c.minOrderAmount}
                      </p>

                      <p className="text-sm text-gray-700 mt-1">
                        <span className="font-medium">Expires:</span>{" "}
                        {formatDate(c.expiryDate)}
                      </p>
                    </div>

                    <button
                      onClick={() => handleDelete(c._id)}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CouponList;