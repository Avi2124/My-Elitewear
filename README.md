# 🛍️ Elitewear - Perfect Store with Luxury

## 📦 Tech Stack

- **Frontend**: React.js, Tailwind CSS, Swiper.js
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose)
- **Authentication**: JWT (JSON Web Tokens), Bcrypt
- **Payments**: Razorpay, Stripe, Cash on Delivery
- **Image Handling**: Cloudinary / Local (based on configuration)
- **Deployment**: Vercel

---

## ✨ Features

### 👤 User Side
- ✅ Secure User Registration & Login
- ✅ JWT Authentication
- ✅ Product Search Bar
- ✅ Filter by:
  - Category
  - Subcategory
  - Price Range
  - Latest / Relevance
- ✅ View product details
- ✅ Related Product Suggestions
- ✅ Add to Cart
- ✅ Checkout Process
- ✅ Multiple Payment Options:
  - Razorpay
  - Stripe
  - Cash on Delivery
- ✅ View Order History

### 🔐 Admin Panel
- ✅ Secure Admin Login
- ✅ Dashboard with analytics (optional)
- ✅ Manage:
  - Products (CRUD)
  - Categories & Subcategories
  - Orders
  - Users
- ✅ Product Search, Filter, Sort
- ✅ Update Order Status

---

## 📂 Project Structure

```

/client           → React frontend
/server           → Express backend
/models           → Mongoose models
/routes           → API endpoints
/controllers      → Business logic
/context          → React global state (ShopContext)

````

## 🔧 Installation

### 🖥️ Clone the repo

```bash
git clone https://github.com/yourusername/my-elitewear.git
cd myelitewear
````

### 🚀 Backend Setup

```bash
cd server
npm install
.env sample 
# - MANGODB_URI=""
# - CLOUDINARY_API_KEY=""
# - CLOUDINARY_SECRET_KEY=""
# - CLOUDINARY_NAME=""
# - JWT_SECRET=""
# - ADMIN_EMAIL=
# - ADMIN_PASSWORD=
# - STRIPE_SECRET_KEY=""
# - STRIPE_PUBLISHABLE_KEY=""
# - RAZORPAY_KEY_SECRET=
# - RAZORPAY_KEY_ID=

npm run dev
```

### 💻 Frontend Setup

```bash
cd client
npm install
npm start
```

## ✅ Future Improvements

* User address book
* Email notifications
* Wishlist & Recently viewed
* Progressive Web App (PWA)

---
