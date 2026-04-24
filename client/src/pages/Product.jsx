import React, { useContext, useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { ShopContext } from "../context/ShopContext";
import RelatedProducts from "../components/RelatedProducts";

const Product = () => {
  const { productId } = useParams();
  const { products, currency, addToCart, token, backendUrl, getProductsData } =
    useContext(ShopContext);

  const [productData, setProductData] = useState(null);
  const [image, setImage] = useState("");
  const [size, setSize] = useState("");
  const [activeTab, setActiveTab] = useState("description");
  const [sizeError, setSizeError] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showAddedMessage, setShowAddedMessage] = useState(false);

  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);
  const [averageRating, setAverageRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);

  const [canReview, setCanReview] = useState(false);
  const [checkingReviewPermission, setCheckingReviewPermission] =
    useState(false);

  const productImageRef = useRef(null);
  const cartIconRef = useRef(null);

  useEffect(() => {
    const item = products.find((p) => p._id === productId);
    if (item) {
      setProductData(item);
      setImage(item.image[0]);
      setAverageRating(item.averageRating || 0);
      setReviewCount(item.reviewCount || 0);
    }
  }, [productId, products]);

  const fetchReviews = async () => {
    try {
      const response = await axios.get(
        backendUrl + `/api/review/product/${productId}`,
      );

      if (response.data.success) {
        setReviews(response.data.reviews || []);
        setAverageRating(response.data.averageRating || 0);
        setReviewCount(response.data.reviewCount || 0);
      } else {
        toast.error(response.data.message || "Failed to fetch reviews");
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to fetch reviews");
    }
  };

  const checkCanReview = async () => {
    if (!token) {
      setCanReview(false);
      return;
    }

    try {
      setCheckingReviewPermission(true);

      const response = await axios.get(
        backendUrl + `/api/review/can-review/${productId}`,
        {
          headers: { token },
        },
      );

      if (response.data.success) {
        setCanReview(response.data.canReview);
      } else {
        setCanReview(false);
      }
    } catch (error) {
      console.log(error);
      setCanReview(false);
    } finally {
      setCheckingReviewPermission(false);
    }
  };

  useEffect(() => {
    if (productId) {
      fetchReviews();
    }
  }, [productId]);

  useEffect(() => {
    if (productId && token) {
      checkCanReview();
    } else {
      setCanReview(false);
    }
  }, [productId, token]);

  const handleAddToCart = () => {
    if (!size) {
      setSizeError(true);
      return;
    }

    setSizeError(false);
    addToCart(productData._id, size);
    animateAddToCart();

    setShowAddedMessage(true);
    setTimeout(() => setShowAddedMessage(false), 2000);
  };

  const handleAddReview = async (e) => {
    e.preventDefault();

    if (!token) {
      toast.error("Please login first");
      return;
    }

    if (!canReview) {
      toast.error(
        "You can review this product only after purchasing it and once it is delivered",
      );
      return;
    }

    if (!comment.trim()) {
      toast.error("Please write a review comment");
      return;
    }

    try {
      setReviewLoading(true);

      const response = await axios.post(
        backendUrl + "/api/review/add",
        {
          productId,
          rating,
          comment,
        },
        {
          headers: { token },
        },
      );

      if (response.data.success) {
        toast.success("Review added successfully");
        setComment("");
        setRating(5);
        await fetchReviews();
        await checkCanReview();
        await getProductsData();
      } else {
        toast.error(response.data.message || "Failed to add review");
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setReviewLoading(false);
    }
  };

  const animateAddToCart = () => {
    if (isAnimating) return;

    setIsAnimating(true);

    const img = productImageRef.current;
    const icon = cartIconRef.current;

    if (!img || !icon) {
      setIsAnimating(false);
      return;
    }

    const from = img.getBoundingClientRect();
    const to = icon.getBoundingClientRect();

    const flyingImg = document.createElement("img");
    flyingImg.src = image;
    flyingImg.style.position = "fixed";
    flyingImg.style.width = "50px";
    flyingImg.style.height = "50px";
    flyingImg.style.borderRadius = "4px";
    flyingImg.style.objectFit = "cover";
    flyingImg.style.zIndex = "9999";
    flyingImg.style.pointerEvents = "none";
    flyingImg.style.left = `${from.left + from.width / 2 - 25}px`;
    flyingImg.style.top = `${from.top}px`;
    flyingImg.style.transition = "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)";

    document.body.appendChild(flyingImg);

    requestAnimationFrame(() => {
      flyingImg.style.left = `${to.left + to.width / 2 - 25}px`;
      flyingImg.style.top = `${to.top}px`;
      flyingImg.style.width = "20px";
      flyingImg.style.height = "20px";
      flyingImg.style.opacity = "0.7";
    });

    setTimeout(() => {
      flyingImg.remove();
      setIsAnimating(false);
    }, 500);
  };

  if (!productData) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-orange-500" />
      </div>
    );
  }

  const {
    name,
    category,
    price,
    image: images,
    description,
    sizes,
    subCategory,
  } = productData;

  return (
    <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {showAddedMessage && (
        <div className="animate-bounce fixed left-1/2 top-1/2 z-50 flex -translate-x-1/2 -translate-y-1/2 transform items-center rounded-lg bg-green-500 px-6 py-3 text-white shadow-lg">
          <svg
            className="mr-2 h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M5 13l4 4L19 7"
            />
          </svg>
          <span className="font-bold">🛍️! Added to cart</span>
        </div>
      )}

      <div className="flex flex-col gap-12 lg:flex-row">
        <div className="flex flex-1 flex-col-reverse gap-6 lg:flex-row">
          <div className="scrollbar-hide flex gap-3 overflow-x-auto lg:w-24 lg:flex-col">
            {images.map((img, i) => (
              <div
                key={i}
                onClick={() => setImage(img)}
                className={`h-20 w-20 cursor-pointer overflow-hidden rounded-md border-2 transition-all lg:h-24 lg:w-full ${
                  image === img ? "border-orange-500" : "border-transparent"
                }`}
              >
                <img
                  src={img}
                  alt={name}
                  className="h-full w-full object-cover"
                />
              </div>
            ))}
          </div>

          <div className="flex-1 overflow-hidden rounded-xl bg-gray-50">
            <img
              ref={productImageRef}
              src={image}
              alt={name}
              className="aspect-square max-h-[600px] w-full object-contain"
            />
          </div>
        </div>

        <div className="flex-1 lg:max-w-md xl:max-w-lg">
          <div className="sticky top-24">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-gray-900">{name}</h1>
              <span className="rounded bg-orange-100 px-2.5 py-0.5 text-xs font-medium text-orange-800">
                {category}
              </span>
            </div>

            <div className="mt-3 flex items-center">
              <div className="flex text-yellow-400">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    className={`h-5 w-5 ${
                      star <= Math.round(averageRating)
                        ? "text-yellow-400"
                        : "text-gray-300"
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              <span className="ml-2 text-sm text-gray-500">
                ({reviewCount} reviews)
              </span>
            </div>

            <p className="mt-6 text-3xl font-bold text-gray-900">
              {currency}
              {price.toLocaleString()}
            </p>

            <p className="mt-4 text-gray-600">{description}</p>

            <div className="mt-8">
              <div className="flex justify-between text-sm font-medium">
                <span>Select Size</span>
                {sizeError && (
                  <span className="text-red-500">Please select a size</span>
                )}
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {sizes.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setSize(s);
                      setSizeError(false);
                    }}
                    className={`rounded-md border px-4 py-2 text-sm font-medium ${
                      s === size
                        ? "border-orange-500 bg-orange-500 text-white"
                        : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleAddToCart}
              className="mt-8 flex w-full items-center justify-center rounded-md bg-gray-900 px-6 py-3 text-white transition hover:bg-gray-800"
            >
              <svg
                ref={cartIconRef}
                className="mr-2 h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4m1.6 8L5.4 5M7 13l-1.5 7h13M9 20a1 1 0 100 2 1 1 0 000-2zm8 0a1 1 0 100 2 1 1 0 000-2z"
                />
              </svg>
              ADD TO CART
            </button>

            <div className="mt-8 space-y-4 border-t border-gray-200 pt-6 text-sm text-gray-500">
              {[
                "100% Original Products",
                "Cash On Delivery available",
                "Easy 7-day returns & exchanges",
              ].map((text, i) => (
                <div key={i} className="flex items-start">
                  <svg
                    className="h-5 w-5 flex-shrink-0 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <p className="ml-3">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-16">
        <nav className="-mb-px flex border-b border-gray-200">
          {["description", "reviews"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`border-b-2 px-6 py-4 text-sm font-medium ${
                activeTab === tab
                  ? "border-orange-500 text-orange-600"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
              }`}
            >
              {tab === "reviews"
                ? `Reviews (${reviewCount})`
                : "Description"}
            </button>
          ))}
        </nav>

        <div className="py-8">
          {activeTab === "description" ? (
            <div className="prose prose-sm text-gray-500">
              <p>{description}</p>
              <p className="mt-4">
                This product is crafted with care and designed for both comfort
                and style. Explore its features, choose your size, and check
                out customer reviews before placing your order.
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {checkingReviewPermission ? (
                <div className="rounded-xl border bg-white p-6 shadow-sm text-gray-500">
                  Checking review eligibility...
                </div>
              ) : canReview ? (
                <div className="rounded-xl border bg-white p-6 shadow-sm">
                  <h3 className="mb-4 text-xl font-semibold">Write a Review</h3>

                  <form onSubmit={handleAddReview} className="space-y-4">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Rating
                      </label>
                      <div className="flex cursor-pointer gap-1 text-3xl">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span
                            key={star}
                            onClick={() => setRating(star)}
                            className={
                              star <= rating
                                ? "text-yellow-400"
                                : "text-gray-300"
                            }
                          >
                            ★
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Comment
                      </label>
                      <textarea
                        rows="4"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Write your review here..."
                        className="w-full rounded-lg border px-4 py-3 outline-none focus:ring-2 focus:ring-orange-400"
                      />
                    </div>

                    {/* <button
                      type="submit"
                      disabled={reviewLoading}
                      className="rounded-lg bg-orange-600 px-6 py-2.5 text-white transition hover:bg-orange-700 disabled:opacity-60"
                    >
                      {reviewLoading ? "Submitting..." : "Submit Review"}
                    </button> */}
                  </form>
                </div>
              ) : null}

              <div className="space-y-4">
                {reviews.length > 0 ? (
                  reviews.map((review) => (
                    <div
                      key={review._id}
                      className="flex flex-col gap-2 rounded-xl border bg-gray-50 p-4"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="font-semibold text-gray-800">
                            {review.name}
                          </p>
                          <div className="flex text-sm text-yellow-400">
                            {"★".repeat(review.rating)}
                            {"☆".repeat(5 - review.rating)}
                          </div>
                        </div>

                        {/* <div className="text-sm text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString(
                            "en-GB",
                          )}
                        </div> */}
                      </div>

                      <p className="text-gray-700">{review.comment}</p>
                    </div>
                  ))
                ) : (
                  <div className="py-12 text-center text-gray-500">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M8 10h8M8 14h5m-7 6h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <h3 className="mt-2 text-lg font-medium text-gray-900">
                      No reviews yet
                    </h3>
                    <p className="mt-1 text-sm">
                      Be the first to review this product
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-16">
        <h2 className="mb-8 text-2xl font-bold text-gray-900">
          You may also like
        </h2>
        <RelatedProducts category={category} subCategory={subCategory} />
      </div>
    </div>
  );
};

export default Product;