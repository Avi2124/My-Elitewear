import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { backEndURL, currency } from "../App";
import { toast } from "react-toastify";
import {
  Users,
  Package,
  ShoppingBag,
  CheckCircle2,
  Clock3,
  LayoutDashboardIcon,
  RefreshCwIcon,
  XCircle,
  MessageSquare,
  Star,
  TicketPercent,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

const isCancelledOrder = (order) => {
  const status = String(order?.status || "")
    .toLowerCase()
    .trim();

  return (
    status === "cancelled" ||
    status === "canceled" ||
    status === "cancel"
  );
};

const isCompletedPayment = (order) =>
  !isCancelledOrder(order) && order?.payment === true;

const isPendingPayment = (order) =>
  !isCancelledOrder(order) && order?.payment === false;

const getOrderAmount = (order) => {
  const n = Number(order?.amount || 0);
  return Number.isFinite(n) ? n : 0;
};

const getOrderDate = (order) => {
  const d = order?.createdAt || order?.date || order?.updatedAt;
  return d ? new Date(d) : null;
};

const getReviewDate = (review) => {
  const d = review?.createdAt || review?.date || review?.updatedAt;
  return d ? new Date(d) : null;
};

const getMessageDate = (message) => {
  const d = message?.createdAt || message?.date || message?.updatedAt;
  return d ? new Date(d) : null;
};

const formatDate = (dateString) => {
  if (!dateString) return "-";

  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}-${month}-${year}`;
};

const isExpiredCoupon = (coupon) => {
  if (!coupon?.expiryDate) return false;
  return new Date(coupon.expiryDate) < new Date();
};

const StatCard = ({ title, value, Icon, sub }) => (
  <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs uppercase text-gray-500">{title}</p>
        <p className="text-2xl font-semibold text-gray-900 mt-1">{value}</p>
        {sub && <p className="text-sm text-gray-500 mt-1">{sub}</p>}
      </div>
      <div className="p-2 rounded-xl bg-gray-50">
        <Icon className="w-6 h-6 text-gray-700" />
      </div>
    </div>
  </div>
);

const Dashboard = ({ token }) => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [messages, setMessages] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [coupons, setCoupons] = useState([]);

  const headers = useMemo(() => ({ headers: { token } }), [token]);

  const fetchAll = async () => {
    if (!token) {
      toast.error("Admin token missing. Please login again.");
      return;
    }

    setLoading(true);
    try {
      const [pRes, uRes, oRes, mRes, rRes, cRes] = await Promise.all([
        axios.get(backEndURL + "/api/product/list"),
        axios.get(backEndURL + "/api/user/list", headers),
        axios.post(backEndURL + "/api/order/list", {}, headers),
        axios.get(backEndURL + "/api/contact/list", headers),
        axios.get(backEndURL + "/api/review/list", headers),
        axios.get(backEndURL + "/api/coupon/list", headers),
      ]);

      if (pRes.data?.success) setProducts(pRes.data.products || []);
      else toast.error(pRes.data?.message || "Failed to fetch products");

      if (uRes.data?.success) setUsers(uRes.data.users || []);
      else toast.error(uRes.data?.message || "Failed to fetch users");

      if (oRes.data?.success) setOrders(oRes.data.orders || []);
      else toast.error(oRes.data?.message || "Failed to fetch orders");

      if (mRes.data?.success) {
        setMessages(
          mRes.data.messages || mRes.data.contacts || mRes.data.data || []
        );
      } else {
        toast.error(mRes.data?.message || "Failed to fetch contact messages");
      }

      if (rRes.data?.success) {
        setReviews(rRes.data.reviews || rRes.data.data || []);
      } else {
        toast.error(rRes.data?.message || "Failed to fetch reviews");
      }

      if (cRes.data?.success) {
        setCoupons(cRes.data.coupons || []);
      } else {
        toast.error(cRes.data?.message || "Failed to fetch coupons");
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const sortedProducts = useMemo(() => {
    return [...products].sort(
      (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    );
  }, [products]);

  const sortedUsers = useMemo(() => {
    return [...users].sort(
      (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    );
  }, [users]);

  const sortedOrders = useMemo(() => {
    return [...orders].sort((a, b) => {
      const db = getOrderDate(b)?.getTime() || 0;
      const da = getOrderDate(a)?.getTime() || 0;
      return db - da;
    });
  }, [orders]);

  const sortedMessages = useMemo(() => {
    return [...messages].sort((a, b) => {
      const db = getMessageDate(b)?.getTime() || 0;
      const da = getMessageDate(a)?.getTime() || 0;
      return db - da;
    });
  }, [messages]);

  const sortedReviews = useMemo(() => {
    return [...reviews].sort((a, b) => {
      const db = getReviewDate(b)?.getTime() || 0;
      const da = getReviewDate(a)?.getTime() || 0;
      return db - da;
    });
  }, [reviews]);

  const sortedCoupons = useMemo(() => {
    return [...coupons].sort(
      (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    );
  }, [coupons]);

  const completedRevenue = useMemo(() => {
    return sortedOrders
      .filter(isCompletedPayment)
      .reduce((sum, o) => sum + getOrderAmount(o), 0);
  }, [sortedOrders]);

  const pendingRevenue = useMemo(() => {
    return sortedOrders
      .filter(isPendingPayment)
      .reduce((sum, o) => sum + getOrderAmount(o), 0);
  }, [sortedOrders]);

  const cancelledRevenue = useMemo(() => {
    return sortedOrders
      .filter(isCancelledOrder)
      .reduce((sum, o) => sum + getOrderAmount(o), 0);
  }, [sortedOrders]);

  const completedOrdersCount = useMemo(
    () => sortedOrders.filter(isCompletedPayment).length,
    [sortedOrders]
  );

  const pendingOrdersCount = useMemo(
    () => sortedOrders.filter(isPendingPayment).length,
    [sortedOrders]
  );

  const cancelledOrdersCount = useMemo(
    () => sortedOrders.filter(isCancelledOrder).length,
    [sortedOrders]
  );

  const totalChartData = useMemo(() => {
    return [
      {
        name: "Total",
        completedRevenue,
        pendingRevenue,
        cancelledRevenue,
        totalRevenue: completedRevenue + pendingRevenue,
      },
    ];
  }, [completedRevenue, pendingRevenue, cancelledRevenue]);

  const bestSellers = useMemo(
    () => sortedProducts.filter((p) => p.bestseller).length,
    [sortedProducts]
  );

  const averageRating = useMemo(() => {
    if (!sortedReviews.length) return 0;

    const total = sortedReviews.reduce((sum, review) => {
      const rating = Number(
        review?.rating || review?.star || review?.stars || 0
      );
      return sum + (Number.isFinite(rating) ? rating : 0);
    }, 0);

    return (total / sortedReviews.length).toFixed(1);
  }, [sortedReviews]);

  const activeCouponsCount = useMemo(
    () => sortedCoupons.filter((coupon) => !isExpiredCoupon(coupon)).length,
    [sortedCoupons]
  );

  return (
  <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
    <div className="bg-gradient-to-r from-indigo-900 to-purple-800 p-6 text-white">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-light tracking-wide flex items-center">
            <LayoutDashboardIcon className="h-8 w-8 mr-3 text-indigo-200" />
            Dashboard
          </h1>
          <p className="text-indigo-200 mt-1">Overview of your store</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchAll}
            className="bg-indigo-800 bg-opacity-30 border border-indigo-300 rounded-full py-2 px-4 text-white focus:outline-none flex items-center"
          >
            <RefreshCwIcon className="h-4 w-4 mr-3 text-indigo-200" />
            Refresh
          </button>
        </div>
      </div>
    </div>

    {loading ? (
      <div className="p-12 flex justify-center">
        <div className="animate-spin h-10 w-10 border-t-2 border-b-2 border-indigo-500 rounded-full"></div>
      </div>
    ) : (
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-4">
          <StatCard
            title="Total Products"
            value={products.length}
            Icon={Package}
          />
          <StatCard title="Total Users" value={users.length} Icon={Users} />
          <StatCard
            title="Total Orders"
            value={orders.length}
            Icon={ShoppingBag}
          />
          <StatCard
            title="Bestsellers"
            value={bestSellers}
            Icon={Package}
          />
          <StatCard
            title="Messages"
            value={messages.length}
            Icon={MessageSquare}
          />
          <StatCard
            title="Reviews"
            value={reviews.length}
            Icon={Star}
            // sub={reviews.length ? `Avg ${averageRating}/5` : ""}
          />
          <StatCard
            title="Coupons"
            value={coupons.length}
            Icon={TicketPercent}
            // sub={`${activeCouponsCount} active`}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard
            title="Completed Revenue"
            value={`${currency}${Number(completedRevenue).toLocaleString()}`}
            Icon={CheckCircle2}
            sub={`${completedOrdersCount} completed payments`}
          />
          <StatCard
            title="Pending Revenue"
            value={`${currency}${Number(pendingRevenue).toLocaleString()}`}
            Icon={Clock3}
            sub={`${pendingOrdersCount} pending payments`}
          />
          <StatCard
            title="Cancelled Revenue"
            value={`${currency}${Number(cancelledRevenue).toLocaleString()}`}
            Icon={XCircle}
            sub={`${cancelledOrdersCount} cancelled orders`}
          />
        </div>

        <div className="bg-gray-50 rounded-2xl border p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-800">Total Revenue</h2>
            <div className="text-xs text-gray-500">
              Completed vs Pending vs Cancelled vs Total
            </div>
          </div>

          {sortedOrders.length === 0 ? (
            <div className="text-sm text-gray-500 py-10 text-center">
              No order data to show chart.
            </div>
          ) : (
            <div className="w-full h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={totalChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    formatter={(val, name) => {
                      let label = "Revenue";

                      if (name === "completedRevenue") {
                        label = "Completed Revenue";
                      } else if (name === "pendingRevenue") {
                        label = "Pending Revenue";
                      } else if (name === "cancelledRevenue") {
                        label = "Cancelled Revenue";
                      } else if (name === "totalRevenue") {
                        label = "Total Revenue";
                      }

                      return [
                        `${currency}${Number(val).toLocaleString()}`,
                        label,
                      ];
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="completedRevenue"
                    strokeWidth={2}
                    fillOpacity={0.2}
                  />
                  <Area
                    type="monotone"
                    dataKey="pendingRevenue"
                    strokeWidth={2}
                    fillOpacity={0.2}
                  />
                  <Area
                    type="monotone"
                    dataKey="cancelledRevenue"
                    strokeWidth={2}
                    fillOpacity={0.2}
                  />
                  <Area
                    type="monotone"
                    dataKey="totalRevenue"
                    strokeWidth={2}
                    fillOpacity={0.2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="bg-gray-50 rounded-2xl border p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-gray-800">Recent Products</h2>
              <button
                onClick={() => navigate("/list")}
                className="text-sm text-indigo-600 hover:underline shrink-0"
              >
                View all
              </button>
            </div>

            <div className="space-y-3">
              {sortedProducts.slice(0, 5).map((p) => (
                <div
                  key={p._id}
                  className="flex items-center gap-3 bg-white rounded-xl border p-3"
                >
                  <img
                    src={p.image?.[0]}
                    alt={p.name}
                    className="w-12 h-12 rounded-lg object-cover border"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{p.name}</div>
                    <div className="text-xs text-gray-500 truncate">
                      {p.category} • {p.subCategory}
                    </div>
                  </div>
                  <div className="text-sm font-semibold shrink-0">
                    {currency}
                    {Number(p.price || 0).toLocaleString()}
                  </div>
                </div>
              ))}

              {sortedProducts.length === 0 && (
                <div className="text-sm text-gray-500 py-6 text-center">
                  No products found.
                </div>
              )}
            </div>
          </div>

          <div className="bg-gray-50 rounded-2xl border p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-gray-800">Recent Users</h2>
              <button
                onClick={() => navigate("/users")}
                className="text-sm text-indigo-600 hover:underline shrink-0"
              >
                View all
              </button>
            </div>

            <div className="space-y-3">
              {sortedUsers.slice(0, 5).map((u) => (
                <div key={u._id} className="bg-white rounded-xl border p-3">
                  <div className="font-medium text-sm">{u.name}</div>
                  <div className="text-xs text-gray-500">{u.email}</div>
                  <div className="text-xs text-gray-400 mt-1">
                    Joined:{" "}
                    {u.createdAt
                      ? new Date(u.createdAt).toLocaleDateString("en-GB")
                      : "-"}
                  </div>
                </div>
              ))}

              {sortedUsers.length === 0 && (
                <div className="text-sm text-gray-500 py-6 text-center">
                  No users found.
                </div>
              )}
            </div>
          </div>

          <div className="bg-gray-50 rounded-2xl border p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-gray-800">Recent Orders</h2>
              <button
                onClick={() => navigate("/orders")}
                className="text-sm text-indigo-600 hover:underline shrink-0"
              >
                View all
              </button>
            </div>

            <div className="space-y-3">
              {sortedOrders.slice(0, 5).map((o) => (
                <div key={o._id} className="bg-white rounded-xl border p-3">
                  <div className="flex justify-between">
                    <div className="text-sm font-medium">Order</div>
                    <div className="text-sm font-semibold">
                      {currency}
                      {getOrderAmount(o).toLocaleString()}
                    </div>
                  </div>

                  <div className="text-xs text-gray-500 mt-1">
                    {getOrderDate(o)
                      ? getOrderDate(o).toLocaleString("en-GB")
                      : "-"}
                  </div>

                  <div className="text-xs text-gray-400 mt-1">
                    Payment:{" "}
                    {isCancelledOrder(o)
                      ? "Cancelled"
                      : o?.payment
                      ? "Completed"
                      : "Pending"}{" "}
                    • Status: {o?.status || "N/A"}
                  </div>
                </div>
              ))}

              {sortedOrders.length === 0 && (
                <div className="text-sm text-gray-500 py-6 text-center">
                  No orders found.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <div className="bg-gray-50 rounded-2xl border p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-gray-800">Recent Coupons</h2>
              <button
                onClick={() => navigate("/coupon-list")}
                className="text-sm text-indigo-600 hover:underline shrink-0"
              >
                View all
              </button>
            </div>

            <div className="space-y-3">
              {sortedCoupons.slice(0, 5).map((coupon) => {
                const expired = isExpiredCoupon(coupon);

                return (
                  <div
                    key={coupon._id}
                    className="bg-white rounded-xl border p-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="font-medium text-sm break-words">
                        {coupon.code}
                      </div>

                      <span
                        className={`px-2 py-1 rounded-full text-[10px] font-medium shrink-0 ${
                          expired
                            ? "bg-red-50 text-red-600"
                            : "bg-green-50 text-green-600"
                        }`}
                      >
                        {expired ? "Expired" : "Active"}
                      </span>
                    </div>

                    <div className="text-xs text-gray-500 mt-2">
                      {coupon.discountType === "percentage"
                        ? `${coupon.discountValue}% off`
                        : `${currency}${coupon.discountValue} off`}
                    </div>

                    <div className="text-xs text-gray-400 mt-1">
                      Min order: {currency}
                      {Number(coupon.minOrderAmount || 0).toLocaleString()}
                    </div>

                    <div className="text-xs text-gray-400 mt-1">
                      Expires: {formatDate(coupon.expiryDate)}
                    </div>
                  </div>
                );
              })}

              {sortedCoupons.length === 0 && (
                <div className="text-sm text-gray-500 py-6 text-center">
                  No coupons found.
                </div>
              )}
            </div>
          </div>

          <div className="bg-gray-50 rounded-2xl border p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-gray-800">
                Recent Contact Messages
              </h2>
              <button
                onClick={() => navigate("/contacts")}
                className="text-sm text-indigo-600 hover:underline shrink-0"
              >
                View all
              </button>
            </div>

            <div className="space-y-3">
              {sortedMessages.slice(0, 5).map((m) => (
                <div
                  key={m._id}
                  className="flex items-center gap-3 bg-white rounded-xl border p-3"
                >
                  <div className="w-12 h-12 rounded-lg border bg-gray-100 flex items-center justify-center shrink-0">
                    <MessageSquare className="w-6 h-6 text-gray-600" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">
                      {m.fullName || "No Name"}
                    </div>

                    <div className="text-xs text-gray-500 truncate">
                      {m.email || "No Email"}
                    </div>

                    <div className="text-xs text-gray-400 truncate mt-1">
                      {m.subject || m.message || "Contact message"}
                    </div>
                  </div>

                  <div className="text-xs text-gray-400 shrink-0">
                    {getMessageDate(m)
                      ? getMessageDate(m).toLocaleDateString("en-GB")
                      : "-"}
                  </div>
                </div>
              ))}

              {sortedMessages.length === 0 && (
                <div className="text-sm text-gray-500 py-6 text-center">
                  No contact messages found.
                </div>
              )}
            </div>
          </div>

          <div className="bg-gray-50 rounded-2xl border p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-gray-800">Recent Reviews</h2>
              <button
                onClick={() => navigate("/reviews")}
                className="text-sm text-indigo-600 hover:underline shrink-0"
              >
                View all
              </button>
            </div>

            <div className="space-y-3">
              {sortedReviews.slice(0, 5).map((r) => {
                const rating = Number(
                  r?.rating || r?.star || r?.stars || 0
                );

                return (
                  <div
                    key={r._id}
                    className="flex items-center gap-3 bg-white rounded-xl border p-3"
                  >
                    <div className="w-12 h-12 rounded-lg border bg-gray-100 flex items-center justify-center shrink-0">
                      <Star className="w-6 h-6 text-gray-600" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">
                        {r.userName ||
                          r.name ||
                          r.user?.name ||
                          "Anonymous User"}
                      </div>

                      <div className="text-xs text-gray-500 truncate">
                        {r.productName ||
                          r.product?.name ||
                          "Product Review"}
                      </div>

                      <div className="text-xs text-gray-400 truncate mt-1">
                        {r.comment ||
                          r.review ||
                          r.message ||
                          "No review text"}
                      </div>
                    </div>

                    <div className="text-sm font-semibold shrink-0">
                      {Number.isFinite(rating) ? rating : 0}/5
                    </div>
                  </div>
                );
              })}

              {sortedReviews.length === 0 && (
                <div className="text-sm text-gray-500 py-6 text-center">
                  No reviews found.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )}
  </div>
);
};

export default Dashboard;