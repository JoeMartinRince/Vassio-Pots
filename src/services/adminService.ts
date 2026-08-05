/**
 * Vassio Admin Service — Production Architecture
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Rules:
 *   1. No mockDynamicProducts. No module-level mutable state.
 *   2. Every fetch goes directly to Supabase.
 *   3. Every save: upsert to Supabase → wait → refetch → return fresh data.
 *   4. Caller (admin.tsx) replaces its state from returned fresh data.
 */

import {
  supabase,
  isSupabaseConfigured,
  dbFetchAllDynamicProducts,
  dbFetchAllVariants,
  dbFetchVariantsByProductId,
  dbUpsertDynamicProduct,
  dbUpsertVariant,
  type DbDynamicProduct,
  type DbProductVariant,
} from "@/lib/supabase";
import { products as staticProducts, potBg } from "@/data/products";
import type { ProductVariant } from "@/types/product";

// ─── Admin Product Interface ──────────────────────────────────────────────────
// Flat record used by the Admin Dashboard table and editors.

export interface AdminProduct {
  product_id: string;
  name: string;
  img: string;
  material: string;
  dimensions: string;
  description: string;
  category: string;
  // Dynamic flags (from products_dynamic)
  featured: boolean;
  new_arrival: boolean;
  active: boolean;
  display_order: number;
  // Derived from variants (for summary display)
  price_from: number;   // lowest variant selling_price
  price_to: number;     // highest variant selling_price
  total_stock: number;  // sum of all variant stock_quantity
  variant_count: number;
  // Full variant list for the editor
  variants: ProductVariant[];
}

// ─── Order / Customer types (unchanged) ──────────────────────────────────────

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

// ─── Helpers ──────────────────────────────────────────────────────────────────

function mapDbVariantToProductVariant(v: DbProductVariant): ProductVariant {
  return {
    id: v.id,
    product_id: v.product_id.toUpperCase(),
    variant_name: v.variant_name,
    dimensions: v.dimensions,
    selling_price: Number(v.selling_price),
    original_price: Number(v.original_price),
    discount_percentage: v.discount_percentage != null
      ? Number(v.discount_percentage)
      : v.original_price > 0
        ? Math.round(((Number(v.original_price) - Number(v.selling_price)) / Number(v.original_price)) * 100)
        : 0,
    stock_quantity: Number(v.stock_quantity),
    available: Boolean(v.available),
    sku: v.sku ?? undefined,
    display_order: Number(v.display_order),
  };
}

function buildAdminProduct(
  staticProd: any,
  dynFlags: DbDynamicProduct | undefined,
  variants: ProductVariant[],
  idx: number
): AdminProduct {
  const prices = variants.map((v) => v.selling_price).filter((p) => p > 0);
  return {
    product_id: staticProd.code,
    name: staticProd.name,
    img: staticProd.img ?? potBg,
    material: staticProd.material ?? "N/A",
    dimensions: staticProd.dimensions ?? "N/A",
    description: staticProd.description ?? "",
    category: (staticProd.material ?? "").includes("Fiber") ? "Fiberglass Planters" : "Ceramic & Decor",
    featured: dynFlags ? Boolean(dynFlags.featured) : false,
    new_arrival: dynFlags ? Boolean(dynFlags.new_arrival) : false,
    active: dynFlags ? dynFlags.active !== false : true,
    display_order: dynFlags?.display_order ?? idx + 1,
    price_from: prices.length > 0 ? Math.min(...prices) : 0,
    price_to: prices.length > 0 ? Math.max(...prices) : 0,
    total_stock: variants.reduce((sum, v) => sum + v.stock_quantity, 0),
    variant_count: variants.length,
    variants,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// PRODUCT ADMIN API
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Fetch all products for the admin dashboard.
 * Always fetches fresh from Supabase. No local cache.
 */
export async function fetchAdminProducts(): Promise<AdminProduct[]> {
  const [dbDynamic, dbVariants] = await Promise.all([
    dbFetchAllDynamicProducts(),
    dbFetchAllVariants(),
  ]);

  const dynMap = new Map<string, DbDynamicProduct>(
    (dbDynamic ?? []).map((d) => [d.product_id.toUpperCase(), d])
  );

  const variantMap = new Map<string, ProductVariant[]>();
  (dbVariants ?? []).forEach((v) => {
    const key = v.product_id.toUpperCase();
    const existing = variantMap.get(key) ?? [];
    existing.push(mapDbVariantToProductVariant(v));
    variantMap.set(key, existing);
  });

  return staticProducts.map((sp, idx) => {
    const key = (sp.code as string).toUpperCase();
    const variants = (variantMap.get(key) ?? []).sort(
      (a, b) => a.display_order - b.display_order
    );
    return buildAdminProduct(sp, dynMap.get(key), variants, idx);
  });
}

/**
 * Update product metadata flags (featured, new_arrival, active, display_order).
 * Returns fresh product list after save.
 */
export async function updateProductFlags(
  productId: string,
  flags: Partial<Pick<AdminProduct, "featured" | "new_arrival" | "active" | "display_order">>
): Promise<{ success: boolean; error?: string; products?: AdminProduct[] }> {
  const code = productId.toUpperCase();

  const result = await dbUpsertDynamicProduct({
    product_id: code,
    featured: flags.featured ?? false,
    new_arrival: flags.new_arrival ?? false,
    active: flags.active ?? true,
    display_order: flags.display_order ?? 99,
  });

  if (!result.success) {
    return { success: false, error: result.error };
  }

  // Refetch fresh data
  const products = await fetchAdminProducts();
  return { success: true, products };
}

/**
 * Save a single product variant (size A / B / C) to Supabase.
 * Returns the fresh variant list for that product after save.
 */
export async function saveProductVariant(
  variant: ProductVariant
): Promise<{ success: boolean; error?: string; variants?: ProductVariant[] }> {
  const code = variant.product_id.toUpperCase();

  const result = await dbUpsertVariant({
    product_id: code,
    variant_name: variant.variant_name,
    dimensions: variant.dimensions ?? "",
    selling_price: Number(variant.selling_price),
    original_price: Number(variant.original_price),
    stock_quantity: Number(variant.stock_quantity),
    available: Boolean(variant.available),
    sku: variant.sku ?? null,
    display_order: Number(variant.display_order),
  });

  if (!result.success) {
    return { success: false, error: result.error };
  }

  // Refetch fresh variants for this product
  const freshDb = await dbFetchVariantsByProductId(code);
  const variants = (freshDb ?? [])
    .map(mapDbVariantToProductVariant)
    .sort((a, b) => a.display_order - b.display_order);

  return { success: true, variants };
}

// ═══════════════════════════════════════════════════════════════════════════════
// ORDERS & CUSTOMERS (unchanged, using mock data for demo)
// ═══════════════════════════════════════════════════════════════════════════════

const mockOrders: Order[] = [
  {
    id: "ord-1001",
    order_number: "VAS-1001",
    customer_name: "Ananya Sharma",
    customer_email: "ananya.sharma@example.com",
    customer_phone: "+91 98765 43210",
    shipping_address: "42 Lotus Boulevard, Bandra West, Mumbai 400050",
    items: [{ product_id: "FLX48", name: "Flax Series Tapered Vases", price: 5200, quantity: 1, size: 'D (21")' }],
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

const mockCustomers: Customer[] = [
  {
    id: "cust-1",
    name: "Ananya Sharma",
    email: "ananya.sharma@example.com",
    phone: "+91 98765 43210",
    total_orders: 1,
    total_spent: 4940,
    last_order_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
];

export async function fetchAdminOrders(): Promise<Order[]> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });
      if (!error && data) return data as Order[];
    } catch (e) {
      console.warn("[Admin] Orders fetch from Supabase failed, using demo data:", e);
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
      const { error } = await supabase
        .from("orders")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", orderId);
      if (!error) return true;
    } catch (e) {
      console.warn("[Admin] Order update failed:", e);
    }
  }
  return true; // Demo mode always succeeds
}

export async function fetchAdminCustomers(): Promise<Customer[]> {
  return [...mockCustomers];
}

export async function fetchRevenueMetrics(): Promise<RevenueMetrics> {
  const orders = await fetchAdminOrders();
  const totalRevenue = orders.reduce(
    (sum, o) => sum + (o.order_status !== "cancelled" ? o.total_amount : 0),
    0
  );
  return {
    totalRevenue,
    monthlyRevenue: totalRevenue,
    totalOrders: orders.length,
    pendingOrders: orders.filter((o) => o.order_status === "pending" || o.order_status === "processing").length,
    completedOrders: orders.filter((o) => o.order_status === "completed").length,
    cancelledOrders: orders.filter((o) => o.order_status === "cancelled").length,
    recentOrders: orders.slice(0, 5),
  };
}
