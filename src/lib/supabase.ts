import { createClient } from "@supabase/supabase-js";

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

// ─── Type: Row returned from products_dynamic ─────────────────────────────────

export interface SupabaseDynamicProduct {
  product_id: string;
  selling_price: number;
  original_price: number;
  discount_percentage: number;
  stock_quantity: number;
  stock_status?: "in_stock" | "out_of_stock" | "pre_order";
  featured: boolean;
  new_arrival: boolean;
  active: boolean;
  display_order: number;
  updated_at?: string;
}

// ─── Fetch all dynamic products from Supabase ────────────────────────────────

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

    if (!data || data.length === 0) {
      console.warn("[Vassio Supabase] products_dynamic returned 0 rows. Check RLS policies and that rows exist.");
      return null;
    }

    return data as SupabaseDynamicProduct[];
  } catch (err) {
    console.error("[Vassio Supabase] Network error fetching products_dynamic:", err);
    return null;
  }
}

// ─── Fetch a single product's dynamic data ───────────────────────────────────

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

    if (!data) {
      console.warn(`[Vassio Supabase] No row found for product_id "${productId}". Falling back to static data.`);
      return null;
    }

    return data as SupabaseDynamicProduct;
  } catch (err) {
    console.error(`[Vassio Supabase] Network error fetching product "${productId}":`, err);
    return null;
  }
}

/*
  ─── Required Supabase SQL Schema ─────────────────────────────────────────────
  Run this in the Supabase SQL Editor to set up the table and policies:

  CREATE TABLE IF NOT EXISTS public.products_dynamic (
    product_id         TEXT PRIMARY KEY,
    selling_price      NUMERIC NOT NULL DEFAULT 0,
    original_price     NUMERIC NOT NULL DEFAULT 0,
    discount_percentage NUMERIC DEFAULT 0,
    stock_quantity     INT DEFAULT 10,
    stock_status       TEXT DEFAULT 'in_stock',
    featured           BOOLEAN DEFAULT false,
    new_arrival        BOOLEAN DEFAULT false,
    active             BOOLEAN DEFAULT true,
    display_order      INT DEFAULT 99,
    updated_at         TIMESTAMPTZ DEFAULT NOW()
  );

  ALTER TABLE public.products_dynamic ENABLE ROW LEVEL SECURITY;

  -- Allow anonymous reads (required for customer website)
  CREATE POLICY "Allow anon select" ON public.products_dynamic
    FOR SELECT USING (true);

  -- Allow authenticated writes (required for admin dashboard)
  CREATE POLICY "Allow authenticated upsert" ON public.products_dynamic
    FOR ALL USING (auth.role() = 'authenticated');

  -- Seed data (adjust prices to match your actual catalog)
  INSERT INTO public.products_dynamic
    (product_id, selling_price, original_price, discount_percentage, stock_quantity, featured, new_arrival, active, display_order)
  VALUES
    ('FLX48',   54400, 600000, 30, 15, true,  true,  true, 1),
    ('LFS70',    4500,   6500, 30, 10, true,  false, true, 2),
    ('LFS69',    4500,   6500, 30,  8, false, true,  true, 3),
    ('VNL83',    3000,   4500, 33, 20, true,  true,  true, 4),
    ('ARC84',    5500,   8000, 31, 12, true,  false, true, 5),
    ('FFT2399', 14999,  23999, 37,  5, false, false, true, 6)
  ON CONFLICT (product_id) DO UPDATE SET
    selling_price = EXCLUDED.selling_price,
    original_price = EXCLUDED.original_price;
*/
