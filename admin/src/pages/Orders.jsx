import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { backEndURL, currency } from "../App";
import { toast } from "react-toastify";
import { assets } from "../assets/assets";
import { ShoppingBagIcon } from "lucide-react";

const Orders = ({ token }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 10;

  const fetchAllOrders = async () => {
    if (!token) return;

    setLoading(true);
    try {
      const response = await axios.post(
        `${backEndURL}/api/order/list`,
        {},
        { headers: { token } }
      );

      if (response.data.success) {
        const sortedOrders = (response.data.orders || []).sort(
          (a, b) =>
            new Date(b.date || b.createdAt || 0) -
            new Date(a.date || a.createdAt || 0)
        );
        setOrders(sortedOrders);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.message);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const statusHandler = async (e, orderId, paymentMethod) => {
    try {
      const response = await axios.post(
        `${backEndURL}/api/order/status`,
        { orderId, status: e.target.value, paymentMethod: e.target.value },
        { headers: { token } }
      );

      if (response.data.success) {
        await fetchAllOrders();
        toast.success(response.data.message);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.message);
      console.error(error);
    }
  };

  useEffect(() => {
    fetchAllOrders();
  }, [token]);

  const filteredOrders = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();

    return orders.filter((order) => {
      const orderId = order?._id?.toLowerCase() || "";
      const firstName = order?.address?.firstName?.toLowerCase() || "";
      const lastName = order?.address?.lastName?.toLowerCase() || "";
      const fullName = `${firstName} ${lastName}`.trim();
      const phone = order?.address?.phone?.toLowerCase() || "";
      const city = order?.address?.city?.toLowerCase() || "";
      const status = order?.status?.toLowerCase() || "";

      const itemsText = Array.isArray(order?.items)
        ? order.items
            .map((item) => `${item?.name || ""} ${item?.size || ""}`)
            .join(" ")
            .toLowerCase()
        : "";

      return (
        orderId.includes(term) ||
        firstName.includes(term) ||
        lastName.includes(term) ||
        fullName.includes(term) ||
        phone.includes(term) ||
        city.includes(term) ||
        status.includes(term) ||
        itemsText.includes(term)
      );
    });
  }, [orders, searchTerm]);

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage) || 1;
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirst, indexOfLast);

  const getStatusColor = (status) => {
    switch (status) {
      case "Delivered":
        return "bg-green-100 text-green-800";
      case "Cancelled":
        return "bg-red-100 text-red-800";
      case "Order Placed":
        return "bg-blue-100 text-blue-800";
      case "Stripe":
        return "bg-green-100 text-green-800";
      case "Razorpay":
        return "bg-green-100 text-green-800";
      case "COD":
        return "bg-red-100 text-red-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="bg-gradient-to-r from-indigo-900 to-purple-800 p-6 text-white">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div>
            <h1 className="text-3xl font-light tracking-wide flex items-center">
              <ShoppingBagIcon className="h-8 w-8 mr-3 text-indigo-200" />
              Order Management
            </h1>
            <p className="text-indigo-200 mt-1">
              View and manage customer orders
            </p>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Search orders..."
              className="bg-indigo-800 bg-opacity-30 border border-indigo-300 rounded-full py-2 px-4 text-white placeholder-indigo-200 focus:outline-none"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="p-12 flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : (
        <>
          <div className="divide-y divide-gray-100">
            {currentOrders.length === 0 ? (
              <div className="p-12 text-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-16 w-16 mx-auto text-gray-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h3 className="mt-4 text-lg font-medium text-gray-900">
                  No orders found
                </h3>
                <p className="mt-1 text-gray-500">
                  Matching orders will appear here
                </p>
              </div>
            ) : (
              currentOrders.map((order) => (
                <div
                  key={order._id}
                  className="p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-5">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0 bg-gray-100 p-3 rounded-lg">
                          <img
                            src={assets.parcel_icon}
                            alt="Order"
                            className="h-8 w-8"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-medium text-gray-900 mb-2">
                            Order #{order._id.slice(-8).toUpperCase()}
                          </h3>

                          <div className="space-y-1 text-sm text-gray-600">
                            {order.items.map((item, index) => (
                              <p key={index}>
                                {item.name} × {item.quantity}{" "}
                                {item.size && `(${item.size})`}
                                {index < order.items.length - 1 && ","}
                              </p>
                            ))}
                          </div>

                          <div className="mt-3">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                                order.status
                              )}`}
                            >
                              {order.status}
                            </span>
                          </div>
                          <div className="mt-3">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                                order.paymentMethod
                              )}`}
                            >
                              {order.paymentMethod}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="lg:col-span-4">
                      <div className="bg-gray-50 p-4 rounded-lg h-full">
                        <h4 className="text-sm font-medium text-gray-500 mb-2">
                          Customer
                        </h4>
                        <p className="text-gray-900 font-medium">
                          {order.address.firstName} {order.address.lastName}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          {order.address.street}, {order.address.city}
                          <br />
                          {order.address.state}, {order.address.country},{" "}
                          {order.address.zipCode}
                        </p>
                        <p className="text-sm text-gray-600 mt-2">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 inline mr-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                            />
                          </svg>
                          {order.address.phone}
                        </p>
                      </div>
                    </div>

                    <div className="lg:col-span-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-500">
                            Date
                          </h4>
                          <p className="text-gray-900">
                            {new Date(
                              order.date || order.createdAt
                            ).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </p>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium text-gray-500">
                            Items
                          </h4>
                          <p className="text-gray-900">{order.items.length}</p>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium text-gray-500">
                            Payment
                          </h4>
                          <p
                            className={`font-medium ${
                              order.payment
                                ? "text-green-600"
                                : "text-yellow-600"
                            }`}
                          >
                            {order.payment ? "Completed" : "Pending"}
                          </p>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium text-gray-500">
                            Total
                          </h4>
                          <p className="text-gray-900 font-medium">
                            {currency}
                            {order.amount.toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4">
                        <select
                          className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md shadow-sm"
                          value={order.status}
                          onChange={(e) => statusHandler(e, order._id)}
                        >
                          <option value="Order Placed">Order Placed</option>
                          <option value="Packing">Packing</option>
                          <option value="Order Shipped">Order Shipped</option>
                          <option value="Out for Delivery">
                            Out for Delivery
                          </option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {filteredOrders.length > 0 && (
            <div className="px-4 py-4 bg-gray-50 border-t flex justify-between items-center">
              <div>
                Showing {currentOrders.length} of {filteredOrders.length}
              </div>

              <div className="space-x-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border rounded disabled:opacity-50"
                >
                  Previous
                </button>

                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(p + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Orders;