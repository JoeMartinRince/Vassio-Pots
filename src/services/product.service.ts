/**
 * Vassio Product Service — Multi-Variant Hybrid Architecture
 * ─────────────────────────────────────────────────────────────────────────────
 * Single source of truth for all product and variant data across the application.
 *
 * Static fields   → src/data/products.ts (name, description, images, colors, specs)
 * Dynamic product → Supabase products_dynamic (featured, new_arrival, active, display_order)
 * Dynamic variant → Supabase product_variants (variant_name, selling_price, original_price, stock_quantity, available)
 *
 * React components NEVER query Supabase directly.
 * They call this service and receive a unified Product object with a populated `variants[]` array.
 */

import {
  products as staticProducts,
  vases as staticVases,
  auxiliaryProducts as staticAuxiliary,
  getProductByCode as findStaticProduct,
} from "@/data/products";
import {
  fetchDynamicProductsFromSupabase,
  fetchDynamicVariantsFromSupabase,
  fetchDynamicProductById,
  fetchVariantsByProductId,
  isSupabaseConfigured,
} from "@/lib/supabase";
import type { Product, ProductVariant } from "@/types/product";
import type { SupabaseDynamicProduct, SupabaseProductVariant } from "@/lib/supabase";

// ─── Module-Level Caches ──────────────────────────────────────────────────────
// Populated only from Supabase. Zero hardcoded prices.

let dynamicProductCache: Map<string, SupabaseDynamicProduct> = new Map();
let variantCache: Map<string, ProductVariant[]> = new Map();
let cachePopulated = false;

// ─── Default Variant Builder ──────────────────────────────────────────────────
// Creates fallback variant objects from static size definitions if Supabase rows do not exist yet.

function buildStaticFallbackVariants(staticProd: any): ProductVariant[] {
  if (!staticProd) return [];
  const code = (staticProd.code || "").toUpperCase();

  if (Array.isArray(staticProd.sizes) && staticProd.sizes.length > 0) {
    return staticProd.sizes.map((sz: any, idx: number) => ({
      product_id: code,
      variant_name: sz.name,
      dimensions: sz.dimensions || "",
      selling_price: Number(staticProd.price || 0),
      original_price: Number(staticProd.mrp || staticProd.price || 0),
      discount_percentage: staticProd.mrp > staticProd.price
        ? Math.round(((staticProd.mrp - staticProd.price) / staticProd.mrp) * 100)
        : 0,
      stock_quantity: 10,
      available: true,
      display_order: idx + 1,
    }));
  }

  // Single default variant for products without sizes
  return [
    {
      product_id: code,
      variant_name: "Standard",
      dimensions: staticProd.dimensions || "",
      selling_price: Number(staticProd.price || 0),
      original_price: Number(staticProd.mrp || staticProd.price || 0),
      discount_percentage: 0,
      stock_quantity: 10,
      available: true,
      display_order: 1,
    },
  ];
}

// ─── Merge Helper ─────────────────────────────────────────────────────────────

function mergeProduct(
  staticProd: any,
  dyn?: SupabaseDynamicProduct | null,
  variantsList?: ProductVariant[]
): Product {
  if (!staticProd) {
    return {
      code: "UNKNOWN",
      name: "Unknown Product",
      price: 0,
      mrp: 0,
      img: "",
      variants: [],
    };
  }

  const code = (staticProd.code || "").toUpperCase();

  // Get active variants for this product
  const activeVariants = (variantsList && variantsList.length > 0)
    ? variantsList
    : (variantCache.get(code) || buildStaticFallbackVariants(staticProd));

  // Determine primary base pricing from dynamic table OR first variant OR static product
  const primaryVariant = activeVariants.find((v) => v.available) || activeVariants[0];

  const price = dyn?.selling_price !== undefined
    ? Number(dyn.selling_price)
    : (primaryVariant ? Number(primaryVariant.selling_price) : Number(staticProd.price ?? 0));

  const mrp = dyn?.original_price !== undefined
    ? Number(dyn.original_price)
    : (primaryVariant ? Number(primaryVariant.original_price) : Number(staticProd.mrp ?? price));

  const discountPercentage = dyn?.discount_percentage !== undefined
    ? Number(dyn.discount_percentage)
    : (mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0);

  const stockQuantity = dyn?.stock_quantity !== undefined
    ? Number(dyn.stock_quantity)
    : (primaryVariant ? primaryVariant.stock_quantity : 10);

  const isSoldOut = activeVariants.every((v) => !v.available || v.stock_quantity <= 0);

  return {
    ...staticProd,
    code: staticProd.code || "UNKNOWN",
    name: staticProd.name || "Planter",
    img: staticProd.img || "",
    price,
    mrp,
    discountPercentage,
    stockQuantity,
    isSoldOut,
    featured: dyn?.featured !== undefined ? Boolean(dyn.featured) : (staticProd.featured ?? false),
    newArrival: dyn?.new_arrival !== undefined ? Boolean(dyn.new_arrival) : (staticProd.newArrival ?? false),
    displayOrder: dyn?.display_order !== undefined ? Number(dyn.display_order) : 99,
    active: dyn?.active !== undefined ? dyn.active !== false : true,
    variants: activeVariants,
  };
}

// ─── Public Service API ────────────────────────────────────────────────────────

const productService = {

  /**
   * Synchronous: returns merged products using current dynamic cache.
   */
  getAllProducts(): Product[] {
    const allStatic = [...staticProducts, ...staticVases, ...staticAuxiliary];
    return allStatic
      .filter((p) => {
        const dyn = dynamicProductCache.get((p.code || "").toUpperCase());
        return dyn ? dyn.active !== false : true;
      })
      .map((p) => mergeProduct(p, dynamicProductCache.get((p.code || "").toUpperCase())));
  },

  /**
   * Async: fetches products_dynamic AND product_variants from Supabase,
   * populates caches, and returns the full merged product list.
   */
  async getAllProductsAsync(): Promise<Product[]> {
    if (isSupabaseConfigured) {
      try {
        const [dbProducts, dbVariants] = await Promise.all([
          fetchDynamicProductsFromSupabase(),
          fetchDynamicVariantsFromSupabase(),
        ]);

        if (dbProducts && dbProducts.length > 0) {
          dynamicProductCache = new Map(
            dbProducts
              .filter((dp) => dp.product_id)
              .map((dp) => [dp.product_id.toUpperCase(), dp])
          );
        }

        if (dbVariants && dbVariants.length > 0) {
          const grouped = new Map<string, ProductVariant[]>();
          dbVariants.forEach((v) => {
            const key = v.product_id.toUpperCase();
            const list = grouped.get(key) || [];
            list.push({
              id: v.id,
              product_id: key,
              variant_name: v.variant_name,
              dimensions: v.dimensions,
              selling_price: Number(v.selling_price),
              original_price: Number(v.original_price),
              discount_percentage: Number(v.discount_percentage ?? 0),
              stock_quantity: Number(v.stock_quantity),
              available: Boolean(v.available),
              display_order: Number(v.display_order),
            });
            grouped.set(key, list);
          });
          variantCache = grouped;
        }

        cachePopulated = true;
      } catch (e) {
        console.warn("[Vassio Supabase] Error fetching dynamic products/variants:", e);
      }
    }
    return this.getAllProducts();
  },

  /**
   * Synchronous single product lookup from cache.
   */
  getProductByCode(code: string | undefined | null): Product | null {
    if (!code) return null;
    const staticProd = findStaticProduct(code);
    if (!staticProd) return null;
    const key = staticProd.code.toUpperCase();
    return mergeProduct(staticProd, dynamicProductCache.get(key), variantCache.get(key));
  },

  /**
   * Async single product lookup: queries product_id and variants directly from Supabase.
   */
  async getProductByCodeAsync(code: string | undefined | null): Promise<Product | null> {
    if (!code) return null;
    const staticProd = findStaticProduct(code);
    if (!staticProd) return null;
    const key = staticProd.code.toUpperCase();

    if (isSupabaseConfigured) {
      try {
        const [dyn, variants] = await Promise.all([
          fetchDynamicProductById(key),
          fetchVariantsByProductId(key),
        ]);

        if (dyn) dynamicProductCache.set(key, dyn);
        if (variants && variants.length > 0) {
          const mappedVariants: ProductVariant[] = variants.map((v) => ({
            id: v.id,
            product_id: key,
            variant_name: v.variant_name,
            dimensions: v.dimensions,
            selling_price: Number(v.selling_price),
            original_price: Number(v.original_price),
            discount_percentage: Number(v.discount_percentage ?? 0),
            stock_quantity: Number(v.stock_quantity),
            available: Boolean(v.available),
            display_order: Number(v.display_order),
          }));
          variantCache.set(key, mappedVariants);
          return mergeProduct(staticProd, dyn, mappedVariants);
        }
      } catch (e) {
        console.warn(`[Vassio Supabase] Error loading single product "${key}":`, e);
      }
    }

    return this.getProductByCode(code);
  },

  /**
   * Update dynamic product cache for single product
   */
  updateProductCache(productId: string, data: Partial<SupabaseDynamicProduct>): void {
    const key = productId.toUpperCase();
    const existing = dynamicProductCache.get(key);
    if (existing) {
      dynamicProductCache.set(key, { ...existing, ...data });
    } else {
      dynamicProductCache.set(key, data as SupabaseDynamicProduct);
    }
  },

  /**
   * Update dynamic variant cache after admin save
   */
  updateVariantCache(variant: ProductVariant): void {
    const key = variant.product_id.toUpperCase();
    const existingList = variantCache.get(key) || [];
    const idx = existingList.findIndex((v) => v.variant_name === variant.variant_name);
    if (idx >= 0) {
      existingList[idx] = { ...existingList[idx], ...variant };
    } else {
      existingList.push(variant);
    }
    variantCache.set(key, existingList);
  },

  /**
   * Search products by query string.
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
   * Category filtering.
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

  isCachePopulated(): boolean {
    return cachePopulated;
  },
};

export default productService;
