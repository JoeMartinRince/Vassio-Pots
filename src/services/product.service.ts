/**
 * Vassio Product Service — Multi-Variant Enterprise Architecture
 * ─────────────────────────────────────────────────────────────────────────────
 * Single Source of Truth for all product and size variant data across the application.
 *
 * Flow:
 * 1. Load Static Metadata (src/data/products.ts)
 * 2. Fetch products_dynamic (Supabase)
 * 3. Fetch product_variants (Supabase)
 * 4. Merge into single unified Product objects
 *
 * React components call this service exclusively and never query static files or Supabase directly.
 */

import {
  products as staticProducts,
  vases as staticVases,
  auxiliaryProducts as staticAuxiliary,
  getProductByCode as findStaticProduct,
} from "@/data/products";
import {
  fetchDynamicProductRows,
  fetchProductVariantRows,
  fetchVariantsByCode,
  isSupabaseConfigured,
} from "@/lib/supabase";
import type { Product, ProductVariant } from "@/types/product";
import type { SupabaseDynamicProductRow, SupabaseProductVariantRow } from "@/lib/supabase";

// ─── Default Variant Builder ──────────────────────────────────────────────────
// Constructs default variant objects for static products when database rows do not exist.

function buildStaticFallbackVariants(staticProd: any): ProductVariant[] {
  if (!staticProd) return [];
  const code = (staticProd.code || "").toUpperCase();

  if (Array.isArray(staticProd.sizes) && staticProd.sizes.length > 0) {
    return staticProd.sizes.map((sz: any, idx: number) => ({
      product_id: code,
      variant_name: sz.name,
      dimensions: sz.dimensions || "",
      selling_price: 5200 + idx * 1600, // Default price tier
      original_price: 7500 + idx * 2200,
      discount_percentage: 30,
      stock_quantity: 10,
      available: true,
      sku: `SKU-${code}-${sz.name.substring(0, 8).replace(/\s+/g, "").toUpperCase()}`,
      display_order: idx + 1,
    }));
  }

  return [
    {
      product_id: code,
      variant_name: "Standard",
      dimensions: staticProd.dimensions || "",
      selling_price: 4999,
      original_price: 6999,
      discount_percentage: 28,
      stock_quantity: 10,
      available: true,
      sku: `SKU-${code}-STD`,
      display_order: 1,
    },
  ];
}

// ─── Core Product Merger ──────────────────────────────────────────────────────

function mergeProduct(
  staticProd: any,
  dynRow?: SupabaseDynamicProductRow | null,
  variantRows?: ProductVariant[]
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

  // Active variants for product
  const activeVariants = (variantRows && variantRows.length > 0)
    ? variantRows
    : buildStaticFallbackVariants(staticProd);

  // Default primary variant for card displays & catalog lists
  const primaryVariant = activeVariants.find((v) => v.available) || activeVariants[0];

  const price = primaryVariant ? Number(primaryVariant.selling_price) : 0;
  const mrp = primaryVariant ? Number(primaryVariant.original_price) : price;
  const discountPercentage = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;
  const stockQuantity = primaryVariant ? primaryVariant.stock_quantity : 10;
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
    featured: dynRow?.featured !== undefined ? Boolean(dynRow.featured) : true,
    newArrival: dynRow?.new_arrival !== undefined ? Boolean(dynRow.new_arrival) : false,
    active: dynRow?.active !== undefined ? dynRow.active !== false : true,
    displayOrder: dynRow?.display_order !== undefined ? Number(dynRow.display_order) : 99,
    variants: activeVariants,
  };
}

// ─── Product Service API ──────────────────────────────────────────────────────

const productService = {

  /**
   * Synchronous load: returns catalog products using static catalog + fallback defaults.
   */
  getAllProducts(): Product[] {
    const allStatic = [...staticProducts, ...staticVases, ...staticAuxiliary];
    return allStatic.map((sp) => mergeProduct(sp, null, null));
  },

  /**
   * Async load: queries Supabase for products_dynamic and product_variants and merges everything cleanly.
   */
  async getAllProductsAsync(): Promise<Product[]> {
    const allStatic = [...staticProducts, ...staticVases, ...staticAuxiliary];

    if (!isSupabaseConfigured) {
      return this.getAllProducts();
    }

    try {
      const [dbProducts, dbVariants] = await Promise.all([
        fetchDynamicProductRows(),
        fetchProductVariantRows(),
      ]);

      const dynMap = new Map<string, SupabaseDynamicProductRow>();
      if (dbProducts) {
        dbProducts.forEach((p) => {
          if (p.product_id) dynMap.set(p.product_id.toUpperCase(), p);
        });
      }

      const variantMap = new Map<string, ProductVariant[]>();
      if (dbVariants) {
        dbVariants.forEach((v) => {
          const key = v.product_id.toUpperCase();
          const list = variantMap.get(key) || [];
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
            sku: v.sku || `SKU-${key}-${v.variant_name.toUpperCase()}`,
            display_order: Number(v.display_order),
          });
          variantMap.set(key, list);
        });
      }

      return allStatic
        .filter((sp) => {
          const dyn = dynMap.get(sp.code.toUpperCase());
          return dyn ? dyn.active !== false : true;
        })
        .map((sp) => {
          const key = sp.code.toUpperCase();
          return mergeProduct(sp, dynMap.get(key), variantMap.get(key));
        });
    } catch (e) {
      console.warn("[Vassio Supabase] Error fetching dynamic products/variants:", e);
      return this.getAllProducts();
    }
  },

  /**
   * Synchronous single product lookup by code.
   */
  getProductByCode(code: string | undefined | null): Product | null {
    if (!code) return null;
    const staticProd = findStaticProduct(code);
    if (!staticProd) return null;
    return mergeProduct(staticProd, null, null);
  },

  /**
   * Async single product lookup by code: queries Supabase directly for fresh variants.
   */
  async getProductByCodeAsync(code: string | undefined | null): Promise<Product | null> {
    if (!code) return null;
    const staticProd = findStaticProduct(code);
    if (!staticProd) return null;

    const key = staticProd.code.toUpperCase();

    if (isSupabaseConfigured) {
      try {
        const variants = await fetchVariantsByCode(key);
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
            sku: v.sku || `SKU-${key}-${v.variant_name.toUpperCase()}`,
            display_order: Number(v.display_order),
          }));

          return mergeProduct(staticProd, null, mappedVariants);
        }
      } catch (e) {
        console.warn(`[Vassio Supabase] Error fetching variants for product "${key}":`, e);
      }
    }

    return this.getProductByCode(code);
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
};

export default productService;
