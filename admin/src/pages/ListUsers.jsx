import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { backEndURL } from "../App";
import { toast } from "react-toastify";
import { FiTrash2 } from "react-icons/fi";
import { Users } from "lucide-react";

const ListUsers = ({ token }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [deletingId, setDeletingId] = useState(null);

  const itemsPerPage = 15;

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(backEndURL + "/api/user/list", {
        headers: { token },
      });

      if (res.data.success) {
        const sorted = (res.data.users || []).sort(
          (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
        );
        setUsers(sorted);
      } else {
        toast.error(res.data.message || "Failed to fetch users");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const removeUser = async (id) => {
    const ok = window.confirm("Are you sure you want to delete this user?");
    if (!ok) return;

    try {
      setDeletingId(id);

      const res = await axios.post(
        backEndURL + "/api/user/remove",
        { id },
        { headers: { token } },
      );

      if (res.data.success) {
        toast.success("User deleted successfully");

        setUsers((prev) => prev.filter((u) => u._id !== id));

        setCurrentPage((p) => {
          const remaining = filteredUsers.length - 1;
          const newTotalPages = Math.ceil(remaining / itemsPerPage) || 1;
          return Math.min(p, newTotalPages);
        });
      } else {
        toast.error(res.data.message || "Failed to delete user");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const name = (u.name || "").toLowerCase();
      const email = (u.email || "").toLowerCase();
      const term = searchTerm.toLowerCase();

      return name.includes(term) || email.includes(term);
    });
  }, [users, searchTerm]);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage) || 1;
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentItems = filteredUsers.slice(indexOfFirst, indexOfLast);

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
      <div className="bg-gradient-to-r from-indigo-900 to-purple-800 p-6 text-white">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div>
            <h1 className="text-3xl font-light tracking-wide flex items-center">
              <Users className="h-8 w-8 mr-3 text-indigo-200" />
              User Management
            </h1>
            <p className="text-indigo-200 mt-1">Manage registered users</p>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Search by name or email..."
              className="bg-indigo-800 bg-opacity-30 border border-indigo-300 rounded-full py-2 px-4 text-white focus:outline-none"
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
                  <th className="px-4 py-3 ">Name</th>
                  <th className="px-4 py-3 ">Email</th>
                  <th className="px-4 py-3 ">Cart Items</th>
                  <th className="px-4 py-3 ">Joined</th>
                  <th className="px-4 py-3 ">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y text-sm text-center">
                {currentItems.map((u) => {
                  const cartCount =
                    u.cartData && typeof u.cartData === "object"
                      ? Object.keys(u.cartData).length
                      : 0;

                  const joined = u.createdAt
                    ? new Date(u.createdAt).toLocaleDateString("en-GB")
                    : "-";

                  return (
                    <tr key={u._id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-4 font-medium">{u.name}</td>
                      <td className="px-4 py-4 text-gray-700">{u.email}</td>

                      <td className="px-4 py-4">
                        <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs">
                          {cartCount}
                        </span>
                      </td>

                      <td className="px-4 py-4 text-gray-600">{joined}</td>

                      <td className="px-4 py-4">
                        <div className="flex justify-center">
                          <button
                            onClick={() => removeUser(u._id)}
                            disabled={deletingId === u._id}
                            className={`px-3 py-1.5 text-sm rounded-lg font-medium transition ${
                              deletingId === u._id
                                ? "bg-red-200 text-red-500 cursor-not-allowed"
                                : "bg-red-50 text-red-600 hover:bg-red-100"
                            }`}
                            title="Delete user"
                          >
                            {deletingId === u._id ? (
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
                      colSpan={5}
                      className="px-4 py-10 text-center text-gray-500"
                    >
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {filteredUsers.length > 0 && (
            <div className="px-4 py-4 bg-gray-50 border-t flex justify-between items-center">
              <div>
                Showing {currentItems.length} of {filteredUsers.length}
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

export default ListUsers;
