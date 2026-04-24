import React, { useContext, useEffect, useState } from "react";
import Title from "../components/Title";
import CartTotal from "../components/CartTotal";
import { assets } from "../assets/assets";
import { ShopContext } from "../context/ShopContext";
import { toast } from "react-toastify";
import axios from "axios";

const PlaceOrder = () => {
  const [method, setMethod] = useState("cod");
  const [validated, setValidated] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    navigate,
    backendUrl,
    token,
    cartItems,
    setCartItems,
    getCartAmount,
    delivery_fee,
    products,
    finalAmount,
  } = useContext(ShopContext);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
    phone: "",
  });

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/login");
    }
  }, []);

  const onChangeHandler = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const initPay = (order) => {
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: order.currency,
      name: "Order Payment",
      order_id: order.id,
      handler: async (response) => {
        try {
          const { data } = await axios.post(
            backendUrl + "/api/order/verifyRazorpay",
            response,
            { headers: { token } }
          );
          if (data.success) {
            setCartItems({});
            navigate("/orders");
            toast.success("Payment Successful!");
          } else {
            toast.error("Payment Failed");
          }
        } catch (err) {
          toast.error(err.message);
        }
      },
    };
    new window.Razorpay(options).open();
  };

  const onSubmitHandler = async () => {
    const empty = Object.values(formData).some((v) => v === "");
    if (empty) return toast.error("Fill all fields");

    setLoading(true);

    try {
      let orderItems = [];

      for (const items in cartItems) {
        for (const size in cartItems[items]) {
          if (cartItems[items][size] > 0) {
            const product = products.find((p) => p._id === items);
            if (product) {
              orderItems.push({
                ...product,
                size,
                quantity: cartItems[items][size],
              });
            }
          }
        }
      }

      const orderData = {
        address: formData,
        items: orderItems,
        amount: (finalAmount || getCartAmount()) + delivery_fee,
      };

      if (method === "cod") {
        const res = await axios.post(
          backendUrl + "/api/order/place",
          orderData,
          { headers: { token } }
        );
        if (res.data.success) {
          setCartItems({});
          navigate("/orders");
          toast.success("Order placed!");
        }
      }

      if (method === "stripe") {
        const res = await axios.post(
          backendUrl + "/api/order/stripe",
          orderData,
          { headers: { token } }
        );
        window.location.replace(res.data.session_url);
      }

      if (method === "razorpay") {
        const res = await axios.post(
          backendUrl + "/api/order/razorpay",
          orderData,
          { headers: { token } }
        );
        initPay(res.data.order);
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen px-4 py-8 bg-gray-50">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-8">

        {/* LEFT - FORM */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <Title text1="DELIVERY" text2="INFORMATION" />

          <div className="grid gap-4 mt-6">
            <div className="flex gap-3">
              <input name="firstName" placeholder="First Name" onChange={onChangeHandler} className="input" />
              <input name="lastName" placeholder="Last Name" onChange={onChangeHandler} className="input" />
            </div>

            <input name="email" placeholder="Email" onChange={onChangeHandler} className="input" />
            <input name="street" placeholder="Street" onChange={onChangeHandler} className="input" />

            <div className="flex gap-3">
              <input name="city" placeholder="City" onChange={onChangeHandler} className="input" />
              <input name="state" placeholder="State" onChange={onChangeHandler} className="input" />
            </div>

            <div className="flex gap-3">
              <input name="zipCode" placeholder="Zip Code" onChange={onChangeHandler} className="input" />
              <input name="country" placeholder="Country" onChange={onChangeHandler} className="input" />
            </div>

            <input name="phone" placeholder="Phone" onChange={onChangeHandler} className="input" />
          </div>
        </div>

        {/* RIGHT - SUMMARY */}
        <div className="flex flex-col gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm sticky top-6">
            <CartTotal />

            {/* PAYMENT */}
<div className="mt-8">
  <div className="mb-4">
    <p className="text-lg font-semibold text-gray-900">Payment Method</p>
    <p className="text-sm text-gray-500">
      Choose your preferred payment option
    </p>
  </div>

  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
    {/* STRIPE */}
    <div
      onClick={() => setMethod("stripe")}
      className={`group relative cursor-pointer rounded-2xl border p-5 bg-white transition-all duration-300
        hover:-translate-y-1 hover:shadow-lg
        ${
          method === "stripe"
            ? "border-violet-500 ring-2 ring-violet-100 shadow-md"
            : "border-gray-200 hover:border-violet-300"
        }`}
    >

      <div className="flex items-start gap-4">
        <div
          className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all
            ${
              method === "stripe"
                ? "border-violet-500"
                : "border-gray-300 group-hover:border-violet-400"
            }`}
        >
          {method === "stripe" && (
            <div className="w-2.5 h-2.5 rounded-full bg-violet-500"></div>
          )}
        </div>

        <div className="flex-1">
          <div className="h-8 flex items-center">
            <img
              src={assets.stripe_logo}
              alt="Stripe"
              className="h-6 object-contain"
            />
          </div>
        </div>
      </div>
    </div>

    {/* RAZORPAY */}
    <div
      onClick={() => setMethod("razorpay")}
      className={`group relative cursor-pointer rounded-2xl border p-5 bg-white transition-all duration-300
        hover:-translate-y-1 hover:shadow-lg
        ${
          method === "razorpay"
            ? "border-sky-500 ring-2 ring-sky-100 shadow-md"
            : "border-gray-200 hover:border-sky-300"
        }`}
    >

      <div className="flex items-start gap-4">
        <div
          className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all
            ${
              method === "razorpay"
                ? "border-sky-500"
                : "border-gray-300 group-hover:border-sky-400"
            }`}
        >
          {method === "razorpay" && (
            <div className="w-2.5 h-2.5 rounded-full bg-sky-500"></div>
          )}
        </div>

        <div className="flex-1">
          <div className="h-8 flex items-center">
            <img
              src={assets.razorpay_logo}
              alt="Razorpay"
              className="h-6 object-contain"
            />
          </div>
        </div>
      </div>
    </div>

    {/* COD */}
    <div
      onClick={() => setMethod("cod")}
      className={`group relative cursor-pointer rounded-2xl border p-5 bg-white transition-all duration-300
        hover:-translate-y-1 hover:shadow-lg
        ${
          method === "cod"
            ? "border-orange-500 ring-2 ring-orange-100 shadow-md"
            : "border-gray-200 hover:border-orange-300"
        }`}
    >

      <div className="flex items-start gap-4">
        <div
          className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all
            ${
              method === "cod"
                ? "border-orange-500"
                : "border-gray-300 group-hover:border-orange-400"
            }`}
        >
          {method === "cod" && (
            <div className="w-2.5 h-2.5 rounded-full bg-orange-500"></div>
          )}
        </div>

        <div className="flex-1">
          <div className="h-8 flex items-center">
            <p className="text-xl font-semibold tracking-wide text-gray-800">
              COD
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

            {/* BUTTON */}
            <button
  onClick={onSubmitHandler}
  className="w-full mt-6 bg-gray-900 text-white py-3.5 rounded-xl font-semibold tracking-wide hover:bg-black transition-all duration-300 shadow-sm hover:shadow-md"
>
  {loading ? "Placing Order..." : "Place Order"}
</button>
          </div>
        </div>
      </div>

      {/* INPUT STYLE */}
      <style jsx>{`
        .input {
          width: 100%;
          border: 1px solid #d1d5db;
          padding: 10px 12px;
          border-radius: 8px;
          outline: none;
        }
        .input:focus {
          border-color: black;
        }
      `}</style>
    </div>
  );
};

export default PlaceOrder;