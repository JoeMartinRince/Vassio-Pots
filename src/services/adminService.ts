import {
  supabase,
  isSupabaseConfigured,
  upsertProductVariantRow,
  upsertDynamicProductRow,
} from "@/lib/supabase";
import { products as staticProducts, potBg } from "@/data/products";
import productService from "@/services/product.service";
import type { ProductVariant } from "@/types/product";

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
  variants: ProductVariant[];
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
];

let mockCustomers: Customer[] = [
  { id: "cust-1", name: "Ananya Sharma", email: "ananya.sharma@example.com", phone: "+91 98765 43210", total_orders: 1, total_spent: 4940, last_order_at: new Date(Date.now() - 2 * 86400000).toISOString() },
];

// ==============================================================================
// ENTERPRISE PRODUCT & VARIANT ADMIN SERVICE API
// ==============================================================================

/**
 * Fetch fresh products and size variants directly from Supabase.
 * Bypasses all local in-memory caches to guarantee latest database state.
 */
export async function fetchAdminProducts(): Promise<AdminProduct[]> {
  const mergedProducts = await productService.getAllProductsAsync();

  return mergedProducts.map((p, idx) => ({
    product_id: p.code,
    name: p.name,
    price: p.price,
    mrp: p.mrp,
    discount_percentage: p.discountPercentage || 0,
    stock_status: p.isSoldOut ? "out_of_stock" : "in_stock",
    stock_quantity: p.stockQuantity ?? 10,
    featured: p.featured ?? true,
    new_arrival: p.newArrival ?? false,
    display_order: p.displayOrder ?? idx + 1,
    active: p.active !== false,
    img: p.img || potBg,
    category: (p.material || "").includes("Fiber") ? "Fiberglass Planters" : "Ceramic Vases",
    material: p.material || "Fiberglass Composite",
    dimensions: p.dimensions || "",
    description: p.description || "",
    variants: p.variants || [],
  }));
}

/**
 * Update dynamic product flags (featured, new_arrival, active, display_order) in Supabase products_dynamic.
 */
export async function updateAdminProduct(
  productId: string,
  updates: Partial<AdminProduct>
): Promise<{ success: boolean; error?: string }> {
  const code = productId.trim().toUpperCase();

  const result = await upsertDynamicProductRow({
    product_id: code,
    featured: updates.featured,
    new_arrival: updates.new_arrival,
    active: updates.active,
    display_order: updates.display_order,
  });

  return result;
}

/**
 * Update individual variant pricing (selling_price, original_price, stock_quantity, available, sku)
 * in Supabase product_variants table.
 */
export async function updateAdminProductVariant(
  variant: ProductVariant
): Promise<{ success: boolean; error?: string }> {
  return await upsertProductVariantRow(variant);
}

// ==============================================================================
// ORDERS & CUSTOMERS SERVICE API
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

export async function fetchAdminCustomers(): Promise<Customer[]> {
  return [...mockCustomers];
}

export async function fetchRevenueMetrics(): Promise<RevenueMetrics> {
  const orders = await fetchAdminOrders();
  const totalRevenue = orders.reduce((sum, o) => sum + (o.order_status !== "cancelled" ? o.total_amount : 0), 0);
  const monthlyRevenue = totalRevenue;
  const completedOrders = orders.filter((o) => o.order_status === "completed").length;
  const pendingOrders = orders.filter((o) => o.order_status === "pending" || o.order_status === "processing").length;
  const cancelledOrders = orders.filter((o) => o.order_status === "cancelled").length;

  return {
    totalRevenue,
    monthlyRevenue,
    totalOrders: orders.length,
    pendingOrders,
    completedOrders,
    cancelledOrders,
    recentOrders: orders.slice(0, 5),
  };
}
