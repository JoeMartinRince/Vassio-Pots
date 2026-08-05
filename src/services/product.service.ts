import { products as staticProducts, vases as staticVases, auxiliaryProducts as staticAuxiliary, getProductByCode as findStaticProduct } from "@/data/products";
import { mockDynamicProducts, fetchAdminProducts } from "@/services/adminService";
import { fetchDynamicProductsFromSupabase, isSupabaseConfigured } from "@/lib/supabase";
import type { Product } from "@/types/product";

export interface DynamicProductData {
  product_id: string;
  selling_price?: number;
  original_price?: number;
  discount_percentage?: number;
  stock_quantity?: number;
  stock_status?: "in_stock" | "out_of_stock" | "pre_order";
  featured?: boolean;
  new_arrival?: boolean;
  display_order?: number;
  active?: boolean;
  updated_at?: string;
}

/**
 * Hybrid Product Service:
 * Merges Static Product Data (src/data/products.ts) with Dynamic Business Data (Supabase `products_dynamic` table / Admin Store).
 */
export const productService = {
  /**
   * Helper to merge static content with dynamic business state.
   */
  mergeProduct(staticProd: any, dynamicMap: Map<string, any>): Product {
    const code = staticProd.code.toUpperCase();
    const dyn = dynamicMap.get(code);

    const price = Number(dyn?.selling_price ?? dyn?.price ?? staticProd.price);
    const mrp = Number(dyn?.original_price ?? dyn?.mrp ?? staticProd.mrp);
    const discount = dyn?.discount_percentage !== undefined ? Number(dyn.discount_percentage) : (mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0);
    const isSoldOut = dyn?.stock_status === "out_of_stock" || (dyn?.stock_quantity !== undefined && Number(dyn.stock_quantity) <= 0);

    return {
      ...staticProd,
      price,
      mrp,
      discountPercentage: discount,
      isSoldOut,
      featured: dyn?.featured !== undefined ? Boolean(dyn.featured) : (staticProd.featured ?? false),
      newArrival: dyn?.new_arrival !== undefined ? Boolean(dyn.new_arrival) : (staticProd.newArrival ?? false),
      displayOrder: dyn?.display_order !== undefined ? Number(dyn.display_order) : 99,
      active: dyn?.active !== undefined ? dyn.active !== false : true,
    };
  },

  /**
   * Fetch all active merged products across collections.
   */
  getAllProducts(): Product[] {
    const allStatic = [...staticProducts, ...staticVases, ...staticAuxiliary];
    
    // Fetch cached dynamic map
    const dynamicMap = new Map<string, any>();
    Object.entries(mockDynamicProducts).forEach(([code, item]) => {
      dynamicMap.set(code.toUpperCase(), item);
    });

    return allStatic
      .filter((p) => {
        const dyn = dynamicMap.get(p.code.toUpperCase());
        return dyn?.active !== false;
      })
      .map((p) => this.mergeProduct(p, dynamicMap));
  },

  /**
   * Async Supabase integration for loading dynamic records from `products_dynamic`.
   */
  async getAllProductsAsync(): Promise<Product[]> {
    const allStatic = [...staticProducts, ...staticVases, ...staticAuxiliary];

    if (isSupabaseConfigured) {
      const dbProducts = await fetchDynamicProductsFromSupabase();
      if (dbProducts && dbProducts.length > 0) {
        const dynamicMap = new Map<string, any>();
        dbProducts.forEach((dp) => dynamicMap.set(dp.product_id.toUpperCase(), dp));

        // Update in-memory cache
        dbProducts.forEach((dp) => {
          mockDynamicProducts[dp.product_id.toUpperCase()] = {
            price: Number(dp.selling_price),
            mrp: Number(dp.original_price),
            discount_percentage: Number(dp.discount_percentage),
            stock_status: dp.stock_quantity > 0 ? "in_stock" : "out_of_stock",
            stock_quantity: dp.stock_quantity,
            featured: dp.featured,
            new_arrival: dp.new_arrival,
            display_order: dp.display_order,
            active: dp.active,
          };
        });

        return allStatic
          .filter((p) => {
            const dyn = dynamicMap.get(p.code.toUpperCase());
            return dyn ? dyn.active !== false : true;
          })
          .map((p) => this.mergeProduct(p, dynamicMap));
      }
    }

    return this.getAllProducts();
  },

  /**
   * Fetch a single merged product by code or slug.
   */
  getProductByCode(code: string): Product | null {
    const staticProd = findStaticProduct(code);
    if (!staticProd) return null;

    const dynamicMap = new Map<string, any>();
    Object.entries(mockDynamicProducts).forEach(([c, item]) => {
      dynamicMap.set(c.toUpperCase(), item);
    });

    return this.mergeProduct(staticProd, dynamicMap);
  },

  /**
   * Search products by name, code, category, or keywords.
   */
  searchProducts(query: string): Product[] {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    return this.getAllProducts().filter((p) => {
      const matchName = p.name.toLowerCase().includes(q);
      const matchCode = p.code.toLowerCase().includes(q);
      const matchColor = p.color ? p.color.toLowerCase().includes(q) : false;
      const matchMaterial = p.material ? p.material.toLowerCase().includes(q) : false;
      return matchName || matchCode || matchColor || matchMaterial;
    });
  },

  /**
   * Get products by category slug.
   */
  getProductsByCategory(category: string): Product[] {
    const cat = category.toLowerCase();
    const all = this.getAllProducts();

    if (cat === "frp-pots") {
      return all.filter((p) => (p.material || "").toLowerCase().includes("fiber") || p.code.startsWith("FLX") || p.code.startsWith("ARC"));
    }

    if (cat === "artificial-plants") {
      return all.filter((p) => {
        const lname = p.name.toLowerCase();
        return (
          lname.includes("plant") ||
          lname.includes("tree") ||
          lname.includes("faux") ||
          lname.includes("palm") ||
          lname.includes("ficus") ||
          p.code.startsWith("FFT")
        );
      });
    }

    if (cat === "terracotta-pots") {
      return all.filter((p) => (p.material || "").toLowerCase().includes("ceramic") || (p.material || "").toLowerCase().includes("clay") || p.code.startsWith("LFS") || p.code.startsWith("VNL"));
    }

    if (cat === "pebbles") {
      return all.filter((p) => p.name.toLowerCase().includes("pebble") || p.name.toLowerCase().includes("stone") || (p.material || "").toLowerCase().includes("stone"));
    }

    return all;
  },
};

export default productService;
