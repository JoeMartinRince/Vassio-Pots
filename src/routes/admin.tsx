import React, { useState, useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
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
  Settings,
  LogOut,
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  Save,
  Eye,
  Shield,
  Tag,
  AlertTriangle,
  RefreshCw,
  ChevronRight,
  Database,
  Lock,
  UserCheck,
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
  const [activeTab, setActiveTab] = useState<"overview" | "products" | "orders" | "customers" | "settings">("overview");

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
  const [productSearch, setProductSearch] = useState("");
  const [productCategoryFilter, setProductCategoryFilter] = useState("all");
  const [orderStatusFilter, setOrderStatusFilter] = useState("all");
  const [customerSearch, setCustomerSearch] = useState("");

  // Edit Product Modal / Inline Editing state
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<AdminProduct>>({});

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
      toast.success("Successfully logged into Vassio Admin");
    } else {
      toast.error(res.error || "Login failed");
    }
  };

  // Handle Product Field Updates
  const handleProductUpdate = async (productId: string, updates: Partial<AdminProduct>) => {
    const success = await updateAdminProduct(productId, updates);
    if (success) {
      toast.success(`Updated product ${productId}`);
      setProducts((prev) =>
        prev.map((p) => (p.product_id === productId ? { ...p, ...updates } : p))
      );
    } else {
      toast.error("Failed to update product");
    }
  };

  // Handle Order Updates
  const handleOrderUpdate = async (
    orderId: string,
    updates: Partial<Pick<Order, "order_status" | "payment_status" | "shipping_status" | "tracking_number">>
  ) => {
    const success = await updateAdminOrder(orderId, updates);
    if (success) {
      toast.success(`Updated Order ${orders.find((o) => o.id === orderId)?.order_number}`);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, ...updates } : o))
      );
      // Refresh revenue metrics
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
              <Shield className="w-4 h-4" />
              <span>Vassio Admin Portal</span>
            </div>
            <h1 className="serif text-3xl font-extrabold text-[#2F4B2F] tracking-wide">
              Welcome Back
            </h1>
            <p className="text-xs text-muted-foreground mt-2 font-medium">
              Enter your credentials to access the Vassio Store Manager
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
                  <span>Sign In to Dashboard</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials Info */}
          <div className="mt-6 pt-6 border-t border-[#D9E3C5]/40 text-center">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Demo Access Quick Credentials:
            </p>
            <div className="grid grid-cols-2 gap-2 text-left">
              <div
                onClick={() => {
                  setLoginEmail("admin@vassio.com");
                  setLoginPass("admin123");
                }}
                className="p-2 rounded-lg bg-[#EEF5E3]/60 border border-[#D9E3C5] hover:bg-[#EEF5E3] cursor-pointer text-xs"
              >
                <div className="font-bold text-[#3F673F]">Admin Role</div>
                <div className="text-[10px] text-muted-foreground">admin@vassio.com</div>
              </div>
              <div
                onClick={() => {
                  setLoginEmail("staff@vassio.com");
                  setLoginPass("admin123");
                }}
                className="p-2 rounded-lg bg-[#EEF5E3]/60 border border-[#D9E3C5] hover:bg-[#EEF5E3] cursor-pointer text-xs"
              >
                <div className="font-bold text-[#3F673F]">Staff Role</div>
                <div className="text-[10px] text-muted-foreground">staff@vassio.com</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Filtered lists
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.product_id.toLowerCase().includes(productSearch.toLowerCase());
    const matchesCategory =
      productCategoryFilter === "all" ||
      (productCategoryFilter === "fiberglass" && p.category.includes("Fiberglass")) ||
      (productCategoryFilter === "vases" && p.category.includes("Vases"));
    return matchesSearch && matchesCategory;
  });

  const filteredOrders = orders.filter((o) => {
    if (orderStatusFilter === "all") return true;
    return o.order_status === orderStatusFilter;
  });

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
      c.email.toLowerCase().includes(customerSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#FCFCF8] flex flex-col md:flex-row font-sans text-foreground">
      {/* SIDEBAR NAVIGATION */}
      <aside className="w-full md:w-64 bg-white border-r border-[#D9E3C5]/60 p-5 flex flex-col justify-between shrink-0 shadow-sm">
        <div>
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 pb-6 mb-6 border-b border-[#D9E3C5]/50">
            <div className="w-10 h-10 rounded-xl bg-[#739D30] text-white flex items-center justify-center font-extrabold text-lg shadow-sm">
              V
            </div>
            <div>
              <h2 className="serif text-xl font-extrabold text-[#2F4B2F] leading-tight">
                Vassio
              </h2>
              <span className="text-[10px] uppercase tracking-widest font-bold text-[#739D30]">
                Admin Dashboard
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {[
              { id: "overview", label: "Overview", icon: LayoutDashboard },
              { id: "products", label: "Products", icon: Package, badge: products.length },
              { id: "orders", label: "Orders", icon: ShoppingCart, badge: orders.filter((o) => o.order_status === "pending").length },
              { id: "customers", label: "Customers", icon: Users, badge: customers.length },
              { id: "settings", label: "Settings", icon: Settings },
            ].map((nav) => {
              const Icon = nav.icon;
              const isActive = activeTab === nav.id;
              return (
                <button
                  key={nav.id}
                  onClick={() => setActiveTab(nav.id as any)}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                    isActive
                      ? "bg-[#739D30] text-white shadow-sm shadow-[#739D30]/20 font-bold"
                      : "text-muted-foreground hover:bg-[#EEF5E3]/60 hover:text-foreground"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{nav.label}</span>
                  </div>
                  {nav.badge !== undefined && nav.badge > 0 && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isActive
                          ? "bg-white text-[#739D30]"
                          : "bg-[#739D30]/15 text-[#739D30]"
                      }`}
                    >
                      {nav.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Profile & Role Info */}
        <div className="pt-6 border-t border-[#D9E3C5]/50 mt-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#3F673F] text-white flex items-center justify-center text-xs font-bold">
                {user?.name?.[0] || "A"}
              </div>
              <div>
                <p className="text-xs font-bold text-[#2F4B2F] truncate max-w-[110px]">
                  {user?.name}
                </p>
                <span
                  className={`text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded ${
                    isAdmin ? "bg-amber-100 text-amber-800" : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {role}
                </span>
              </div>
            </div>
            <button
              onClick={logout}
              title="Logout"
              className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center justify-between text-[10px] text-muted-foreground/80 font-medium px-1">
            <span>Supabase Status:</span>
            <span className={`inline-flex items-center gap-1 font-bold ${isSupabaseConfigured ? "text-emerald-600" : "text-amber-600"}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isSupabaseConfigured ? "bg-emerald-500" : "bg-amber-500 animate-pulse"}`} />
              {isSupabaseConfigured ? "Live Connected" : "Local Mode"}
            </span>
          </div>
        </div>
      </aside>

      {/* MAIN DASHBOARD CONTENT AREA */}
      <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="serif text-3xl font-extrabold text-[#2F4B2F] tracking-wide capitalize">
              {activeTab === "overview" ? "Dashboard Overview" : activeTab}
            </h1>
            <p className="text-xs text-muted-foreground font-medium mt-1">
              Real-time store management and business performance analytics
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadDashboardData}
              disabled={dataLoading}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-[#D9E3C5] text-xs font-semibold text-[#2F4B2F] hover:bg-[#EEF5E3] transition shadow-sm cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${dataLoading ? "animate-spin" : ""}`} />
              <span>Refresh Data</span>
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: OVERVIEW & REVENUE DASHBOARD */}
        {/* ========================================================================= */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Revenue KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              <div className="bg-white border border-[#D9E3C5]/60 rounded-2xl p-4 shadow-sm relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Total Revenue</span>
                  <div className="p-2 rounded-xl bg-[#739D30]/10 text-[#739D30]">
                    <DollarSign className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-2xl font-extrabold text-[#2F4B2F] mt-2 font-sans">
                  ₹{metrics?.totalRevenue.toLocaleString() || "0"}
                </p>
                <span className="text-[10px] text-emerald-600 font-bold mt-1 inline-block">↑ Paid Orders Total</span>
              </div>

              <div className="bg-white border border-[#D9E3C5]/60 rounded-2xl p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Monthly Revenue</span>
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-2xl font-extrabold text-[#2F4B2F] mt-2 font-sans">
                  ₹{metrics?.monthlyRevenue.toLocaleString() || "0"}
                </p>
                <span className="text-[10px] text-muted-foreground font-medium mt-1 inline-block">This Month</span>
              </div>

              <div className="bg-white border border-[#D9E3C5]/60 rounded-2xl p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Total Orders</span>
                  <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-2xl font-extrabold text-[#2F4B2F] mt-2 font-sans">
                  {metrics?.totalOrders || 0}
                </p>
                <span className="text-[10px] text-muted-foreground font-medium mt-1 inline-block">All Orders</span>
              </div>

              <div className="bg-white border border-[#D9E3C5]/60 rounded-2xl p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Pending Orders</span>
                  <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600">
                    <Clock className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-2xl font-extrabold text-amber-700 mt-2 font-sans">
                  {metrics?.pendingOrders || 0}
                </p>
                <span className="text-[10px] text-amber-600 font-bold mt-1 inline-block">Requires Action</span>
              </div>

              <div className="bg-white border border-[#D9E3C5]/60 rounded-2xl p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Completed</span>
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-2xl font-extrabold text-emerald-700 mt-2 font-sans">
                  {metrics?.completedOrders || 0}
                </p>
                <span className="text-[10px] text-emerald-600 font-bold mt-1 inline-block">Fulfilled</span>
              </div>

              <div className="bg-white border border-[#D9E3C5]/60 rounded-2xl p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Cancelled</span>
                  <div className="p-2 rounded-xl bg-rose-500/10 text-rose-600">
                    <XCircle className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-2xl font-extrabold text-rose-700 mt-2 font-sans">
                  {metrics?.cancelledOrders || 0}
                </p>
                <span className="text-[10px] text-rose-600 font-medium mt-1 inline-block">Voided</span>
              </div>
            </div>

            {/* Quick Recent Orders Table */}
            <div className="bg-white border border-[#D9E3C5]/60 rounded-3xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="serif text-xl font-extrabold text-[#2F4B2F]">Recent Store Orders</h3>
                  <p className="text-xs text-muted-foreground font-medium mt-0.5">Latest customer transactions</p>
                </div>
                <button
                  onClick={() => setActiveTab("orders")}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#739D30] hover:underline cursor-pointer"
                >
                  <span>View All Orders</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#D9E3C5]/40 text-muted-foreground font-semibold uppercase text-[10px] tracking-wider">
                      <th className="py-3 px-3">Order ID</th>
                      <th className="py-3 px-3">Customer</th>
                      <th className="py-3 px-3">Items</th>
                      <th className="py-3 px-3">Amount</th>
                      <th className="py-3 px-3">Order Status</th>
                      <th className="py-3 px-3">Payment</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#D9E3C5]/30">
                    {metrics?.recentOrders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-[#EEF5E3]/30 transition">
                        <td className="py-3.5 px-3 font-bold text-[#2F4B2F]">{ord.order_number}</td>
                        <td className="py-3.5 px-3 font-semibold">
                          <div>{ord.customer_name}</div>
                          <div className="text-[10px] text-muted-foreground">{ord.customer_email}</div>
                        </td>
                        <td className="py-3.5 px-3 font-medium text-muted-foreground">
                          {ord.items.map((i) => `${i.name} (${i.quantity})`).join(", ")}
                        </td>
                        <td className="py-3.5 px-3 font-bold text-[#2F4B2F]">₹{ord.total_amount.toLocaleString()}</td>
                        <td className="py-3.5 px-3">
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
                        <td className="py-3.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              ord.payment_status === "paid" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
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
        {/* TAB 2: PRODUCTS MANAGEMENT (DYNAMIC DATA ONLY, STATIC CONTENT PRESERVED) */}
        {/* ========================================================================= */}
        {activeTab === "products" && (
          <div className="space-y-6">
            {/* Search & Filter Bar */}
            <div className="bg-white border border-[#D9E3C5]/60 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search products by code or title..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-[#D9E3C5] text-xs focus:outline-none focus:ring-2 focus:ring-[#739D30] bg-white"
                />
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <select
                  value={productCategoryFilter}
                  onChange={(e) => setProductCategoryFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-[#D9E3C5] text-xs focus:outline-none focus:ring-2 focus:ring-[#739D30] bg-white font-semibold"
                >
                  <option value="all">All Categories</option>
                  <option value="fiberglass">Fiberglass Planters</option>
                  <option value="vases">Ceramic Vases</option>
                </select>
                <div className="text-xs text-muted-foreground font-semibold">
                  Showing {filteredProducts.length} Products
                </div>
              </div>
            </div>

            {/* Products Table */}
            <div className="bg-white border border-[#D9E3C5]/60 rounded-3xl p-6 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#D9E3C5]/40 text-muted-foreground font-semibold uppercase text-[10px] tracking-wider">
                      <th className="py-3 px-3">Product</th>
                      <th className="py-3 px-3">Code / ID</th>
                      <th className="py-3 px-3">Price (₹)</th>
                      <th className="py-3 px-3">MRP (₹)</th>
                      <th className="py-3 px-3">Offer %</th>
                      <th className="py-3 px-3">Stock Status</th>
                      <th className="py-3 px-3 text-center">Featured</th>
                      <th className="py-3 px-3 text-center">New Arrival</th>
                      <th className="py-3 px-3 text-center">Active</th>
                      <th className="py-3 px-3 text-center">Display Order</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#D9E3C5]/30">
                    {filteredProducts.map((p) => (
                      <tr key={p.product_id} className="hover:bg-[#EEF5E3]/30 transition">
                        {/* Image Preview & Title */}
                        <td className="py-3.5 px-3">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl overflow-hidden bg-card border border-border/40 shrink-0">
                              <img src={p.img} alt={p.name} className="w-full h-full object-cover" />
                            </div>
                            <div>
                              <div className="font-bold text-[#2F4B2F] text-xs">{p.name}</div>
                              <div className="text-[10px] text-muted-foreground font-medium">{p.category}</div>
                            </div>
                          </div>
                        </td>

                        {/* Code */}
                        <td className="py-3.5 px-3 font-bold text-muted-foreground">{p.product_id}</td>

                        {/* Price Input */}
                        <td className="py-3.5 px-3">
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
                        <td className="py-3.5 px-3">
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

                        {/* Discount % Badge */}
                        <td className="py-3.5 px-3">
                          <span className="px-2 py-1 rounded-md bg-[#3F673F] text-white text-[10px] font-bold border border-[#5B8550]">
                            {p.discount_percentage}% OFF
                          </span>
                        </td>

                        {/* Stock Status Selector */}
                        <td className="py-3.5 px-3">
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
                        <td className="py-3.5 px-3 text-center">
                          <input
                            type="checkbox"
                            checked={p.featured}
                            onChange={(e) => handleProductUpdate(p.product_id, { featured: e.target.checked })}
                            className="w-4 h-4 accent-[#739D30] cursor-pointer"
                          />
                        </td>

                        {/* New Arrival Toggle */}
                        <td className="py-3.5 px-3 text-center">
                          <input
                            type="checkbox"
                            checked={p.new_arrival}
                            onChange={(e) => handleProductUpdate(p.product_id, { new_arrival: e.target.checked })}
                            className="w-4 h-4 accent-[#739D30] cursor-pointer"
                          />
                        </td>

                        {/* Active Toggle */}
                        <td className="py-3.5 px-3 text-center">
                          <input
                            type="checkbox"
                            checked={p.active}
                            onChange={(e) => handleProductUpdate(p.product_id, { active: e.target.checked })}
                            className="w-4 h-4 accent-[#739D30] cursor-pointer"
                          />
                        </td>

                        {/* Display Order */}
                        <td className="py-3.5 px-3 text-center">
                          <input
                            type="number"
                            value={p.display_order}
                            onChange={(e) => handleProductUpdate(p.product_id, { display_order: Number(e.target.value) })}
                            className="w-14 px-2 py-1 border border-[#D9E3C5] rounded-lg text-xs font-semibold text-center bg-white"
                          />
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
        {/* TAB 3: ORDERS MANAGEMENT */}
        {/* ========================================================================= */}
        {activeTab === "orders" && (
          <div className="space-y-6">
            {/* Filter Tabs */}
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
                Showing {filteredOrders.length} Orders
              </div>
            </div>

            {/* Orders Cards List */}
            <div className="space-y-4">
              {filteredOrders.map((ord) => (
                <div key={ord.id} className="bg-white border border-[#D9E3C5]/60 rounded-3xl p-6 shadow-sm space-y-4">
                  {/* Top Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#D9E3C5]/40">
                    <div>
                      <span className="serif text-lg font-extrabold text-[#2F4B2F] mr-3">{ord.order_number}</span>
                      <span className="text-xs text-muted-foreground font-medium">
                        {new Date(ord.created_at).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        value={ord.order_status}
                        onChange={(e) => handleOrderUpdate(ord.id, { order_status: e.target.value as any })}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold uppercase border bg-white cursor-pointer focus:ring-1 focus:ring-[#739D30]"
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>

                      <select
                        value={ord.payment_status}
                        onChange={(e) => handleOrderUpdate(ord.id, { payment_status: e.target.value as any })}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold uppercase border bg-white cursor-pointer focus:ring-1 focus:ring-[#739D30]"
                      >
                        <option value="pending">Payment Pending</option>
                        <option value="paid">Payment Paid</option>
                        <option value="refunded">Refunded</option>
                      </select>
                    </div>
                  </div>

                  {/* Customer Info & Address */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div>
                      <span className="font-bold text-[#2F4B2F] uppercase text-[10px] tracking-wider block mb-1">Customer Details</span>
                      <div className="font-bold text-foreground">{ord.customer_name}</div>
                      <div className="text-muted-foreground">{ord.customer_email}</div>
                      <div className="text-muted-foreground">{ord.customer_phone}</div>
                    </div>

                    <div>
                      <span className="font-bold text-[#2F4B2F] uppercase text-[10px] tracking-wider block mb-1">Shipping Address</span>
                      <p className="text-muted-foreground font-medium leading-relaxed">{ord.shipping_address}</p>
                    </div>

                    <div>
                      <span className="font-bold text-[#2F4B2F] uppercase text-[10px] tracking-wider block mb-1">Shipping & Tracking</span>
                      <div className="flex items-center gap-2 mb-2">
                        <select
                          value={ord.shipping_status}
                          onChange={(e) => handleOrderUpdate(ord.id, { shipping_status: e.target.value as any })}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold border bg-white"
                        >
                          <option value="unshipped">Unshipped</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                        </select>
                      </div>
                      <input
                        type="text"
                        placeholder="Tracking Number (e.g. BLRD-9988231)"
                        value={ord.tracking_number || ""}
                        onChange={(e) => handleOrderUpdate(ord.id, { tracking_number: e.target.value })}
                        className="w-full px-2.5 py-1 border border-[#D9E3C5] rounded-lg text-xs font-medium bg-white"
                      />
                    </div>
                  </div>

                  {/* Ordered Items Table */}
                  <div className="pt-3 border-t border-[#D9E3C5]/30">
                    <span className="font-bold text-[#2F4B2F] uppercase text-[10px] tracking-wider block mb-2">Items Ordered</span>
                    <div className="space-y-2">
                      {ord.items.map((it, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs py-1.5 px-3 rounded-xl bg-[#EEF5E3]/40">
                          <div className="font-semibold text-foreground">
                            {it.name} <span className="text-muted-foreground font-normal">({it.size || "Standard"}) x {it.quantity}</span>
                          </div>
                          <div className="font-bold text-[#2F4B2F]">₹{(it.price * it.quantity).toLocaleString()}</div>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-3 mt-3 border-t border-[#D9E3C5]/30 font-bold text-sm text-[#2F4B2F]">
                      <span>Order Total:</span>
                      <span className="text-base text-[#739D30]">₹{ord.total_amount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: CUSTOMERS DIRECTORY */}
        {/* ========================================================================= */}
        {activeTab === "customers" && (
          <div className="space-y-6">
            <div className="bg-white border border-[#D9E3C5]/60 rounded-2xl p-4 shadow-sm flex items-center justify-between">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search customers by name or email..."
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-[#D9E3C5] text-xs focus:outline-none focus:ring-2 focus:ring-[#739D30] bg-white"
                />
              </div>
              <div className="text-xs text-muted-foreground font-semibold">
                Total Customers: {filteredCustomers.length}
              </div>
            </div>

            <div className="bg-white border border-[#D9E3C5]/60 rounded-3xl p-6 shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#D9E3C5]/40 text-muted-foreground font-semibold uppercase text-[10px] tracking-wider">
                      <th className="py-3 px-3">Customer Name</th>
                      <th className="py-3 px-3">Email Address</th>
                      <th className="py-3 px-3">Phone</th>
                      <th className="py-3 px-3 text-center">Total Orders</th>
                      <th className="py-3 px-3">Total Spent (₹)</th>
                      <th className="py-3 px-3">Last Order Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#D9E3C5]/30">
                    {filteredCustomers.map((c) => (
                      <tr key={c.id} className="hover:bg-[#EEF5E3]/30 transition">
                        <td className="py-3.5 px-3 font-bold text-[#2F4B2F]">{c.name}</td>
                        <td className="py-3.5 px-3 text-muted-foreground">{c.email}</td>
                        <td className="py-3.5 px-3 text-muted-foreground font-medium">{c.phone || "N/A"}</td>
                        <td className="py-3.5 px-3 text-center font-bold text-[#739D30]">{c.total_orders}</td>
                        <td className="py-3.5 px-3 font-extrabold text-[#2F4B2F]">₹{c.total_spent.toLocaleString()}</td>
                        <td className="py-3.5 px-3 text-muted-foreground font-medium">
                          {new Date(c.last_order_at).toLocaleDateString()}
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
        {/* TAB 5: SETTINGS & SECURITY */}
        {/* ========================================================================= */}
        {activeTab === "settings" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Profile & Role Capability */}
              <div className="bg-white border border-[#D9E3C5]/60 rounded-3xl p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#739D30] text-white flex items-center justify-center font-extrabold">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="serif text-xl font-extrabold text-[#2F4B2F]">Active Admin Credentials</h3>
                    <p className="text-xs text-muted-foreground">Logged in role capabilities</p>
                  </div>
                </div>

                <div className="space-y-2 text-xs pt-2">
                  <div className="flex justify-between py-2 border-b border-[#D9E3C5]/30">
                    <span className="font-semibold text-muted-foreground">Email:</span>
                    <span className="font-bold text-[#2F4B2F]">{user?.email}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-[#D9E3C5]/30">
                    <span className="font-semibold text-muted-foreground">Assigned Role:</span>
                    <span className="font-bold uppercase tracking-wider text-[#739D30]">{role}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-[#D9E3C5]/30">
                    <span className="font-semibold text-muted-foreground">Delete Products Permission:</span>
                    <span className="font-bold text-emerald-600">{isAdmin ? "Allowed (Admin)" : "Restricted (Staff)"}</span>
                  </div>
                </div>
              </div>

              {/* Supabase Status */}
              <div className="bg-white border border-[#D9E3C5]/60 rounded-3xl p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#3F673F] text-white flex items-center justify-center font-extrabold">
                    <Database className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="serif text-xl font-extrabold text-[#2F4B2F]">Supabase Infrastructure</h3>
                    <p className="text-xs text-muted-foreground">Backend connection status</p>
                  </div>
                </div>

                <div className="space-y-2 text-xs pt-2">
                  <div className="flex justify-between py-2 border-b border-[#D9E3C5]/30">
                    <span className="font-semibold text-muted-foreground">Connection State:</span>
                    <span className={`font-bold ${isSupabaseConfigured ? "text-emerald-600" : "text-amber-600"}`}>
                      {isSupabaseConfigured ? "Connected (VITE_SUPABASE_URL)" : "Local Development Mode"}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-[#D9E3C5]/30">
                    <span className="font-semibold text-muted-foreground">Row Level Security (RLS):</span>
                    <span className="font-bold text-emerald-600">Enabled</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
