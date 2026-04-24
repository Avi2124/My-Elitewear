import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { backEndURL } from "../App";
import { toast } from "react-toastify";
import { FiTrash2 } from "react-icons/fi";
import { MessageSquareText } from "lucide-react";

const ListContacts = ({ token }) => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [deletingId, setDeletingId] = useState(null);
  const [updatingStatusId, setUpdatingStatusId] = useState(null);

  const itemsPerPage = 15;

  const subjectLabels = {
    general: "General Inquiry",
    order: "Order Support",
    returns: "Returns & Exchanges",
    feedback: "Feedback",
    other: "Other",
  };

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const res = await axios.get(backEndURL + "/api/contact/list", {
        headers: { token },
      });

      if (res.data.success) {
        const sorted = (res.data.data || []).sort(
          (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
        );
        setContacts(sorted);
      } else {
        toast.error(res.data.message || "Failed to fetch contact messages");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch contact messages");
    } finally {
      setLoading(false);
    }
  };

  const removeContact = async (id) => {
    // const ok = window.confirm(
    //   "Are you sure you want to delete this contact message?",
    // );
    // if (!ok) return;

    try {
      setDeletingId(id);

      const res = await axios.delete(backEndURL + `/api/contact/delete/${id}`, {
        headers: { token },
      });

      if (res.data.success) {
        toast.success("Contact message deleted successfully");

        setContacts((prev) => prev.filter((c) => c._id !== id));

        setCurrentPage((p) => {
          const remaining = filteredContacts.length - 1;
          const newTotalPages = Math.ceil(remaining / itemsPerPage) || 1;
          return Math.min(p, newTotalPages);
        });
      } else {
        toast.error(res.data.message || "Failed to delete contact message");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    } finally {
      setDeletingId(null);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      setUpdatingStatusId(id);

      const res = await axios.patch(
        backEndURL + `/api/contact/status/${id}`,
        { status },
        { headers: { token } },
      );

      if (res.data.success) {
        toast.success("Status updated successfully");

        setContacts((prev) =>
          prev.map((c) =>
            c._id === id ? { ...c, status: res.data.data.status } : c,
          ),
        );
      } else {
        toast.error(res.data.message || "Failed to update status");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to update status");
    } finally {
      setUpdatingStatusId(null);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const filteredContacts = useMemo(() => {
    return contacts.filter((c) => {
      const fullName = (c.fullName || "").toLowerCase();
      const email = (c.email || "").toLowerCase();
      const subject = (c.subject || "").toLowerCase();
      const message = (c.message || "").toLowerCase();
      const term = searchTerm.toLowerCase();

      return (
        fullName.includes(term) ||
        email.includes(term) ||
        subject.includes(term) ||
        message.includes(term)
      );
    });
  }, [contacts, searchTerm]);

  const totalPages = Math.ceil(filteredContacts.length / itemsPerPage) || 1;
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentItems = filteredContacts.slice(indexOfFirst, indexOfLast);

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
      <div className="bg-gradient-to-r from-indigo-900 to-purple-800 p-6 text-white">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div>
            <h1 className="text-3xl font-light tracking-wide flex items-center">
              <MessageSquareText className="h-8 w-8 mr-3 text-indigo-200" />
              Contact Messages
            </h1>
            <p className="text-indigo-200 mt-1">Manage customer messages</p>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Search by name or email..."
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
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Subject</th>
                  <th className="px-4 py-3">Message</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Received</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y text-sm text-center">
                {currentItems.map((c) => {
                  const received = c.createdAt
                    ? new Date(c.createdAt).toLocaleDateString("en-GB")
                    : "-";

                  return (
                    <tr key={c._id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-4 font-medium">{c.fullName}</td>

                      <td className="px-4 py-4 text-gray-700">{c.email}</td>

                      <td className="px-4 py-4 text-gray-700">
                        {c.phone || "-"}
                      </td>

                      <td className="px-4 py-4">
                        <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs">
                          {subjectLabels[c.subject] || c.subject}
                        </span>
                      </td>

                      <td className="px-4 py-4 text-gray-700 max-w-[220px]">
                        <p className="truncate" title={c.message}>
                          {c.message}
                        </p>
                      </td>

                      <td className="px-4 py-4">
                        <select
                          value={c.status}
                          onChange={(e) => updateStatus(c._id, e.target.value)}
                          disabled={updatingStatusId === c._id}
                          className={`px-2 py-1 rounded-full text-xs border outline-none ${
                            c.status === "new"
                              ? "bg-green-100 text-green-700 border-green-200"
                              : c.status === "read"
                                ? "bg-yellow-100 text-yellow-700 border-yellow-200"
                                : "bg-blue-100 text-blue-700 border-blue-200"
                          }`}
                        >
                          <option value="new">New</option>
                          <option value="read">Read</option>
                          <option value="replied">Replied</option>
                        </select>
                      </td>

                      <td className="px-4 py-4 text-gray-600">{received}</td>

                      <td className="px-4 py-4">
                        <div className="flex justify-center">
                          <button
                            onClick={() => removeContact(c._id)}
                            disabled={deletingId === c._id}
                            className={`px-3 py-1.5 text-sm rounded-lg font-medium transition ${
                              deletingId === c._id
                                ? "bg-red-200 text-red-500 cursor-not-allowed"
                                : "bg-red-50 text-red-600 hover:bg-red-100"
                            }`}
                            title="Delete message"
                          >
                            {deletingId === c._id ? (
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
                      colSpan={8}
                      className="px-4 py-10 text-center text-gray-500"
                    >
                      No contact messages found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {filteredContacts.length > 0 && (
            <div className="px-4 py-4 bg-gray-50 border-t flex justify-between items-center">
              <div>
                Showing {currentItems.length} of {filteredContacts.length}
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

export default ListContacts;