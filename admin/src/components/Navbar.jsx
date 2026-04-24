import { useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import {
  Users,
  PlusCircle,
  ListCheck,
  ShoppingBagIcon,
  LayoutDashboardIcon,
  MessageSquare,
  Star,
  TicketPercent,
  Rows4,
} from "lucide-react";
import { assets } from "../assets/assets";

const Navbar = ({ setToken }) => {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);

  const handleLogout = () => {
    setToken("");
    navigate("/");
    setShowMenu(false);
  };

  const RenderIcon = ({ icon, alt }) => {
    if (typeof icon === "string") {
      return <img src={icon} className="w-5 h-5" alt={alt} />;
    }

    const IconComp = icon;
    return <IconComp className="w-5 h-5" />;
  };

  const navLinks = [
    { to: "/dashboard", icon: LayoutDashboardIcon, text: "Dashboard" },
    { to: "/add", icon: PlusCircle, text: "Add Items" },
    { to: "/list", icon: ListCheck, text: "List Items" },
    { to: "/orders", icon: ShoppingBagIcon, text: "Orders" },
    { to: "/users", icon: Users, text: "List Users" },
    { to: "/contacts", icon: MessageSquare, text: "Contact Messages" },
    { to: "/reviews", icon: Star, text: "List Reviews" },
    { to: "/coupons", icon: TicketPercent, text: "Coupons" },
    { to: "/coupons-list", icon: Rows4, text: "List Coupons" },
  ];

  return (
    <>
      <div className="relative flex items-center justify-between border-b border-gray-100 bg-white p-4 shadow-sm sm:ml-[18%]">
        <div className="flex items-center gap-3 sm:hidden">
          <img
            src={assets.logo}
            alt="Logo"
            className="h-5 w-10 object-contain"
          />
          <h1 className="text-base font-semibold sm:text-lg">
            Admin Dashboard
          </h1>
        </div>

        <div className="ml-auto hidden items-center gap-4 pr-4 sm:flex">
          <div className="flex items-center gap-2 text-gray-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-sm">Admin</span>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-md bg-red-500 px-4 py-2 text-sm text-white transition-colors hover:bg-red-600"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            <span>Logout</span>
          </button>
        </div>

        <button
          onClick={() => setShowMenu(!showMenu)}
          className="p-1 text-gray-500 hover:text-gray-700 sm:hidden"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>

      {showMenu && (
        <div className="fixed inset-0 z-50 sm:hidden">
          <div
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setShowMenu(false)}
          ></div>

          <div className="absolute right-0 top-0 h-full w-64 bg-white shadow-lg">
            <div className="flex items-center justify-between border-b border-gray-200 p-4">
              <h2 className="text-lg font-semibold">Menu</h2>
              <button
                onClick={() => setShowMenu(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="flex flex-col gap-1 p-4">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setShowMenu(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-200
                    ${
                      isActive
                        ? "bg-indigo-50 text-indigo-600 border-l-4 border-indigo-600"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div
                        className={`rounded-lg p-2 ${
                          isActive ? "bg-indigo-100" : "bg-gray-100"
                        }`}
                      >
                        <RenderIcon icon={link.icon} alt={link.text} />
                      </div>
                      <span className="font-medium">{link.text}</span>
                    </>
                  )}
                </NavLink>
              ))}
            </div>

            <div className="absolute bottom-0 left-0 right-0 border-t border-gray-200 p-4">
              <div className="flex items-center gap-2 px-4 py-3 text-gray-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm">Admin</span>
              </div>

              <button
                onClick={handleLogout}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-md bg-red-500 px-4 py-2 text-sm text-white transition-colors hover:bg-red-600"
              >
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="fixed left-0 top-0 hidden min-h-screen w-[18%] border-r border-gray-100 bg-white shadow-sm sm:block">
        <div className="flex items-center gap-3 border-b border-gray-100 p-4">
          <img
            src={assets.logo}
            alt="Logo"
            className="h-10 w-10 object-contain"
          />
          <h1 className="text-base font-semibold">Admin Dashboard</h1>
        </div>

        <div className="flex flex-col gap-2 pt-6 pl-6 pr-2">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-200
                ${
                  isActive
                    ? "bg-indigo-50 text-indigo-600 border-l-4 border-indigo-600"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div
                    className={`rounded-lg p-2 ${
                      isActive ? "bg-indigo-100" : "bg-gray-100"
                    }`}
                  >
                    <RenderIcon icon={link.icon} alt={link.text} />
                  </div>
                  <span className="font-medium">{link.text}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </div>
    </>
  );
};

export default Navbar;