
import { useEffect, useState } from "react";
import "./App.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8083";

const apiFetch = (url, options = {}) => {
  const token = localStorage.getItem("token");

  return fetch(`${API_URL}${url}`, {
    ...options,
    headers: {
      ...options.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
};

function App() {
  // AUTHENTICATION
  const [auth, setAuth] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginMessage, setLoginMessage] = useState("");

  // REGISTRATION
  const [isRegistering, setIsRegistering] = useState(false);
  const [registerData, setRegisterData] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "CUSTOMER",
  });

  // APPLICATION DATA
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [sellerOrders, setSellerOrders] = useState([]);
  const [sellerDashboard, setSellerDashboard] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [view, setView] = useState("customer");

  const [loading, setLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [ordering, setOrdering] = useState(false);
  const [addingProduct, setAddingProduct] = useState(false);

  // EDIT PRODUCT
  const [editingProduct, setEditingProduct] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    category: "",
    imageUrl: "",
  });
  const [updatingProduct, setUpdatingProduct] = useState(false);

  // REVIEW DATA
  const [reviewRatings, setReviewRatings] = useState({});
  const [reviewComments, setReviewComments] = useState({});
  const [reviewSubmitting, setReviewSubmitting] = useState({});
  const [reviewMessage, setReviewMessage] = useState("");

  const userId = auth?.id;
const sellerId = sellerDashboard?.seller?.id;

  // LOGIN
  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      setLoginLoading(true);
      setLoginMessage("");

      const response = await fetch(`${API_URL}/api/users/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      if (!data.token) {
        throw new Error("Login response did not contain a JWT token");
      }

      const loggedInUser = {
        id: data.id,
        fullName: data.fullName,
        email: data.email,
        role: data.role,
      };

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(loggedInUser));

      setAuth(loggedInUser);
      setPassword("");
    } catch (error) {
      console.error(error);
      setLoginMessage(error.message || "Unable to login.");
    } finally {
      setLoginLoading(false);
    }
  };

  // REGISTER
  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      setLoginLoading(true);
      setLoginMessage("");

      const response = await fetch(`${API_URL}/api/users/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(registerData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      setLoginMessage("Registration successful! Please log in.");
      setIsRegistering(false);
      setEmail(registerData.email);
      setPassword("");

      setRegisterData({
        fullName: "",
        email: "",
        password: "",
        role: "CUSTOMER",
      });
    } catch (error) {
      console.error(error);
      setLoginMessage(error.message || "Unable to register.");
    } finally {
      setLoginLoading(false);
    }
  };

  // LOGOUT
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setAuth(null);
    setProducts([]);
    setSelectedProduct(null);
    setCart([]);
    setOrders([]);
    setSellerOrders([]);
    setSellerDashboard(null);
    setReviews([]);
    setView("customer");
    setMessage("");
    setReviewMessage("");
    setLoginMessage("");
    setIsRegistering(false);
    setEditingProduct(null);
  };

  // LOAD CART
  const loadCart = async () => {
    try {
      const response = await apiFetch(`/api/cart/${userId}`);

      if (!response.ok) {
        throw new Error("Cart loading failed");
      }

      setCart(await response.json());
    } catch (error) {
      console.error(error);
    }
  };

  // LOAD PRODUCTS
  const loadProducts = async () => {
    try {
      const response = await apiFetch("/api/products");

      if (!response.ok) {
        throw new Error("Products loading failed");
      }

      setProducts(await response.json());
    } catch (error) {
      console.error(error);
    }
  };

  // LOAD CUSTOMER ORDERS
  const loadOrders = async () => {
    try {
      setOrdersLoading(true);

      const response = await apiFetch(`/api/orders/user/${userId}`);

      if (!response.ok) {
        throw new Error("Orders loading failed");
      }

      setOrders(await response.json());
    } catch (error) {
      console.error(error);
    } finally {
      setOrdersLoading(false);
    }
  };

  // LOAD REVIEWS
 
const loadReviews = async (targetSellerId) => {
  if (!targetSellerId) {
    setReviews([]);
    return;
  }

  try {
    const response = await apiFetch(
      `/api/reviews/seller/${targetSellerId}`
    );

    if (!response.ok) {
      throw new Error("Reviews loading failed");
    }

    const data = await response.json();
    setReviews(Array.isArray(data) ? data : []);
  } catch (error) {
    console.error(error);
  }
};

  // SUBMIT CUSTOMER REVIEW
 
const submitReview = async (order) => {
  const rating = Number(reviewRatings[order.id] || 0);
  const comment = (reviewComments[order.id] || "").trim();

  if (rating < 1 || rating > 5) {
    setReviewMessage("Please select a rating between 1 and 5 stars.");
    return;
  }

  if (!comment) {
    setReviewMessage("Please enter a review comment.");
    return;
  }

  const orderedProduct = products.find(
    (product) => Number(product.id) === Number(order.productId)
  );

  const reviewSellerId = orderedProduct?.sellerId;

  if (!reviewSellerId) {
    setReviewMessage("Unable to identify the seller for this order.");
    return;
  }

  try {
    setReviewSubmitting((previous) => ({
      ...previous,
      [order.id]: true,
    }));

    setReviewMessage("");

    const response = await apiFetch("/api/reviews", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId,
        sellerId: reviewSellerId,
        rating,
        comment,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Review submission failed");
    }

    setReviewMessage(
      `Thank you! Your review for Order #${order.id} was submitted.`
    );

    setReviewRatings((previous) => ({
      ...previous,
      [order.id]: 0,
    }));

    setReviewComments((previous) => ({
      ...previous,
      [order.id]: "",
    }));

    await loadReviews(reviewSellerId);

  } catch (error) {
    console.error(error);
    setReviewMessage(error.message || "Unable to submit review.");
  } finally {
    setReviewSubmitting((previous) => ({
      ...previous,
      [order.id]: false,
    }));
  }
};


  // LOAD SELLER DASHBOARD
  
// LOAD SELLER DASHBOARD
const loadSellerDashboard = async () => {
  try {
    setDashboardLoading(true);
    setMessage("");

    // First, load the logged-in seller's dashboard
    const dashboardResponse = await apiFetch(
      "/api/sellers/dashboard"
    );

    if (!dashboardResponse.ok) {
      throw new Error("Seller dashboard loading failed");
    }

    const dashboardData = await dashboardResponse.json();

    // Get the actual store ID
    const actualSellerId = dashboardData.seller.id;

    // Now load orders using the actual store ID
    const ordersResponse = await apiFetch(
      `/api/orders/seller/${actualSellerId}`
    );

    if (!ordersResponse.ok) {
      throw new Error("Seller orders loading failed");
    }

    setSellerDashboard(dashboardData);
setSellerOrders(await ordersResponse.json());

await loadReviews(actualSellerId);

  } catch (error) {
    console.error(error);
    setMessage("Unable to load seller dashboard.");
  } finally {
    setDashboardLoading(false);
  }
};

  
// ADD PRODUCT
const addProduct = async (e) => {
  e.preventDefault();

  const formData = new FormData(e.target);

  const newProduct = {
    name: formData.get("name"),
    description: formData.get("description"),
    price: Number(formData.get("price")),
    stock: Number(formData.get("stock")),
    category: formData.get("category"),
    imageUrl: formData.get("imageUrl"),
    sellerId: sellerDashboard?.seller?.id,
  };

  if (!newProduct.sellerId) {
    setMessage("Seller information is not loaded. Please refresh.");
    return;
  }

  try {
    setAddingProduct(true);
    setMessage("");

    const response = await apiFetch("/api/products", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newProduct),
    });

    if (!response.ok) {
      throw new Error(await response.text());
    }

    e.target.reset();

    await loadProducts();
    await loadSellerDashboard();

    setMessage("Product added successfully!");
  } catch (error) {
    console.error(error);
    setMessage("Unable to add product. Please check the details.");
  } finally {
    setAddingProduct(false);
  }
};


  // CANCEL EDIT
  const cancelEdit = () => {
    setEditingProduct(null);

    setEditForm({
      name: "",
      description: "",
      price: "",
      stock: "",
      category: "",
      imageUrl: "",
    });
  };

  // DELETE PRODUCT
  const deleteProduct = async (productId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmed) return;

    try {
      setMessage("");

      const response = await apiFetch(`/api/products/${productId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      if (editingProduct?.id === productId) {
        cancelEdit();
      }

      if (selectedProduct?.id === productId) {
        setSelectedProduct(null);
      }

      await loadProducts();
      await loadSellerDashboard();

      setMessage("Product deleted successfully!");
    } catch (error) {
      console.error(error);
      setMessage("Unable to delete product.");
    }
  };

  // UPDATE SELLER ORDER STATUS
  const updateSellerOrderStatus = async (orderId, status) => {
    try {
      const response = await apiFetch(
        `/api/orders/${orderId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update order status");
      }

      setMessage(`Order #${orderId} updated to ${status}`);

      await loadSellerDashboard();
      await loadOrders();
    } catch (error) {
      console.error(error);
      setMessage(error.message);
    }
  };

  // INITIAL DATA
  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    setLoading(true);

    Promise.all([
  loadProducts(),
  loadCart(),
  loadOrders(),
]).finally(() => {
      setLoading(false);
    });
  }, [auth?.id]);

  // OPEN SELLER DASHBOARD
  
const openSellerDashboard = async () => {
  setView("seller");
  await loadSellerDashboard();
};


  // ADD TO CART
  const addToCart = async (productId) => {
    try {
      const response = await apiFetch("/api/cart/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          productId,
          quantity: 1,
        }),
      });

      if (!response.ok) {
        throw new Error("Add to cart failed");
      }

      setMessage("Product added to cart!");
      await loadCart();
    } catch (error) {
      console.error(error);
      setMessage("Unable to add product.");
    }
  };

  // REMOVE FROM CART
  const removeFromCart = async (productId) => {
    try {
      const response = await apiFetch(
        `/api/cart/${userId}/product/${productId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Remove failed");
      }

      setMessage("Product removed from cart.");
      await loadCart();
    } catch (error) {
      console.error(error);
      setMessage("Unable to remove product.");
    }
  };

  // CLEAR CART
  const clearCart = async () => {
    try {
      const response = await apiFetch(
        `/api/cart/${userId}/clear`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Clear cart failed");
      }

      setMessage("Cart cleared successfully.");
      await loadCart();
    } catch (error) {
      console.error(error);
      setMessage("Unable to clear cart.");
    }
  };

  // PLACE ORDER
  const placeOrder = async () => {
    if (cart.length === 0) {
      setMessage("Your cart is empty.");
      return;
    }

    try {
      setOrdering(true);
      setMessage("");

      const response = await apiFetch(
        `/api/orders/place/${userId}`,
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        throw new Error(await response.text());
      }

      await response.json();

      setMessage("Order placed successfully!");

      await loadCart();
      await loadProducts();
      await loadOrders();
    } catch (error) {
      console.error(error);
      setMessage(
        "Unable to place order. Please check stock and try again."
      );
    } finally {
      setOrdering(false);
    }
  };

  // CALCULATIONS
  const totalAmount = cart.reduce((total, item) => {
    const product = products.find(
      (p) => p.id === item.productId
    );

    return total + (
      product ? product.price * item.quantity : 0
    );
  }, 0);

  const sellerProducts = products.filter(
  (product) =>
    Number(product.sellerId) ===
    Number(sellerDashboard?.seller?.id)
);

  const averageRating = reviews.length
    ? reviews.reduce(
        (total, review) => total + Number(review.rating || 0),
        0
      ) / reviews.length
    : 0;

  const trustScore = (averageRating / 5) * 100;

  // RELATED PRODUCTS
  const relatedProducts = selectedProduct
    ? products
        .filter(
          (product) =>
            product.id !== selectedProduct.id &&
            String(product.category || "").trim().toLowerCase() ===
              String(selectedProduct.category || "").trim().toLowerCase()
        )
        .slice(0, 4)
    : [];

  // OPEN A PRODUCT
  const openProduct = (product) => {
    setSelectedProduct(product);
    setMessage("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // LOGIN AND REGISTRATION SCREEN
  if (!auth) {
    return (
      <div className="app auth-layout">
        <header className="navbar">
          <div className="navbar-brand">
            <h1 className="logo">
              Local<span>Kart</span>
              <small>DISCOVER LOCAL. SHOP DIFFERENT.</small>
            </h1>
          </div>

          <div className="navbar-label">
            A MARKETPLACE FOR EVERYONE
          </div>
        </header>

        <main className="auth-page">
          <section className="auth-card">
            <div className="auth-brand-icon">✦</div>

            <p className="auth-eyebrow">
              YOUR LOCAL MARKETPLACE
            </p>

            <h2>
              {isRegistering ? "Create Account" : "Welcome Back"}
            </h2>

            <p className="auth-description">
              {isRegistering
                ? "Join LocalKart and discover something special."
                : "Sign in to explore products from trusted local stores."}
            </p>

            {loginMessage && (
              <p className="message">{loginMessage}</p>
            )}

            {isRegistering ? (
              <form className="auth-form" onSubmit={handleRegister}>
                <input
                  type="text"
                  placeholder="Full Name"
                  value={registerData.fullName}
                  onChange={(e) =>
                    setRegisterData({
                      ...registerData,
                      fullName: e.target.value,
                    })
                  }
                  required
                />

                <input
                  type="email"
                  placeholder="Email Address"
                  value={registerData.email}
                  onChange={(e) =>
                    setRegisterData({
                      ...registerData,
                      email: e.target.value,
                    })
                  }
                  required
                />

                <input
                  type="password"
                  placeholder="Password (minimum 6 characters)"
                  value={registerData.password}
                  onChange={(e) =>
                    setRegisterData({
                      ...registerData,
                      password: e.target.value,
                    })
                  }
                  minLength={6}
                  required
                />

                <select
                  value={registerData.role}
                  onChange={(e) =>
                    setRegisterData({
                      ...registerData,
                      role: e.target.value,
                    })
                  }
                >
                  <option value="CUSTOMER">Customer</option>
                  <option value="SELLER">Seller</option>
                </select>

                <button type="submit" disabled={loginLoading}>
                  {loginLoading ? "Creating Account..." : "Create Account"}
                </button>

                <p className="auth-switch">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setIsRegistering(false);
                      setLoginMessage("");
                    }}
                  >
                    Login
                  </button>
                </p>
              </form>
            ) : (
              <form className="auth-form" onSubmit={handleLogin}>
                <input
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />

                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />

                <button type="submit" disabled={loginLoading}>
                  {loginLoading ? "Logging in..." : "Login to LocalKart"}
                </button>

                <p className="auth-switch">
                  Don't have an account?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setIsRegistering(true);
                      setLoginMessage("");
                    }}
                  >
                    Register
                  </button>
                </p>
              </form>
            )}

            <div className="auth-footer">
              QUALITY · COMMUNITY · TRUST
            </div>
          </section>
        </main>

        <footer>
          <h2>LocalKart</h2>
          <p>Empowering Local Businesses, Connecting Communities.</p>
          <p>© 2026 LocalKart. All rights reserved.</p>
        </footer>
      </div>
    );
  }

  // SELLER DASHBOARD
  if (view === "seller") {
    return (
      <div className="app">
        <header className="navbar">
          <h1 className="logo">
            Local<span>Kart</span>
          </h1>

          <nav>
            <button onClick={() => setView("customer")}>
              Customer Home
            </button>

            <button onClick={loadSellerDashboard}>
              Refresh Dashboard
            </button>

            <button onClick={logout}>
              Logout
            </button>
          </nav>
        </header>

        <main className="seller-dashboard">
          <div className="dashboard-heading">
            <div>
              <p className="tagline">SELLER CONTROL CENTER</p>
              <h2>Seller Dashboard</h2>
              <p>Manage your store and keep track of your business.</p>
            </div>

            <button
              className="dashboard-back"
              onClick={() => setView("customer")}
            >
              ← Back to Shopping
            </button>
          </div>

          {message && <p className="message">{message}</p>}

          {dashboardLoading ? (
            <p>Loading seller dashboard...</p>
          ) : sellerDashboard ? (
            <>
              <div className="seller-welcome">
                <div>
                  <h2>
                    Welcome, {sellerDashboard.seller.ownerName}!
                  </h2>

                  <p>
                    {sellerDashboard.seller.storeName} ·{" "}
                    {sellerDashboard.seller.city},{" "}
                    {sellerDashboard.seller.state}
                  </p>
                </div>

                <div className="store-icon">🏪</div>
              </div>

              <div className="dashboard-stats">
                <div className="dashboard-stat">
                  <span>📦</span>
                  <p>Total Products</p>
                  <h2>{sellerDashboard.totalProducts}</h2>
                </div>

                <div className="dashboard-stat">
                  <span>⭐</span>
                  <p>Customer Reviews</p>
                  <h2>{reviews.length}</h2>
                </div>

                <div className="dashboard-stat">
                  <span>🌟</span>
                  <p>Average Rating</p>
                  <h2>{averageRating.toFixed(1)}/5</h2>
                </div>

                <div className="dashboard-stat">
                  <span>🏆</span>
                  <p>Trust Score</p>
                  <h2>{trustScore.toFixed(0)}%</h2>
                </div>
              </div>

              <section className="dashboard-panel">
                <h2>Store Information</h2>

                <div className="store-details">
                  <p><strong>Store:</strong> {sellerDashboard.seller.storeName}</p>
                  <p><strong>Owner:</strong> {sellerDashboard.seller.ownerName}</p>
                  <p><strong>Email:</strong> {sellerDashboard.seller.email}</p>
                  <p><strong>Phone:</strong> {sellerDashboard.seller.phone}</p>
                  <p>
                    <strong>Location:</strong>{" "}
                    {sellerDashboard.seller.city},{" "}
                    {sellerDashboard.seller.state} -{" "}
                    {sellerDashboard.seller.postalCode}
                  </p>
                  <p><strong>About:</strong> {sellerDashboard.seller.description}</p>
                </div>
              </section>

              <section className="dashboard-panel">
                <h2>➕ Add New Product</h2>

                <form className="add-product-form" onSubmit={addProduct}>
                  <input name="name" placeholder="Product Name" required />
                  <textarea name="description" placeholder="Product Description" required />
                  <input name="price" type="number" placeholder="Price (₹)" min="0.01" step="0.01" required />
                  <input name="stock" type="number" placeholder="Available Stock" min="0" required />
                  <input name="category" placeholder="Category" required />
                  <input name="imageUrl" type="url" placeholder="Product Image URL" />

                  <button type="submit" disabled={addingProduct}>
                    {addingProduct ? "Adding Product..." : "Add Product"}
                  </button>
                </form>
              </section>

              <section className="dashboard-panel">
                <h2>My Products</h2>

                {sellerProducts.length === 0 ? (
                  <p>No products found for this seller.</p>
                ) : (
                  <div className="product-grid">
                    {sellerProducts.map((product) => (
                      <div className="product-card" key={product.id}>
                        {editingProduct?.id === product.id ? (
                          <>
                            <h3>Edit Product</h3>

                            <form
                              className="add-product-form"
                              onSubmit={updateProduct}
                            >
                              <input
                                name="name"
                                value={editForm.name}
                                onChange={(e) =>
                                  setEditForm({
                                    ...editForm,
                                    name: e.target.value,
                                  })
                                }
                                placeholder="Product Name"
                                required
                              />

                              <textarea
                                name="description"
                                value={editForm.description}
                                onChange={(e) =>
                                  setEditForm({
                                    ...editForm,
                                    description: e.target.value,
                                  })
                                }
                                placeholder="Product Description"
                                required
                              />

                              <input
                                name="price"
                                type="number"
                                value={editForm.price}
                                onChange={(e) =>
                                  setEditForm({
                                    ...editForm,
                                    price: e.target.value,
                                  })
                                }
                                min="0.01"
                                step="0.01"
                                required
                              />

                              <input
                                name="stock"
                                type="number"
                                value={editForm.stock}
                                onChange={(e) =>
                                  setEditForm({
                                    ...editForm,
                                    stock: e.target.value,
                                  })
                                }
                                min="0"
                                required
                              />

                              <input
                                name="category"
                                value={editForm.category}
                                onChange={(e) =>
                                  setEditForm({
                                    ...editForm,
                                    category: e.target.value,
                                  })
                                }
                                required
                              />

                              <input
                                name="imageUrl"
                                type="url"
                                value={editForm.imageUrl}
                                onChange={(e) =>
                                  setEditForm({
                                    ...editForm,
                                    imageUrl: e.target.value,
                                  })
                                }
                                placeholder="Product Image URL"
                              />

                              <button
                                type="submit"
                                disabled={updatingProduct}
                              >
                                {updatingProduct
                                  ? "Updating..."
                                  : "Save Changes"}
                              </button>

                              <button
                                type="button"
                                className="cancel-edit-button"
                                onClick={cancelEdit}
                              >
                                Cancel
                              </button>
                            </form>
                          </>
                        ) : (
                          <>
                            <div className="product-image">
                              <img
                                src={
                                  product.imageUrl ||
                                  "https://placehold.co/600x400?text=Product"
                                }
                                alt={product.name}
                                onError={(e) => {
                                  e.currentTarget.onerror = null;
                                  e.currentTarget.src =
                                    "https://placehold.co/600x400?text=Product";
                                }}
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "contain",
                                  borderRadius: "2px",
                                }}
                              />
                            </div>

                            <h3>{product.name}</h3>
                            <p>{product.description}</p>
                            <p className="category">{product.category}</p>
                            <h3 className="price">₹{product.price}</h3>
                            <p>Available stock: {product.stock}</p>

                            <div className="product-actions">
                              <button
                                className="edit-product-button"
                                onClick={() => {
                                  setEditingProduct(product);

                                  setEditForm({
                                    name: product.name || "",
                                    description: product.description || "",
                                    price: String(product.price ?? ""),
                                    stock: String(product.stock ?? ""),
                                    category: product.category || "",
                                    imageUrl: product.imageUrl || "",
                                  });

                                  setMessage("");
                                }}
                              >
                                Edit
                              </button>

                              <button
                                className="delete-product-button"
                                onClick={() => deleteProduct(product.id)}
                              >
                                Delete
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <section className="dashboard-panel">
                <h2>Customer Orders</h2>

                {sellerOrders.length === 0 ? (
                  <p>No orders received yet.</p>
                ) : (
                  <div className="seller-orders-list">
                    {sellerOrders.map((order) => {
                      const product = products.find(
                        (p) => p.id === order.productId
                      );

                      return (
                        <div className="seller-order-card" key={order.id}>
                          <h3>Order #{order.id}</h3>

                          <p>
                            Product:{" "}
                            {product
                              ? product.name
                              : `Product #${order.productId}`}
                          </p>

                          <p>Quantity: {order.quantity}</p>
                          <p>Total: ₹{Number(order.totalPrice).toFixed(2)}</p>

                          <span className="order-status">{order.status}</span>

                          <div className="order-actions">
                            <select
                              value={order.status}
                              onChange={(e) =>
                                updateSellerOrderStatus(
                                  order.id,
                                  e.target.value
                                )
                              }
                            >
                              <option value="PENDING">Pending</option>
                              <option value="CONFIRMED">Confirmed</option>
                              <option value="SHIPPED">Shipped</option>
                              <option value="DELIVERED">Delivered</option>
                              <option value="CANCELLED">Cancelled</option>
                            </select>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>

              <section className="dashboard-panel">
                <h2>⭐ Customer Reviews</h2>

                {reviews.length === 0 ? (
                  <p>No customer reviews yet.</p>
                ) : (
                  <div className="reviews-list">
                    {reviews.map((review) => (
                      <div className="review-card" key={review.id}>
                        <h3>{"⭐".repeat(Number(review.rating))}</h3>
                        <p>{review.comment}</p>
                        <small>Customer #{review.userId}</small>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </>
          ) : (
            <p>{message || "Dashboard data is not available."}</p>
          )}
        </main>

        <footer>
          <h2>LocalKart</h2>
          <p>Empowering Local Businesses, Connecting Communities.</p>
        </footer>
      </div>
    );
  }

  // CUSTOMER HOMEPAGE
  return (
    <div className="app">
      
<header className="navbar">
  <div className="navbar-brand">
    <a href="#home" className="logo">
      Local<span>Kart</span>
      <small>DISCOVER LOCAL. SHOP DIFFERENT.</small>
    </a>
  </div>

  <nav className="main-navigation">
    <a href="#home">Home</a>
    <a href="#products">Collection</a>

    {auth.role === "CUSTOMER" && (
      <>
        <a href="#cart">My Cart ({cart.length})</a>
        <a href="#orders">My Orders</a>
      </>
    )}

    <a href="#reviews">Reviews</a>
    <a href="#about">About</a>

    {auth.role === "SELLER" && (
      <button
        className="nav-dashboard-button"
        onClick={openSellerDashboard}
      >
        Seller Dashboard
      </button>
    )}

    <button className="nav-logout-button" onClick={logout}>
      Logout
    </button>
  </nav>
</header>


      <section className="hero" id="home">
        <div className="hero-content">
          <p className="tagline">
            THE ART OF SHOPPING LOCAL
          </p>

          <h2>
            Discover Local.
            <br />
            <span>Experience Luxury.</span>
          </h2>

          <p className="hero-description">
            Explore thoughtfully selected products from
            trusted local businesses. Quality, connection
            and community — all in one place.
          </p>

          <a className="shop-button" href="#products">
            Explore Collection <span>→</span>
          </a>

          {auth.fullName && (
            <p className="hero-welcome">
              Welcome back, {auth.fullName}!
            </p>
          )}
        </div>

        <div className="hero-visual">
          <div className="hero-visual-frame">
            <span className="hero-visual-label">
              THE LOCAL COLLECTION
            </span>

            <div className="hero-visual-center">
              <span className="hero-visual-icon">✦</span>
              <h3>Shop with Purpose.</h3>
              <p>Celebrate local craftsmanship.</p>
            </div>

            <span className="hero-visual-bottom">
              QUALITY · COMMUNITY · TRUST
            </span>
          </div>
        </div>
      </section>
      <section className="products-section" id="products">
  <div className="collection-heading">
    <div>
      <p className="section-eyebrow">CURATED FOR YOU</p>
      <h2>Explore Our Collection</h2>
      <p className="subtitle">
        Discover quality products from independent local sellers.
      </p>
    </div>

    <span className="collection-count">
      {products.length} PRODUCTS
    </span>
  </div>

        {message && <p className="message">{message}</p>}

        {loading ? (
          <p>Loading products...</p>
        ) : selectedProduct ? (
          <>
            {/* SELECTED PRODUCT DETAILS */}
            <div className="product-details-card">
              <div>
                <img
                  src={
                    selectedProduct.imageUrl ||
                    "https://placehold.co/600x400?text=Product"
                  }
                  alt={selectedProduct.name}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src =
                      "https://placehold.co/600x400?text=Product";
                  }}
                  style={{
                    width: "100%",
                    maxHeight: "420px",
                    objectFit: "contain",
                    borderRadius: "12px",
                  }}
                />
              </div>

              <div>
                <button
                  type="button"
                  className="dashboard-back"
                  onClick={() => {
                    setSelectedProduct(null);
                    setMessage("");
                  }}
                  style={{ marginBottom: "20px" }}
                >
                  ← Back to Products
                </button>

                <p className="category">{selectedProduct.category}</p>

                <h2>{selectedProduct.name}</h2>

                <h2 className="price">
                  ₹{Number(selectedProduct.price).toLocaleString("en-IN")}
                </h2>

                <h3>Product Description</h3>

                <p style={{ whiteSpace: "pre-wrap", lineHeight: "1.7" }}>
                  {selectedProduct.description ||
                    "No description available."}
                </p>

                <p>
                  <strong>Available Stock:</strong>{" "}
                  {selectedProduct.stock}
                </p>

                {auth.role === "CUSTOMER" && (
                  <button
                    type="button"
                    disabled={selectedProduct.stock <= 0}
                    onClick={() => addToCart(selectedProduct.id)}
                  >
                    {selectedProduct.stock <= 0
                      ? "Out of Stock"
                      : "Add to Cart"}
                  </button>
                )}
              </div>
            </div>

            {/* RELATED PRODUCTS */}
            <section className="related-products">
              <h2>You May Also Like</h2>

              <p className="subtitle">
                More products from the {selectedProduct.category} category
              </p>

              {relatedProducts.length === 0 ? (
                <p>No similar products available right now.</p>
              ) : (
                <div className="product-grid">
                  {relatedProducts.map((product) => (
                    <div
                      className="product-card"
                      key={product.id}
                      onClick={() => openProduct(product)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          openProduct(product);
                        }
                      }}
                      style={{ cursor: "pointer" }}
                    >
                      <div className="product-image">
                        <img
                          src={
                            product.imageUrl ||
                            "https://placehold.co/600x400?text=Product"
                          }
                          alt={product.name}
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src =
                              "https://placehold.co/600x400?text=Product";
                          }}
                        />
                      </div>

                      <h3>{product.name}</h3>

                      <p className="category">{product.category}</p>

                      <h3 className="price">
                        ₹{Number(product.price).toLocaleString("en-IN")}
                      </h3>

                      <p>
                        {product.stock > 0
                          ? "In Stock"
                          : "Out of Stock"}
                      </p>

                      {auth.role === "CUSTOMER" && (
                        <button
                          type="button"
                          disabled={product.stock <= 0}
                          onClick={(e) => {
                            e.stopPropagation();
                            addToCart(product.id);
                          }}
                        >
                          {product.stock <= 0
                            ? "Out of Stock"
                            : "Add to Cart"}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        ) : (
          <div className="product-grid">
            {products.map((product) => (
              <div
                className="product-card"
                key={product.id}
                onClick={() => openProduct(product)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    openProduct(product);
                  }
                }}
                style={{ cursor: "pointer" }}
              >
                <div className="product-image">
                  <img
                    src={
                      product.imageUrl ||
                      "https://placehold.co/600x400?text=Product"
                    }
                    alt={product.name}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src =
                        "https://placehold.co/600x400?text=Product";
                    }}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                      borderRadius: "2px",
                    }}
                  />
                </div>

                <h3>{product.name}</h3>
                <p className="category">{product.category}</p>

                <h3 className="price">
                  ₹{Number(product.price).toLocaleString("en-IN")}
                </h3>

                <p>Stock: {product.stock}</p>

                <p className="view-details-text">
                  Click to view product details
                </p>

                {auth.role === "CUSTOMER" && (
                  <button
                    type="button"
                    disabled={product.stock <= 0}
                    onClick={(e) => {
                      e.stopPropagation();
                      addToCart(product.id);
                    }}
                  >
                    {product.stock <= 0
                      ? "Out of Stock"
                      : "Add to Cart"}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* CUSTOMER CART */}
      {auth.role === "CUSTOMER" && (
        <>
          <section className="cart-section" id="cart">
            <h2>My Shopping Cart</h2>

            {cart.length === 0 ? (
              <p>Your cart is empty. Start shopping!</p>
            ) : (
              <>
                {cart.map((item) => {
                  const product = products.find(
                    (p) => p.id === item.productId
                  );

                  if (!product) return null;

                  return (
                    <div className="cart-item" key={item.id}>
                      <div>
                        <h3>{product.name}</h3>
                        <p>₹{product.price} × {item.quantity}</p>

                        <strong>
                          ₹{(product.price * item.quantity).toFixed(2)}
                        </strong>
                      </div>

                      <button
                        className="remove-button"
                        onClick={() => removeFromCart(item.productId)}
                      >
                        Remove
                      </button>
                    </div>
                  );
                })}

                <h3 className="cart-total">
                  Total: ₹{totalAmount.toFixed(2)}
                </h3>

                <button
                  className="checkout-button"
                  onClick={placeOrder}
                  disabled={ordering || cart.length === 0}
                >
                  {ordering ? "Processing..." : "Place Order"}
                </button>

                <button className="clear-button" onClick={clearCart}>
                  Clear Cart
                </button>
              </>
            )}
          </section>

          {/* CUSTOMER ORDERS */}
          <section className="orders-section" id="orders">
            <h2>My Orders</h2>
            <p className="subtitle">Track your purchases</p>

            {ordersLoading ? (
              <p>Loading your orders...</p>
            ) : orders.length === 0 ? (
              <p>You haven't placed any orders yet.</p>
            ) : (
              <div className="orders-list">
                {orders.map((order) => {
                  const product = products.find(
                    (p) => p.id === order.productId
                  );

                  const isDelivered = order.status === "DELIVERED";

                  return (
                    <div className="order-card" key={order.id}>
                      <h3>Order #{order.id}</h3>

                      <p>
                        Product:{" "}
                        {product
                          ? product.name
                          : `Product #${order.productId}`}
                      </p>

                      <p>Quantity: {order.quantity}</p>
                      <p>Total: ₹{Number(order.totalPrice).toFixed(2)}</p>

                      <p>
                        Date:{" "}
                        {order.createdAt
                          ? new Date(order.createdAt).toLocaleString()
                          : "Not available"}
                      </p>

                      <span
                        className={`order-status ${String(order.status).toLowerCase()}`}
                      >
                        {order.status}
                      </span>

                      {isDelivered && (
                        <div className="review-form">
                          <h3>⭐ Rate Your Experience</h3>
                          <p>How was your experience with this seller?</p>

                          <div className="star-rating">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                className={
                                  Number(reviewRatings[order.id] || 0) >= star
                                    ? "star-button active"
                                    : "star-button"
                                }
                                onClick={() =>
                                  setReviewRatings((previous) => ({
                                    ...previous,
                                    [order.id]: star,
                                  }))
                                }
                              >
                                ★
                              </button>
                            ))}
                          </div>

                          <textarea
                            placeholder="Write your experience..."
                            value={reviewComments[order.id] || ""}
                            onChange={(e) =>
                              setReviewComments((previous) => ({
                                ...previous,
                                [order.id]: e.target.value,
                              }))
                            }
                            maxLength={500}
                          />

                          <button
                            type="button"
                            onClick={() => submitReview(order)}
                            disabled={Boolean(reviewSubmitting[order.id])}
                          >
                            {reviewSubmitting[order.id]
                              ? "Submitting..."
                              : "Submit Review"}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {reviewMessage && (
              <p className="message">{reviewMessage}</p>
            )}

            <button className="refresh-orders" onClick={loadOrders}>
              Refresh Orders
            </button>
          </section>
        </>
      )}

      {/* SELLER RATINGS AND REVIEWS */}
      <section className="dashboard-panel" id="reviews">
        <h2>⭐ Seller Ratings & Reviews</h2>

        <div className="seller-rating-summary">
          <h3>{averageRating.toFixed(1)} / 5 ⭐</h3>
          <p>Average Seller Rating</p>

          <h3>{trustScore.toFixed(0)}%</h3>
          <p>Seller Trust Score</p>
        </div>

        {reviews.length === 0 ? (
          <p>No reviews available yet.</p>
        ) : (
          <div className="reviews-list">
            {reviews.map((review) => (
              <div className="review-card" key={review.id}>
                <h3>{"⭐".repeat(Number(review.rating))}</h3>
                <p>{review.comment}</p>
                <small>Customer #{review.userId}</small>
              </div>
            ))}
          </div>
        )}

        <button onClick={loadReviews}>Refresh Reviews</button>
      </section>

      {/* ABOUT */}
      <section className="about" id="about">
        <h2>Why LocalKart?</h2>

        <p>
          We connect customers with nearby businesses, helping local
          sellers grow and communities thrive.
        </p>
      </section>

      {/* FOOTER */}
      <footer>
        <h2>LocalKart</h2>
        <p>Empowering Local Businesses, Connecting Communities.</p>
        <p>© 2026 LocalKart. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;
