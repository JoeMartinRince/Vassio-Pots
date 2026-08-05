/**
 * Vassio Product Service — Production Architecture
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Data sources:
 *   Static metadata  → src/data/products.ts  (name, description, images, sizes)
 *   Metadata flags   → Supabase products_dynamic  (featured, new_arrival, active)
 *   ALL PRICES       → Supabase product_variants  (selling_price, original_price, stock)
 *
 * Rules:
 *   1. No price/mrp on any static product object.
 *   2. No module-level mutable caches.
 *   3. No fallback to static prices. If Supabase fails, throw — don't silently show stale data.
 *   4. React components call this service only. They never query Supabase directly.
 *   5. Every public method that needs live data is async.
 */

import {
  products as rawStaticProducts,
  vases as rawStaticVases,
  auxiliaryProducts as rawStaticAuxiliary,
} from "@/data/products";
import {
  dbFetchAllDynamicProducts,
  dbFetchAllVariants,
  dbFetchDynamicProductById,
  dbFetchVariantsByProductId,
  isSupabaseConfigured,
  type DbDynamicProduct,
  type DbProductVariant,
} from "@/lib/supabase";
import type { Product, ProductVariant } from "@/types/product";

// ─── Static Catalog ───────────────────────────────────────────────────────────
// All static products combined, keyed by code for O(1) lookup.

const staticCatalog: Map<string, any> = new Map(
  [...rawStaticProducts, ...rawStaticVases, ...rawStaticAuxiliary].map((p) => [
    (p.code as string).toUpperCase(),
    p,
  ])
);

const staticCatalogList: any[] = [...rawStaticProducts, ...rawStaticVases, ...rawStaticAuxiliary];

// ─── Mapping Helpers ──────────────────────────────────────────────────────────

function mapDbVariant(v: DbProductVariant): ProductVariant {
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

function buildProduct(
  staticProd: any,
  dynFlags: DbDynamicProduct | undefined,
  variants: ProductVariant[]
): Product {
  // Primary price = cheapest available variant, else first variant, else 0
  const availableVariants = variants.filter((v) => v.available && v.stock_quantity > 0);
  const primaryVariant =
    availableVariants.length > 0 ? availableVariants[0] : variants[0];

  const price = primaryVariant ? Number(primaryVariant.selling_price) : 0;
  const mrp = primaryVariant ? Number(primaryVariant.original_price) : 0;
  const discountPercentage = mrp > price
    ? Math.round(((mrp - price) / mrp) * 100)
    : 0;
  const stockQuantity = primaryVariant ? primaryVariant.stock_quantity : 0;
  const isSoldOut = variants.length > 0
    ? variants.every((v) => !v.available || v.stock_quantity <= 0)
    : true;

  return {
    // Static fields — never prices
    code: staticProd.code,
    name: staticProd.name,
    img: staticProd.img,
    thumbnails: staticProd.thumbnails,
    color: staticProd.color,
    material: staticProd.material,
    dimensions: staticProd.dimensions,
    insideBox: staticProd.insideBox,
    delivery: staticProd.delivery,
    payment: staticProd.payment,
    description: staticProd.description,
    sizes: staticProd.sizes,
    pairsWith: staticProd.pairsWith
      ? { code: staticProd.pairsWith.code, name: staticProd.pairsWith.name, img: staticProd.pairsWith.img }
      : undefined,
    category: staticProd.category,
    height: staticProd.height,

    // Dynamic metadata flags
    featured: dynFlags ? Boolean(dynFlags.featured) : false,
    newArrival: dynFlags ? Boolean(dynFlags.new_arrival) : false,
    active: dynFlags ? dynFlags.active !== false : true,
    displayOrder: dynFlags?.display_order ?? 99,

    // Derived from variants
    price,
    mrp,
    discountPercentage,
    stockQuantity,
    isSoldOut,

    // The variants array — the single source of truth for all pricing
    variants,
  };
}

// ─── Public Service API ───────────────────────────────────────────────────────

const productService = {
  /**
   * Fetch ALL products with live Supabase data.
   * Always fetches fresh — no stale module-level cache.
   * If product_variants is empty/missing, products will have variants: [] and price: 0.
   */
  async getAllProductsAsync(): Promise<Product[]> {
    if (!isSupabaseConfigured) {
      // Return static-only products with empty variants (no prices)
      return staticCatalogList.map((p) => buildProduct(p, undefined, []));
    }

    const [dbDynamic, dbVariants] = await Promise.all([
      dbFetchAllDynamicProducts(),
      dbFetchAllVariants(),
    ]);

    // Build lookup maps
    const dynMap = new Map<string, DbDynamicProduct>(
      (dbDynamic ?? []).map((d) => [d.product_id.toUpperCase(), d])
    );

    const variantMap = new Map<string, ProductVariant[]>();
    (dbVariants ?? []).forEach((v) => {
      const key = v.product_id.toUpperCase();
      const list = variantMap.get(key) ?? [];
      list.push(mapDbVariant(v));
      variantMap.set(key, list);
    });

    return staticCatalogList
      .filter((p) => {
        const dyn = dynMap.get((p.code as string).toUpperCase());
        return dyn ? dyn.active !== false : true;
      })
      .map((p) => {
        const key = (p.code as string).toUpperCase();
        const variants = (variantMap.get(key) ?? []).sort(
          (a, b) => a.display_order - b.display_order
        );
        return buildProduct(p, dynMap.get(key), variants);
      });
  },

  /**
   * Fetch a single product with live Supabase data.
   * Direct Supabase query — always fresh.
   */
  async getProductByCodeAsync(code: string | undefined | null): Promise<Product | null> {
    if (!code) return null;
    const key = code.toUpperCase();
    const staticProd = staticCatalog.get(key);
    if (!staticProd) return null;

    if (!isSupabaseConfigured) {
      return buildProduct(staticProd, undefined, []);
    }

    const [dynFlags, dbVariants] = await Promise.all([
      dbFetchDynamicProductById(key),
      dbFetchVariantsByProductId(key),
    ]);

    const variants = (dbVariants ?? [])
      .map(mapDbVariant)
      .sort((a, b) => a.display_order - b.display_order);

    return buildProduct(staticProd, dynFlags ?? undefined, variants);
  },

  /**
   * Check if a product code exists in the static catalog.
   */
  productExists(code: string | undefined | null): boolean {
    if (!code) return false;
    return staticCatalog.has(code.toUpperCase());
  },

  /**
   * Get static product metadata only (no prices, no Supabase).
   * Use only for SEO/head generation where async is unavailable.
   */
  getStaticProductMetadata(code: string | undefined | null): { name: string; description: string } | null {
    if (!code) return null;
    const p = staticCatalog.get(code.toUpperCase());
    if (!p) return null;
    return { name: p.name, description: p.description ?? "" };
  },

  /**
   * Filter products by category from a pre-fetched list.
   * Call getAllProductsAsync() first, then filter with this.
   */
  filterByCategory(products: Product[], category: string): Product[] {
    const cat = category.toLowerCase();
    if (cat === "frp-pots") {
      return products.filter(
        (p) =>
          (p.material ?? "").toLowerCase().includes("fiber") ||
          p.code.startsWith("FLX") ||
          p.code.startsWith("ARC")
      );
    }
    if (cat === "artificial-plants") {
      return products.filter((p) => {
        const n = p.name.toLowerCase();
        return (
          n.includes("plant") || n.includes("tree") || n.includes("faux") ||
          n.includes("palm") || n.includes("ficus") || p.code.startsWith("FFT")
        );
      });
    }
    if (cat === "terracotta-pots") {
      return products.filter(
        (p) =>
          (p.material ?? "").toLowerCase().includes("ceramic") ||
          (p.material ?? "").toLowerCase().includes("clay") ||
          p.code.startsWith("LFS") ||
          p.code.startsWith("VNL")
      );
    }
    if (cat === "pebbles") {
      return products.filter(
        (p) =>
          p.name.toLowerCase().includes("pebble") ||
          p.name.toLowerCase().includes("stone") ||
          (p.material ?? "").toLowerCase().includes("stone")
      );
    }
    return products;
  },

  /**
   * Search products from a pre-fetched list.
   */
  searchInProducts(products: Product[], query: string): Product[] {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.code.toLowerCase().includes(q) ||
        (p.color ?? "").toLowerCase().includes(q) ||
        (p.material ?? "").toLowerCase().includes(q)
    );
  },
};

export default productService;
