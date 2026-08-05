/**
 * Vassio Product Service — Hybrid Architecture
 * ─────────────────────────────────────────────────────────────────────────────
 * Single source of truth for all product data on the customer website.
 *
 * Static fields  → src/data/products.ts  (name, images, specs, sizes, colors)
 * Dynamic fields → Supabase products_dynamic table (price, stock, featured…)
 *
 * React components NEVER call Supabase directly.
 * They call this service and receive one final merged Product object.
 */

import {
  products as staticProducts,
  vases as staticVases,
  auxiliaryProducts as staticAuxiliary,
  getProductByCode as findStaticProduct,
} from "@/data/products";
import {
  fetchDynamicProductsFromSupabase,
  fetchDynamicProductById,
  isSupabaseConfigured,
} from "@/lib/supabase";
import type { Product } from "@/types/product";
import type { SupabaseDynamicProduct } from "@/lib/supabase";

// ─── Module-Level Dynamic Cache ───────────────────────────────────────────────
// Starts EMPTY. Populated only from Supabase. Never seeded with hardcoded data.
// This is intentional: if Supabase hasn't loaded yet, static fallback prices
// from products.ts are used, making it clear no override exists.

let dynamicCache: Map<string, SupabaseDynamicProduct> = new Map();
let cachePopulated = false;

// ─── Merge Helper ─────────────────────────────────────────────────────────────

function mergeProduct(staticProd: any, dyn?: SupabaseDynamicProduct | null): Product {
  // Use Supabase values when available; fall back to static product prices
  const price = dyn ? Number(dyn.selling_price) : Number(staticProd.price ?? 0);
  const mrp = dyn ? Number(dyn.original_price) : Number(staticProd.mrp ?? price);
  const discountPercentage = dyn?.discount_percentage !== undefined
    ? Number(dyn.discount_percentage)
    : (mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0);
  const isSoldOut = dyn
    ? (dyn.stock_status === "out_of_stock" || (dyn.stock_quantity !== undefined && Number(dyn.stock_quantity) <= 0))
    : false;

  return {
    // Spread all static fields first (name, images, description, sizes, etc.)
    ...staticProd,
    // Dynamic fields override — these always come from Supabase when available
    price,
    mrp,
    discountPercentage,
    isSoldOut,
    stockQuantity: dyn?.stock_quantity,
    featured: dyn?.featured !== undefined ? Boolean(dyn.featured) : (staticProd.featured ?? false),
    newArrival: dyn?.new_arrival !== undefined ? Boolean(dyn.new_arrival) : (staticProd.newArrival ?? false),
    displayOrder: dyn?.display_order !== undefined ? Number(dyn.display_order) : 99,
    active: dyn?.active !== undefined ? dyn.active !== false : true,
  };
}

// ─── Public Service API ────────────────────────────────────────────────────────

const productService = {

  /**
   * Synchronous: returns merged products using whatever is in the dynamic cache.
   * On first call (cache empty), returns static product prices as fallback.
   * After getAllProductsAsync() has resolved, this reflects live Supabase values.
   */
  getAllProducts(): Product[] {
    const allStatic = [...staticProducts, ...staticVases, ...staticAuxiliary];
    return allStatic
      .filter((p) => {
        const dyn = dynamicCache.get((p.code || "").toUpperCase());
        // Only filter out if Supabase explicitly set active = false
        return dyn ? dyn.active !== false : true;
      })
      .map((p) => mergeProduct(p, dynamicCache.get((p.code || "").toUpperCase())));
  },

  /**
   * Async: fetches all dynamic records from Supabase, populates the cache,
   * then returns the full merged product list.
   * Call this once on page mount; getAllProducts() will then be accurate.
   */
  async getAllProductsAsync(): Promise<Product[]> {
    if (isSupabaseConfigured) {
      const dbProducts = await fetchDynamicProductsFromSupabase();
      if (dbProducts && dbProducts.length > 0) {
        // Replace cache with fresh Supabase data
        dynamicCache = new Map(
          dbProducts
            .filter((dp) => dp.product_id)
            .map((dp) => [dp.product_id.toUpperCase(), dp])
        );
        cachePopulated = true;
      }
    }
    return this.getAllProducts();
  },

  /**
   * Synchronous: returns a single merged product using whatever is in cache.
   * Used for SSR initial render — returns static prices as fallback.
   */
  getProductByCode(code: string | undefined | null): Product | null {
    if (!code) return null;
    const staticProd = findStaticProduct(code);
    if (!staticProd) return null;
    const dyn = dynamicCache.get(staticProd.code.toUpperCase());
    return mergeProduct(staticProd, dyn);
  },

  /**
   * Async: fetches ONE product's dynamic data directly from Supabase,
   * updates the cache, and returns the merged product.
   * Used by the product detail page for live pricing on every visit.
   */
  async getProductByCodeAsync(code: string | undefined | null): Promise<Product | null> {
    if (!code) return null;
    const staticProd = findStaticProduct(code);
    if (!staticProd) return null;

    if (isSupabaseConfigured) {
      const dyn = await fetchDynamicProductById(staticProd.code);
      if (dyn) {
        // Update cache so subsequent getAllProducts() calls are also accurate
        dynamicCache.set(dyn.product_id.toUpperCase(), dyn);
        return mergeProduct(staticProd, dyn);
      }
    }

    // Supabase unavailable or no row found — return static fallback
    return mergeProduct(staticProd, dynamicCache.get(staticProd.code.toUpperCase()));
  },

  /**
   * Update the local dynamic cache after an admin save.
   * Called by adminService after a successful Supabase upsert.
   * Keeps the customer website in sync without a full page reload.
   */
  updateCache(productId: string, data: Partial<SupabaseDynamicProduct>): void {
    const key = productId.toUpperCase();
    const existing = dynamicCache.get(key);
    if (existing) {
      dynamicCache.set(key, { ...existing, ...data });
    } else {
      dynamicCache.set(key, data as SupabaseDynamicProduct);
    }
  },

  /**
   * Search products by name, code, color, or material.
   */
  searchProducts(query: string): Product[] {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return this.getAllProducts().filter((p) => {
      return (
        p.name.toLowerCase().includes(q) ||
        p.code.toLowerCase().includes(q) ||
        (p.color || "").toLowerCase().includes(q) ||
        (p.material || "").toLowerCase().includes(q)
      );
    });
  },

  /**
   * Filter products by category slug.
   */
  getProductsByCategory(category: string): Product[] {
    const cat = category.toLowerCase();
    const all = this.getAllProducts();

    if (cat === "frp-pots") {
      return all.filter(
        (p) =>
          (p.material || "").toLowerCase().includes("fiber") ||
          p.code.startsWith("FLX") ||
          p.code.startsWith("ARC")
      );
    }
    if (cat === "artificial-plants") {
      return all.filter((p) => {
        const n = p.name.toLowerCase();
        return (
          n.includes("plant") ||
          n.includes("tree") ||
          n.includes("faux") ||
          n.includes("palm") ||
          n.includes("ficus") ||
          p.code.startsWith("FFT")
        );
      });
    }
    if (cat === "terracotta-pots") {
      return all.filter(
        (p) =>
          (p.material || "").toLowerCase().includes("ceramic") ||
          (p.material || "").toLowerCase().includes("clay") ||
          p.code.startsWith("LFS") ||
          p.code.startsWith("VNL")
      );
    }
    if (cat === "pebbles") {
      return all.filter(
        (p) =>
          p.name.toLowerCase().includes("pebble") ||
          p.name.toLowerCase().includes("stone") ||
          (p.material || "").toLowerCase().includes("stone")
      );
    }

    return all;
  },

  /** Whether the dynamic cache has been populated from Supabase */
  isCachePopulated(): boolean {
    return cachePopulated;
  },
};

export default productService;
export type { SupabaseDynamicProduct };
