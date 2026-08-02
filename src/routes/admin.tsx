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
    "overview" | "products" | "orders" | "customers" | "revenue" | "settings"
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
    const success = await updateAdminProduct(productId, updates);
    if (success) {
      toast.success(`Updated ${productId}`);
      setProducts((prev) =>
        prev.map((p) => (p.product_id === productId ? { ...p, ...updates } : p))
      );
    } else {
      toast.error("Failed to update product");
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
  const handleAddProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductForm.product_id || !newProductForm.name) {
      toast.error("Please fill in Product Code and Name");
      return;
    }

    const created: AdminProduct = {
      product_id: newProductForm.product_id.toUpperCase(),
      name: newProductForm.name,
      price: Number(newProductForm.price) || 3000,
      mrp: Number(newProductForm.mrp) || 4500,
      discount_percentage: Math.round(
        (((Number(newProductForm.mrp) || 4500) - (Number(newProductForm.price) || 3000)) /
          (Number(newProductForm.mrp) || 4500)) *
          100
      ),
      stock_status: (newProductForm.stock_status as any) || "in_stock",
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

    setProducts((prev) => [created, ...prev]);
    updateAdminProduct(created.product_id, created);
    setShowAddProductModal(false);
    toast.success(`Product ${created.product_id} added successfully`);
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
                placeholder="admin@vassio.com or staff@vassio.com"
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
                placeholder="admin123"
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
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials */}
          <div className="mt-6 pt-6 border-t border-[#D9E3C5]/40 text-center">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Quick Demo Credentials:
            </p>
            <div className="grid grid-cols-2 gap-2 text-left">
              <div
                onClick={() => {
                  setLoginEmail("admin@vassio.com");
                  setLoginPass("admin123");
                }}
                className="p-2 rounded-lg bg-[#EEF5E3]/60 border border-[#D9E3C5] hover:bg-[#EEF5E3] cursor-pointer text-xs"
              >
                <div className="font-bold text-[#3F673F]">Master Admin</div>
                <div className="text-[10px] text-muted-foreground">admin@vassio.com</div>
              </div>
              <div
                onClick={() => {
                  setLoginEmail("staff@vassio.com");
                  setLoginPass("admin123");
                }}
                className="p-2 rounded-lg bg-[#EEF5E3]/60 border border-[#D9E3C5] hover:bg-[#EEF5E3] cursor-pointer text-xs"
              >
                <div className="font-bold text-[#3F673F]">Staff Operations</div>
                <div className="text-[10px] text-muted-foreground">staff@vassio.com</div>
              </div>
            </div>
          </div>
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
    { id: "revenue", label: "Revenue / Analytics", icon: TrendingUp },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  // Placeholder navigation items
  const placeholderNavItems = [
    { label: "Categories", icon: Layers },
    { label: "Coupons", icon: Tag },
    { label: "Reviews", icon: Star },
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
