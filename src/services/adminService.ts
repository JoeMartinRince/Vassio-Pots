import { supabase, isSupabaseConfigured, upsertProductVariant } from "@/lib/supabase";
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
];

let mockCustomers: Customer[] = [
  { id: "cust-1", name: "Ananya Sharma", email: "ananya.sharma@example.com", phone: "+91 98765 43210", total_orders: 1, total_spent: 4940, last_order_at: new Date(Date.now() - 2 * 86400000).toISOString() },
];

// ==============================================================================
// PRODUCT & VARIANT ADMIN SERVICE API
// ==============================================================================

export async function fetchAdminProducts(): Promise<AdminProduct[]> {
  // Always fetch fresh merged products directly from productService
  const mergedProducts = await productService.getAllProductsAsync();

  return mergedProducts.map((p, idx) => ({
    product_id: p.code,
    name: p.name,
    price: p.price,
    mrp: p.mrp,
    discount_percentage: p.discountPercentage || 0,
    stock_status: (p.isSoldOut ? "out_of_stock" : "in_stock") as any,
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

export async function updateAdminProduct(
  productId: string,
  updates: Partial<AdminProduct>
): Promise<{ success: boolean; error?: string }> {
  const code = productId.trim().toUpperCase();
  const staticProd = staticProducts.find((p) => p.code.toUpperCase() === code);
  const existingDyn = mockDynamicProducts[code] || {};

  const sellingPrice = updates.price !== undefined
    ? Number(updates.price)
    : Number(existingDyn.price ?? staticProd?.price ?? 0);

  const originalPrice = updates.mrp !== undefined
    ? Number(updates.mrp)
    : Number(existingDyn.mrp ?? staticProd?.mrp ?? sellingPrice);

  const discountPercentage = updates.discount_percentage !== undefined
    ? Number(updates.discount_percentage)
    : (originalPrice > 0 ? Math.round(((originalPrice - sellingPrice) / originalPrice) * 100) : 0);

  let stockQty = updates.stock_quantity !== undefined
    ? Number(updates.stock_quantity)
    : existingDyn.stock_quantity;

  if (stockQty === undefined) {
    stockQty = updates.stock_status === "out_of_stock" ? 0 : 10;
  }

  const payload = {
    product_id: code,
    selling_price: sellingPrice,
    original_price: originalPrice,
    discount_percentage: discountPercentage,
    stock_quantity: stockQty,
    featured: updates.featured !== undefined ? Boolean(updates.featured) : Boolean(existingDyn.featured ?? true),
    new_arrival: updates.new_arrival !== undefined ? Boolean(updates.new_arrival) : Boolean(existingDyn.new_arrival ?? false),
    active: updates.active !== undefined ? Boolean(updates.active) : Boolean(existingDyn.active ?? true),
    display_order: updates.display_order !== undefined ? Number(updates.display_order) : Number(existingDyn.display_order ?? 99),
    updated_at: new Date().toISOString(),
  };

  mockDynamicProducts[code] = {
    ...existingDyn,
    price: sellingPrice,
    mrp: originalPrice,
    discount_percentage: discountPercentage,
    stock_quantity: stockQty,
    stock_status: stockQty <= 0 ? "out_of_stock" : "in_stock",
    featured: payload.featured,
    new_arrival: payload.new_arrival,
    display_order: payload.display_order,
    active: payload.active,
  };

  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase
        .from("products_dynamic")
        .upsert(payload, { onConflict: "product_id" });

      if (error) {
        console.error("[Vassio Supabase] products_dynamic upsert failed:", error.message, error.code);
        return { success: false, error: error.message };
      }

      productService.updateProductCache(code, payload as any);
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e?.message || "Network error" };
    }
  }

  productService.updateProductCache(code, payload as any);
  return { success: true };
}

/**
 * Save an individual variant (e.g. Size A, Size B, Size C) to Supabase product_variants table.
 */
export async function updateAdminProductVariant(
  variant: ProductVariant
): Promise<{ success: boolean; error?: string }> {
  const code = variant.product_id.toUpperCase();

  const result = await upsertProductVariant({
    ...variant,
    product_id: code,
  });

  if (result.success) {
    productService.updateVariantCache({
      ...variant,
      product_id: code,
    });
  }

  return result;
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
