
import { useEffect, useMemo, useState } from "react";
import {
  Home,
  LayoutGrid,
  ShoppingCart,
  ClipboardList,
  UserRound,
  Search,
  MapPin,
  LocateFixed,
  Plus,
  Minus,
  Trash2,
  Heart,
  Truck,
  Leaf,
  Smile,
  ArrowUp,
  X,
  CheckCircle2,
  Menu as MenuIcon,
  ChefHat,
  ArrowLeft,
  PackageCheck,
  Navigation,
  LogOut,
  LockKeyhole,
  ShieldCheck,
  Eye,
  EyeOff,
  Ban,
  Clock,
  AlertTriangle,
} from "lucide-react";
import "./App.css";

const PRODUCTS = [
  {
    id: 1,
    name: "Leche Flan",
    price: 40,
    category: "Flan",
    image: "/yunigabimg/Leche%20Flan.jpg",
  },
  {
    id: 2,
    name: "Yema Cake Cheesy",
    price: 45,
    category: "Cakes",
    image: "/yunigabimg/Yema%20Cake%20Cheesy.jpg",
  },
  {
    id: 3,
    name: "Yema Cake with Caramel Syrup",
    price: 45,
    category: "Cakes",
    image: "/yunigabimg/Yema%20Cake%20with%20Caramel%20Syrup.jpg",
  },
  {
    id: 4,
    name: "Yema Cake Ube",
    price: 45,
    category: "Cakes",
    image: "/yunigabimg/Yema%20Cake%20Ube.jpg",
  },
  {
    id: 5,
    name: "Yema Cake Mocha",
    price: 45,
    category: "Cakes",
    image: "/yunigabimg/Yema%20Cake%20Mocha.jpg",
  },
  {
    id: 6,
    name: "Yema Cake Strawberry",
    price: 45,
    category: "Cakes",
    image: "/yunigabimg/Yema%20Cake%20Strawberry.jpg",
  },
  {
    id: 7,
    name: "Chocolate Moist Cake",
    price: 45,
    category: "Cakes",
    image: "/yunigabimg/Chocolate%20Moist%20Cake.jpg",
  },
];

const PROMO_QUANTITY = 3;
const PROMO_PRICE = 100;
const DELIVERY_FEE = 50;

const ORDER_STATUSES = [
  "Pending",
  "Preparing",
  "Completed",
  "Cancelled",
];

const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "Yunigab123";

const ORDERS_STORAGE_KEY = "yunigab_yummy_sweets_orders_v1";
const CUSTOMER_ACCOUNTS_KEY =
  "yunigab_yummy_sweets_customer_accounts_v1";
const CUSTOMER_SESSION_KEY =
  "yunigab_yummy_sweets_customer_session_v1";

const money = (amount) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 2,
  }).format(amount);

const NAV_ITEMS = [
  { id: "home", label: "Home", icon: Home },
  { id: "menu", label: "Menu", icon: LayoutGrid },
  { id: "cart", label: "Cart", icon: ShoppingCart },
  { id: "orders", label: "Orders", icon: ClipboardList },
  { id: "profile", label: "Profile", icon: UserRound },
];

const CUSTOMER_PAGES = [
  "home",
  "menu",
  "cart",
  "orders",
  "profile",
];

function getCurrentRoute() {
  return window.location.pathname.replace(/\/+$/, "") === "/admin"
    ? "admin"
    : "customer";
}

function loadSavedOrders() {
  try {
    const saved = localStorage.getItem(ORDERS_STORAGE_KEY);

    if (!saved) return [];

    const parsed = JSON.parse(saved);

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function loadCustomerSession() {
  try {
    const saved = localStorage.getItem(CUSTOMER_SESSION_KEY);

    if (!saved) return null;

    const session = JSON.parse(saved);

    if (
      session &&
      typeof session.email === "string" &&
      typeof session.name === "string"
    ) {
      return session;
    }

    return null;
  } catch {
    return null;
  }
}

function loadCustomerAccounts() {
  try {
    const saved = localStorage.getItem(CUSTOMER_ACCOUNTS_KEY);

    if (!saved) return [];

    const accounts = JSON.parse(saved);

    return Array.isArray(accounts) ? accounts : [];
  } catch {
    return [];
  }
}

function calculateSubtotal(items) {
  const totalQuantity = items.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const bundleCount = Math.floor(
    totalQuantity / PROMO_QUANTITY
  );

  let remainingQuantity = totalQuantity % PROMO_QUANTITY;

  const remainingItems = items
    .map((item) => ({ ...item }))
    .sort((a, b) => a.price - b.price);

  let remainingTotal = 0;

  for (const item of remainingItems) {
    const used = Math.min(item.quantity, remainingQuantity);

    remainingTotal += used * item.price;
    remainingQuantity -= used;
  }

  return bundleCount * PROMO_PRICE + remainingTotal;
}

function Brand() {
  return (
    <a
      className="brand"
      href="/"
      aria-label="Yunigab Yummy Sweet's home"
      onClick={(event) => {
        event.preventDefault();

        window.dispatchEvent(
          new CustomEvent("yunigab-navigate", {
            detail: "menu",
          })
        );
      }}
    >
      <span className="brand-icon">
        <ChefHat size={23} />
      </span>

      <span>
        <strong>Yunigab</strong>
        <b>Yummy Sweet’s</b>
        <small>♥ Sweet treats, happy moments ♥</small>
      </span>
    </a>
  );
}

function ProductCard({
  product,
  addToCart,
  favorite,
  toggleFavorite,
}) {
  return (
    <article className="product-card">
      <div className="product-photo-wrap">
        <img
          className="product-photo"
          src={product.image}
          alt={product.name}
          loading="lazy"
          onError={(event) => {
            event.currentTarget.style.visibility = "hidden";
          }}
        />

        <button
          className={`favorite-button ${
            favorite ? "is-favorite" : ""
          }`}
          onClick={() => toggleFavorite(product.id)}
          aria-label={
            favorite ? "Remove from favorites" : "Add to favorites"
          }
        >
          <Heart
            size={18}
            fill={favorite ? "currentColor" : "none"}
          />
        </button>

        {product.id === 1 && (
          <span className="product-tag">Best seller</span>
        )}
      </div>

      <div className="product-info">
        <span className="product-category">{product.category}</span>

        <h3>{product.name}</h3>

        <div className="product-bottom">
          <strong className="product-price">3 FOR ₱100</strong>

          <button
            className="add-button"
            onClick={() => addToCart(product)}
          >
            <Plus size={16} /> Add
          </button>
        </div>

        <div className="heart-divider">
          <span>♥</span>
        </div>
      </div>
    </article>
  );
}

function App() {
  const [page, setPage] = useState(() =>
    getCurrentRoute() === "admin" ? "admin-login" : "menu"
  );

  const [customerSession, setCustomerSession] =
    useState(loadCustomerSession);

  const [customerAuthMode, setCustomerAuthMode] = useState("login");
  const [authName, setAuthName] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authConfirmPassword, setAuthConfirmPassword] =
    useState("");
  const [showCustomerPassword, setShowCustomerPassword] =
    useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);
  const [customerAuthError, setCustomerAuthError] = useState("");
  const [customerAuthMessage, setCustomerAuthMessage] =
    useState("");

  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState(loadSavedOrders);
  const [adminFilter, setAdminFilter] = useState("All");
  const [favorites, setFavorites] = useState([]);

  const [location, setLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState("loading");
  const [locationMessage, setLocationMessage] = useState(
    "Requesting your current location…"
  );

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const [customerName, setCustomerName] = useState(
    () => loadCustomerSession()?.name || ""
  );

  const [phone, setPhone] = useState("");
  const [payment, setPayment] = useState("Cash on Delivery");
  const [notes, setNotes] = useState("");
  const [notice, setNotice] = useState("");

  const [adminAuthenticated, setAdminAuthenticated] =
    useState(false);
  const [adminUsername, setAdminUsername] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [adminLoginError, setAdminLoginError] = useState("");

  const customerAuthenticated = Boolean(customerSession);

  // Only show a customer's own orders in My Orders.
  const customerOrders = useMemo(() => {
    if (!customerSession?.email) return [];

    return orders.filter(
      (order) =>
        order.customerEmail?.toLowerCase() ===
        customerSession.email.toLowerCase()
    );
  }, [orders, customerSession]);

  const cartCount = cart.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const bundleCount = Math.floor(cartCount / PROMO_QUANTITY);
  const remainingCount = cartCount % PROMO_QUANTITY;
  const subtotal = calculateSubtotal(cart);
  const deliveryFee = cartCount > 0 ? DELIVERY_FEE : 0;
  const total = subtotal + deliveryFee;

  const visibleProducts = useMemo(() => {
    const term = search.trim().toLowerCase();

    return PRODUCTS.filter((product) => {
      const matchesCategory =
        category === "All" || product.category === category;

      const matchesSearch = product.name
        .toLowerCase()
        .includes(term);

      return matchesCategory && matchesSearch;
    });
  }, [category, search]);

  const filteredAdminOrders = useMemo(() => {
    if (adminFilter === "All") return orders;

    return orders.filter((order) => order.status === adminFilter);
  }, [orders, adminFilter]);

  const pendingCount = orders.filter(
    (order) => order.status === "Pending"
  ).length;

  const preparingCount = orders.filter(
    (order) => order.status === "Preparing"
  ).length;

  const completedCount = orders.filter(
    (order) => order.status === "Completed"
  ).length;

  const cancelledCount = orders.filter(
    (order) => order.status === "Cancelled"
  ).length;

  useEffect(() => {
    try {
      localStorage.setItem(
        ORDERS_STORAGE_KEY,
        JSON.stringify(orders)
      );
    } catch {
      setNotice("Orders could not be saved in this browser.");
    }
  }, [orders]);

  useEffect(() => {
    const syncOrders = (event) => {
      if (
        event.key !== ORDERS_STORAGE_KEY &&
        event.key !== null
      ) {
        return;
      }

      if (event.newValue === null) {
        setOrders([]);
        return;
      }

      try {
        const updatedOrders = JSON.parse(event.newValue);

        if (Array.isArray(updatedOrders)) {
          setOrders(updatedOrders);
        }
      } catch {
        // Ignore invalid storage data.
      }
    };

    window.addEventListener("storage", syncOrders);

    return () => {
      window.removeEventListener("storage", syncOrders);
    };
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      setMobileMenuOpen(false);
      setCheckoutOpen(false);

      if (getCurrentRoute() === "admin") {
        setPage(adminAuthenticated ? "admin" : "admin-login");
      } else if (!loadCustomerSession()) {
        setPage("customer-auth");
      } else {
        setPage((currentPage) =>
          CUSTOMER_PAGES.includes(currentPage) ? currentPage : "menu"
        );
      }
    };

    const handleCustomNavigation = (event) => {
      goTo(event.detail);
    };

    window.addEventListener("popstate", handlePopState);
    window.addEventListener(
      "yunigab-navigate",
      handleCustomNavigation
    );

    return () => {
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener(
        "yunigab-navigate",
        handleCustomNavigation
      );
    };
  }, [adminAuthenticated]);

  useEffect(() => {
    if (
      customerAuthenticated &&
      getCurrentRoute() !== "admin"
    ) {
      requestLocation();
    }
  }, [customerAuthenticated]);

  useEffect(() => {
    if (!notice) return;

    const timer = window.setTimeout(() => setNotice(""), 2800);

    return () => window.clearTimeout(timer);
  }, [notice]);

  const requestLocation = () => {
    if (!("geolocation" in navigator)) {
      setLocationStatus("error");
      setLocationMessage(
        "This browser does not support location access."
      );
      return;
    }

    setLocationStatus("loading");
    setLocationMessage("Finding your current location…");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const coordinates = { latitude, longitude };

        setLocation(coordinates);
        setLocationMessage("Location found. Getting your address…");

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
          );

          if (!response.ok) {
            throw new Error("Address lookup failed");
          }

          const data = await response.json();

          setLocation({
            ...coordinates,
            address:
              data.display_name ||
              `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`,
          });

          setLocationStatus("success");
          setLocationMessage(
            "Your current delivery location is ready."
          );
        } catch {
          setLocation({
            ...coordinates,
            address: `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`,
          });

          setLocationStatus("success");
          setLocationMessage(
            "Coordinates detected. The readable address could not be loaded."
          );
        }
      },
      (error) => {
        setLocationStatus("error");

        if (error.code === error.PERMISSION_DENIED) {
          setLocationMessage(
            "Location permission was denied. Allow location access in your browser, then tap Detect My Location."
          );
        } else if (error.code === error.TIMEOUT) {
          setLocationMessage(
            "Location request timed out. Please try detecting your location again."
          );
        } else {
          setLocationMessage(
            "Could not detect your location. Check your device location settings and try again."
          );
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  };

  // CUSTOMER REGISTRATION
  const handleCustomerRegister = (event) => {
    event.preventDefault();

    setCustomerAuthError("");
    setCustomerAuthMessage("");

    const name = authName.trim();
    const email = authEmail.trim().toLowerCase();

    if (!name) {
      setCustomerAuthError("Please enter your full name.");
      return;
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setCustomerAuthError("Please enter a valid email address.");
      return;
    }

    if (authPassword.length < 6) {
      setCustomerAuthError(
        "Your password must contain at least 6 characters."
      );
      return;
    }

    if (authPassword !== authConfirmPassword) {
      setCustomerAuthError("Your passwords do not match.");
      return;
    }

    const accounts = loadCustomerAccounts();

    if (
      accounts.some(
        (account) => account.email.toLowerCase() === email
      )
    ) {
      setCustomerAuthError(
        "An account with this email already exists. Please log in."
      );
      return;
    }

    const newAccount = {
      id: `CUST-${Date.now()}`,
      name,
      email,
      password: authPassword,
    };

    try {
      localStorage.setItem(
        CUSTOMER_ACCOUNTS_KEY,
        JSON.stringify([...accounts, newAccount])
      );

      const session = {
        id: newAccount.id,
        name: newAccount.name,
        email: newAccount.email,
      };

      localStorage.setItem(
        CUSTOMER_SESSION_KEY,
        JSON.stringify(session)
      );

      setCustomerSession(session);
      setCustomerName(session.name);
      setAuthName("");
      setAuthEmail("");
      setAuthPassword("");
      setAuthConfirmPassword("");
      setCustomerAuthError("");
      setCustomerAuthMessage("");
      setPage("menu");
      setNotice(
        `Welcome to Yunigab Yummy Sweet’s, ${session.name}!`
      );

      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setCustomerAuthError(
        "Your account could not be saved. Check your browser storage and try again."
      );
    }
  };

  // CUSTOMER LOGIN
  const handleCustomerLogin = (event) => {
    event.preventDefault();

    setCustomerAuthError("");
    setCustomerAuthMessage("");

    const email = authEmail.trim().toLowerCase();

    if (!email || !authPassword) {
      setCustomerAuthError(
        "Please enter your email and password."
      );
      return;
    }

    const account = loadCustomerAccounts().find(
      (item) =>
        item.email.toLowerCase() === email &&
        item.password === authPassword
    );

    if (!account) {
      setCustomerAuthError(
        "Incorrect email or password. Please try again."
      );
      return;
    }

    const session = {
      id: account.id,
      name: account.name,
      email: account.email,
    };

    try {
      localStorage.setItem(
        CUSTOMER_SESSION_KEY,
        JSON.stringify(session)
      );

      setCustomerSession(session);
      setCustomerName(session.name);
      setAuthEmail("");
      setAuthPassword("");
      setCustomerAuthError("");
      setCustomerAuthMessage("");
      setPage("menu");
      setNotice(`Welcome back, ${session.name}!`);

      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setCustomerAuthError(
        "Login could not be saved. Please try again."
      );
    }
  };

  const handleCustomerLogout = () => {
    try {
      localStorage.removeItem(CUSTOMER_SESSION_KEY);
    } catch {
      // Continue logging out for the current session.
    }

    setCustomerSession(null);
    setCustomerName("");
    setPhone("");
    setCart([]);
    setCheckoutOpen(false);
    setMobileMenuOpen(false);
    setNotes("");
    setAuthName("");
    setAuthEmail("");
    setAuthPassword("");
    setAuthConfirmPassword("");
    setCustomerAuthError("");
    setCustomerAuthMessage("");
    setCustomerAuthMode("login");
    setPage("customer-auth");

    if (window.location.pathname !== "/") {
      window.history.pushState({}, "", "/");
    }

    setNotice("You have logged out successfully.");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const addToCart = (product) => {
    setCart((current) => {
      const existing = current.find(
        (item) => item.id === product.id
      );

      if (existing) {
        return current.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...current, { ...product, quantity: 1 }];
    });

    setNotice(`${product.name} added to cart`);
  };

  const changeQuantity = (id, amount) => {
    setCart((current) =>
      current
        .map((item) =>
          item.id === id
            ? { ...item, quantity: item.quantity + amount }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (id) => {
    setCart((current) =>
      current.filter((item) => item.id !== id)
    );
  };

  const toggleFavorite = (id) => {
    setFavorites((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  };

  const handleAdminLogin = (event) => {
    event.preventDefault();

    if (
      adminUsername.trim() === ADMIN_USERNAME &&
      adminPassword === ADMIN_PASSWORD
    ) {
      if (window.location.pathname !== "/admin") {
        window.history.pushState({}, "", "/admin");
      }

      setAdminAuthenticated(true);
      setAdminLoginError("");
      setAdminPassword("");
      setAdminFilter("All");
      setPage("admin");
      setMobileMenuOpen(false);
      setNotice("Admin login successful.");

      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      setAdminLoginError(
        "Incorrect username or password. Please try again."
      );
    }
  };

  const handleAdminLogout = () => {
    setAdminAuthenticated(false);
    setAdminUsername("");
    setAdminPassword("");
    setShowAdminPassword(false);
    setAdminLoginError("");
    setAdminFilter("All");
    setPage("admin-login");

    if (window.location.pathname !== "/admin") {
      window.history.pushState({}, "", "/admin");
    }

    setNotice("You have logged out of the admin dashboard.");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goTo = (nextPage) => {
    const isAdminPage = ["admin", "admin-login"].includes(nextPage);

    if (isAdminPage) {
      if (window.location.pathname !== "/admin") {
        window.history.pushState({}, "", "/admin");
      }

      if (nextPage === "admin" && !adminAuthenticated) {
        setPage("admin-login");
      } else {
        setPage(nextPage);
      }

      setMobileMenuOpen(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (!CUSTOMER_PAGES.includes(nextPage)) return;

    if (!customerAuthenticated) {
      setPage("customer-auth");
      return;
    }

    if (window.location.pathname !== "/") {
      window.history.pushState({}, "", "/");
    }

    setPage(nextPage);
    setMobileMenuOpen(false);

    if (nextPage === "menu") {
      window.setTimeout(() => {
        document.getElementById("menu-products")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 150);
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // ADMIN: UPDATE AN ORDER'S STATUS.
  // A cancelled order cannot be reopened or changed accidentally.
  const updateOrderStatus = (orderId, nextStatus) => {
    if (!adminAuthenticated) {
      goTo("admin-login");
      return;
    }

    if (!ORDER_STATUSES.includes(nextStatus)) return;

    const existingOrder = orders.find(
      (order) => order.id === orderId
    );

    if (!existingOrder) return;

    if (existingOrder.status === "Cancelled") {
      setNotice("Cancelled orders cannot be reopened.");
      return;
    }

    setOrders((current) =>
      current.map((order) =>
        order.id === orderId
          ? {
              ...order,
              status: nextStatus,
              ...(nextStatus === "Cancelled"
                ? { cancelledAt: new Date().toLocaleString("en-PH") }
                : {}),
            }
          : order
      )
    );

    setNotice(`Order ${orderId} updated to ${nextStatus}.`);
  };

  // CUSTOMER: CANCEL AN ORDER THAT IS STILL PENDING.
  const cancelCustomerOrder = (orderId) => {
    if (!customerSession?.email) {
      setNotice("Please log in to cancel your order.");
      setPage("customer-auth");
      return;
    }

    const order = orders.find(
      (item) =>
        item.id === orderId &&
        item.customerEmail?.toLowerCase() ===
          customerSession.email.toLowerCase()
    );

    if (!order) {
      setNotice("Order not found in your account.");
      return;
    }

    if (order.status !== "Pending") {
      setNotice(
        "Only pending orders can be cancelled. Please contact the shop if you need help."
      );
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to cancel order ${order.id}?\n\nThis action cannot be undone.`
    );

    if (!confirmed) return;

    setOrders((current) =>
      current.map((item) =>
        item.id === orderId &&
        item.customerEmail?.toLowerCase() ===
          customerSession.email.toLowerCase() &&
        item.status === "Pending"
          ? {
              ...item,
              status: "Cancelled",
              cancelledAt: new Date().toLocaleString("en-PH"),
              cancellationReason: "Cancelled by customer",
            }
          : item
      )
    );

    setNotice(`Order ${orderId} has been cancelled.`);
  };

  // ADMIN-ONLY CLEAR ORDER HISTORY
  const clearOrderHistory = () => {
    if (!adminAuthenticated) {
      goTo("admin-login");
      return;
    }

    if (orders.length === 0) {
      setNotice("There is no order history to clear.");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to permanently clear all ${orders.length} orders?\n\nThis action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify([]));
      setOrders([]);
      setAdminFilter("All");
      setNotice("All order history has been cleared.");
    } catch {
      setNotice("Unable to clear order history. Please try again.");
    }
  };

  const placeOrder = (event) => {
    event.preventDefault();

    if (!customerAuthenticated) {
      setCheckoutOpen(false);
      setPage("customer-auth");
      return;
    }

    if (!location?.latitude || !location?.longitude) {
      setNotice(
        "Please allow location access before checking out."
      );
      requestLocation();
      return;
    }

    if (!customerName.trim() || !phone.trim()) {
      setNotice("Please enter your name and phone number.");
      return;
    }

    if (!cart.length) {
      setNotice("Your cart is empty.");
      return;
    }

    const orderSubtotal = calculateSubtotal(cart);
    const orderDeliveryFee = DELIVERY_FEE;

    const newOrder = {
      id: `YS-${Date.now().toString().slice(-6)}`,
      customerName: customerName.trim(),
      phone: phone.trim(),
      customerEmail: customerSession?.email || "",
      items: cart.map((item) => ({ ...item })),
      subtotal: orderSubtotal,
      deliveryFee: orderDeliveryFee,
      total: orderSubtotal + orderDeliveryFee,
      payment,
      notes: notes.trim(),
      location:
        location.address ||
        `${location.latitude}, ${location.longitude}`,
      coordinates: {
        latitude: location.latitude,
        longitude: location.longitude,
      },
      status: "Pending",
      date: new Date().toLocaleString("en-PH"),
    };

    setOrders((current) => [newOrder, ...current]);
    setCart([]);
    setCheckoutOpen(false);
    setNotes("");
    goTo("orders");
    setNotice("Your order has been placed!");
  };

  const openCheckout = () => {
    if (!customerAuthenticated) {
      setPage("customer-auth");
      return;
    }

    if (!cart.length) {
      setNotice("Add a dessert to your cart first.");
      return;
    }

    if (
      locationStatus !== "success" ||
      !location?.latitude
    ) {
      setNotice("Allow location access to continue.");
      requestLocation();
      return;
    }

    setCheckoutOpen(true);
  };

  const renderProducts = () => (
    <>
      <div className="section-heading">
        <span className="eyebrow">MADE WITH LOVE</span>

        <h2>
          {page === "home" ? "Featured Sweet Delights" : "Our Menu"}
        </h2>

        <p>
          Fresh, delicious, homemade treats for your sweetest moments.
        </p>

        <div className="heading-flourish">♡ ───── ♥ ───── ♡</div>
      </div>

      <div className="category-tabs">
        {["All", "Cakes", "Flan"].map((item) => (
          <button
            key={item}
            className={
              category === item ? "category-tab active" : "category-tab"
            }
            onClick={() => setCategory(item)}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="product-grid">
        {visibleProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            addToCart={addToCart}
            favorite={favorites.includes(product.id)}
            toggleFavorite={toggleFavorite}
          />
        ))}
      </div>

      {!visibleProducts.length && (
        <div className="empty-state">
          <span>♡</span>
          <h3>No desserts found</h3>
          <p>Try another search or category.</p>
        </div>
      )}
    </>
  );

  // CUSTOMER LOGIN / REGISTRATION GATE
  if (
    getCurrentRoute() !== "admin" &&
    !customerAuthenticated
  ) {
    return (
      <div className="app-shell customer-auth-shell" id="top">
        <header className="site-header auth-site-header">
          <Brand />
        </header>

        <main className="page-section admin-login-page customer-auth-page">
          <div className="admin-login-panel profile-panel customer-auth-panel">
            <div className="profile-avatar-large">
              {customerAuthMode === "login" ? (
                <LockKeyhole size={38} />
              ) : (
                <UserRound size={38} />
              )}
            </div>

            <span className="eyebrow">
              WELCOME TO YUNIGAB YUMMY SWEET’S
            </span>

            <h1>
              {customerAuthMode === "login"
                ? "Customer Login"
                : "Create Your Account"}
            </h1>

            <p>
              {customerAuthMode === "login"
                ? "Log in to access our menu, order your favorite desserts, and track your orders."
                : "Register an account to start ordering your favorite sweet treats."}
            </p>

            {customerAuthError && (
              <div className="admin-login-error" role="alert">
                <X size={17} />
                <span>{customerAuthError}</span>
              </div>
            )}

            {customerAuthMessage && (
              <div className="auth-success-message" role="status">
                <CheckCircle2 size={17} />
                <span>{customerAuthMessage}</span>
              </div>
            )}

            <form
              className="profile-form admin-login-form customer-auth-form"
              onSubmit={
                customerAuthMode === "login"
                  ? handleCustomerLogin
                  : handleCustomerRegister
              }
            >
              {customerAuthMode === "register" && (
                <label>
                  Full Name
                  <input
                    type="text"
                    value={authName}
                    onChange={(event) => {
                      setAuthName(event.target.value);
                      setCustomerAuthError("");
                    }}
                    placeholder="Enter your full name"
                    autoComplete="name"
                    required
                  />
                </label>
              )}

              <label>
                Email Address
                <input
                  type="email"
                  value={authEmail}
                  onChange={(event) => {
                    setAuthEmail(event.target.value);
                    setCustomerAuthError("");
                  }}
                  placeholder="Enter your email address"
                  autoComplete="email"
                  required
                />
              </label>

              <label>
                Password
                <div className="admin-password-input">
                  <input
                    type={showCustomerPassword ? "text" : "password"}
                    value={authPassword}
                    onChange={(event) => {
                      setAuthPassword(event.target.value);
                      setCustomerAuthError("");
                    }}
                    placeholder={
                      customerAuthMode === "register"
                        ? "Create a password (at least 6 characters)"
                        : "Enter your password"
                    }
                    autoComplete={
                      customerAuthMode === "register"
                        ? "new-password"
                        : "current-password"
                    }
                    minLength={
                      customerAuthMode === "register" ? 6 : undefined
                    }
                    required
                  />

                  <button
                    type="button"
                    className="admin-password-toggle"
                    onClick={() =>
                      setShowCustomerPassword((show) => !show)
                    }
                    aria-label={
                      showCustomerPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showCustomerPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </label>

              {customerAuthMode === "register" && (
                <label>
                  Confirm Password
                  <div className="admin-password-input">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={authConfirmPassword}
                      onChange={(event) => {
                        setAuthConfirmPassword(event.target.value);
                        setCustomerAuthError("");
                      }}
                      placeholder="Confirm your password"
                      autoComplete="new-password"
                      minLength={6}
                      required
                    />

                    <button
                      type="button"
                      className="admin-password-toggle"
                      onClick={() =>
                        setShowConfirmPassword((show) => !show)
                      }
                      aria-label={
                        showConfirmPassword
                          ? "Hide password"
                          : "Show password"
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                </label>
              )}

              <button
                className="primary-button full-button"
                type="submit"
              >
                {customerAuthMode === "login" ? (
                  <>
                    <LockKeyhole size={17} />
                    Login
                  </>
                ) : (
                  <>
                    <UserRound size={17} />
                    Create Account
                  </>
                )}
              </button>
            </form>

            <div className="customer-auth-switch">
              {customerAuthMode === "login" ? (
                <>
                  <span>Don't have an account?</span>
                  <button
                    type="button"
                    onClick={() => {
                      setCustomerAuthMode("register");
                      setCustomerAuthError("");
                      setCustomerAuthMessage("");
                      setAuthPassword("");
                      setAuthConfirmPassword("");
                    }}
                  >
                    Register here
                  </button>
                </>
              ) : (
                <>
                  <span>Already have an account?</span>
                  <button
                    type="button"
                    onClick={() => {
                      setCustomerAuthMode("login");
                      setCustomerAuthError("");
                      setCustomerAuthMessage("");
                      setAuthPassword("");
                      setAuthConfirmPassword("");
                    }}
                  >
                    Log in
                  </button>
                </>
              )}
            </div>

            <div className="customer-auth-note">
              <Heart size={15} />
              <span>Sweet treats, happy moments.</span>
            </div>

            <p className="customer-auth-admin-note">
              Are you the administrator?{" "}
              <a
                href="/admin"
                onClick={(event) => {
                  event.preventDefault();
                  window.history.pushState({}, "", "/admin");
                  setPage("admin-login");
                  setCustomerAuthError("");
                  setCustomerAuthMessage("");
                }}
              >
                Admin Login
              </a>
            </p>
          </div>
        </main>

        <footer className="site-footer">
          <div className="footer-wave" />
          <div className="footer-content">
            <Brand />
            <p>♥ Sweet treats, happy moments. ♥</p>
          </div>
          <small className="copyright">
            © {new Date().getFullYear()} Yunigab Yummy Sweet’s. Made with love.
          </small>
        </footer>
      </div>
    );
  }

  return (
    <div className="app-shell" id="top">
      {page !== "admin" && page !== "admin-login" && (
        <header className="site-header">
          <button
            className="mobile-menu-button"
            onClick={() => setMobileMenuOpen((open) => !open)}
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? <X /> : <MenuIcon />}
          </button>

          <Brand />

          <nav className={`main-nav ${mobileMenuOpen ? "nav-open" : ""}`}>
            {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                className={`nav-link ${page === id ? "active" : ""}`}
                onClick={() => goTo(id)}
              >
                <Icon size={18} />
                <span>{label}</span>
                {id === "cart" && cartCount > 0 && (
                  <span className="cart-badge">{cartCount}</span>
                )}
              </button>
            ))}
          </nav>

          <div className="header-search">
            <Search size={17} />
            <input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                if (page !== "menu" && page !== "home") {
                  goTo("menu");
                }
              }}
              placeholder="Search desserts..."
              aria-label="Search desserts"
            />
          </div>
        </header>
      )}

      {notice && (
        <div className="toast-message" role="status">
          <CheckCircle2 size={18} />
          {notice}
          <button
            onClick={() => setNotice("")}
            aria-label="Dismiss message"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <main>
        {(page === "home" || page === "menu") && (
          <>
            <section className="hero-banner">
              <div className="hero-decor hero-decor-one">♡</div>

              <div className="hero-copy">
                <span className="hero-kicker">
                  A LITTLE BOX OF HAPPINESS
                </span>
                <div className="tiny-crown">♕</div>
                <h1>
                  3 FOR <span>100</span>
                </h1>
                <div className="assorted-brush">ASSORTED!!</div>
                <p>
                  Mix your favorite sweet treats and share the happiness.
                </p>
                <button
                  className="hero-button"
                  onClick={() => goTo("menu")}
                >
                  ORDER NOW!!
                  <ArrowLeft size={17} className="button-arrow" />
                </button>
                <span className="hero-note">
                  ♥ Any 3 eligible desserts for ₱100 ♥
                </span>
              </div>

              <div className="hero-desserts">
                <div className="hero-photo hero-photo-main">
                  <img src={PRODUCTS[0].image} alt="Leche flan dessert" />
                </div>
                <div className="hero-photo hero-photo-top">
                  <img src={PRODUCTS[3].image} alt="Ube cake dessert" />
                </div>
                <div className="hero-photo hero-photo-right">
                  <img
                    src={PRODUCTS[5].image}
                    alt="Strawberry cake dessert"
                  />
                </div>
                <div className="hero-sparkle">✦</div>
                <span className="hero-heart">♥</span>
              </div>
            </section>

            {page === "home" && (
              <div className="location-strip">
                <div className="location-strip-icon">
                  <MapPin size={20} />
                </div>
                <div className="location-strip-copy">
                  <strong>Your delivery location</strong>
                  <span>
                    {locationStatus === "success"
                      ? location?.address
                      : locationMessage}
                  </span>
                </div>
                {locationStatus !== "success" ? (
                  <button
                    className="location-action"
                    onClick={requestLocation}
                  >
                    <LocateFixed size={16} />
                    Detect My Location
                  </button>
                ) : (
                  <span className="location-ready">
                    <CheckCircle2 size={16} />
                    Detected
                  </span>
                )}
              </div>
            )}

            <section id="menu-products" className="menu-section">
              {renderProducts()}
              {page === "home" && (
                <button
                  className="view-menu-button"
                  onClick={() => goTo("menu")}
                >
                  View Full Menu
                  <ArrowLeft size={17} className="button-arrow" />
                </button>
              )}
            </section>

            <section className="benefits-strip">
              <div className="benefit">
                <span><Truck size={25} /></span>
                <div><strong>Fast & Reliable</strong><small>Delivery</small></div>
              </div>
              <div className="benefit">
                <span><Leaf size={25} /></span>
                <div><strong>Freshly Made</strong><small>Daily</small></div>
              </div>
              <div className="benefit">
                <span><Heart size={25} /></span>
                <div><strong>Quality Ingredients</strong><small>Only</small></div>
              </div>
              <div className="benefit">
                <span><Smile size={25} /></span>
                <div><strong>Sweet Treats</strong><small>For Every Occasion</small></div>
              </div>
            </section>
          </>
        )}

        {page === "cart" && (
          <section className="page-section">
            <div className="page-title-row">
              <div>
                <span className="eyebrow">YOUR SWEET PICKS</span>
                <h1>My Cart</h1>
              </div>
              {cart.length > 0 && (
                <button
                  className="text-button"
                  onClick={() => setCart([])}
                >
                  <Trash2 size={16} />
                  Clear Cart
                </button>
              )}
            </div>

            {!cart.length ? (
              <div className="empty-state">
                <ShoppingCart size={42} />
                <h3>Your cart is waiting for something sweet.</h3>
                <p>Choose your favorite desserts to get started.</p>
                <button className="primary-button" onClick={() => goTo("menu")}>
                  Browse Menu
                </button>
              </div>
            ) : (
              <div className="cart-layout">
                <div className="cart-items">
                  {cart.map((item) => (
                    <article className="cart-item" key={item.id}>
                      <img src={item.image} alt={item.name} />
                      <div className="cart-item-details">
                        <h3>{item.name}</h3>
                        <p>Included in 3 for ₱100 assorted promo</p>
                        <div className="quantity-control">
                          <button
                            onClick={() => changeQuantity(item.id, -1)}
                            aria-label="Decrease quantity"
                          >
                            <Minus size={15} />
                          </button>
                          <span>{item.quantity}</span>
                          <button
                            onClick={() => changeQuantity(item.id, 1)}
                            aria-label="Increase quantity"
                          >
                            <Plus size={15} />
                          </button>
                        </div>
                      </div>
                      <button
                        className="remove-item"
                        onClick={() => removeFromCart(item.id)}
                        aria-label={`Remove ${item.name}`}
                      >
                        <Trash2 size={17} />
                      </button>
                    </article>
                  ))}
                </div>

                <aside className="order-summary">
                  <h2>Order Summary</h2>
                  <div><span>Assorted desserts</span><strong>{cartCount} pcs</strong></div>
                  {bundleCount > 0 && (
                    <div><span>3 for ₱100 bundles</span><strong>{bundleCount} × ₱100</strong></div>
                  )}
                  {remainingCount > 0 && (
                    <div><span>Remaining items</span><strong>{remainingCount} pc(s)</strong></div>
                  )}
                  <div><span>Subtotal</span><strong>{money(subtotal)}</strong></div>
                  <div><span>Delivery Fee</span><strong>{money(deliveryFee)}</strong></div>
                  <div className="summary-total"><span>Total</span><strong>{money(total)}</strong></div>
                  <p className="summary-note"><Heart size={14} /> Every 3 assorted desserts cost ₱100.</p>
                  <button className="primary-button full-button" onClick={openCheckout}>
                    Proceed to Checkout <Navigation size={17} />
                  </button>
                  <p className="summary-note"><Heart size={14} /> Made with love, just for you.</p>
                </aside>
              </div>
            )}
          </section>
        )}

        {/* CUSTOMER ORDER HISTORY + CANCEL BUTTON */}
        {page === "orders" && (
          <section className="page-section">
            <div className="page-title-row">
              <div>
                <span className="eyebrow">THANK YOU FOR ORDERING</span>
                <h1>My Orders</h1>
                <p>Track your orders and cancel eligible pending orders.</p>
              </div>
            </div>

            {!customerOrders.length ? (
              <div className="empty-state">
                <PackageCheck size={42} />
                <h3>No orders yet</h3>
                <p>Your placed orders will appear here.</p>
                <button className="primary-button" onClick={() => goTo("menu")}>
                  Order Desserts
                </button>
              </div>
            ) : (
              <div className="orders-list">
                {customerOrders.map((order) => (
                  <article className="order-card" key={order.id}>
                    <div className="order-card-top">
                      <div>
                        <span className="eyebrow">ORDER NUMBER</span>
                        <h3>{order.id}</h3>
                      </div>
                      <span className={`status-pill ${order.status.toLowerCase()}`}>
                        {order.status}
                      </span>
                    </div>

                    <p className="order-date">{order.date}</p>

                    <div className="order-card-items">
                      {order.items.map((item) => (
                        <div key={item.id}>
                          <span>{item.quantity} × {item.name}</span>
                        </div>
                      ))}
                    </div>

                    <p className="summary-note">
                      Assorted promo: every 3 desserts for ₱100.
                    </p>

                    <div className="order-location">
                      <MapPin size={16} />
                      <span>{order.location}</span>
                    </div>

                    <div className="order-card-total">
                      <span>Subtotal</span>
                      <strong>{money(order.subtotal)}</strong>
                    </div>
                    <div className="order-card-total">
                      <span>Delivery fee</span>
                      <strong>{money(order.deliveryFee)}</strong>
                    </div>
                    <div className="order-card-total">
                      <span>Total</span>
                      <strong>{money(order.total)}</strong>
                    </div>

                    {order.status === "Pending" && (
                      <div className="customer-cancel-order">
                        <p>
                          <Clock size={15} />
                          You may cancel this order while it is pending.
                        </p>
                        <button
                          type="button"
                          className="cancel-order-button"
                          onClick={() => cancelCustomerOrder(order.id)}
                        >
                          <Ban size={17} />
                          Cancel Order
                        </button>
                      </div>
                    )}

                    {order.status === "Preparing" && (
                      <div className="order-cancellation-info">
                        <AlertTriangle size={16} />
                        <span>
                          Your order is being prepared and can no longer be
                          cancelled here. Please contact the shop for help.
                        </span>
                      </div>
                    )}

                    {order.status === "Cancelled" && (
                      <div className="order-cancelled-notice">
                        <Ban size={17} />
                        <div>
                          <strong>Order Cancelled</strong>
                          <span>
                            {order.cancelledAt
                              ? `Cancelled on ${order.cancelledAt}`
                              : "This order has been cancelled."}
                          </span>
                        </div>
                      </div>
                    )}

                    {order.status === "Completed" && (
                      <div className="order-completed-notice">
                        <CheckCircle2 size={17} />
                        This order has been completed.
                      </div>
                    )}
                  </article>
                ))}
              </div>
            )}
          </section>
        )}

        {page === "admin-login" && (
          <section className="page-section admin-login-page">
            <div className="admin-login-panel profile-panel">
              <div className="profile-avatar-large"><ShieldCheck size={38} /></div>
              <span className="eyebrow">YUNIGAB YUMMY SWEET’S</span>
              <h1>Admin Login</h1>
              <p>Sign in to manage customer orders and update order statuses.</p>

              {adminLoginError && (
                <div className="admin-login-error" role="alert">
                  <X size={17} />
                  <span>{adminLoginError}</span>
                </div>
              )}

              <form className="profile-form admin-login-form" onSubmit={handleAdminLogin}>
                <label>
                  Admin Username
                  <input
                    type="text"
                    value={adminUsername}
                    onChange={(event) => {
                      setAdminUsername(event.target.value);
                      setAdminLoginError("");
                    }}
                    placeholder="Enter admin username"
                    autoComplete="username"
                    required
                  />
                </label>

                <label>
                  Admin Password
                  <div className="admin-password-input">
                    <input
                      type={showAdminPassword ? "text" : "password"}
                      value={adminPassword}
                      onChange={(event) => {
                        setAdminPassword(event.target.value);
                        setAdminLoginError("");
                      }}
                      placeholder="Enter admin password"
                      autoComplete="current-password"
                      required
                    />
                    <button
                      type="button"
                      className="admin-password-toggle"
                      onClick={() => setShowAdminPassword((show) => !show)}
                      aria-label={showAdminPassword ? "Hide password" : "Show password"}
                    >
                      {showAdminPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </label>

                <button className="primary-button full-button" type="submit">
                  <LockKeyhole size={17} />
                  Login to Admin Dashboard
                </button>

                <button
                  className="text-button admin-back-button"
                  type="button"
                  onClick={() => {
                    if (!customerAuthenticated) {
                      if (window.location.pathname !== "/") {
                        window.history.pushState({}, "", "/");
                      }
                      setPage("customer-auth");
                    } else {
                      goTo("menu");
                    }
                  }}
                >
                  <ArrowLeft size={16} />
                  Back to Customer Menu
                </button>
              </form>

              <p className="admin-login-security">
                <ShieldCheck size={15} /> Admin access only
              </p>
            </div>
          </section>
        )}

        {/* ADMIN DASHBOARD */}
        {page === "admin" && adminAuthenticated && (
          <section className="page-section admin-page">
            <div className="page-title-row">
              <div>
                <span className="eyebrow">YUNIGAB YUMMY SWEET’S</span>
                <h1>Admin Dashboard</h1>
                <p className="admin-description">
                  Manage customer orders, including cancelled orders.
                </p>
              </div>

              <div className="admin-header-actions">
                <button className="text-button" onClick={() => goTo("menu")}>
                  <ArrowLeft size={17} />
                  Back to Menu
                </button>
                <button
                  className="text-button admin-logout-button"
                  onClick={handleAdminLogout}
                >
                  <LogOut size={17} />
                  Logout
                </button>
              </div>
            </div>

            <div className="admin-stats">
              <article className="admin-stat-card pending">
                <span><ClipboardList size={17} /> Pending Orders</span>
                <strong>{pendingCount}</strong>
                <small>Waiting to be processed</small>
              </article>

              <article className="admin-stat-card preparing">
                <span><ChefHat size={17} /> Preparing Orders</span>
                <strong>{preparingCount}</strong>
                <small>Currently being prepared</small>
              </article>

              <article className="admin-stat-card completed">
                <span><PackageCheck size={17} /> Completed Orders</span>
                <strong>{completedCount}</strong>
                <small>Finished orders</small>
              </article>

              {/* NEW CANCELLED ORDERS STATISTIC */}
              <article className="admin-stat-card cancelled">
                <span><Ban size={17} /> Cancelled Orders</span>
                <strong>{cancelledCount}</strong>
                <small>Orders cancelled by customer or admin</small>
              </article>
            </div>

            <div className="admin-toolbar">
              <div>
                <h2>Customer Orders</h2>
                <p>
                  {orders.length} total order{orders.length === 1 ? "" : "s"}
                </p>
              </div>

              <div className="admin-toolbar-actions">
                <label className="admin-filter-wrap">
                  <span>Filter by status</span>
                  <select
                    className="admin-filter"
                    value={adminFilter}
                    onChange={(event) => setAdminFilter(event.target.value)}
                  >
                    <option value="All">All Orders</option>
                    <option value="Pending">Pending</option>
                    <option value="Preparing">Preparing</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </label>

                <button
                  type="button"
                  className="text-button admin-clear-history-button"
                  onClick={clearOrderHistory}
                  disabled={orders.length === 0}
                  title="Clear all customer order history"
                >
                  <Trash2 size={17} />
                  Clear Order History
                </button>
              </div>
            </div>

            {!filteredAdminOrders.length ? (
              <div className="empty-state admin-empty-state">
                <PackageCheck size={42} />
                <h3>
                  {orders.length === 0
                    ? "No customer orders yet"
                    : `No ${adminFilter.toLowerCase()} orders`}
                </h3>
                <p>
                  {orders.length === 0
                    ? "Customer orders will appear here after checkout."
                    : "Choose another status filter to view more orders."}
                </p>
                {orders.length === 0 && (
                  <button className="primary-button" onClick={() => goTo("menu")}>
                    View Menu
                  </button>
                )}
              </div>
            ) : (
              <div className="admin-order-list">
                {filteredAdminOrders.map((order) => (
                  <article className="admin-order-card" key={order.id}>
                    <div className="admin-order-heading">
                      <div className="admin-order-number">
                        <span className="eyebrow">ORDER NUMBER</span>
                        <h3>{order.id}</h3>
                        <p>{order.date}</p>
                      </div>
                      <span className={`status-pill ${order.status.toLowerCase()}`}>
                        {order.status}
                      </span>
                    </div>

                    <div className="admin-order-details">
                      <div className="admin-detail-block">
                        <span>Customer</span>
                        <strong>{order.customerName}</strong>
                      </div>
                      <div className="admin-detail-block">
                        <span>Phone Number</span>
                        <strong>{order.phone}</strong>
                      </div>
                      <div className="admin-detail-block">
                        <span>Payment Method</span>
                        <strong>{order.payment}</strong>
                      </div>
                      <div className="admin-detail-block">
                        <span>Customer Email</span>
                        <strong>{order.customerEmail || "Not provided"}</strong>
                      </div>
                    </div>

                    <div className="admin-items-section">
                      <h4>Ordered Desserts</h4>
                      {order.items.map((item) => (
                        <div className="admin-item-row" key={item.id}>
                          <div>
                            <strong>{item.name}</strong>
                            <span>Quantity: {item.quantity}</span>
                          </div>
                          <strong>{money(item.price * item.quantity)}</strong>
                        </div>
                      ))}
                    </div>

                    {order.notes && (
                      <div className="admin-notes">
                        <strong>Customer Notes</strong>
                        <p>{order.notes}</p>
                      </div>
                    )}

                    <div className="admin-delivery-location">
                      <MapPin size={18} />
                      <div>
                        <strong>Delivery Location</strong>
                        <p>{order.location || "No location provided"}</p>
                      </div>
                    </div>

                    <div className="admin-order-total">
                      <div><span>Subtotal</span><strong>{money(order.subtotal)}</strong></div>
                      <div><span>Delivery Fee</span><strong>{money(order.deliveryFee)}</strong></div>
                      <div className="admin-grand-total">
                        <span>Total Amount</span>
                        <strong>{money(order.total)}</strong>
                      </div>
                    </div>

                    {/* CANCELLATION DETAILS FOR ADMIN */}
                    {order.status === "Cancelled" && (
                      <div className="admin-cancellation-details">
                        <div className="admin-cancellation-heading">
                          <Ban size={20} />
                          <strong>Order Cancelled</strong>
                        </div>
                        <p>
                          Cancelled on: {order.cancelledAt || "Date not recorded"}
                        </p>
                        <p>
                          Reason: {order.cancellationReason || "Cancelled by admin or customer"}
                        </p>
                        <small>
                          This order is locked and cannot be reopened.
                        </small>
                      </div>
                    )}

                    <div className="admin-status-control">
                      <label htmlFor={`status-${order.id}`}>
                        Update Order Status
                      </label>

                      <select
                        id={`status-${order.id}`}
                        className={`admin-status-select ${order.status.toLowerCase()}`}
                        value={order.status}
                        disabled={order.status === "Cancelled"}
                        onChange={(event) =>
                          updateOrderStatus(order.id, event.target.value)
                        }
                      >
                        {ORDER_STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>

                      {order.status !== "Cancelled" &&
                        order.status !== "Completed" && (
                          <p className="admin-status-help">
                            Selecting Cancelled will mark this order as cancelled.
                          </p>
                        )}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}

        {page === "profile" && (
          <section className="page-section">
            <div className="page-title-row">
              <div>
                <span className="eyebrow">YOUR SWEET CORNER</span>
                <h1>My Profile</h1>
              </div>
            </div>

            <div className="profile-panel">
              <div className="profile-avatar-large"><UserRound size={38} /></div>
              <h2>{customerName || "Sweet Customer"}</h2>
              <p>Welcome to Yunigab Yummy Sweet’s!</p>

              {customerSession?.email && (
                <p className="profile-account-email">
                  {customerSession.email}
                </p>
              )}

              <div className="profile-form">
                <label>
                  Customer name
                  <input
                    value={customerName}
                    onChange={(event) => setCustomerName(event.target.value)}
                    placeholder="Enter your name"
                  />
                </label>

                <label>
                  Phone number
                  <input
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    placeholder="Enter your phone number"
                    inputMode="tel"
                  />
                </label>

                <div className="profile-location">
                  <MapPin size={19} />
                  <div>
                    <strong>Current location</strong>
                    <span>{location?.address || locationMessage}</span>
                  </div>
                  <button className="location-action" onClick={requestLocation}>
                    Detect
                  </button>
                </div>

                <button
                  className="primary-button"
                  onClick={() => {
                    setCustomerName(customerName.trim());

                    if (customerSession) {
                      const updatedSession = {
                        ...customerSession,
                        name: customerName.trim(),
                      };

                      try {
                        localStorage.setItem(
                          CUSTOMER_SESSION_KEY,
                          JSON.stringify(updatedSession)
                        );
                        setCustomerSession(updatedSession);
                      } catch {
                        setNotice("Profile changes could not be saved.");
                        return;
                      }
                    }

                    setNotice("Profile details updated for this session.");
                  }}
                >
                  Save Profile
                </button>

                <button
                  className="text-button customer-logout-button"
                  onClick={handleCustomerLogout}
                >
                  <LogOut size={17} />
                  Logout
                </button>
              </div>
            </div>
          </section>
        )}
      </main>

      {page !== "admin" && page !== "admin-login" && (
        <footer className="site-footer">
          <div className="footer-wave" />
          <div className="footer-content">
            <Brand />
            <p>♥ Sweet treats, happy moments. ♥</p>
            <div className="footer-social">
              <span>f</span>
              <span>◎</span>
              <span>♪</span>
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                aria-label="Back to top"
              >
                <ArrowUp size={18} />
              </button>
            </div>
          </div>
          <small className="copyright">
            © {new Date().getFullYear()} Yunigab Yummy Sweet’s. Made with love.
          </small>
        </footer>
      )}

      {checkoutOpen && (
        <div
          className="modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setCheckoutOpen(false);
            }
          }}
        >
          <form className="checkout-modal" onSubmit={placeOrder}>
            <div className="modal-heading">
              <div>
                <span className="eyebrow">ONE LAST STEP</span>
                <h2>Checkout</h2>
              </div>
              <button
                type="button"
                className="modal-close"
                onClick={() => setCheckoutOpen(false)}
                aria-label="Close checkout"
              >
                <X />
              </button>
            </div>

            <div className="checkout-location">
              <MapPin size={22} />
              <div>
                <strong>Detected delivery location</strong>
                <p>{location?.address || "Location not available"}</p>
                <small>Your browser location is used. No address typing needed.</small>
              </div>
              <button
                type="button"
                className="icon-button"
                onClick={requestLocation}
                aria-label="Refresh location"
              >
                <LocateFixed size={18} />
              </button>
            </div>

            <label className="form-label">
              Customer name
              <input
                required
                value={customerName}
                onChange={(event) => setCustomerName(event.target.value)}
                placeholder="Your full name"
              />
            </label>

            <label className="form-label">
              Phone number
              <input
                required
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="Your contact number"
                inputMode="tel"
              />
            </label>

            <label className="form-label">
              Payment method
              <select value={payment} onChange={(event) => setPayment(event.target.value)}>
                <option>Cash on Delivery</option>
                <option>GCash</option>
              </select>
            </label>

            <label className="form-label">
              Order notes (optional)
              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Any special instructions?"
                rows={2}
              />
            </label>

            <div className="checkout-promo">
              <span>Assorted desserts</span>
              <strong>{cartCount} piece(s)</strong>
            </div>
            <div className="checkout-promo">
              <span>Promo discount included</span>
              <strong>{bundleCount} bundle(s)</strong>
            </div>
            <div className="checkout-total">
              <span>Total</span>
              <strong>{money(total)}</strong>
            </div>

            <button className="primary-button full-button" type="submit">
              Place My Order
              <Heart size={17} />
            </button>

            <p className="modal-footnote">
              Please make sure your detected location is correct before placing your order.
            </p>
          </form>
        </div>
      )}
    </div>
  );
}

export default App;
