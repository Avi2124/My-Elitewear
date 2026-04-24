import React, { useEffect, useState } from "react";
import axios from "axios";
import { backEndURL, currency } from "../App";
import { toast } from "react-toastify";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { ListCheckIcon } from "lucide-react";

const List = ({ token }) => {
  const navigate = useNavigate();

  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [deletingId, setDeletingId] = useState(null);

  const itemsPerPage = 15;

  const fetchList = async () => {
    setLoading(true);
    try {
      const response = await axios.get(backEndURL + "/api/product/list");
      if (response.data.success) {
        const sorted = response.data.products.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
        );
        setList(sorted);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error("Failed to fetch products");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const removeProduct = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this product?",
    );

    if (!confirmDelete) return;

    try {
      setDeletingId(id);

      const response = await axios.post(
        backEndURL + "/api/product/remove",
        { id },
        { headers: { token } },
      );

      if (response.data.success) {
        toast.success("Product deleted successfully");
        await fetchList();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error("Something went wrong");
      console.error(error);
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  const categories = ["All", ...new Set(list.map((item) => item.category))];

  const filteredProducts = list.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === "All" || product.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentItems = filteredProducts.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
      <div className="bg-gradient-to-r from-indigo-900 to-purple-800 p-6 text-white">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div>
            <h1 className="text-3xl font-light tracking-wide flex items-center">
              <ListCheckIcon className="h-8 w-8 mr-3 text-indigo-200" />
              Product Inventory
            </h1>
            <p className="text-indigo-200 mt-1">
              Manage your luxury product catalog
            </p>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Search products..."
              className="bg-indigo-800 bg-opacity-30 border border-indigo-300 rounded-full py-2 px-4 text-white focus:outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="px-4 py-3 bg-gray-50 border-b flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => {
              setSelectedCategory(category);
              setCurrentPage(1);
            }}
            className={`px-4 py-1 rounded-full text-sm transition ${
              selectedCategory === category
                ? "bg-indigo-600 text-white"
                : "bg-white border hover:bg-gray-100"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="p-12 flex justify-center">
          <div className="animate-spin h-10 w-10 border-t-2 border-b-2 border-indigo-500 rounded-full"></div>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-4 py-3 text-left">Product</th>
                  <th className="px-4 py-3 text-left">Category</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-right">Price</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y text-sm">
                {currentItems.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-4 flex items-center gap-3">
                      <img
                        src={item.image[0]}
                        alt={item.name}
                        className="h-14 w-14 rounded-lg object-cover border"
                      />
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-gray-500">{item.subCategory}</div>
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs">
                        {item.category}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          item.bestseller
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {item.bestseller ? "Bestseller" : "Standard"}
                      </span>
                    </td>

                    <td className="px-4 py-4 text-right font-semibold">
                      {currency}
                      {item.price.toLocaleString()}
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex justify-center gap-3">
                        <button
                          onClick={() => navigate(`/update/${item._id}`)}
                          className="px-3 py-1.5 text-sm rounded-lg 
                                     bg-indigo-50 text-indigo-600 
                                     hover:bg-indigo-100 transition 
                                     font-medium"
                        >
                          <FiEdit size={18} />
                        </button>

                        <button
                          onClick={() => removeProduct(item._id)}
                          disabled={deletingId === item._id}
                          className={`px-3 py-1.5 text-sm rounded-lg 
                            font-medium transition ${
                              deletingId === item._id
                                ? "bg-red-200 text-red-500 cursor-not-allowed"
                                : "bg-red-50 text-red-600 hover:bg-red-100"
                            }`}
                        >
                          {deletingId === item._id ? (
                            "Deleting..."
                          ) : (
                            <FiTrash2 size={18} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredProducts.length > 0 && (
            <div className="px-4 py-4 bg-gray-50 border-t flex justify-between items-center">
              <div>
                Showing {currentItems.length} of {filteredProducts.length}
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

export default List;
