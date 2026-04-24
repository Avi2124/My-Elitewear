import React from "react";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";

const ProductsItem = ({
  id,
  image,
  name,
  price,
  averageRating = 0,
  reviewCount = 0,
}) => {
  const images = Array.isArray(image) ? image : [image];

  const handleClick = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <Link
      to={`/product/${id}`}
      onClick={handleClick}
      className="group overflow-hidden rounded-lg border transition-all duration-300 hover:shadow-md"
    >
      <div className="relative h-64 overflow-hidden bg-white">
        <Swiper spaceBetween={0} slidesPerView={1}>
          {images.map((img, idx) => (
            <SwiperSlide key={idx}>
              <img
                src={img}
                alt={`${name} - ${idx + 1}`}
                loading="lazy"
                className="h-64 w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      <div className="p-4">
        <h3 className="mb-1 text-base font-semibold text-gray-900 transition-colors group-hover:text-primary">
          {name}
        </h3>

        <span className="text-sm font-medium text-gray-700">₹{price}</span>

        <div className="mt-2 flex items-center gap-2">
          <div className="flex text-sm">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={
                  star <= Math.round(averageRating)
                    ? "text-yellow-400"
                    : "text-gray-300"
                }
              >
                ★
              </span>
            ))}
          </div>

          <span className="text-xs text-gray-500">
            {averageRating > 0 ? averageRating.toFixed(1) : "0.0"} ({reviewCount})
          </span>
        </div>
      </div>
    </Link>
  );
};

export default ProductsItem;