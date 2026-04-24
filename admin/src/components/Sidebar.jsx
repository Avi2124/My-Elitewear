import React from "react";
import { NavLink } from "react-router-dom";
import {
  Users,
  PlusCircle,
  ListCheck,
  ShoppingBagIcon,
  MessageSquare,
  Star,
  Rows4,
} from "lucide-react";
import { assets } from "../assets/assets";

const Sidebar = () => {
  const navClass = ({ isActive }) =>
    `flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-200
     ${
       isActive
         ? "bg-indigo-50 text-indigo-600 border-l-4 border-indigo-600"
         : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
     }`;

  return (
    <div className="w-[18%] min-h-screen bg-white shadow-sm border-r border-gray-100">
      <div className="flex items-center gap-3 p-4 border-b border-gray-100">
        <img
          src={assets.logo}
          alt="Logo"
          className="w-10 h-10 object-contain"
        />
        <h1 className="text-base font-semibold">Admin Dashboard</h1>
      </div>

      <div className="flex flex-col gap-2 pt-6 pl-6 pr-2">
        <NavLink to="/add" className={navClass}>
          {({ isActive }) => (
            <>
              <div
                className={`p-2 rounded-lg ${
                  isActive ? "bg-indigo-100" : "bg-gray-100"
                }`}
              >
                <PlusCircle className="w-5 h-5" />
              </div>
              <span className="hidden md:block font-medium">Add Items</span>
            </>
          )}
        </NavLink>

        <NavLink to="/list" className={navClass}>
          {({ isActive }) => (
            <>
              <div
                className={`p-2 rounded-lg ${
                  isActive ? "bg-indigo-100" : "bg-gray-100"
                }`}
              >
                <ListCheck className="w-5 h-5" />
              </div>
              <span className="hidden md:block font-medium">List Items</span>
            </>
          )}
        </NavLink>

        <NavLink to="/orders" className={navClass}>
          {({ isActive }) => (
            <>
              <div
                className={`p-2 rounded-lg ${
                  isActive ? "bg-indigo-100" : "bg-gray-100"
                }`}
              >
                <ShoppingBagIcon className="w-5 h-5" />
              </div>
              <span className="hidden md:block font-medium">Orders</span>
            </>
          )}
        </NavLink>

        <NavLink to="/users" className={navClass}>
          {({ isActive }) => (
            <>
              <div
                className={`p-2 rounded-lg ${
                  isActive ? "bg-indigo-100" : "bg-gray-100"
                }`}
              >
                <Users className="w-5 h-5" />
              </div>
              <span className="hidden md:block font-medium">List Users</span>
            </>
          )}
        </NavLink>

        <NavLink to="/contacts" className={navClass}>
          {({ isActive }) => (
            <>
              <div
                className={`p-2 rounded-lg ${
                  isActive ? "bg-indigo-100" : "bg-gray-100"
                }`}
              >
                <MessageSquare className="w-5 h-5" />
              </div>
              <span className="hidden md:block font-medium">
                Contact Messages
              </span>
            </>
          )}
        </NavLink>

        <NavLink to="/reviews" className={navClass}>
          {({ isActive }) => (
            <>
              <div
                className={`p-2 rounded-lg ${
                  isActive ? "bg-indigo-100" : "bg-gray-100"
                }`}
              >
                <Star className="w-5 h-5" />
              </div>
              <span className="hidden md:block font-medium">List Reviews</span>
            </>
          )}
        </NavLink>

        <NavLink to="/coupons" className={navClass}>
          {({ isActive }) => (
            <>
              <div
                className={`p-2 rounded-lg ${
                  isActive ? "bg-indigo-100" : "bg-gray-100"
                }`}
              >
                <Star className="w-5 h-5" />
              </div>
              <span className="hidden md:block font-medium">Add Coupons</span>
            </>
          )}
        </NavLink>

        <NavLink to="/coupons-list" className={navClass}>
          {({ isActive }) => (
            <>
              <div
                className={`p-2 rounded-lg ${
                  isActive ? "bg-indigo-100" : "bg-gray-100"
                }`}
              >
                <Rows4 className="w-5 h-5" />
              </div>
              <span className="hidden md:block font-medium">List Coupons</span>
            </>
          )}
        </NavLink>
      </div>
    </div>
  );
};

export default Sidebar;