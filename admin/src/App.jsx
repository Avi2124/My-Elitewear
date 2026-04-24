import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Add from "./pages/Add";
import Update from "./pages/Update";
import List from "./pages/List";
import Orders from "./pages/Orders";
import Login from "./components/Login";
import Footer from "./components/Footer";
import ListUsers from "./pages/ListUsers";
import Dashboard from "./pages/Dashboard";
import ListContacts from "./pages/ListContacts";
import ListReviews from "./pages/ListReviews";
import Coupons from "./pages/Coupons";
import CouponList from "./pages/CouponList";

export const backEndURL = import.meta.env.VITE_BACKEND_URL;
export const currency = "₹";

const App = () => {
  const [token, setToken] = useState(localStorage.getItem("token") || "");

  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }
  }, [token]);

  return (
    <div className="bg-gray-50 min-h-screen">
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
        theme="colored"
      />

      {token === "" ? (
        <Login setToken={setToken} />
      ) : (
        <div className="bg-gray-50 min-h-screen">
          <Navbar setToken={setToken} />

          <div className="flex w-full">
            <Sidebar />

            <div className="flex-1 my-8 px-4 sm:px-6 text-gray-700 text-base">
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" />} />
                <Route path="/add" element={<Add token={token} />} />
                <Route path="/update/:id" element={<Update token={token} />} />
                <Route path="/list" element={<List token={token} />} />
                <Route path="/users" element={<ListUsers token={token} />} />
                <Route path="/orders" element={<Orders token={token} />} />
                <Route path="/contacts" element={<ListContacts />} />
                <Route path="/reviews" element={<ListReviews token={token} />} />
                <Route path="/coupons" element={<Coupons />} />
                <Route path="/coupons-list" element={<CouponList />} />
                <Route
                  path="/dashboard"
                  element={<Dashboard token={token} />}
                />
              </Routes>
              <Footer />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
