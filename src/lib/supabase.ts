import { createClient } from "@supabase/supabase-js";
import type { ProductVariant } from "@/types/product";

// ─── Environment Variables ────────────────────────────────────────────────────

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

// Verify credentials exist and look valid
const hasUrl = typeof supabaseUrl === "string" && supabaseUrl.startsWith("https://");
const hasKey = typeof supabaseAnonKey === "string" && supabaseAnonKey.length > 20;

export const isSupabaseConfigured = hasUrl && hasKey;

if (!isSupabaseConfigured) {
  console.warn(
    "[Vassio] Supabase is NOT configured. Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.",
    { hasUrl, hasKey }
  );
}

// ─── Supabase Client ─────────────────────────────────────────────────────────

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

// ─── Types: Database Tables ───────────────────────────────────────────────────

export interface SupabaseDynamicProduct {
  product_id: string;
  selling_price?: number;
  original_price?: number;
  discount_percentage?: number;
  stock_quantity?: number;
  featured?: boolean;
  new_arrival?: boolean;
  active?: boolean;
  display_order?: number;
  updated_at?: string;
}

export interface SupabaseProductVariant {
  id?: string;
  product_id: string;
  variant_name: string;
  dimensions?: string;
  selling_price: number;
  original_price: number;
  discount_percentage?: number;
  stock_quantity: number;
  available: boolean;
  display_order: number;
  created_at?: string;
  updated_at?: string;
}

// ─── Query Helpers: products_dynamic ──────────────────────────────────────────

export async function fetchDynamicProductsFromSupabase(): Promise<SupabaseDynamicProduct[] | null> {
  if (!isSupabaseConfigured) return null;

  try {
    const { data, error } = await supabase
      .from("products_dynamic")
      .select("*")
      .order("display_order", { ascending: true });

    if (error) {
      console.error("[Vassio Supabase] products_dynamic SELECT failed:", error.message, error.code);
      return null;
    }

    return data as SupabaseDynamicProduct[];
  } catch (err) {
    console.error("[Vassio Supabase] Network error fetching products_dynamic:", err);
    return null;
  }
}

export async function fetchDynamicProductById(productId: string): Promise<SupabaseDynamicProduct | null> {
  if (!isSupabaseConfigured) return null;

  try {
    const { data, error } = await supabase
      .from("products_dynamic")
      .select("*")
      .eq("product_id", productId.toUpperCase())
      .maybeSingle();

    if (error) {
      console.error(`[Vassio Supabase] products_dynamic SELECT for "${productId}" failed:`, error.message);
      return null;
    }

    return data as SupabaseDynamicProduct;
  } catch (err) {
    console.error(`[Vassio Supabase] Network error fetching product "${productId}":`, err);
    return null;
  }
}

// ─── Query Helpers: product_variants ──────────────────────────────────────────

export async function fetchDynamicVariantsFromSupabase(): Promise<SupabaseProductVariant[] | null> {
  if (!isSupabaseConfigured) return null;

  try {
    const { data, error } = await supabase
      .from("product_variants")
      .select("*")
      .order("display_order", { ascending: true });

    if (error) {
      // Table might not exist in Supabase yet — log helpful notice
      if (error.code === "42P01") {
        console.warn("[Vassio Supabase] Table product_variants does not exist in database yet. Run migration script.");
      } else {
        console.error("[Vassio Supabase] product_variants SELECT failed:", error.message, error.code);
      }
      return null;
    }

    return data as SupabaseProductVariant[];
  } catch (err) {
    console.error("[Vassio Supabase] Network error fetching product_variants:", err);
    return null;
  }
}

export async function fetchVariantsByProductId(productId: string): Promise<SupabaseProductVariant[] | null> {
  if (!isSupabaseConfigured) return null;

  try {
    const { data, error } = await supabase
      .from("product_variants")
      .select("*")
      .eq("product_id", productId.toUpperCase())
      .order("display_order", { ascending: true });

    if (error) {
      console.error(`[Vassio Supabase] product_variants SELECT for "${productId}" failed:`, error.message);
      return null;
    }

    return data as SupabaseProductVariant[];
  } catch (err) {
    console.error(`[Vassio Supabase] Network error fetching variants for "${productId}":`, err);
    return null;
  }
}

export async function upsertProductVariant(variant: ProductVariant): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured) return { success: true };

  try {
    const payload = {
      product_id: variant.product_id.toUpperCase(),
      variant_name: variant.variant_name,
      dimensions: variant.dimensions || "",
      selling_price: Number(variant.selling_price),
      original_price: Number(variant.original_price),
      discount_percentage: variant.original_price > 0
        ? Math.round(((variant.original_price - variant.selling_price) / variant.original_price) * 100)
        : 0,
      stock_quantity: Number(variant.stock_quantity),
      available: Boolean(variant.available),
      display_order: Number(variant.display_order || 1),
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from("product_variants")
      .upsert(payload, { onConflict: "product_id,variant_name" });

    if (error) {
      console.error("[Vassio Supabase] product_variants upsert failed:", error.message, error.code);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (e: any) {
    console.error("[Vassio Supabase] Exception upserting variant:", e);
    return { success: false, error: e?.message || "Network error" };
  }
}

/*
  ─── Required Supabase SQL Migrations ─────────────────────────────────────────
  Run this script in the Supabase SQL Editor:

  -- 1. Table: products_dynamic
  CREATE TABLE IF NOT EXISTS public.products_dynamic (
    product_id          TEXT PRIMARY KEY,
    selling_price       NUMERIC NOT NULL DEFAULT 0,
    original_price      NUMERIC NOT NULL DEFAULT 0,
    discount_percentage NUMERIC DEFAULT 0,
    stock_quantity      INT DEFAULT 10,
    featured            BOOLEAN DEFAULT false,
    new_arrival         BOOLEAN DEFAULT false,
    active              BOOLEAN DEFAULT true,
    display_order       INT DEFAULT 99,
    updated_at          TIMESTAMPTZ DEFAULT NOW()
  );

  ALTER TABLE public.products_dynamic ENABLE ROW LEVEL SECURITY;

  CREATE POLICY "Allow public read and write products_dynamic" ON public.products_dynamic
    FOR ALL USING (true) WITH CHECK (true);

  -- 2. Table: product_variants
  CREATE TABLE IF NOT EXISTS public.product_variants (
    id                  UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id          TEXT NOT NULL,
    variant_name        TEXT NOT NULL,
    dimensions          TEXT,
    selling_price       NUMERIC NOT NULL DEFAULT 0,
    original_price      NUMERIC NOT NULL DEFAULT 0,
    discount_percentage NUMERIC DEFAULT 0,
    stock_quantity      INT DEFAULT 10,
    available           BOOLEAN DEFAULT true,
    display_order       INT DEFAULT 1,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_product_variant UNIQUE (product_id, variant_name)
  );

  ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;

  CREATE POLICY "Allow public read and write product_variants" ON public.product_variants
    FOR ALL USING (true) WITH CHECK (true);
*/
