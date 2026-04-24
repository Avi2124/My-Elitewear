import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "../components/Title";
import { toast } from "react-toastify";
import axios from "axios";
import {
  FiRefreshCw,
  FiTruck,
  FiPackage,
  FiCheckCircle,
  FiXCircle,
} from "react-icons/fi";

const Orders = () => {
  const { currency, backendUrl, token } = useContext(ShopContext);
  const [orderData, setOrderData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const [reviewEligibility, setReviewEligibility] = useState({});
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);

  const loadOrderData = async () => {
    try {
      setIsLoading(true);

      if (!token) {
        setOrderData([]);
        return;
      }

      const response = await axios.post(
        backendUrl + "/api/order/userorders",
        {},
        { headers: { token } },
      );

      if (response.data.success) {
        let allOrdersItem = [];

        response.data.orders.forEach((order) => {
          order.items.forEach((item) => {
            const productId =
              item.productId || item._id || item.id || item.itemId;

            allOrdersItem.push({
              ...item,
              productId,
              status: order.status,
              payment: order.payment,
              paymentMethod: order.paymentMethod,
              date: new Date(order.date),
              orderAmount: order.amount,   // ✅ ADD THIS
            });
          });
        });

        allOrdersItem.sort((a, b) => b.date - a.date);
        setOrderData(allOrdersItem);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const checkReviewEligibility = async (productId) => {
    if (!token || !productId) return;

    try {
      const response = await axios.get(
        backendUrl + `/api/review/can-review/${productId}`,
        {
          headers: { token },
        },
      );

      if (response.data.success) {
        setReviewEligibility((prev) => ({
          ...prev,
          [productId]: response.data.canReview,
        }));
      } else {
        setReviewEligibility((prev) => ({
          ...prev,
          [productId]: false,
        }));
      }
    } catch (error) {
      console.log(error);
      setReviewEligibility((prev) => ({
        ...prev,
        [productId]: false,
      }));
    }
  };

  const loadReviewEligibilityForDeliveredOrders = async (items) => {
    const deliveredItems = items.filter(
      (item) => item.status === "Delivered" && item.productId,
    );

    const uniqueProductIds = [
      ...new Set(deliveredItems.map((item) => item.productId)),
    ];

    for (const productId of uniqueProductIds) {
      await checkReviewEligibility(productId);
    }
  };

  const openReviewModal = (productId) => {
    setSelectedProductId(productId);
    setRating(5);
    setComment("");
    setShowReviewModal(true);
  };

  const closeReviewModal = () => {
    setShowReviewModal(false);
    setSelectedProductId("");
    setRating(5);
    setComment("");
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();

    if (!token) {
      toast.error("Please login first");
      return;
    }

    if (!selectedProductId) {
      toast.error("Product not selected");
      return;
    }

    if (!comment.trim()) {
      toast.error("Please write your review");
      return;
    }

    try {
      setReviewLoading(true);

      const response = await axios.post(
        backendUrl + "/api/review/add",
        {
          productId: selectedProductId,
          rating,
          comment,
        },
        {
          headers: { token },
        },
      );

      if (response.data.success) {
        toast.success("Review added successfully");

        setReviewEligibility((prev) => ({
          ...prev,
          [selectedProductId]: false,
        }));

        closeReviewModal();
      } else {
        toast.error(response.data.message || "Failed to add review");
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setReviewLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Cancelled":
        return <FiXCircle className="text-red-500" />;
      case "Delivered":
        return <FiCheckCircle className="text-green-600" />;
      case "Packing":
      case "Order Shipped":
        return <FiTruck className="text-blue-500" />;
      default:
        return <FiPackage className="text-gray-500" />;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        if (!token) {
          setOrderData([]);
          return;
        }

        const response = await axios.post(
          backendUrl + "/api/order/userorders",
          {},
          { headers: { token } },
        );

        if (response.data.success) {
          let allOrdersItem = [];

          response.data.orders.forEach((order) => {
            order.items.forEach((item) => {
              const productId =
                item.productId || item._id || item.id || item.itemId;

              allOrdersItem.push({
                ...item,
                productId,
                status: order.status,
                payment: order.payment,
                paymentMethod: order.paymentMethod,
                date: new Date(order.date),
                orderAmount: order.amount,
              });
            });
          });

          allOrdersItem.sort((a, b) => b.date - a.date);
          setOrderData(allOrdersItem);
          await loadReviewEligibilityForDeliveredOrders(allOrdersItem);
        } else {
          toast.error(response.data.message);
        }
      } catch (error) {
        console.error(error);
        toast.error(error.response?.data?.message || error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [token, backendUrl]);

  return (
    <div className="mb-12 border-t px-4 pt-8 sm:px-6 sm:pt-16 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 text-2xl">
          <Title text1={"MY"} text2={"ORDERS"} />
        </div>

        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Showing {orderData.length} orders
          </p>

          <button
            onClick={loadOrderData}
            disabled={isLoading}
            className="flex items-center gap-2 text-sm text-gray-700 transition-colors hover:text-black"
          >
            <FiRefreshCw
              className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </div>

        {orderData.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-gray-500">You haven't placed any orders yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orderData.map((item, index) => (
              <div
                key={index}
                className="flex flex-col gap-4 rounded-lg border px-4 py-4 transition-shadow hover:shadow-sm sm:flex-row sm:items-center sm:justify-between sm:px-6"
              >
                <div className="flex items-start gap-4 sm:gap-6">
                  <img
                    src={item.image[0]}
                    className="h-16 w-16 rounded object-cover sm:h-20 sm:w-20"
                    alt={item.name}
                  />

                  <div className="flex-1">
                    <p className="text-sm font-medium sm:text-base">
                      {item.name}
                    </p>

                    <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-gray-600">
                      <p>
                        {currency}
                        {item.orderAmount?.toFixed(2)}
                      </p>
                      <p>Qty: {item.quantity}</p>
                      <p>Size: {item.size}</p>
                    </div>

                    <div className="mt-2 space-y-1 text-xs text-gray-500 sm:text-sm">
                      <p>
                        Ordered on:{" "}
                        <span className="font-medium">
                          {item.date.toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </p>

                      <p>
                        Payment Method:{" "}
                        <span className="font-medium">
                          {item.paymentMethod}
                        </span>
                      </p>

                      <p>
                        Payment Status:{" "}
                        <span
                          className={`font-medium ${
                            item.payment ? "text-green-600" : "text-orange-500"
                          }`}
                        >
                          {item.payment ? "Completed" : "Pending"}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:w-1/3 sm:items-end">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(item.status)}
                    <p
                      className={`text-sm sm:text-base ${
                        item.status === "Cancelled"
                          ? "text-red-500"
                          : item.status === "Delivered"
                            ? "text-green-600"
                            : item.status === "Packing" ||
                                item.status === "Order Shipped"
                              ? "text-blue-500"
                              : "text-gray-700"
                      }`}
                    >
                      {item.status}
                    </p>
                  </div>

                  {item.status !== "Delivered" &&
                    item.status !== "Cancelled" && (
                      <button
                        className="rounded border border-gray-300 px-3 py-1.5 text-xs font-medium transition-colors hover:bg-gray-50 sm:text-sm"
                        onClick={() => {
                          toast.info(
                            "Tracking information will be available soon",
                          );
                        }}
                      >
                        Track Order
                      </button>
                    )}

                  {item.status === "Delivered" &&
                    item.productId &&
                    reviewEligibility[item.productId] && (
                      <button
                        onClick={() => openReviewModal(item.productId)}
                        className="rounded bg-orange-600 px-4 py-2 text-xs font-medium text-white transition hover:bg-orange-700 sm:text-sm"
                      >
                        Review Product
                      </button>
                    )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h3 className="mb-4 text-xl font-semibold text-gray-800">
              Write a Review
            </h3>

            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Rating
                </label>

                <div className="flex cursor-pointer gap-1 text-3xl">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      onClick={() => setRating(star)}
                      className={
                        star <= rating ? "text-yellow-400" : "text-gray-300"
                      }
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Comment
                </label>

                <textarea
                  rows="4"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Write your review here..."
                  className="w-full rounded-lg border px-4 py-3 outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeReviewModal}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={reviewLoading}
                  className="rounded-lg bg-orange-600 px-5 py-2 text-sm text-white transition hover:bg-orange-700 disabled:opacity-60"
                >
                  {reviewLoading ? "Submitting..." : "Submit Review"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
