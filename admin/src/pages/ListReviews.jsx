import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { backEndURL } from "../App";
import { toast } from "react-toastify";
import { FiTrash2 } from "react-icons/fi";
import { Star } from "lucide-react";

const ListReviews = ({ token }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [deletingId, setDeletingId] = useState(null);

  const itemsPerPage = 15;

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await axios.get(backEndURL + "/api/review/list", {
        headers: { token },
      });

      if (res.data.success) {
        setReviews(res.data.reviews || []);
      } else {
        toast.error(res.data.message || "Failed to fetch reviews");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch reviews");
    } finally {
      setLoading(false);
    }
  };

  const removeReview = async (id) => {
    const ok = window.confirm("Are you sure you want to delete this review?");
    if (!ok) return;

    try {
      setDeletingId(id);

      const res = await axios.delete(
        backEndURL + `/api/review/admin-delete/${id}`,
        {
          headers: { token },
        },
      );

      if (res.data.success) {
        toast.success("Review deleted successfully");

        setReviews((prev) => prev.filter((r) => r._id !== id));

        setCurrentPage((p) => {
          const remaining = filteredReviews.length - 1;
          const newTotalPages = Math.ceil(remaining / itemsPerPage) || 1;
          return Math.min(p, newTotalPages);
        });
      } else {
        toast.error(res.data.message || "Failed to delete review");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const updateStatus = async (id, status) => {
  try {
    const res = await axios.put(
      backEndURL + `/api/review/status/${id}`,
      { status },
      { headers: { token } }
    );

    if (res.data.success) {
      toast.success("Status updated");

      setReviews((prev) =>
        prev.map((r) =>
          r._id === id ? { ...r, status } : r
        )
      );
    } else {
      toast.error(res.data.message);
    }
  } catch (error) {
    console.log(error);
    toast.error("Failed to update status");
  }
};

  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => {
      const userName = (r.name || "").toLowerCase();
      const productName = (r.productId?.name || "").toLowerCase();
      const comment = (r.comment || "").toLowerCase();
      const term = searchTerm.toLowerCase();

      return (
        userName.includes(term) ||
        productName.includes(term) ||
        comment.includes(term)
      );
    });
  }, [reviews, searchTerm]);

  const totalPages = Math.ceil(filteredReviews.length / itemsPerPage) || 1;
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentItems = filteredReviews.slice(indexOfFirst, indexOfLast);

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
      <div className="bg-gradient-to-r from-indigo-900 to-purple-800 p-6 text-white">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div>
            <h1 className="text-3xl font-light tracking-wide flex items-center">
              <Star className="h-8 w-8 mr-3 text-indigo-200" />
              Review Management
            </h1>
            <p className="text-indigo-200 mt-1">Manage product reviews</p>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Search by user, product or review..."
              className="bg-indigo-800 bg-opacity-30 border border-indigo-300 rounded-full py-2 px-4 text-white placeholder:text-indigo-200 focus:outline-none"
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
          <div className="animate-spin h-10 w-10 border-t-2 border-b-2 border-indigo-500 rounded-full"></div>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500 text-center">
                <tr>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Rating</th>
                  <th className="px-4 py-3">Comment</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y text-sm text-center">
                {currentItems.map((r) => {
                  const reviewDate = r.createdAt
                    ? new Date(r.createdAt).toLocaleDateString("en-GB")
                    : "-";

                  return (
                    <tr key={r._id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-4 font-medium">{r.name}</td>

                      <td className="px-4 py-4 text-gray-700">
                        {r.productId?.name || "-"}
                      </td>

                      <td className="px-4 py-4">
  <div className="flex flex-col items-center gap-1">
    <div className="flex text-yellow-400 text-sm">
      {"★".repeat(r.rating)}
      {"☆".repeat(5 - r.rating)}
    </div>
    <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs">
      {r.rating} / 5
    </span>
  </div>
</td>

                      <td className="px-4 py-4 text-gray-700 max-w-[260px]">
                        <p className="truncate" title={r.comment}>
                          {r.comment}
                        </p>
                      </td>

                      <td className="px-4 py-4">
  <select
  value={r.status}
  onChange={(e) => updateStatus(r._id, e.target.value)}
  className={`px-3 py-1 rounded-md text-sm border outline-none ${
    r.status === "new"
      ? "bg-yellow-50 text-yellow-700 border-yellow-300"
      : r.status === "approved"
        ? "bg-green-50 text-green-700 border-green-300"
        : "bg-red-50 text-red-700 border-red-300"
  }`}
>
  {/* <option value="new">New</option> */}
  <option value="approved">Approved</option>
  <option value="rejected">Rejected</option>
</select>
</td>

                      <td className="px-4 py-4 text-gray-600">{reviewDate}</td>

                      <td className="px-4 py-4">
                        <div className="flex justify-center">
                          <button
                            onClick={() => removeReview(r._id)}
                            disabled={deletingId === r._id}
                            className={`px-3 py-1.5 text-sm rounded-lg font-medium transition ${
                              deletingId === r._id
                                ? "bg-red-200 text-red-500 cursor-not-allowed"
                                : "bg-red-50 text-red-600 hover:bg-red-100"
                            }`}
                            title="Delete review"
                          >
                            {deletingId === r._id ? (
                              "Deleting..."
                            ) : (
                              <FiTrash2 size={18} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {currentItems.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-10 text-center text-gray-500"
                    >
                      No reviews found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {filteredReviews.length > 0 && (
            <div className="px-4 py-4 bg-gray-50 border-t flex justify-between items-center">
              <div>
                Showing {currentItems.length} of {filteredReviews.length}
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

export default ListReviews;