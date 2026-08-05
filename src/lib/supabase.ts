import { createClient } from "@supabase/supabase-js";

// Retrieve environment variables with project credentials fallback
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://rhxwvsjxoqkjqeinypvd.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "sb_publishable_vzi1t4s1L9iVbBimA_m58w_dCR19JBb";

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

// Single reusable Supabase client instance
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export interface SupabaseDynamicProduct {
  product_id: string;
  selling_price: number;
  original_price: number;
  discount_percentage: number;
  stock_quantity: number;
  featured: boolean;
  new_arrival: boolean;
  active: boolean;
  display_order: number;
  updated_at?: string;
}

/**
 * Safely fetches dynamic product data from Supabase `products_dynamic` table.
 * Falls back cleanly to local static data if table does not exist or database is offline.
 */
export async function fetchDynamicProductsFromSupabase(): Promise<SupabaseDynamicProduct[] | null> {
  if (!isSupabaseConfigured) {
    return null;
  }

  try {
    const { data, error } = await supabase
      .from("products_dynamic")
      .select("*")
      .order("display_order", { ascending: true });

    if (error) {
      console.warn("[Vassio Supabase] products_dynamic table query notice:", error.message);
      return null;
    }

    return data as SupabaseDynamicProduct[];
  } catch (err) {
    console.warn("[Vassio Supabase] Connection exception, using static fallback:", err);
    return null;
  }
}

/**
 * SQL Schema script helper for creating the products_dynamic table in Supabase SQL Editor:
 * 
 * CREATE TABLE public.products_dynamic (
 *   product_id TEXT PRIMARY KEY,
 *   selling_price NUMERIC NOT NULL,
 *   original_price NUMERIC NOT NULL,
 *   discount_percentage NUMERIC DEFAULT 0,
 *   stock_quantity INT DEFAULT 10,
 *   featured BOOLEAN DEFAULT false,
 *   new_arrival BOOLEAN DEFAULT false,
 *   active BOOLEAN DEFAULT true,
 *   display_order INT DEFAULT 99,
 *   updated_at TIMESTAMPTZ DEFAULT NOW()
 * );
 * 
 * INSERT INTO public.products_dynamic (product_id, selling_price, original_price, discount_percentage, stock_quantity, featured, new_arrival, active, display_order)
 * VALUES ('FLX48', 5200, 7500, 30, 15, true, true, true, 1);
 */
