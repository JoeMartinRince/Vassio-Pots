import React, { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  AdminAuthProvider,
  useAdminAuth,
} from "@/context/AdminAuthContext";
import {
  fetchAdminProducts,
  updateAdminProduct,
  fetchAdminOrders,
  updateAdminOrder,
  fetchAdminCustomers,
  fetchRevenueMetrics,
  AdminProduct,
  Order,
  Customer,
  RevenueMetrics,
} from "@/services/adminService";
import { isSupabaseConfigured } from "@/lib/supabase";
import { toast } from "sonner";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  TrendingUp,
  Settings,
  Layers,
  Tag,
  Star,
  Bell,
  LogOut,
  DollarSign,
  ShoppingBag,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  Plus,
  Trash2,
  Edit3,
  RefreshCw,
  ChevronRight,
  Menu,
  X,
  Lock,
  UserCheck,
  Database,
  ChevronLeft,
  ChevronRight as RightIcon,
} from "lucide-react";
import {
  getVariants,
  toggleSizeAvailability,
  toggleColorAvailability,
  addSizeVariant,
  addColorVariant,
  removeSizeVariant,
  removeColorVariant,
} from "@/services/variantStore";
import { reviewStore } from "@/services/reviewStore";
import { Review } from "@/types/reviews";

export const Route = createFileRoute("/admin")({
  component: AdminDashboardWrapper,
});

function AdminDashboardWrapper() {
  return (
    <AdminAuthProvider>
      <AdminDashboardMain />
    </AdminAuthProvider>
  );
}

function AdminDashboardMain() {
  const { user, isAuthenticated, role, isAdmin, login, logout, loading } = useAdminAuth();
  
  // Navigation State
  const [activeTab, setActiveTab] = useState<
    "overview" | "products" | "orders" | "customers" | "reviews" | "revenue" | "settings"
  >("overview");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // Data states
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [metrics, setMetrics] = useState<RevenueMetrics | null>(null);
  const [dataLoading, setDataLoading] = useState(false);

  // Filters & Search
  const [globalSearch, setGlobalSearch] = useState("");
  const [productCategoryFilter, setProductCategoryFilter] = useState("all");
  const [orderStatusFilter, setOrderStatusFilter] = useState("all");

  // Pagination states
  const [prodPage, setProdPage] = useState(1);
  const [orderPage, setOrderPage] = useState(1);
  const itemsPerPage = 8;

  // Add Product Modal
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [newProductForm, setNewProductForm] = useState<Partial<AdminProduct>>({
    product_id: "",
    name: "",
    price: 3500,
    mrp: 5000,
    stock_status: "in_stock",
    category: "Fiberglass Planters",
    featured: false,
    new_arrival: true,
    active: true,
  });

  useEffect(() => {
    if (isAuthenticated) {
      loadDashboardData();
    }
  }, [isAuthenticated]);

  const loadDashboardData = async () => {
    setDataLoading(true);
    try {
      const [prodsData, ordersData, custsData, metricsData] = await Promise.all([
        fetchAdminProducts(),
        fetchAdminOrders(),
        fetchAdminCustomers(),
        fetchRevenueMetrics(),
      ]);
      setProducts(prodsData);
      setOrders(ordersData);
      setCustomers(custsData);
      setMetrics(metricsData);
    } catch (err) {
      console.error("Failed to load admin data", err);
      toast.error("Error loading dashboard metrics");
    } finally {
      setDataLoading(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    const res = await login(loginEmail, loginPass);
    setLoginLoading(false);

    if (res.success) {
      toast.success("Welcome back to Vassio Admin Dashboard");
    } else {
      toast.error(res.error || "Login failed");
    }
  };

  // Handle Product Field Updates
  const handleProductUpdate = async (productId: string, updates: Partial<AdminProduct>) => {
    // Optimistic UI state update
    setProducts((prev) =>
      prev.map((p) => (p.product_id === productId ? { ...p, ...updates } : p))
    );

    const res = await updateAdminProduct(productId, updates);
    if (res.success) {
      toast.success(`Saved ${productId} to Supabase`);
      const refreshed = await fetchAdminProducts();
      setProducts(refreshed);
    } else {
      toast.error(res.error || "Failed to update product in Supabase");
      const refreshed = await fetchAdminProducts();
      setProducts(refreshed);
    }
  };

  // Handle Delete Product (Admin Only)
  const handleDeleteProduct = (productId: string) => {
    if (!isAdmin) {
      toast.error("Only Master Administrators can delete products");
      return;
    }
    setProducts((prev) => prev.filter((p) => p.product_id !== productId));
    toast.success(`Product ${productId} removed`);
  };

  // Handle Add Product
  const handleAddProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductForm.product_id || !newProductForm.name) {
      toast.error("Please fill in Product Code and Name");
      return;
    }

    const created: AdminProduct = {
      product_id: newProductForm.product_id.trim().toUpperCase(),
      name: newProductForm.name.trim(),
      price: Number(newProductForm.price) || 3000,
      mrp: Number(newProductForm.mrp) || 4500,
      discount_percentage: Math.round(
        (((Number(newProductForm.mrp) || 4500) - (Number(newProductForm.price) || 3000)) /
          (Number(newProductForm.mrp) || 4500)) *
          100
      ),
      stock_status: (newProductForm.stock_status as any) || "in_stock",
      stock_quantity: Number(newProductForm.stock_quantity || 10),
      featured: Boolean(newProductForm.featured),
      new_arrival: Boolean(newProductForm.new_arrival),
      display_order: products.length + 1,
      active: true,
      img: "/products/default.jpg",
      category: newProductForm.category || "Fiberglass Planters",
      material: "Architectural Fiberglass Composite",
      dimensions: "Standard",
      description: "New handcrafted Vassio botanical product.",
    };

    const res = await updateAdminProduct(created.product_id, created);
    if (res.success) {
      toast.success(`Product ${created.product_id} created in Supabase!`);
      setShowAddProductModal(false);
      const fresh = await fetchAdminProducts();
      setProducts(fresh);
    } else {
      toast.error(`Failed to create product: ${res.error}`);
    }
  };

  // Handle Order Updates
  const handleOrderUpdate = async (
    orderId: string,
    updates: Partial<Pick<Order, "order_status" | "payment_status" | "shipping_status" | "tracking_number">>
  ) => {
    const success = await updateAdminOrder(orderId, updates);
    if (success) {
      toast.success(`Order updated`);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, ...updates } : o))
      );
      const freshMetrics = await fetchRevenueMetrics();
      setMetrics(freshMetrics);
    } else {
      toast.error("Failed to update order");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FCFCF8]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#739D30] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold text-[#3F673F] font-sans">Loading Vassio Admin...</p>
        </div>
      </div>
    );
  }

  // LOGIN SCREEN
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FCFCF8] p-4 relative overflow-hidden font-sans">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#739D30]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-md bg-white border border-[#D9E3C5]/60 rounded-3xl p-8 shadow-xl relative z-10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#739D30]/10 border border-[#739D30]/25 text-[#739D30] text-xs font-bold uppercase tracking-widest mb-3">
              <Lock className="w-4 h-4" />
              <span>Vassio Admin Portal</span>
            </div>
            <h1 className="serif text-3xl font-extrabold text-[#2F4B2F] tracking-wide">
              Sign In to Dashboard
            </h1>
            <p className="text-xs text-muted-foreground mt-2 font-medium">
              Enter your admin credentials to access the store management system
            </p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-[#2F4B2F] mb-1.5 uppercase tracking-wider">
                Admin Email
              </label>
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="admin@vassio.com"
                className="w-full px-4 py-3 rounded-xl border border-[#D9E3C5] focus:outline-none focus:ring-2 focus:ring-[#739D30] text-sm text-foreground bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#2F4B2F] mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <input
                type="password"
                required
                value={loginPass}
                onChange={(e) => setLoginPass(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl border border-[#D9E3C5] focus:outline-none focus:ring-2 focus:ring-[#739D30] text-sm text-foreground bg-white"
              />
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-3.5 rounded-xl bg-[#739D30] hover:bg-[#628828] text-white font-bold text-sm tracking-wide shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              {loginLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Authenticating with Supabase...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Sign In to Dashboard</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Filtered Lists
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(globalSearch.toLowerCase()) ||
      p.product_id.toLowerCase().includes(globalSearch.toLowerCase());
    const matchesCategory =
      productCategoryFilter === "all" ||
      (productCategoryFilter === "fiberglass" && p.category.includes("Fiberglass")) ||
      (productCategoryFilter === "vases" && p.category.includes("Vases"));
    return matchesSearch && matchesCategory;
  });

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.order_number.toLowerCase().includes(globalSearch.toLowerCase()) ||
      o.customer_name.toLowerCase().includes(globalSearch.toLowerCase()) ||
      o.customer_email.toLowerCase().includes(globalSearch.toLowerCase());
    const matchesStatus = orderStatusFilter === "all" || o.order_status === orderStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(globalSearch.toLowerCase()) ||
      c.email.toLowerCase().includes(globalSearch.toLowerCase())
  );

  // Pagination slicing
  const paginatedProducts = filteredProducts.slice(
    (prodPage - 1) * itemsPerPage,
    prodPage * itemsPerPage
  );
  const totalProdPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;

  // Sidebar navigation items list
  const navItems = [
    { id: "overview", label: "Dashboard", icon: LayoutDashboard },
    { id: "products", label: "Products", icon: Package, badge: products.length },
    { id: "orders", label: "Orders", icon: ShoppingCart, badge: orders.filter((o) => o.order_status === "pending").length },
    { id: "customers", label: "Customers", icon: Users, badge: customers.length },
    { id: "reviews", label: "Reviews", icon: Star, badge: reviewStore.getAllReviews().length },
    { id: "revenue", label: "Revenue / Analytics", icon: TrendingUp },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  // Placeholder navigation items
  const placeholderNavItems = [
    { label: "Categories", icon: Layers },
    { label: "Coupons", icon: Tag },
    { label: "Notifications", icon: Bell },
  ];

  return (
    <div className="min-h-screen bg-[#FCFCF8] flex font-sans text-foreground relative">
      {/* ========================================================================= */}
      {/* FIXED LEFT SIDEBAR (DESKTOP: 260px, TABLET: 220px, MOBILE: DRAWER) */}
      {/* ========================================================================= */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-40 bg-white border-r border-[#D9E3C5]/60 flex flex-col justify-between transition-transform duration-300 shadow-sm
          w-[260px] md:w-[220px] lg:w-[260px]
          ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        <div className="p-5 overflow-y-auto flex-1 scrollbar-none">
          {/* Sidebar Header: Vassio Logo & Subtitle */}
          <div className="flex items-center justify-between pb-6 mb-6 border-b border-[#D9E3C5]/50">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#739D30] text-white flex items-center justify-center font-extrabold text-lg shadow-sm shrink-0">
                V
              </div>
              <div>
                <h2 className="serif text-xl font-extrabold text-[#2F4B2F] leading-tight">
                  Vassio
                </h2>
                <p className="text-[10px] uppercase tracking-widest font-bold text-[#739D30]">
                  Admin Dashboard
                </p>
              </div>
            </div>

            {/* Mobile Close Drawer Button */}
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="md:hidden p-1.5 text-muted-foreground hover:text-foreground rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Active Navigation Items */}
          <div className="space-y-1">
            <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground/70 px-3 mb-2">
              Main Menu
            </p>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id as any);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-[12px] text-xs font-semibold tracking-wide transition-all cursor-pointer group ${
                    isActive
                      ? "bg-[#739D30] text-white shadow-sm shadow-[#739D30]/20 font-bold"
                      : "text-muted-foreground hover:bg-[#EEF5E3]/70 hover:text-foreground"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 transition-colors ${
                        isActive
                          ? "text-white"
                          : "text-muted-foreground group-hover:text-[#739D30]"
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isActive
                          ? "bg-white text-[#739D30]"
                          : "bg-[#739D30]/15 text-[#739D30]"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Future-Ready Placeholders Section */}
          <div className="mt-6 pt-6 border-t border-[#D9E3C5]/40 space-y-1">
            <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground/70 px-3 mb-2">
              Store Extensions
            </p>
            {placeholderNavItems.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-[12px] text-xs font-medium text-muted-foreground/60 opacity-75 cursor-not-allowed"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  <span className="text-[9px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded bg-muted/60 text-muted-foreground">
                    Soon
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sidebar Bottom User Section */}
        <div className="p-4 border-t border-[#D9E3C5]/50 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-[#3F673F] text-white flex items-center justify-center text-xs font-bold shadow-sm shrink-0">
                {user?.name?.[0] || "A"}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-[#2F4B2F] truncate max-w-[110px]">
                  {user?.name || "Master Administrator"}
                </p>
                <p className="text-[10px] text-muted-foreground capitalize font-medium">
                  {role || "Administrator"}
                </p>
              </div>
            </div>

            <button
              onClick={logout}
              title="Logout"
              className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-colors cursor-pointer shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Drawer Overlay Backdrop */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/30 backdrop-blur-xs z-30 md:hidden"
        />
      )}

      {/* ========================================================================= */}
      {/* MAIN CONTENT AREA (RIGHT OF SIDEBAR: md:ml-[220px] lg:ml-[260px]) */}
      {/* ========================================================================= */}
      <div className="flex-1 flex flex-col min-w-0 md:ml-[220px] lg:ml-[260px]">
        {/* Minimal Top Header Bar */}
        <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-[#D9E3C5]/60 px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-xl bg-[#EEF5E3] text-[#2F4B2F] hover:bg-[#EEF5E3]/80"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="serif text-xl sm:text-2xl font-extrabold text-[#2F4B2F] tracking-wide capitalize">
              {activeTab === "overview"
                ? "Dashboard Overview"
                : activeTab === "revenue"
                ? "Revenue & Analytics"
                : activeTab}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Global Search Input */}
            <div className="relative hidden sm:block w-48 lg:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search catalog, orders..."
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-[#D9E3C5] text-xs focus:outline-none focus:ring-2 focus:ring-[#739D30] bg-white font-medium"
              />
            </div>

            {/* Notifications Button */}
            <button className="relative p-2 rounded-xl border border-[#D9E3C5] bg-white text-muted-foreground hover:text-foreground hover:bg-[#EEF5E3]/50 transition cursor-pointer">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#739D30] rounded-full" />
            </button>

            {/* Refresh Button */}
            <button
              onClick={loadDashboardData}
              disabled={dataLoading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#D9E3C5] text-xs font-semibold text-[#2F4B2F] hover:bg-[#EEF5E3] transition shadow-xs cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${dataLoading ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </header>

        {/* Dashboard Main Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-8 max-w-[1600px] mx-auto w-full">
          {/* ========================================================================= */}
          {/* TAB 1: OVERVIEW DASHBOARD */}
          {/* ========================================================================= */}
          {activeTab === "overview" && (
            <div className="space-y-8">
              {/* Responsive KPI Card Grid: Desktop 4, Tablet 2, Mobile 1 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="bg-white border border-[#D9E3C5]/60 rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      Total Revenue
                    </span>
                    <div className="p-2.5 rounded-xl bg-[#739D30]/10 text-[#739D30]">
                      <DollarSign className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-2xl sm:text-3xl font-extrabold text-[#2F4B2F] mt-3 font-sans">
                    ₹{metrics?.totalRevenue.toLocaleString() || "0"}
                  </p>
                  <span className="text-[11px] text-emerald-600 font-bold mt-1 inline-block">
                    ↑ Lifetime Paid Revenue
                  </span>
                </div>

                <div className="bg-white border border-[#D9E3C5]/60 rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      Monthly Revenue
                    </span>
                    <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-2xl sm:text-3xl font-extrabold text-[#2F4B2F] mt-3 font-sans">
                    ₹{metrics?.monthlyRevenue.toLocaleString() || "0"}
                  </p>
                  <span className="text-[11px] text-muted-foreground font-medium mt-1 inline-block">
                    Current Month
                  </span>
                </div>

                <div className="bg-white border border-[#D9E3C5]/60 rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      Total Orders
                    </span>
                    <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600">
                      <ShoppingBag className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-2xl sm:text-3xl font-extrabold text-[#2F4B2F] mt-3 font-sans">
                    {metrics?.totalOrders || 0}
                  </p>
                  <span className="text-[11px] text-muted-foreground font-medium mt-1 inline-block">
                    All Customer Transactions
                  </span>
                </div>

                <div className="bg-white border border-[#D9E3C5]/60 rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      Pending Action
                    </span>
                    <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600">
                      <Clock className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-2xl sm:text-3xl font-extrabold text-amber-700 mt-3 font-sans">
                    {metrics?.pendingOrders || 0}
                  </p>
                  <span className="text-[11px] text-amber-600 font-bold mt-1 inline-block">
                    Requires Fulfillment
                  </span>
                </div>
              </div>

              {/* Table Container with Sticky Header */}
              <div className="bg-white border border-[#D9E3C5]/60 rounded-3xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="serif text-xl font-extrabold text-[#2F4B2F]">Recent Store Orders</h3>
                    <p className="text-xs text-muted-foreground font-medium mt-0.5">
                      Latest customer orders requiring processing
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab("orders")}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#739D30] hover:underline cursor-pointer"
                  >
                    <span>View All Orders</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-[#D9E3C5]/40">
                  <table className="w-full text-left text-xs">
                    <thead className="sticky top-0 bg-[#FCFCF8] z-10 border-b border-[#D9E3C5]/50 text-muted-foreground font-semibold uppercase text-[10px] tracking-wider">
                      <tr>
                        <th className="py-3 px-4">Order ID</th>
                        <th className="py-3 px-4">Customer</th>
                        <th className="py-3 px-4">Items</th>
                        <th className="py-3 px-4">Total</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Payment</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#D9E3C5]/30">
                      {metrics?.recentOrders.map((ord) => (
                        <tr key={ord.id} className="hover:bg-[#EEF5E3]/40 transition-colors">
                          <td className="py-3.5 px-4 font-bold text-[#2F4B2F]">{ord.order_number}</td>
                          <td className="py-3.5 px-4 font-semibold">
                            <div>{ord.customer_name}</div>
                            <div className="text-[10px] text-muted-foreground font-normal">{ord.customer_email}</div>
                          </td>
                          <td className="py-3.5 px-4 font-medium text-muted-foreground">
                            {ord.items.map((i) => `${i.name} (x${i.quantity})`).join(", ")}
                          </td>
                          <td className="py-3.5 px-4 font-bold text-[#2F4B2F]">
                            ₹{ord.total_amount.toLocaleString()}
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                ord.order_status === "completed"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : ord.order_status === "processing"
                                  ? "bg-blue-100 text-blue-800"
                                  : ord.order_status === "pending"
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-rose-100 text-rose-800"
                              }`}
                            >
                              {ord.order_status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                ord.payment_status === "paid"
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-amber-50 text-amber-700"
                              }`}
                            >
                              {ord.payment_status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: PRODUCTS PAGE (SEARCH, FILTER, ADD, EDIT, DELETE) */}
          {/* ========================================================================= */}
          {activeTab === "products" && (
            <div className="space-y-6">
              {/* Header Bar Actions */}
              <div className="bg-white border border-[#D9E3C5]/60 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="relative w-full sm:w-64">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Filter products..."
                      value={globalSearch}
                      onChange={(e) => setGlobalSearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#D9E3C5] text-xs focus:outline-none focus:ring-2 focus:ring-[#739D30] bg-white font-medium"
                    />
                  </div>

                  <select
                    value={productCategoryFilter}
                    onChange={(e) => setProductCategoryFilter(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-[#D9E3C5] text-xs focus:outline-none focus:ring-2 focus:ring-[#739D30] bg-white font-semibold"
                  >
                    <option value="all">All Categories</option>
                    <option value="fiberglass">Fiberglass Planters</option>
                    <option value="vases">Ceramic Vases</option>
                  </select>
                </div>

                <button
                  onClick={() => setShowAddProductModal(true)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#739D30] hover:bg-[#628828] text-white text-xs font-bold tracking-wide shadow-sm transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Product</span>
                </button>
              </div>

              {/* Modern Products Table */}
              <div className="bg-white border border-[#D9E3C5]/60 rounded-3xl p-6 shadow-sm overflow-hidden">
                <div className="overflow-x-auto rounded-2xl border border-[#D9E3C5]/40">
                  <table className="w-full text-left text-xs">
                    <thead className="sticky top-0 bg-[#FCFCF8] z-10 border-b border-[#D9E3C5]/50 text-muted-foreground font-semibold uppercase text-[10px] tracking-wider">
                      <tr>
                        <th className="py-3 px-4">Product</th>
                        <th className="py-3 px-4">Code / ID</th>
                        <th className="py-3 px-4">Price (₹)</th>
                        <th className="py-3 px-4">MRP (₹)</th>
                        <th className="py-3 px-4">Stock Status</th>
                        <th className="py-3 px-4 text-center">Featured</th>
                        <th className="py-3 px-4 text-center">New Arrival</th>
                        <th className="py-3 px-4 text-center">Active</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#D9E3C5]/30">
                      {paginatedProducts.map((p) => (
                        <tr key={p.product_id} className="hover:bg-[#EEF5E3]/40 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-11 h-11 rounded-xl overflow-hidden bg-card border border-border/40 shrink-0">
                                <img src={p.img} alt={p.name} className="w-full h-full object-cover" />
                              </div>
                              <div>
                                <div className="font-bold text-[#2F4B2F] text-xs">{p.name}</div>
                                <div className="text-[10px] text-muted-foreground font-medium">{p.category}</div>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4 font-bold text-muted-foreground">{p.product_id}</td>

                          {/* Price Input */}
                          <td className="py-3.5 px-4">
                            <input
                              type="number"
                              value={p.price}
                              onChange={(e) =>
                                handleProductUpdate(p.product_id, {
                                  price: Number(e.target.value),
                                  discount_percentage: Math.round(((p.mrp - Number(e.target.value)) / p.mrp) * 100),
                                })
                              }
                              className="w-20 px-2 py-1 border border-[#D9E3C5] rounded-lg text-xs font-bold text-[#2F4B2F] bg-white focus:ring-1 focus:ring-[#739D30]"
                            />
                          </td>

                          {/* MRP Input */}
                          <td className="py-3.5 px-4">
                            <input
                              type="number"
                              value={p.mrp}
                              onChange={(e) =>
                                handleProductUpdate(p.product_id, {
                                  mrp: Number(e.target.value),
                                  discount_percentage: Math.round(((Number(e.target.value) - p.price) / Number(e.target.value)) * 100),
                                })
                              }
                              className="w-20 px-2 py-1 border border-[#D9E3C5] rounded-lg text-xs text-muted-foreground bg-white focus:ring-1 focus:ring-[#739D30]"
                            />
                          </td>

                          {/* Stock Status Selector */}
                          <td className="py-3.5 px-4">
                            <select
                              value={p.stock_status}
                              onChange={(e) => handleProductUpdate(p.product_id, { stock_status: e.target.value as any })}
                              className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase focus:outline-none cursor-pointer border ${
                                p.stock_status === "in_stock"
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                                  : p.stock_status === "out_of_stock"
                                  ? "bg-rose-50 text-rose-700 border-rose-300"
                                  : "bg-amber-50 text-amber-700 border-amber-300"
                              }`}
                            >
                              <option value="in_stock">In Stock</option>
                              <option value="out_of_stock">Out of Stock</option>
                              <option value="pre_order">Pre Order</option>
                            </select>
                          </td>

                          {/* Featured Toggle */}
                          <td className="py-3.5 px-4 text-center">
                            <input
                              type="checkbox"
                              checked={p.featured}
                              onChange={(e) => handleProductUpdate(p.product_id, { featured: e.target.checked })}
                              className="w-4 h-4 accent-[#739D30] cursor-pointer"
                            />
                          </td>

                          {/* New Arrival Toggle */}
                          <td className="py-3.5 px-4 text-center">
                            <input
                              type="checkbox"
                              checked={p.new_arrival}
                              onChange={(e) => handleProductUpdate(p.product_id, { new_arrival: e.target.checked })}
                              className="w-4 h-4 accent-[#739D30] cursor-pointer"
                            />
                          </td>

                          {/* Active Toggle */}
                          <td className="py-3.5 px-4 text-center">
                            <input
                              type="checkbox"
                              checked={p.active}
                              onChange={(e) => handleProductUpdate(p.product_id, { active: e.target.checked })}
                              className="w-4 h-4 accent-[#739D30] cursor-pointer"
                            />
                          </td>

                          {/* Delete Action */}
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => handleDeleteProduct(p.product_id)}
                              className="p-1.5 text-muted-foreground hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                              title="Delete Product"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Table Pagination Controls */}
                <div className="flex items-center justify-between pt-4 text-xs text-muted-foreground font-medium">
                  <div>
                    Showing {(prodPage - 1) * itemsPerPage + 1} to{" "}
                    {Math.min(prodPage * itemsPerPage, filteredProducts.length)} of{" "}
                    {filteredProducts.length} entries
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setProdPage((p) => Math.max(1, p - 1))}
                      disabled={prodPage === 1}
                      className="p-1.5 rounded-lg border border-[#D9E3C5] hover:bg-[#EEF5E3] disabled:opacity-40 cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="font-bold text-[#2F4B2F]">
                      Page {prodPage} of {totalProdPages}
                    </span>
                    <button
                      onClick={() => setProdPage((p) => Math.min(totalProdPages, p + 1))}
                      disabled={prodPage === totalProdPages}
                      className="p-1.5 rounded-lg border border-[#D9E3C5] hover:bg-[#EEF5E3] disabled:opacity-40 cursor-pointer"
                    >
                      <RightIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* ─── Variant Management Panel ─────────────────────────────────────────── */}
              <ProductVariantManager products={products} />
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: ORDERS PAGE */}
          {/* ========================================================================= */}
          {activeTab === "orders" && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 bg-white border border-[#D9E3C5]/60 rounded-2xl p-4 shadow-sm">
                <div className="flex items-center gap-2">
                  {["all", "pending", "processing", "completed", "cancelled"].map((st) => (
                    <button
                      key={st}
                      onClick={() => setOrderStatusFilter(st)}
                      className={`px-3 py-1.5 rounded-xl text-xs uppercase font-bold tracking-wider cursor-pointer transition ${
                        orderStatusFilter === st
                          ? "bg-[#739D30] text-white shadow-sm"
                          : "bg-[#EEF5E3]/60 text-muted-foreground hover:bg-[#EEF5E3]"
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
                <div className="text-xs font-semibold text-muted-foreground">
                  Found {filteredOrders.length} Orders
                </div>
              </div>

              <div className="space-y-4">
                {filteredOrders.map((ord) => (
                  <div key={ord.id} className="bg-white border border-[#D9E3C5]/60 rounded-3xl p-6 shadow-sm space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#D9E3C5]/40">
                      <div>
                        <span className="serif text-lg font-extrabold text-[#2F4B2F] mr-3">{ord.order_number}</span>
                        <span className="text-xs text-muted-foreground font-medium">
                          {new Date(ord.created_at).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <select
                          value={ord.order_status}
                          onChange={(e) => handleOrderUpdate(ord.id, { order_status: e.target.value as any })}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold uppercase border bg-white cursor-pointer"
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>

                        <select
                          value={ord.payment_status}
                          onChange={(e) => handleOrderUpdate(ord.id, { payment_status: e.target.value as any })}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold uppercase border bg-white cursor-pointer"
                        >
                          <option value="pending">Payment Pending</option>
                          <option value="paid">Payment Paid</option>
                          <option value="refunded">Refunded</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                      <div>
                        <span className="font-bold text-[#2F4B2F] uppercase text-[10px] tracking-wider block mb-1">Customer</span>
                        <div className="font-bold text-foreground">{ord.customer_name}</div>
                        <div className="text-muted-foreground">{ord.customer_email}</div>
                        <div className="text-muted-foreground">{ord.customer_phone}</div>
                      </div>

                      <div>
                        <span className="font-bold text-[#2F4B2F] uppercase text-[10px] tracking-wider block mb-1">Shipping Address</span>
                        <p className="text-muted-foreground font-medium leading-relaxed">{ord.shipping_address}</p>
                      </div>

                      <div>
                        <span className="font-bold text-[#2F4B2F] uppercase text-[10px] tracking-wider block mb-1">Tracking Number</span>
                        <input
                          type="text"
                          placeholder="e.g. BLRD-9988231"
                          value={ord.tracking_number || ""}
                          onChange={(e) => handleOrderUpdate(ord.id, { tracking_number: e.target.value })}
                          className="w-full px-2.5 py-1.5 border border-[#D9E3C5] rounded-xl text-xs font-medium bg-white"
                        />
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[#D9E3C5]/30 flex items-center justify-between text-xs font-bold text-[#2F4B2F]">
                      <span>Order Total:</span>
                      <span className="text-base text-[#739D30]">₹{ord.total_amount.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 4: CUSTOMERS PAGE */}
          {/* ========================================================================= */}
          {activeTab === "customers" && (
            <div className="bg-white border border-[#D9E3C5]/60 rounded-3xl p-6 shadow-sm overflow-hidden">
              <div className="overflow-x-auto rounded-2xl border border-[#D9E3C5]/40">
                <table className="w-full text-left text-xs">
                  <thead className="sticky top-0 bg-[#FCFCF8] z-10 border-b border-[#D9E3C5]/50 text-muted-foreground font-semibold uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Customer Name</th>
                      <th className="py-3 px-4">Email</th>
                      <th className="py-3 px-4">Phone</th>
                      <th className="py-3 px-4 text-center">Total Orders</th>
                      <th className="py-3 px-4">Total Spent (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#D9E3C5]/30">
                    {filteredCustomers.map((c) => (
                      <tr key={c.id} className="hover:bg-[#EEF5E3]/40 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-[#2F4B2F]">{c.name}</td>
                        <td className="py-3.5 px-4 text-muted-foreground">{c.email}</td>
                        <td className="py-3.5 px-4 text-muted-foreground font-medium">{c.phone || "N/A"}</td>
                        <td className="py-3.5 px-4 text-center font-bold text-[#739D30]">{c.total_orders}</td>
                        <td className="py-3.5 px-4 font-extrabold text-[#2F4B2F]">₹{c.total_spent.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 5: REVENUE / ANALYTICS PAGE */}
          {/* ========================================================================= */}
          {activeTab === "revenue" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                <div className="bg-white border border-[#D9E3C5]/60 rounded-2xl p-6 shadow-sm">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Sales Volume</span>
                  <p className="text-3xl font-extrabold text-[#2F4B2F] mt-2 font-sans">
                    ₹{metrics?.totalRevenue.toLocaleString() || "0"}
                  </p>
                </div>
                <div className="bg-white border border-[#D9E3C5]/60 rounded-2xl p-6 shadow-sm">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Average Order Value</span>
                  <p className="text-3xl font-extrabold text-[#739D30] mt-2 font-sans">
                    ₹{metrics?.totalOrders ? Math.round(metrics.totalRevenue / metrics.totalOrders).toLocaleString() : "0"}
                  </p>
                </div>
                <div className="bg-white border border-[#D9E3C5]/60 rounded-2xl p-6 shadow-sm">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Completed Fulfillment Rate</span>
                  <p className="text-3xl font-extrabold text-emerald-600 mt-2 font-sans">
                    {metrics?.totalOrders ? Math.round((metrics.completedOrders / metrics.totalOrders) * 100) : 100}%
                  </p>
                </div>
              </div>

              {/* Best Selling Products List */}
              <div className="bg-white border border-[#D9E3C5]/60 rounded-3xl p-6 shadow-sm">
                <h3 className="serif text-xl font-extrabold text-[#2F4B2F] mb-4">Top Performing Products</h3>
                <div className="space-y-3">
                  {products.slice(0, 4).map((p, idx) => (
                    <div key={p.product_id} className="flex items-center justify-between p-3 rounded-xl bg-[#EEF5E3]/40 border border-[#D9E3C5]/30">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-sm text-[#739D30] w-6 text-center">#{idx + 1}</span>
                        <img src={p.img} alt={p.name} className="w-10 h-10 rounded-lg object-cover" />
                        <div>
                          <div className="font-bold text-xs text-[#2F4B2F]">{p.name}</div>
                          <div className="text-[10px] text-muted-foreground">{p.category}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-xs text-[#2F4B2F]">₹{p.price.toLocaleString()}</div>
                        <div className="text-[10px] text-emerald-600 font-bold">{p.discount_percentage}% OFF</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB: REVIEWS MODERATION */}
          {/* ========================================================================= */}
          {activeTab === "reviews" && <AdminReviewsView products={products} />}

          {/* ========================================================================= */}
          {/* TAB 6: SETTINGS PAGE */}
          {/* ========================================================================= */}
          {activeTab === "settings" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border border-[#D9E3C5]/60 rounded-3xl p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-3">
                  <UserCheck className="w-6 h-6 text-[#739D30]" />
                  <div>
                    <h3 className="serif text-xl font-extrabold text-[#2F4B2F]">Admin User Capabilities</h3>
                    <p className="text-xs text-muted-foreground">Current user role & privileges</p>
                  </div>
                </div>
                <div className="space-y-2 text-xs pt-2">
                  <div className="flex justify-between py-2 border-b border-[#D9E3C5]/30">
                    <span className="font-semibold text-muted-foreground">User:</span>
                    <span className="font-bold text-[#2F4B2F]">{user?.email}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-[#D9E3C5]/30">
                    <span className="font-semibold text-muted-foreground">Role:</span>
                    <span className="font-bold uppercase tracking-wider text-[#739D30]">{role}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-[#D9E3C5]/30">
                    <span className="font-semibold text-muted-foreground">Delete Products Permission:</span>
                    <span className="font-bold text-emerald-600">{isAdmin ? "Allowed (Admin)" : "Restricted (Staff)"}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-[#D9E3C5]/60 rounded-3xl p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-3">
                  <Database className="w-6 h-6 text-[#3F673F]" />
                  <div>
                    <h3 className="serif text-xl font-extrabold text-[#2F4B2F]">Supabase Infrastructure</h3>
                    <p className="text-xs text-muted-foreground">Database & RLS status</p>
                  </div>
                </div>
                <div className="space-y-2 text-xs pt-2">
                  <div className="flex justify-between py-2 border-b border-[#D9E3C5]/30">
                    <span className="font-semibold text-muted-foreground">Connection Status:</span>
                    <span className={`font-bold ${isSupabaseConfigured ? "text-emerald-600" : "text-amber-600"}`}>
                      {isSupabaseConfigured ? "Connected to Supabase" : "Local Development Mode"}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-[#D9E3C5]/30">
                    <span className="font-semibold text-muted-foreground">RLS Security Policies:</span>
                    <span className="font-bold text-emerald-600">Enabled</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ========================================================================= */}
      {/* MODAL: ADD PRODUCT MODAL */}
      {/* ========================================================================= */}
      {showAddProductModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#D9E3C5] rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#D9E3C5]/50">
              <h3 className="serif text-2xl font-extrabold text-[#2F4B2F]">Add New Product</h3>
              <button onClick={() => setShowAddProductModal(false)} className="p-1 rounded-lg hover:bg-muted">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            <form onSubmit={handleAddProductSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#2F4B2F] mb-1 uppercase tracking-wider text-[10px]">
                  Product Code / ID (e.g. VSS99)
                </label>
                <input
                  type="text"
                  required
                  value={newProductForm.product_id}
                  onChange={(e) => setNewProductForm({ ...newProductForm, product_id: e.target.value })}
                  placeholder="VSS99"
                  className="w-full px-3 py-2 rounded-xl border border-[#D9E3C5] font-bold text-foreground"
                />
              </div>

              <div>
                <label className="block font-bold text-[#2F4B2F] mb-1 uppercase tracking-wider text-[10px]">
                  Product Title
                </label>
                <input
                  type="text"
                  required
                  value={newProductForm.name}
                  onChange={(e) => setNewProductForm({ ...newProductForm, name: e.target.value })}
                  placeholder="e.g. Zen Tapered Fiberplanter"
                  className="w-full px-3 py-2 rounded-xl border border-[#D9E3C5] font-semibold text-foreground"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#2F4B2F] mb-1 uppercase tracking-wider text-[10px]">
                    Price (₹)
                  </label>
                  <input
                    type="number"
                    required
                    value={newProductForm.price}
                    onChange={(e) => setNewProductForm({ ...newProductForm, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-[#D9E3C5] font-bold text-foreground"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#2F4B2F] mb-1 uppercase tracking-wider text-[10px]">
                    MRP (₹)
                  </label>
                  <input
                    type="number"
                    required
                    value={newProductForm.mrp}
                    onChange={(e) => setNewProductForm({ ...newProductForm, mrp: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-[#D9E3C5] text-muted-foreground"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#2F4B2F] mb-1 uppercase tracking-wider text-[10px]">
                  Category
                </label>
                <select
                  value={newProductForm.category}
                  onChange={(e) => setNewProductForm({ ...newProductForm, category: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#D9E3C5] font-semibold text-foreground bg-white"
                >
                  <option value="Fiberglass Planters">Fiberglass Planters</option>
                  <option value="Ceramic Vases">Ceramic Vases</option>
                  <option value="Decoratives">Decoratives</option>
                </select>
              </div>

              <div className="flex items-center gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newProductForm.featured}
                    onChange={(e) => setNewProductForm({ ...newProductForm, featured: e.target.checked })}
                    className="w-4 h-4 accent-[#739D30]"
                  />
                  <span className="font-semibold text-xs">Featured</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newProductForm.new_arrival}
                    onChange={(e) => setNewProductForm({ ...newProductForm, new_arrival: e.target.checked })}
                    className="w-4 h-4 accent-[#739D30]"
                  />
                  <span className="font-semibold text-xs">New Arrival</span>
                </label>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-[#D9E3C5]/40">
                <button
                  type="button"
                  onClick={() => setShowAddProductModal(false)}
                  className="px-4 py-2 rounded-xl border border-[#D9E3C5] text-xs font-semibold text-muted-foreground hover:bg-muted cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#739D30] hover:bg-[#628828] text-white text-xs font-bold shadow-sm cursor-pointer"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PRODUCT VARIANT MANAGER COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

function ProductVariantManager({ products }: { products: AdminProduct[] }) {
  const [expandedProduct, setExpandedProduct] = React.useState<string | null>(null);
  const [variantState, setVariantState] = React.useState<Record<string, ReturnType<typeof getVariants>>>({});
  // New size form
  const [newSizeId, setNewSizeId] = React.useState("");
  const [newSizeLabel, setNewSizeLabel] = React.useState("");
  const [newSizeDim, setNewSizeDim] = React.useState("");
  // New color form
  const [newColorId, setNewColorId] = React.useState("");
  const [newColorName, setNewColorName] = React.useState("");
  const [newColorHex, setNewColorHex] = React.useState("#739D30");

  // Load variants for a product when it's expanded
  const handleExpand = (code: string) => {
    if (expandedProduct === code) {
      setExpandedProduct(null);
      return;
    }
    setExpandedProduct(code);
    setVariantState((prev) => ({ ...prev, [code]: getVariants(code) }));
    // Reset form fields
    setNewSizeId(""); setNewSizeLabel(""); setNewSizeDim("");
    setNewColorId(""); setNewColorName(""); setNewColorHex("#739D30");
  };

  const refreshVariants = (code: string) => {
    setVariantState((prev) => ({ ...prev, [code]: getVariants(code) }));
  };

  const handleToggleSize = (code: string, sizeId: string, available: boolean) => {
    toggleSizeAvailability(code, sizeId, available);
    refreshVariants(code);
    toast.success(`Size "${sizeId}" ${available ? "enabled" : "disabled"}`);
  };

  const handleToggleColor = (code: string, colorId: string, available: boolean) => {
    toggleColorAvailability(code, colorId, available);
    refreshVariants(code);
    toast.success(`Color "${colorId}" ${available ? "enabled" : "disabled"}`);
  };

  const handleAddSize = (code: string) => {
    if (!newSizeId.trim() || !newSizeLabel.trim()) {
      toast.error("Size ID and Label are required");
      return;
    }
    addSizeVariant(code, {
      id: newSizeId.trim(),
      label: newSizeLabel.trim(),
      dimensions: newSizeDim.trim() || undefined,
      available: true,
    });
    refreshVariants(code);
    setNewSizeId(""); setNewSizeLabel(""); setNewSizeDim("");
    toast.success("Size added");
  };

  const handleAddColor = (code: string) => {
    if (!newColorId.trim() || !newColorName.trim()) {
      toast.error("Color ID and Name are required");
      return;
    }
    addColorVariant(code, {
      id: newColorId.trim().toLowerCase(),
      name: newColorName.trim(),
      hex: newColorHex,
      available: true,
    });
    refreshVariants(code);
    setNewColorId(""); setNewColorName(""); setNewColorHex("#739D30");
    toast.success("Color added");
  };

  const handleRemoveSize = (code: string, sizeId: string) => {
    removeSizeVariant(code, sizeId);
    refreshVariants(code);
    toast.success("Size removed");
  };

  const handleRemoveColor = (code: string, colorId: string) => {
    removeColorVariant(code, colorId);
    refreshVariants(code);
    toast.success("Color removed");
  };

  return (
    <div className="bg-white border border-[#D9E3C5]/60 rounded-3xl p-6 shadow-sm">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="serif text-xl font-extrabold text-[#2F4B2F]">Variant Management</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage sizes and colors for each product. Click a product to expand.
          </p>
        </div>
        <div className="px-3 py-1 bg-[#EEF5E3] rounded-full text-[10px] font-bold text-[#3F673F] uppercase tracking-wider">
          {products.length} Products
        </div>
      </div>

      {/* Product List */}
      <div className="space-y-3">
        {products.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">
            No products found. Add products first via Supabase or the Add Product form above.
          </p>
        )}

        {products.map((p) => {
          const isOpen = expandedProduct === p.product_id;
          const vd = variantState[p.product_id];

          return (
            <div
              key={p.product_id}
              className="border border-[#D9E3C5]/50 rounded-2xl overflow-hidden transition-all duration-200"
            >
              {/* Product Row Header */}
              <button
                onClick={() => handleExpand(p.product_id)}
                className="w-full flex items-center justify-between gap-4 px-5 py-4 hover:bg-[#EEF5E3]/40 transition-colors cursor-pointer text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl overflow-hidden bg-card border border-border/40 shrink-0">
                    <img src={p.img} alt={p.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="font-bold text-[#2F4B2F] text-sm">{p.name}</p>
                    <p className="text-[10px] text-muted-foreground font-medium">{p.product_id}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {isOpen && vd && (
                    <div className="hidden sm:flex items-center gap-2 text-[10px] text-muted-foreground font-semibold">
                      <span className="px-2 py-0.5 bg-[#EEF5E3] rounded-full text-[#3F673F]">
                        {vd.sizes.length} Sizes
                      </span>
                      <span className="px-2 py-0.5 bg-[#EEF5E3] rounded-full text-[#3F673F]">
                        {vd.colors.length} Colors
                      </span>
                    </div>
                  )}
                  <ChevronRight
                    className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${isOpen ? "rotate-90" : ""}`}
                  />
                </div>
              </button>

              {/* Expanded Variant Editor */}
              {isOpen && vd && (
                <div className="border-t border-[#D9E3C5]/40 px-5 pb-6 pt-5 bg-[#FCFCF8] space-y-8">
                  {/* ── SIZES ── */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-[11px] uppercase tracking-[0.3em] font-bold text-[#2F4B2F]">
                        Sizes
                      </p>
                      <span className="text-[10px] text-muted-foreground">
                        {vd.sizes.filter((s) => s.available).length} of {vd.sizes.length} available
                      </span>
                    </div>

                    {/* Existing Sizes */}
                    <div className="space-y-2 mb-4">
                      {vd.sizes
                        .sort((a, b) => a.displayOrder - b.displayOrder)
                        .map((sz) => (
                          <div
                            key={sz.id}
                            className="flex items-center justify-between gap-4 px-4 py-3 bg-white border border-[#D9E3C5]/40 rounded-xl"
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`h-8 w-8 rounded-lg flex items-center justify-center text-xs font-bold border-2 ${
                                  sz.available
                                    ? "border-[#739D30] bg-[#739D30] text-white"
                                    : "border-border/40 bg-muted/30 text-muted-foreground/50"
                                }`}
                              >
                                {sz.label}
                              </div>
                              <div>
                                <p className="text-xs font-bold text-[#2F4B2F]">
                                  Size {sz.label}
                                </p>
                                {sz.dimensions && (
                                  <p className="text-[10px] text-muted-foreground">{sz.dimensions}</p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                              {/* Availability Toggle */}
                              <button
                                onClick={() => handleToggleSize(p.product_id, sz.id, !sz.available)}
                                className={`relative inline-flex h-5 w-9 cursor-pointer rounded-full border-2 transition-all duration-200 ${
                                  sz.available
                                    ? "border-[#739D30] bg-[#739D30]"
                                    : "border-border bg-border/30"
                                }`}
                                title={sz.available ? "Mark unavailable" : "Mark available"}
                              >
                                <span
                                  className={`absolute top-0 h-4 w-4 rounded-full bg-white shadow transition-all duration-200 ${
                                    sz.available ? "translate-x-4" : "translate-x-0"
                                  }`}
                                />
                              </button>
                              <span
                                className={`text-[10px] font-bold uppercase tracking-wide ${
                                  sz.available ? "text-emerald-600" : "text-rose-500"
                                }`}
                              >
                                {sz.available ? "Available" : "Unavailable"}
                              </span>
                              {/* Delete */}
                              <button
                                onClick={() => handleRemoveSize(p.product_id, sz.id)}
                                className="p-1.5 text-muted-foreground hover:text-rose-500 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                                title="Remove size"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>

                    {/* Add New Size */}
                    <div className="flex flex-wrap gap-2 items-end p-4 bg-white border border-dashed border-[#D9E3C5] rounded-xl">
                      <div>
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide block mb-1">ID *</label>
                        <input
                          type="text"
                          placeholder="D"
                          value={newSizeId}
                          onChange={(e) => setNewSizeId(e.target.value)}
                          className="w-16 px-2 py-1.5 border border-[#D9E3C5] rounded-lg text-xs focus:ring-1 focus:ring-[#739D30] outline-none font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide block mb-1">Label *</label>
                        <input
                          type="text"
                          placeholder="D"
                          value={newSizeLabel}
                          onChange={(e) => setNewSizeLabel(e.target.value)}
                          className="w-20 px-2 py-1.5 border border-[#D9E3C5] rounded-lg text-xs focus:ring-1 focus:ring-[#739D30] outline-none"
                        />
                      </div>
                      <div className="flex-1 min-w-[140px]">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide block mb-1">Dimensions</label>
                        <input
                          type="text"
                          placeholder='H: 40", Top: 16"'
                          value={newSizeDim}
                          onChange={(e) => setNewSizeDim(e.target.value)}
                          className="w-full px-2 py-1.5 border border-[#D9E3C5] rounded-lg text-xs focus:ring-1 focus:ring-[#739D30] outline-none"
                        />
                      </div>
                      <button
                        onClick={() => handleAddSize(p.product_id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#739D30] hover:bg-[#628828] text-white text-xs font-bold shadow-sm transition cursor-pointer shrink-0"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add Size
                      </button>
                    </div>
                  </div>

                  {/* ── COLORS ── */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-[11px] uppercase tracking-[0.3em] font-bold text-[#2F4B2F]">
                        Colors
                      </p>
                      <span className="text-[10px] text-muted-foreground">
                        {vd.colors.filter((c) => c.available).length} of {vd.colors.length} available
                      </span>
                    </div>

                    {/* Existing Colors */}
                    <div className="space-y-2 mb-4">
                      {vd.colors
                        .sort((a, b) => a.displayOrder - b.displayOrder)
                        .map((c) => (
                          <div
                            key={c.id}
                            className="flex items-center justify-between gap-4 px-4 py-3 bg-white border border-[#D9E3C5]/40 rounded-xl"
                          >
                            <div className="flex items-center gap-3">
                              {/* Swatch */}
                              <span
                                className="h-8 w-8 rounded-lg border border-border/30 shadow-sm shrink-0 block"
                                style={{ backgroundColor: c.hex }}
                              />
                              <div>
                                <p className="text-xs font-bold text-[#2F4B2F]">{c.name}</p>
                                <p className="text-[10px] text-muted-foreground font-mono">{c.hex}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                              {/* Availability Toggle */}
                              <button
                                onClick={() => handleToggleColor(p.product_id, c.id, !c.available)}
                                className={`relative inline-flex h-5 w-9 cursor-pointer rounded-full border-2 transition-all duration-200 ${
                                  c.available
                                    ? "border-[#739D30] bg-[#739D30]"
                                    : "border-border bg-border/30"
                                }`}
                                title={c.available ? "Mark unavailable" : "Mark available"}
                              >
                                <span
                                  className={`absolute top-0 h-4 w-4 rounded-full bg-white shadow transition-all duration-200 ${
                                    c.available ? "translate-x-4" : "translate-x-0"
                                  }`}
                                />
                              </button>
                              <span
                                className={`text-[10px] font-bold uppercase tracking-wide ${
                                  c.available ? "text-emerald-600" : "text-rose-500"
                                }`}
                              >
                                {c.available ? "Available" : "Unavailable"}
                              </span>
                              {/* Delete */}
                              <button
                                onClick={() => handleRemoveColor(p.product_id, c.id)}
                                className="p-1.5 text-muted-foreground hover:text-rose-500 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                                title="Remove color"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>

                    {/* Add New Color */}
                    <div className="flex flex-wrap gap-2 items-end p-4 bg-white border border-dashed border-[#D9E3C5] rounded-xl">
                      <div>
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide block mb-1">ID *</label>
                        <input
                          type="text"
                          placeholder="sage-green"
                          value={newColorId}
                          onChange={(e) => setNewColorId(e.target.value)}
                          className="w-24 px-2 py-1.5 border border-[#D9E3C5] rounded-lg text-xs focus:ring-1 focus:ring-[#739D30] outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide block mb-1">Name *</label>
                        <input
                          type="text"
                          placeholder="Sage Green"
                          value={newColorName}
                          onChange={(e) => setNewColorName(e.target.value)}
                          className="w-28 px-2 py-1.5 border border-[#D9E3C5] rounded-lg text-xs focus:ring-1 focus:ring-[#739D30] outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide block mb-1">Hex Color</label>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="color"
                            value={newColorHex}
                            onChange={(e) => setNewColorHex(e.target.value)}
                            className="h-8 w-10 rounded border border-[#D9E3C5] cursor-pointer p-0.5"
                          />
                          <span className="text-[10px] font-mono text-muted-foreground">{newColorHex}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleAddColor(p.product_id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#739D30] hover:bg-[#628828] text-white text-xs font-bold shadow-sm transition cursor-pointer shrink-0"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add Color
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AdminReviewsView({ products }: { products: AdminProduct[] }) {
  const [reviews, setReviews] = useState<Review[]>(() => reviewStore.getAllReviews());
  const [search, setSearch] = useState("");
  const [productFilter, setProductFilter] = useState("all");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [replyingId, setReplyingId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  const refresh = () => {
    setReviews(reviewStore.getAllReviews());
  };

  const handleStatus = (id: string, status: "approved" | "rejected" | "pending") => {
    reviewStore.updateReviewStatus(id, status);
    toast.success(`Review status updated to ${status}`);
    refresh();
  };

  const handleDelete = (id: string) => {
    reviewStore.deleteReview(id);
    toast.success("Review deleted");
    refresh();
  };

  const handleSaveReply = (id: string) => {
    if (!replyText.trim()) return;
    reviewStore.addAdminReply(id, replyText.trim());
    toast.success("Official response published");
    setReplyingId(null);
    setReplyText("");
    refresh();
  };

  const filteredReviews = reviews.filter((r) => {
    const matchesSearch =
      r.customerName.toLowerCase().includes(search.toLowerCase()) ||
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.description.toLowerCase().includes(search.toLowerCase()) ||
      r.productId.toLowerCase().includes(search.toLowerCase());
    const matchesProduct = productFilter === "all" || r.productId === productFilter;
    const matchesRating = ratingFilter === "all" || r.rating === Number(ratingFilter);
    const matchesStatus = statusFilter === "all" || r.status === statusFilter;
    return matchesSearch && matchesProduct && matchesRating && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header & Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-[#D9E3C5]/60 rounded-2xl p-4 shadow-sm">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Total Reviews</span>
          <p className="text-2xl font-extrabold text-[#2F4B2F] mt-1">{reviews.length}</p>
        </div>
        <div className="bg-white border border-[#D9E3C5]/60 rounded-2xl p-4 shadow-sm">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Approved</span>
          <p className="text-2xl font-extrabold text-emerald-600 mt-1">
            {reviews.filter((r) => r.status === "approved").length}
          </p>
        </div>
        <div className="bg-white border border-[#D9E3C5]/60 rounded-2xl p-4 shadow-sm">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Pending Review</span>
          <p className="text-2xl font-extrabold text-amber-600 mt-1">
            {reviews.filter((r) => r.status === "pending").length}
          </p>
        </div>
        <div className="bg-white border border-[#D9E3C5]/60 rounded-2xl p-4 shadow-sm">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Average Rating</span>
          <p className="text-2xl font-extrabold text-[#739D30] mt-1">
            {(reviews.reduce((acc, r) => acc + r.rating, 0) / (reviews.length || 1)).toFixed(1)} / 5.0
          </p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white border border-[#D9E3C5]/60 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search reviews..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#D9E3C5] text-xs focus:outline-none focus:ring-1 focus:ring-[#739D30]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Product Filter */}
          <select
            value={productFilter}
            onChange={(e) => setProductFilter(e.target.value)}
            className="bg-white border border-[#D9E3C5] rounded-xl px-3 py-2 text-xs font-semibold text-foreground focus:outline-none"
          >
            <option value="all">All Products</option>
            {products.map((p) => (
              <option key={p.product_id} value={p.product_id}>
                {p.product_id} — {p.name}
              </option>
            ))}
          </select>

          {/* Rating Filter */}
          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
            className="bg-white border border-[#D9E3C5] rounded-xl px-3 py-2 text-xs font-semibold text-foreground focus:outline-none"
          >
            <option value="all">All Ratings</option>
            <option value="5">⭐⭐⭐⭐⭐ 5 Stars</option>
            <option value="4">⭐⭐⭐⭐ 4 Stars</option>
            <option value="3">⭐⭐⭐ 3 Stars</option>
            <option value="2">⭐⭐ 2 Stars</option>
            <option value="1">⭐ 1 Star</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border border-[#D9E3C5] rounded-xl px-3 py-2 text-xs font-semibold text-foreground focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.length === 0 ? (
          <div className="bg-white border border-[#D9E3C5]/60 rounded-2xl p-8 text-center text-xs text-muted-foreground">
            No reviews matching your filters.
          </div>
        ) : (
          filteredReviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-white border border-[#D9E3C5]/60 rounded-2xl p-5 shadow-xs space-y-3"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded bg-[#EEF5E3] text-[#3F673F] text-[10px] font-bold uppercase tracking-wider font-mono">
                      {rev.productId}
                    </span>
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-3.5 h-3.5 ${
                            s <= rev.rating ? "fill-[#739D30] text-[#739D30]" : "text-muted-foreground/30"
                          }`}
                        />
                      ))}
                    </div>
                    <h4 className="font-bold text-sm text-[#2F4B2F]">{rev.title}</h4>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="font-bold text-foreground">{rev.customerName}</span>
                    {rev.isVerified && (
                      <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold">
                        Verified Buyer
                      </span>
                    )}
                    {rev.orderId && <span>• Order: {rev.orderId}</span>}
                    <span>• {new Date(rev.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      rev.status === "approved"
                        ? "bg-emerald-100 text-emerald-800"
                        : rev.status === "pending"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-rose-100 text-rose-800"
                    }`}
                  >
                    {rev.status}
                  </span>

                  {/* Actions */}
                  {rev.status !== "approved" && (
                    <button
                      onClick={() => handleStatus(rev.id, "approved")}
                      className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition cursor-pointer"
                    >
                      Approve
                    </button>
                  )}
                  {rev.status !== "rejected" && (
                    <button
                      onClick={() => handleStatus(rev.id, "rejected")}
                      className="px-3 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition cursor-pointer"
                    >
                      Hide
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setReplyingId(replyingId === rev.id ? null : rev.id);
                      setReplyText(rev.adminReply || "");
                    }}
                    className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition cursor-pointer"
                  >
                    Reply
                  </button>
                  <button
                    onClick={() => handleDelete(rev.id)}
                    className="p-1.5 text-muted-foreground hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                    title="Delete Review"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed">"{rev.description}"</p>

              {/* Admin reply present */}
              {rev.adminReply && replyingId !== rev.id && (
                <div className="bg-[#EEF5E3]/60 border-l-2 border-[#739D30] rounded-r-xl p-3 text-xs">
                  <span className="font-bold text-[#2F4B2F] block mb-0.5">Vassio Studio Reply:</span>
                  <p className="text-muted-foreground">{rev.adminReply}</p>
                </div>
              )}

              {/* Reply Form */}
              {replyingId === rev.id && (
                <div className="pt-3 border-t border-[#D9E3C5]/40 space-y-2">
                  <label className="text-[10px] font-bold text-[#2F4B2F] uppercase tracking-wider block">
                    Official Studio Response
                  </label>
                  <textarea
                    rows={3}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Thank you for your feedback..."
                    className="w-full p-3 rounded-xl border border-[#D9E3C5] text-xs focus:outline-none focus:ring-1 focus:ring-[#739D30]"
                  />
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => setReplyingId(null)}
                      className="px-3 py-1.5 rounded-lg border border-[#D9E3C5] text-xs font-semibold text-muted-foreground"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleSaveReply(rev.id)}
                      className="px-4 py-1.5 rounded-lg bg-[#739D30] hover:bg-[#628828] text-white text-xs font-bold shadow-xs"
                    >
                      Publish Response
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
