// context/ShopContext.jsx
import { createContext, useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";

export const ShopContext = createContext();

const ShopContextProvider = (props) => {
  const currency = "₹";
  const delivery_fee = 10;
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState({});
  const [token, setToken] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchBar, setShowSearchBar] = useState(false);

  const [discount, setDiscount] = useState(0);
const [finalAmount, setFinalAmount] = useState(0);

  const navigate = useNavigate();

  // -------------------- PRODUCT DATA --------------------
  const getProductsData = useCallback(async () => {
    try {
      const response = await axios.get(backendUrl + "/api/product/list");

      if (response.data.success) {
        setProducts(response.data.products);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  }, [backendUrl]);

  // -------------------- CART --------------------
  const addToCart = async (itemId, size) => {
    if (!size) {
      toast.error("Please Select a Size");
      return;
    }

    let cartData = structuredClone(cartItems);

    if (cartData[itemId]) {
      cartData[itemId][size] = (cartData[itemId][size] || 0) + 1;
    } else {
      cartData[itemId] = { [size]: 1 };
    }

    setCartItems(cartData);

    if (token) {
      try {
        await axios.post(
          backendUrl + "/api/cart/add",
          { itemId, size },
          { headers: { token } }
        );
      } catch (error) {
        toast.error(error.message);
      }
    }
  };

  const updateQuantity = async (itemId, size, quantity) => {
    let cartItemCopy = structuredClone(cartItems);

    if (cartItemCopy[itemId]) {
      cartItemCopy[itemId][size] = quantity;
      setCartItems(cartItemCopy);
    }

    if (token) {
      try {
        await axios.post(
          backendUrl + "/api/cart/update",
          { itemId, size, quantity },
          { headers: { token } }
        );
      } catch (error) {
        toast.error(error.message);
      }
    }
  };

  const getCartCount = () => {
    let totalCount = 0;

    for (const itemId in cartItems) {
      for (const size in cartItems[itemId]) {
        if (cartItems[itemId][size] > 0) {
          totalCount += cartItems[itemId][size];
        }
      }
    }

    return totalCount;
  };

  const getCartAmount = () => {
    let totalAmount = 0;

    for (const itemId in cartItems) {
      let itemInfo = products.find((p) => p._id === itemId);

      if (!itemInfo) continue;

      for (const size in cartItems[itemId]) {
        if (cartItems[itemId][size] > 0) {
          totalAmount += itemInfo.price * cartItems[itemId][size];
        }
      }
    }

    return totalAmount;
  };

  const getUserCart = async (userToken) => {
    try {
      const response = await axios.post(
        backendUrl + "/api/cart/get",
        {},
        { headers: { token: userToken } }
      );

      if (response.data.success) {
        setCartItems(response.data.cartData);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // -------------------- INITIAL LOAD + AUTO REFRESH --------------------
  useEffect(() => {
    const initializeData = async () => {
      await getProductsData();

      const localToken = localStorage.getItem("token");
      if (localToken) {
        setToken(localToken);
        await getUserCart(localToken);
      }
    };

    initializeData();

    // Auto refresh products every 3 seconds
    const interval = setInterval(() => {
      getProductsData();
    }, 3000);

    return () => clearInterval(interval);
  }, [getProductsData]);

  // -------------------- SEARCH --------------------
  const performSearch = (query) => {
    setSearchQuery(query);

    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    const results = products.filter((item) =>
      item.name.toLowerCase().includes(query.toLowerCase())
    );

    setSearchResults(results);
  };

  // -------------------- CONTEXT VALUE --------------------
  const value = {
    products,
    setProducts,
    getProductsData,
    currency,
    delivery_fee,
    backendUrl,
    cartItems,
    addToCart,
    getCartCount,
    updateQuantity,
    getCartAmount,
    setCartItems,
    token,
    setToken,
    navigate,
    searchQuery,
    setSearchQuery,
    searchResults,
    performSearch,
    showSearchBar,
    setShowSearchBar,
    discount,
    setDiscount,
    finalAmount,
    setFinalAmount,
  };

  return (
    <ShopContext.Provider value={value}>
      {props.children}
    </ShopContext.Provider>
  );
};

export default ShopContextProvider;