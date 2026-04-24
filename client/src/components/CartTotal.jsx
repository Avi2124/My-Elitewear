import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import Title from "./Title";
import { FiShoppingBag } from "react-icons/fi";

const CartTotal = () => {
  const {
    currency,
    delivery_fee,
    getCartAmount,
    getCartCount,
    discount,
  } = useContext(ShopContext);

  const subtotal = getCartAmount();
  const finalTotal = subtotal - discount + delivery_fee;

  const isEmpty = getCartCount() === 0;

  return (
    <div className="w-full bg-white p-6 rounded-lg shadow-sm border border-gray-100">
      <div className="mb-6">
        <Title text1={"CART"} text2={"TOTALS"} />
      </div>

      {isEmpty ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <FiShoppingBag className="w-12 h-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-700 mb-2">
            Your cart is empty
          </h3>
          <p className="text-gray-500 mb-6">
            Please add some items to your cart
          </p>
          <Link
            to="/collection"
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg"
          >
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4 text-gray-700">
          
          {/* Subtotal */}
          <div className="flex justify-between border-b pb-2">
            <p>Subtotal</p>
            <p>{currency}{subtotal.toFixed(2)}</p>
          </div>

          {/* Discount */}
          {discount > 0 && (
            <div className="flex justify-between text-green-600 border-b pb-2">
              <p>Discount</p>
              <p>- {currency}{discount.toFixed(2)}</p>
            </div>
          )}

          {/* Shipping */}
          <div className="flex justify-between border-b pb-2">
            <p>Shipping Fee</p>
            <p>{currency}{delivery_fee.toFixed(2)}</p>
          </div>

          {/* Final Total */}
          <div className="flex justify-between pt-2">
            <p className="text-lg font-semibold">Total</p>
            <p className="text-lg font-bold text-indigo-600">
              {currency}{finalTotal.toFixed(2)}
            </p>
          </div>

        </div>
      )}
    </div>
  );
};

export default CartTotal;