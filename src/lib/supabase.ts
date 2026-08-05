import { createClient } from "@supabase/supabase-js";

// ─── Environment Validation ───────────────────────────────────────────────────

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

const hasUrl = typeof supabaseUrl === "string" && supabaseUrl.startsWith("https://");
const hasKey = typeof supabaseAnonKey === "string" && supabaseAnonKey.length > 40;

export const isSupabaseConfigured = hasUrl && hasKey;

if (!isSupabaseConfigured) {
  console.warn(
    "[Vassio] Supabase NOT configured. Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.",
    { hasUrl, hasKey }
  );
}

// ─── Supabase Client ──────────────────────────────────────────────────────────

export const supabase = createClient(
  supabaseUrl ?? "https://placeholder.supabase.co",
  supabaseAnonKey ?? "placeholder_key_placeholder_key_placeholder_key_placehold",
  { auth: { persistSession: true, autoRefreshToken: true } }
);

// ─── Database Row Types ───────────────────────────────────────────────────────
// These match the exact Supabase column names.

/**
 * products_dynamic table:
 * ONLY metadata/flags. NO price columns.
 * Prices live exclusively in product_variants.
 */
export interface DbDynamicProduct {
  product_id: string;
  featured?: boolean;
  new_arrival?: boolean;
  active?: boolean;
  display_order?: number;
  updated_at?: string;
}

/**
 * product_variants table:
 * Every price for every size variant lives here.
 */
export interface DbProductVariant {
  id: string;
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

// ─── products_dynamic Queries ─────────────────────────────────────────────────

export async function dbFetchAllDynamicProducts(): Promise<DbDynamicProduct[] | null> {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await supabase
    .from("products_dynamic")
    .select("product_id, featured, new_arrival, active, display_order, updated_at")
    .order("display_order", { ascending: true });
  if (error) {
    console.error("[DB] products_dynamic SELECT failed:", error.message, error.code);
    return null;
  }
  return data as DbDynamicProduct[];
}

export async function dbFetchDynamicProductById(productId: string): Promise<DbDynamicProduct | null> {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await supabase
    .from("products_dynamic")
    .select("product_id, featured, new_arrival, active, display_order, updated_at")
    .eq("product_id", productId.toUpperCase())
    .maybeSingle();
  if (error) {
    console.error(`[DB] products_dynamic SELECT '${productId}' failed:`, error.message);
    return null;
  }
  return data as DbDynamicProduct | null;
}

export async function dbUpsertDynamicProduct(
  payload: Omit<DbDynamicProduct, "updated_at">
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured) return { success: false, error: "Supabase not configured" };
  const { error } = await supabase
    .from("products_dynamic")
    .upsert({ ...payload, updated_at: new Date().toISOString() }, { onConflict: "product_id" });
  if (error) {
    console.error("[DB] products_dynamic UPSERT failed:", error.message, error.code);
    return { success: false, error: error.message };
  }
  return { success: true };
}

// ─── product_variants Queries ─────────────────────────────────────────────────

export async function dbFetchAllVariants(): Promise<DbProductVariant[] | null> {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await supabase
    .from("product_variants")
    .select("*")
    .order("display_order", { ascending: true });
  if (error) {
    if (error.code === "42P01") {
      console.warn("[DB] product_variants table does not exist. Run the Supabase migration script.");
    } else {
      console.error("[DB] product_variants SELECT failed:", error.message, error.code);
    }
    return null;
  }
  return data as DbProductVariant[];
}

export async function dbFetchVariantsByProductId(productId: string): Promise<DbProductVariant[] | null> {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await supabase
    .from("product_variants")
    .select("*")
    .eq("product_id", productId.toUpperCase())
    .order("display_order", { ascending: true });
  if (error) {
    console.error(`[DB] product_variants SELECT '${productId}' failed:`, error.message);
    return null;
  }
  return data as DbProductVariant[];
}

export async function dbUpsertVariant(
  variant: Omit<DbProductVariant, "id" | "discount_percentage" | "created_at" | "updated_at">
): Promise<{ success: boolean; error?: string; data?: DbProductVariant }> {
  if (!isSupabaseConfigured) return { success: false, error: "Supabase not configured" };

  const payload = {
    product_id: variant.product_id.toUpperCase(),
    variant_name: variant.variant_name,
    dimensions: variant.dimensions ?? "",
    selling_price: Number(variant.selling_price),
    original_price: Number(variant.original_price),
    stock_quantity: Number(variant.stock_quantity),
    available: Boolean(variant.available),
    sku: variant.sku ?? null,
    display_order: Number(variant.display_order),
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("product_variants")
    .upsert(payload, { onConflict: "product_id,variant_name" })
    .select()
    .single();

  if (error) {
    console.error("[DB] product_variants UPSERT failed:", error.message, error.code);
    return { success: false, error: error.message };
  }
  return { success: true, data: data as DbProductVariant };
}

/*
═══════════════════════════════════════════════════════════════════════════════
REQUIRED SUPABASE SQL — Run in Supabase SQL Editor
═══════════════════════════════════════════════════════════════════════════════

-- STEP 1: Drop price columns from products_dynamic (prices move to variants)
ALTER TABLE public.products_dynamic
  DROP COLUMN IF EXISTS selling_price,
  DROP COLUMN IF EXISTS original_price,
  DROP COLUMN IF EXISTS discount_percentage,
  DROP COLUMN IF EXISTS stock_quantity;

-- STEP 2: Ensure products_dynamic has correct columns
CREATE TABLE IF NOT EXISTS public.products_dynamic (
  product_id   TEXT PRIMARY KEY,
  featured     BOOLEAN NOT NULL DEFAULT false,
  new_arrival  BOOLEAN NOT NULL DEFAULT false,
  active       BOOLEAN NOT NULL DEFAULT true,
  display_order INT NOT NULL DEFAULT 99,
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.products_dynamic ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public select products_dynamic" ON public.products_dynamic FOR SELECT USING (true);
CREATE POLICY "Auth write products_dynamic" ON public.products_dynamic
  FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- STEP 3: Create product_variants table
CREATE TABLE IF NOT EXISTS public.product_variants (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id        TEXT NOT NULL,
  variant_name      TEXT NOT NULL,
  dimensions        TEXT,
  selling_price     NUMERIC NOT NULL DEFAULT 0,
  original_price    NUMERIC NOT NULL DEFAULT 0,
  discount_percentage NUMERIC GENERATED ALWAYS AS (
    CASE WHEN original_price > 0
    THEN ROUND(((original_price - selling_price) / original_price) * 100)
    ELSE 0 END
  ) STORED,
  stock_quantity    INT NOT NULL DEFAULT 10,
  available         BOOLEAN NOT NULL DEFAULT true,
  sku               TEXT,
  display_order     INT NOT NULL DEFAULT 1,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_product_variant UNIQUE (product_id, variant_name)
);
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public select product_variants" ON public.product_variants FOR SELECT USING (true);
CREATE POLICY "Auth write product_variants" ON public.product_variants
  FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- STEP 4: Seed variants
INSERT INTO public.product_variants
  (product_id, variant_name, dimensions, selling_price, original_price, stock_quantity, available, sku, display_order)
VALUES
  ('FLX48','D (21")','Height: 21", Top: 8.5", Bottom: 6.5"',5200,7500,15,true,'FLX48-D',1),
  ('FLX48','C (28")','Height: 28", Top: 11", Bottom: 8.5"',7580,11000,10,true,'FLX48-C',2),
  ('FLX48','B (33")','Height: 33", Top: 13.5", Bottom: 10"',11870,17000,8,true,'FLX48-B',3),
  ('FLX48','A (40")','Height: 40", Top: 16", Bottom: 12"',14910,22000,5,true,'FLX48-A',4),
  ('LFS70','B (Small)','Height: 16.5", Top: 10.5", Bottom: 10.5"',4500,6500,10,true,'LFS70-B',1),
  ('LFS70','A (Large)','Height: 25.5", Top: 17", Bottom: 17"',9000,13500,5,true,'LFS70-A',2),
  ('LFS69','C (Small)','Height: 13.5", Top: 12.5", Bottom: 7.5"',4500,6500,8,true,'LFS69-C',1),
  ('LFS69','B (Medium)','Height: 17.5", Top: 16", Bottom: 9"',7200,10000,6,true,'LFS69-B',2),
  ('LFS69','A (Large)','Height: 21", Top: 19.5", Bottom: 10.5"',8000,12000,4,true,'LFS69-A',3),
  ('VNL83','C (Small)','Height: 8", Top: 9"',3000,4500,20,true,'VNL83-C',1),
  ('VNL83','B (Medium)','Height: 12", Top: 13.5"',5000,7500,12,true,'VNL83-B',2),
  ('VNL83','A (Large)','Height: 16", Top: 18"',7300,11000,7,true,'VNL83-A',3),
  ('ARC84','C (Small)','Height: 15", Top: 8"',5500,8000,12,true,'ARC84-C',1),
  ('ARC84','B (Medium)','Height: 20", Top: 11"',7000,10000,8,true,'ARC84-B',2),
  ('ARC84','A (Large)','Height: 26", Top: 15"',8500,12000,5,true,'ARC84-A',3),
  ('FFT2399','Standard (6 Feet)','Height: 180cm Approx',14999,23999,5,true,'FFT2399-STD',1),
  ('DSV2299','Standard','Height: 30cm, Width: 18cm',1499,2299,20,true,'DSV2299-STD',1)
ON CONFLICT (product_id, variant_name) DO UPDATE SET
  selling_price = EXCLUDED.selling_price,
  original_price = EXCLUDED.original_price,
  stock_quantity = EXCLUDED.stock_quantity,
  available = EXCLUDED.available,
  updated_at = NOW();
*/
