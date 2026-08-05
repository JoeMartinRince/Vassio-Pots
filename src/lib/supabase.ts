import { createClient } from "@supabase/supabase-js";
import type { ProductVariant } from "@/types/product";

// ─── Environment Variables & Setup ──────────────────────────────────────────

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

const hasUrl = typeof supabaseUrl === "string" && supabaseUrl.startsWith("https://");
const hasKey = typeof supabaseAnonKey === "string" && supabaseAnonKey.length > 20;

export const isSupabaseConfigured = hasUrl && hasKey;

if (!isSupabaseConfigured) {
  console.warn(
    "[Vassio Supabase] Supabase is NOT configured. Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file."
  );
}

export const supabase = createClient(
  supabaseUrl ?? "https://placeholder.supabase.co",
  supabaseAnonKey ?? "placeholder",
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);

// ─── Database Row Schemas ──────────────────────────────────────────────────────

export interface SupabaseDynamicProductRow {
  product_id: string;
  featured?: boolean;
  new_arrival?: boolean;
  active?: boolean;
  display_order?: number;
  updated_at?: string;
}

export interface SupabaseProductVariantRow {
  id?: string;
  product_id: string;
  variant_name: string;
  dimensions?: string;
  selling_price: number;
  original_price: number;
  discount_percentage?: number;
  stock_quantity: number;
  available: boolean;
  sku?: string;
  display_order: number;
  created_at?: string;
  updated_at?: string;
}

// ─── Query APIs: products_dynamic ─────────────────────────────────────────────

export async function fetchDynamicProductRows(): Promise<SupabaseDynamicProductRow[] | null> {
  if (!isSupabaseConfigured) return null;

  try {
    const { data, error } = await supabase
      .from("products_dynamic")
      .select("product_id, featured, new_arrival, active, display_order, updated_at")
      .order("display_order", { ascending: true });

    if (error) {
      console.error("[Vassio Supabase] products_dynamic SELECT failed:", error.message, error.code);
      return null;
    }

    return data as SupabaseDynamicProductRow[];
  } catch (err) {
    console.error("[Vassio Supabase] Network error fetching products_dynamic:", err);
    return null;
  }
}

export async function upsertDynamicProductRow(row: SupabaseDynamicProductRow): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured) return { success: true };

  try {
    const payload = {
      product_id: row.product_id.toUpperCase(),
      featured: Boolean(row.featured),
      new_arrival: Boolean(row.new_arrival),
      active: row.active !== false,
      display_order: Number(row.display_order ?? 99),
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from("products_dynamic")
      .upsert(payload, { onConflict: "product_id" });

    if (error) {
      console.error("[Vassio Supabase] products_dynamic UPSERT failed:", error.message);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (e: any) {
    return { success: false, error: e?.message || "Network error" };
  }
}

// ─── Query APIs: product_variants ──────────────────────────────────────────────

export async function fetchProductVariantRows(): Promise<SupabaseProductVariantRow[] | null> {
  if (!isSupabaseConfigured) return null;

  try {
    const { data, error } = await supabase
      .from("product_variants")
      .select("*")
      .order("display_order", { ascending: true });

    if (error) {
      if (error.code === "42P01") {
        console.warn("[Vassio Supabase] Table product_variants does not exist yet. Please run SQL migration script.");
      } else {
        console.error("[Vassio Supabase] product_variants SELECT failed:", error.message, error.code);
      }
      return null;
    }

    return data as SupabaseProductVariantRow[];
  } catch (err) {
    console.error("[Vassio Supabase] Network error fetching product_variants:", err);
    return null;
  }
}

export async function fetchVariantsByCode(code: string): Promise<SupabaseProductVariantRow[] | null> {
  if (!isSupabaseConfigured) return null;

  try {
    const { data, error } = await supabase
      .from("product_variants")
      .select("*")
      .eq("product_id", code.toUpperCase())
      .order("display_order", { ascending: true });

    if (error) {
      console.error(`[Vassio Supabase] product_variants SELECT for "${code}" failed:`, error.message);
      return null;
    }

    return data as SupabaseProductVariantRow[];
  } catch (err) {
    console.error(`[Vassio Supabase] Network error fetching variants for "${code}":`, err);
    return null;
  }
}

export async function upsertProductVariantRow(variant: ProductVariant): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured) return { success: true };

  try {
    const originalPrice = Number(variant.original_price || variant.selling_price || 0);
    const sellingPrice = Number(variant.selling_price || 0);
    const discountPercentage = originalPrice > 0
      ? Math.round(((originalPrice - sellingPrice) / originalPrice) * 100)
      : 0;

    const payload = {
      product_id: variant.product_id.toUpperCase(),
      variant_name: variant.variant_name,
      dimensions: variant.dimensions || "",
      selling_price: sellingPrice,
      original_price: originalPrice,
      discount_percentage: discountPercentage,
      stock_quantity: Number(variant.stock_quantity ?? 10),
      available: Boolean(variant.available),
      sku: variant.sku || `SKU-${variant.product_id.toUpperCase()}-${variant.variant_name.toUpperCase()}`,
      display_order: Number(variant.display_order || 1),
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from("product_variants")
      .upsert(payload, { onConflict: "product_id,variant_name" });

    if (error) {
      console.error("[Vassio Supabase] product_variants UPSERT failed:", error.message);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (e: any) {
    return { success: false, error: e?.message || "Network error" };
  }
}
