/**
 * Vassio Product Service — Production Architecture
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Data sources:
 *   Static metadata  → src/data/products.ts  (name, description, images, sizes)
 *   Metadata flags   → Supabase products_dynamic  (featured, new_arrival, active)
 *   ALL PRICES       → Supabase product_variants  (selling_price, original_price, stock)
 *
 * Resilience Rules:
 *   1. Zero Runtime Throw: Supabase failures or missing tables never crash the UI.
 *   2. Graceful Variant Fallback: If product_variants has 0 rows for a product,
 *      fallback variants are constructed from static sizes/metadata so the page renders.
 *   3. O(1) + Fuzzy Lookup: getProductByCode handles exact codes, normalized codes,
 *      slugs, and hyphens seamlessly.
 */

import {
  products as rawStaticProducts,
  vases as rawStaticVases,
  auxiliaryProducts as rawStaticAuxiliary,
  getProductByCode as getStaticProductByCode,
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

const staticCatalogList: any[] = [...rawStaticProducts, ...rawStaticVases, ...rawStaticAuxiliary];

// ─── Fallback Variant Generator ───────────────────────────────────────────────

function buildFallbackVariants(staticProd: any): ProductVariant[] {
  const code = (staticProd.code as string).toUpperCase();
  if (staticProd.sizes && Array.isArray(staticProd.sizes) && staticProd.sizes.length > 0) {
    return staticProd.sizes.map((s: any, idx: number) => ({
      id: `fallback-${code}-${idx}`,
      product_id: code,
      variant_name: s.name || `Size ${idx + 1}`,
      dimensions: s.dimensions || staticProd.dimensions || "",
      selling_price: 0,
      original_price: 0,
      discount_percentage: 0,
      stock_quantity: 10,
      available: true,
      display_order: idx + 1,
    }));
  }
  return [
    {
      id: `fallback-${code}-std`,
      product_id: code,
      variant_name: "Standard",
      dimensions: staticProd.dimensions || "",
      selling_price: 0,
      original_price: 0,
      discount_percentage: 0,
      stock_quantity: 10,
      available: true,
      display_order: 1,
    },
  ];
}

// ─── Mapping Helpers ──────────────────────────────────────────────────────────

function mapDbVariant(v: DbProductVariant): ProductVariant {
  const selling = Number(v.selling_price || 0);
  const original = Number(v.original_price || 0);
  const discount = v.discount_percentage != null
    ? Number(v.discount_percentage)
    : original > selling
      ? Math.round(((original - selling) / original) * 100)
      : 0;

  return {
    id: v.id,
    product_id: (v.product_id || "").toUpperCase(),
    variant_name: v.variant_name || "Standard",
    dimensions: v.dimensions || "",
    selling_price: selling,
    original_price: original,
    discount_percentage: discount,
    stock_quantity: Number(v.stock_quantity || 0),
    available: Boolean(v.available),
    sku: v.sku ?? undefined,
    display_order: Number(v.display_order || 1),
  };
}

function buildProduct(
  staticProd: any,
  dynFlags: DbDynamicProduct | undefined,
  variants: ProductVariant[]
): Product {
  const safeVariants = (variants && variants.length > 0)
    ? variants
    : buildFallbackVariants(staticProd);

  const availableVariants = safeVariants.filter((v) => v.available && v.stock_quantity > 0);
  const primaryVariant = availableVariants.length > 0 ? availableVariants[0] : safeVariants[0];

  const price = primaryVariant ? Number(primaryVariant.selling_price) : 0;
  const mrp = primaryVariant ? Number(primaryVariant.original_price) : 0;
  const discountPercentage = mrp > price
    ? Math.round(((mrp - price) / mrp) * 100)
    : 0;
  const stockQuantity = primaryVariant ? primaryVariant.stock_quantity : 0;
  const isSoldOut = safeVariants.every((v) => !v.available || v.stock_quantity <= 0);

  return {
    // Static fields
    code: staticProd.code,
    name: staticProd.name,
    img: staticProd.img,
    thumbnails: staticProd.thumbnails || [staticProd.img],
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

    // Derived from primary variant
    price,
    mrp,
    discountPercentage,
    stockQuantity,
    isSoldOut,

    // The variants array — single source of truth for all pricing
    variants: safeVariants,
  };
}

// ─── Public Service API ───────────────────────────────────────────────────────

const productService = {
  /**
   * Fetch ALL products with live Supabase data.
   * Always safe against missing variants or Supabase errors.
   */
  async getAllProductsAsync(): Promise<Product[]> {
    let dbDynamic: DbDynamicProduct[] | null = null;
    let dbVariants: DbProductVariant[] | null = null;

    if (isSupabaseConfigured) {
      try {
        const [dynRes, varRes] = await Promise.all([
          dbFetchAllDynamicProducts(),
          dbFetchAllVariants(),
        ]);
        dbDynamic = dynRes;
        dbVariants = varRes;
      } catch (err) {
        console.warn("[ProductService] getAllProductsAsync Supabase fetch error (using static metadata):", err);
      }
    }

    const dynMap = new Map<string, DbDynamicProduct>(
      (dbDynamic ?? []).map((d) => [d.product_id.toUpperCase(), d])
    );

    const variantMap = new Map<string, ProductVariant[]>();
    (dbVariants ?? []).forEach((v) => {
      if (!v || !v.product_id) return;
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
        const fetchedVariants = (variantMap.get(key) ?? []).sort(
          (a, b) => a.display_order - b.display_order
        );
        const finalVariants = fetchedVariants.length > 0
          ? fetchedVariants
          : buildFallbackVariants(p);
        return buildProduct(p, dynMap.get(key), finalVariants);
      });
  },

  /**
   * Fetch a single product with live Supabase data.
   * Direct Supabase query — always fresh, fuzzy code/slug resolution.
   */
  async getProductByCodeAsync(code: string | undefined | null): Promise<Product | null> {
    if (!code) return null;

    const staticProd = getStaticProductByCode(code);
    if (!staticProd) {
      console.warn(`[ProductService] Static catalog item not found for code: '${code}'`);
      return null;
    }

    const key = staticProd.code.toUpperCase();
    let dynFlags: DbDynamicProduct | undefined = undefined;
    let dbVariants: DbProductVariant[] | null = null;

    if (isSupabaseConfigured) {
      try {
        const [flagsRes, variantsRes] = await Promise.all([
          dbFetchDynamicProductById(key),
          dbFetchVariantsByProductId(key),
        ]);
        dynFlags = flagsRes ?? undefined;
        dbVariants = variantsRes;
      } catch (err) {
        console.warn(`[ProductService] Supabase fetch error for '${key}' (using static metadata):`, err);
      }
    }

    const fetchedVariants = (dbVariants ?? []).map(mapDbVariant);
    const finalVariants = fetchedVariants.length > 0
      ? fetchedVariants.sort((a, b) => a.display_order - b.display_order)
      : buildFallbackVariants(staticProd);

    return buildProduct(staticProd, dynFlags, finalVariants);
  },

  /**
   * Check if a product code exists in the static catalog.
   */
  productExists(code: string | undefined | null): boolean {
    if (!code) return false;
    return getStaticProductByCode(code) !== null;
  },

  /**
   * Get static product metadata only (no prices, no Supabase).
   * Used for SEO/head generation where async is unavailable.
   */
  getStaticProductMetadata(code: string | undefined | null): { name: string; description: string } | null {
    if (!code) return null;
    const p = getStaticProductByCode(code);
    if (!p) return null;
    return { name: p.name, description: p.description ?? "" };
  },

  /**
   * Filter products by category from a pre-fetched list.
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
