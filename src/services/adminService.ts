import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { products as staticProducts, potBg } from "@/data/products";
import productService from "@/services/product.service";

export interface AdminProduct {
  db_id?: string;
  product_id: string; // connects to static product code (e.g. 'FLX48', 'LFS70')
  name: string;
  price: number;
  mrp: number;
  discount_percentage: number;
  stock_status: "in_stock" | "out_of_stock" | "pre_order";
  stock_quantity?: number;
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
// ADMIN PRODUCT SERVICE — reads/writes Supabase products_dynamic
// ==============================================================================

// No hardcoded prices here. All dynamic data must come from Supabase.
// The productService module-level cache (Map) is the single source of truth.
export const mockDynamicProducts: Record<string, Partial<AdminProduct>> = {};

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
];

let mockCustomers: Customer[] = [
  { id: "cust-1", name: "Ananya Sharma", email: "ananya.sharma@example.com", phone: "+91 98765 43210", total_orders: 1, total_spent: 4940, last_order_at: new Date(Date.now() - 2 * 86400000).toISOString() },
  { id: "cust-2", name: "Vikramaditya Roy", email: "vikram.roy@example.com", phone: "+91 98123 88765", total_orders: 1, total_spent: 5500, last_order_at: new Date(Date.now() - 1 * 86400000).toISOString() },
];

// ==============================================================================
// PRODUCT SERVICE API (Synchronized with Supabase products_dynamic)
// ==============================================================================

export async function fetchAdminProducts(): Promise<AdminProduct[]> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from("products_dynamic")
        .select("*")
        .order("display_order", { ascending: true });

      if (!error && data && data.length > 0) {
        const dbMap = new Map(data.map((item) => [item.product_id?.toUpperCase(), item]));

        // Update in-memory cache
        data.forEach((item) => {
          if (item.product_id) {
            mockDynamicProducts[item.product_id.toUpperCase()] = {
              price: Number(item.selling_price ?? item.price),
              mrp: Number(item.original_price ?? item.mrp),
              discount_percentage: Number(item.discount_percentage ?? 0),
              stock_status: item.stock_status || (item.stock_quantity > 0 ? "in_stock" : "out_of_stock"),
              stock_quantity: item.stock_quantity,
              featured: Boolean(item.featured),
              new_arrival: Boolean(item.new_arrival),
              display_order: Number(item.display_order ?? 99),
              active: item.active !== false,
            };
          }
        });

        return staticProducts.map((sp, idx) => {
          const dbItem = dbMap.get(sp.code.toUpperCase());
          const sellingPrice = dbItem ? Number(dbItem.selling_price ?? dbItem.price ?? sp.price) : sp.price;
          const originalPrice = dbItem ? Number(dbItem.original_price ?? dbItem.mrp ?? sp.mrp) : sp.mrp;
          const disc = dbItem?.discount_percentage !== undefined ? Number(dbItem.discount_percentage) : Math.round(((originalPrice - sellingPrice) / originalPrice) * 100);

          return {
            db_id: dbItem?.id,
            product_id: sp.code,
            name: sp.name,
            price: sellingPrice,
            mrp: originalPrice,
            discount_percentage: disc,
            stock_status: dbItem?.stock_status || (dbItem?.stock_quantity !== undefined && dbItem.stock_quantity <= 0 ? "out_of_stock" : "in_stock"),
            stock_quantity: dbItem?.stock_quantity,
            featured: dbItem !== undefined ? Boolean(dbItem.featured) : true,
            new_arrival: dbItem !== undefined ? Boolean(dbItem.new_arrival) : false,
            display_order: dbItem?.display_order || idx + 1,
            active: dbItem !== undefined ? dbItem.active !== false : true,
            img: sp.img || potBg,
            category: sp.material?.includes("Fiber") ? "Fiberglass Planters" : "Ceramic Vases",
            material: sp.material || "Fiberglass Composite",
            dimensions: sp.dimensions || "",
            description: sp.description || "",
          };
        });
      }
    } catch (e) {
      console.warn("[Vassio Supabase] Admin fetch notice, using fallback cache:", e);
    }
  }

  // Fallback map using static catalog + cache
  return staticProducts.map((sp, idx) => {
    const dyn = mockDynamicProducts[sp.code.toUpperCase()] || {};
    return {
      product_id: sp.code,
      name: sp.name,
      price: dyn.price ?? sp.price,
      mrp: dyn.mrp ?? sp.mrp,
      discount_percentage: dyn.discount_percentage ?? Math.round(((sp.mrp - sp.price) / sp.mrp) * 100),
      stock_status: (dyn.stock_status as any) || "in_stock",
      stock_quantity: dyn.stock_quantity,
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
  const code = productId.toUpperCase();

  // Build Supabase payload — map AdminProduct fields to products_dynamic column names
  const payload: Record<string, any> = {
    product_id: code,
    updated_at: new Date().toISOString(),
  };
  if (updates.price !== undefined)             payload.selling_price = Number(updates.price);
  if (updates.mrp !== undefined)               payload.original_price = Number(updates.mrp);
  if (updates.discount_percentage !== undefined) payload.discount_percentage = Number(updates.discount_percentage);
  if (updates.stock_status !== undefined)      payload.stock_status = updates.stock_status;
  if (updates.stock_quantity !== undefined)    payload.stock_quantity = Number(updates.stock_quantity);
  if (updates.featured !== undefined)          payload.featured = Boolean(updates.featured);
  if (updates.new_arrival !== undefined)       payload.new_arrival = Boolean(updates.new_arrival);
  if (updates.display_order !== undefined)     payload.display_order = Number(updates.display_order);
  if (updates.active !== undefined)            payload.active = Boolean(updates.active);

  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase
        .from("products_dynamic")
        .upsert(payload, { onConflict: "product_id" });

      if (error) {
        console.error("[Vassio Supabase] products_dynamic upsert failed:", error.message, error.code);
        return false;
      }

      // Notify productService cache so the customer UI reflects this change immediately
      productService.updateCache(code, {
        selling_price:       payload.selling_price,
        original_price:      payload.original_price,
        discount_percentage: payload.discount_percentage,
        stock_status:        payload.stock_status,
        stock_quantity:      payload.stock_quantity,
        featured:            payload.featured,
        new_arrival:         payload.new_arrival,
        display_order:       payload.display_order,
        active:              payload.active,
      } as any);

      return true;
    } catch (e) {
      console.error("[Vassio Supabase] Error upserting product:", e);
      return false;
    }
  }

  // Supabase not configured — update local cache only (dev mode)
  productService.updateCache(code, {
    selling_price:  updates.price,
    original_price: updates.mrp,
  } as any);
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
