import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { products as staticProducts, potBg } from "@/data/products";

export interface AdminProduct {
  db_id?: string;
  product_id: string; // connects to static product code (e.g. 'FLX48', 'LFS70')
  name: string;
  price: number;
  mrp: number;
  discount_percentage: number;
  stock_status: "in_stock" | "out_of_stock" | "pre_order";
  featured: boolean;
  new_arrival: boolean;
  display_order: number;
  active: boolean;
  img: any;
  category: string;
  material: string;
  dimensions: string;
  description: string;
}

export interface OrderItem {
  product_id: string;
  name: string;
  price: number;
  quantity: number;
  size?: string;
  image?: any;
}

export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  items: OrderItem[];
  subtotal: number;
  discount_amount: number;
  total_amount: number;
  order_status: "pending" | "processing" | "completed" | "cancelled";
  payment_status: "pending" | "paid" | "refunded";
  shipping_status: "unshipped" | "shipped" | "delivered";
  tracking_number?: string | null;
  created_at: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  total_orders: number;
  total_spent: number;
  last_order_at: string;
}

export interface RevenueMetrics {
  totalRevenue: number;
  monthlyRevenue: number;
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  recentOrders: Order[];
}

// ==============================================================================
// IN-MEMORY FALLBACK STORE (Used when Supabase is not yet connected via env)
// ==============================================================================

let mockDynamicProducts: Record<string, Partial<AdminProduct>> = {
  FLX48: { price: 5200, mrp: 7500, discount_percentage: 30, stock_status: "in_stock", featured: true, new_arrival: true, display_order: 1, active: true },
  LFS70: { price: 4500, mrp: 6500, discount_percentage: 30, stock_status: "in_stock", featured: true, new_arrival: false, display_order: 2, active: true },
  LFS69: { price: 4500, mrp: 6500, discount_percentage: 30, stock_status: "in_stock", featured: false, new_arrival: true, display_order: 3, active: true },
  VNL83: { price: 3000, mrp: 4500, discount_percentage: 33, stock_status: "in_stock", featured: true, new_arrival: true, display_order: 4, active: true },
  ARC84: { price: 5500, mrp: 8000, discount_percentage: 31, stock_status: "in_stock", featured: true, new_arrival: false, display_order: 5, active: true },
  FFT2399: { price: 14999, mrp: 23999, discount_percentage: 37, stock_status: "in_stock", featured: false, new_arrival: false, display_order: 6, active: true },
};

let mockOrders: Order[] = [
  {
    id: "ord-1001",
    order_number: "VAS-1001",
    customer_name: "Ananya Sharma",
    customer_email: "ananya.sharma@example.com",
    customer_phone: "+91 98765 43210",
    shipping_address: "42 Lotus Boulevard, Bandra West, Mumbai 400050",
    items: [{ product_id: "FLX48", name: "Flax Series Tapered Vases", price: 5200, quantity: 1, size: "Flax-D (H: 21\")" }],
    subtotal: 5200,
    discount_amount: 260,
    total_amount: 4940,
    order_status: "completed",
    payment_status: "paid",
    shipping_status: "delivered",
    tracking_number: "BLRD-9988231",
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: "ord-1002",
    order_number: "VAS-1002",
    customer_name: "Vikramaditya Roy",
    customer_email: "vikram.roy@example.com",
    customer_phone: "+91 98123 88765",
    shipping_address: "88 Park Street, 4th Floor, Kolkata 700016",
    items: [{ product_id: "ARC84", name: "Areca Ribbed Planters - Set of 3", price: 5500, quantity: 1, size: "Set of 3" }],
    subtotal: 5500,
    discount_amount: 0,
    total_amount: 5500,
    order_status: "processing",
    payment_status: "paid",
    shipping_status: "shipped",
    tracking_number: "BLRD-9988450",
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: "ord-1003",
    order_number: "VAS-1003",
    customer_name: "Priya Nair",
    customer_email: "priya.nair@example.com",
    customer_phone: "+91 97455 11223",
    shipping_address: "15 Indiranagar 100ft Road, Bengaluru 560038",
    items: [{ product_id: "VNL83", name: "VANILLA Planters - Set of 3", price: 3000, quantity: 2, size: "Set of 3" }],
    subtotal: 6000,
    discount_amount: 300,
    total_amount: 5700,
    order_status: "pending",
    payment_status: "pending",
    shipping_status: "unshipped",
    tracking_number: null,
    created_at: new Date(Date.now() - 3 * 3600000).toISOString(),
  },
  {
    id: "ord-1004",
    order_number: "VAS-1004",
    customer_name: "Rohan Mehta",
    customer_email: "rohan.mehta@example.com",
    customer_phone: "+91 99001 22334",
    shipping_address: "702 DLF Phase 5, Gurugram 122002",
    items: [{ product_id: "FFT2399", name: "Faux Ficus Tree — 6 Feet", price: 14999, quantity: 1, size: "6 Feet" }],
    subtotal: 14999,
    discount_amount: 750,
    total_amount: 14249,
    order_status: "completed",
    payment_status: "paid",
    shipping_status: "delivered",
    tracking_number: "BLRD-9987110",
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
];

let mockCustomers: Customer[] = [
  { id: "cust-1", name: "Ananya Sharma", email: "ananya.sharma@example.com", phone: "+91 98765 43210", total_orders: 1, total_spent: 4940, last_order_at: new Date(Date.now() - 2 * 86400000).toISOString() },
  { id: "cust-2", name: "Vikramaditya Roy", email: "vikram.roy@example.com", phone: "+91 98123 88765", total_orders: 1, total_spent: 5500, last_order_at: new Date(Date.now() - 1 * 86400000).toISOString() },
  { id: "cust-3", name: "Priya Nair", email: "priya.nair@example.com", phone: "+91 97455 11223", total_orders: 1, total_spent: 5700, last_order_at: new Date(Date.now() - 3 * 3600000).toISOString() },
  { id: "cust-4", name: "Rohan Mehta", email: "rohan.mehta@example.com", phone: "+91 99001 22334", total_orders: 1, total_spent: 14249, last_order_at: new Date(Date.now() - 5 * 86400000).toISOString() },
];

// ==============================================================================
// PRODUCT SERVICE API
// ==============================================================================

export async function fetchAdminProducts(): Promise<AdminProduct[]> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase.from("products").select("*").order("display_order", { ascending: true });

      if (!error && data && data.length > 0) {
        const dbMap = new Map(data.map((item) => [item.product_id, item]));

        return staticProducts.map((sp, idx) => {
          const dbItem = dbMap.get(sp.code);
          return {
            db_id: dbItem?.id,
            product_id: sp.code,
            name: sp.name,
            price: dbItem ? Number(dbItem.price) : sp.price,
            mrp: dbItem ? Number(dbItem.mrp) : sp.mrp,
            discount_percentage: dbItem ? Number(dbItem.discount_percentage) : Math.round(((sp.mrp - sp.price) / sp.mrp) * 100),
            stock_status: dbItem?.stock_status || "in_stock",
            featured: dbItem !== undefined ? dbItem.featured : true,
            new_arrival: dbItem !== undefined ? dbItem.new_arrival : false,
            display_order: dbItem?.display_order || idx + 1,
            active: dbItem !== undefined ? dbItem.active : true,
            img: sp.img || potBg,
            category: sp.material?.includes("Fiber") ? "Fiberglass Planters" : "Ceramic Vases",
            material: sp.material || "Fiberglass Composite",
            dimensions: sp.dimensions || "",
            description: sp.description || "",
          };
        });
      }
    } catch (e) {
      console.warn("Falling back to local dynamic product store:", e);
    }
  }

  // Fallback to static catalog + mock store
  return staticProducts.map((sp, idx) => {
    const dyn = mockDynamicProducts[sp.code] || {};
    return {
      product_id: sp.code,
      name: sp.name,
      price: dyn.price ?? sp.price,
      mrp: dyn.mrp ?? sp.mrp,
      discount_percentage: dyn.discount_percentage ?? Math.round(((sp.mrp - sp.price) / sp.mrp) * 100),
      stock_status: (dyn.stock_status as any) || "in_stock",
      featured: dyn.featured ?? true,
      new_arrival: dyn.new_arrival ?? false,
      display_order: dyn.display_order ?? idx + 1,
      active: dyn.active ?? true,
      img: sp.img || potBg,
      category: sp.material?.includes("Fiber") ? "Fiberglass Planters" : "Ceramic Vases",
      material: sp.material || "Fiberglass Composite",
      dimensions: sp.dimensions || "",
      description: sp.description || "",
    };
  });
}

export async function updateAdminProduct(productId: string, updates: Partial<AdminProduct>): Promise<boolean> {
  if (isSupabaseConfigured) {
    try {
      const payload: any = { updated_at: new Date().toISOString() };
      if (updates.price !== undefined) payload.price = updates.price;
      if (updates.mrp !== undefined) payload.mrp = updates.mrp;
      if (updates.discount_percentage !== undefined) payload.discount_percentage = updates.discount_percentage;
      if (updates.stock_status !== undefined) payload.stock_status = updates.stock_status;
      if (updates.featured !== undefined) payload.featured = updates.featured;
      if (updates.new_arrival !== undefined) payload.new_arrival = updates.new_arrival;
      if (updates.display_order !== undefined) payload.display_order = updates.display_order;
      if (updates.active !== undefined) payload.active = updates.active;

      const { error } = await supabase.from("products").upsert({ product_id: productId, ...payload }, { onConflict: "product_id" });
      if (!error) return true;
    } catch (e) {
      console.warn("Error updating product in Supabase:", e);
    }
  }

  // Update mock fallback
  mockDynamicProducts[productId] = { ...mockDynamicProducts[productId], ...updates };
  return true;
}

// ==============================================================================
// ORDERS SERVICE API
// ==============================================================================

export async function fetchAdminOrders(): Promise<Order[]> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
      if (!error && data) return data as Order[];
    } catch (e) {
      console.warn("Falling back to mock orders store:", e);
    }
  }
  return [...mockOrders];
}

export async function updateAdminOrder(
  orderId: string,
  updates: Partial<Pick<Order, "order_status" | "payment_status" | "shipping_status" | "tracking_number">>
): Promise<boolean> {
  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase.from("orders").update({ ...updates, updated_at: new Date().toISOString() }).eq("id", orderId);
      if (!error) return true;
    } catch (e) {
      console.warn("Error updating order in Supabase:", e);
    }
  }

  // Mock update
  mockOrders = mockOrders.map((ord) => (ord.id === orderId ? { ...ord, ...updates } : ord));
  return true;
}

// ==============================================================================
// CUSTOMERS SERVICE API
// ==============================================================================

export async function fetchAdminCustomers(): Promise<Customer[]> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase.from("customers").select("*").order("total_spent", { ascending: false });
      if (!error && data) return data as Customer[];
    } catch (e) {
      console.warn("Falling back to mock customer store:", e);
    }
  }
  return [...mockCustomers];
}

// ==============================================================================
// REVENUE & DASHBOARD METRICS API
// ==============================================================================

export async function fetchRevenueMetrics(): Promise<RevenueMetrics> {
  const orders = await fetchAdminOrders();

  const totalRevenue = orders
    .filter((o) => o.payment_status === "paid")
    .reduce((sum, o) => sum + Number(o.total_amount), 0);

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const monthlyRevenue = orders
    .filter((o) => {
      const d = new Date(o.created_at);
      return o.payment_status === "paid" && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    })
    .reduce((sum, o) => sum + Number(o.total_amount), 0);

  return {
    totalRevenue,
    monthlyRevenue,
    totalOrders: orders.length,
    pendingOrders: orders.filter((o) => o.order_status === "pending").length,
    completedOrders: orders.filter((o) => o.order_status === "completed").length,
    cancelledOrders: orders.filter((o) => o.order_status === "cancelled").length,
    recentOrders: orders.slice(0, 5),
  };
}
