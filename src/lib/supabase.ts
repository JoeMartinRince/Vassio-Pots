import { createClient } from "@supabase/supabase-js";

// Retrieve environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://vassiostudioproject.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

export const isSupabaseConfigured = Boolean(
  import.meta.env.VITE_SUPABASE_URL &&
    import.meta.env.VITE_SUPABASE_ANON_KEY &&
    !import.meta.env.VITE_SUPABASE_ANON_KEY.includes("sample_vassio_anon_key")
);

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
 * Falls back cleanly to local state/mock if database is offline or not yet configured.
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
      console.warn("[Vassio Supabase] Failed to fetch products_dynamic:", error.message);
      return null;
    }

    return data as SupabaseDynamicProduct[];
  } catch (err) {
    console.warn("[Vassio Supabase] Connection exception, using static fallback:", err);
    return null;
  }
}
