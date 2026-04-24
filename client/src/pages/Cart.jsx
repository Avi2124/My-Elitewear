import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "../components/Title";
import { assets } from "../assets/assets";
import { toast } from "react-toastify";

const Cart = () => {
  const {
    products,
    currency,
    cartItems,
    updateQuantity,
    navigate,
    token,
    backendUrl,
    discount,
    setDiscount,
    finalAmount,
    setFinalAmount,
  } = useContext(ShopContext);

  const [cartData, setCartData] = useState([]);
  const [proceedToPayment, setProceedToPayment] = useState(false);
  const [coupon, setCoupon] = useState("");
  const [availableCoupons, setAvailableCoupons] = useState([]);

  // ✅ Calculate total
  const getCartTotal = () => {
    let total = 0;

    cartData.forEach((item) => {
      const product = products.find((p) => p._id === item._id);
      if (product) {
        total += product.price * item.quantity;
      }
    });

    return total;
  };

  // ✅ Fetch coupons
  const fetchCoupons = async () => {
    try {
      const res = await fetch(`${backendUrl}/api/coupon/list`);
      const data = await res.json();

      if (data.success) {
        setAvailableCoupons(data.coupons || []);
      } else {
        toast.error(data.message || "Failed to load coupons");
      }
    } catch (err) {
      console.log(err);
      toast.error("Error fetching coupons");
    }
  };

  // ✅ Apply coupon
  const applyCoupon = async () => {
    if (!coupon.trim()) {
      toast.error("Please enter or select a coupon code");
      return;
    }

    try {
      const res = await fetch(`${backendUrl}/api/order/apply-coupon`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          token,
        },
        body: JSON.stringify({
          code: coupon,
          amount: getCartTotal(),
        }),
      });

      const data = await res.json();

      if (data.success) {
        setDiscount(data.discount);
        setFinalAmount(data.finalAmount);
        toast.success("Coupon applied!");
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error("Error applying coupon");
    }
  };

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    fetchCoupons();
  }, []);

  useEffect(() => {
    if (products.length > 0) {
      const tempData = [];

      for (const items in cartItems) {
        for (const item in cartItems[items]) {
          if (cartItems[items][item] > 0) {
            tempData.push({
              _id: items,
              size: item,
              quantity: cartItems[items][item],
            });
          }
        }
      }

      setCartData(tempData);
      setProceedToPayment(tempData.length > 0);
    }
  }, [cartItems, products]);

  return (
    <div className="border-t pt-10 px-4 md:px-10 max-w-6xl mx-auto">
      {/* Title */}
      <div className="text-3xl mb-6">
        <Title text1={"YOUR"} text2={"CART"} />
      </div>

      {/* Cart Items */}
      <div className="bg-white shadow rounded-lg p-4">
        {cartData.length === 0 ? (
          <p className="text-center text-gray-500 py-10">Your cart is empty</p>
        ) : (
          cartData.map((item, index) => {
            const productData = products.find(
              (product) => product._id === item._id
            );

            if (!productData) return null;

            return (
              <div
                key={index}
                className="flex items-center justify-between border-b py-4 gap-4"
              >
                {/* Product Info */}
                <div className="flex items-center gap-4 w-2/3">
                  <img
                    src={productData.image?.[0]}
                    className="w-20 h-20 object-cover rounded"
                    alt={productData.name}
                  />

                  <div>
                    <p className="font-semibold text-gray-800">
                      {productData.name}
                    </p>

                    <p className="text-sm text-gray-500">Size: {item.size}</p>

                    <p className="text-lg font-medium mt-1">
                      {currency}
                      {productData.price}
                    </p>
                  </div>
                </div>

                {/* Quantity */}
                <input
                  type="number"
                  min={1}
                  defaultValue={item.quantity}
                  className="w-16 border rounded px-2 py-1 text-center"
                  onChange={(e) =>
                    updateQuantity(item._id, item.size, Number(e.target.value))
                  }
                />

                {/* Delete */}
                <img
                  src={assets.bin_icon}
                  className="w-5 cursor-pointer hover:scale-110 transition"
                  onClick={() => updateQuantity(item._id, item.size, 0)}
                  alt="Delete"
                />
              </div>
            );
          })
        )}
      </div>

      {/* Coupon + Summary Section */}
      <div className="grid md:grid-cols-2 gap-6 mt-8">
        {/* Coupon */}
        <div className="bg-white shadow rounded-lg p-4">
          <h3 className="font-semibold mb-3">Apply Coupon</h3>

          <input
            type="text"
            placeholder="Enter Coupon Code"
            value={coupon}
            onChange={(e) => setCoupon(e.target.value.toUpperCase())}
            className="border p-2 w-full rounded"
          />

          <button
            onClick={applyCoupon}
            className="mt-3 bg-black text-white px-4 py-2 w-full rounded hover:bg-gray-800 transition"
          >
            Apply Coupon
          </button>

          <div className="mt-5">
            <p className="text-sm font-medium mb-2 text-gray-700">
              Available Coupons
            </p>

            <div className="space-y-2 max-h-40 overflow-y-auto">
              {availableCoupons.map((item) => (
                <div
                  key={item._id}
                  onClick={() => {
                    setCoupon(item.code);
                  }}
                  className="border rounded-lg p-3 cursor-pointer hover:border-black hover:bg-gray-50 transition"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-sm">{item.code}</span>

                    <span className="text-xs text-green-600 font-medium">
                      {item.discountType === "percentage"
                        ? `${item.discountValue}% OFF`
                        : `₹${item.discountValue} OFF`}
                    </span>
                  </div>

                  <p className="text-xs text-gray-500 mt-1">
                    Min Order: ₹{item.minOrderAmount}
                  </p>
                </div>
              ))}

              {availableCoupons.length === 0 && (
                <p className="text-xs text-gray-400">No coupons available</p>
              )}
            </div>
          </div>
        </div>

        {/* Price Summary */}
        <div className="bg-gray-50 shadow rounded-lg p-4">
          <h3 className="font-semibold mb-4">Order Summary</h3>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Total</span>
              <span>
                ₹{getCartTotal()}
              </span>
            </div>

            <div className="flex justify-between text-green-600">
              <span>Discount</span>
              <span>- ₹{discount}</span>
            </div>

            <div className="border-t pt-2 flex justify-between font-semibold text-lg">
              <span>Final Amount</span>
              <span>₹{finalAmount || getCartTotal()}</span>
            </div>
          </div>

          <button
            className="w-full mt-6 bg-indigo-600 text-white py-3 rounded hover:bg-indigo-700 transition"
            onClick={() =>
              !proceedToPayment
                ? toast.error("Add Items to cart")
                : navigate("/place-order", {
                    state: {
                      couponCode: coupon,
                      finalAmount: finalAmount || getCartTotal(),
                    },
                  })
            }
          >
            PROCEED TO CHECKOUT
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;