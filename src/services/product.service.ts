import { products as staticProducts, vases as staticVases, auxiliaryProducts as staticAuxiliary, getProductByCode as findStaticProduct } from "@/data/products";
import { getAdminProducts } from "@/services/adminService";
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
 * Merges Static Product Data (src/data/products.ts) with Dynamic Business Data (Supabase / Admin Store).
 */
export const productService = {
  /**
   * Helper to merge static content with dynamic business state.
   */
  mergeProduct(staticProd: any, dynamicMap: Map<string, any>): Product {
    const dyn = dynamicMap.get(staticProd.code.toUpperCase());

    const price = dyn?.price ?? dyn?.selling_price ?? staticProd.price;
    const mrp = dyn?.mrp ?? dyn?.original_price ?? staticProd.mrp;
    const discount = dyn?.discount_percentage ?? (mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0);
    const isSoldOut = dyn?.stock_status === "out_of_stock" || (dyn?.stock_quantity !== undefined && dyn.stock_quantity <= 0);

    return {
      ...staticProd,
      price,
      mrp,
      discountPercentage: discount,
      isSoldOut,
      featured: dyn?.featured ?? staticProd.featured ?? false,
      newArrival: dyn?.new_arrival ?? staticProd.newArrival ?? false,
      displayOrder: dyn?.display_order ?? 99,
      active: dyn?.active ?? true,
    };
  },

  /**
   * Fetch all active merged products across collections.
   */
  getAllProducts(): Product[] {
    const allStatic = [...staticProducts, ...staticVases, ...staticAuxiliary];
    
    // Fetch dynamic store map
    const adminProducts = getAdminProducts();
    const dynamicMap = new Map<string, any>();
    adminProducts.forEach((ap) => dynamicMap.set(ap.product_id.toUpperCase(), ap));

    return allStatic
      .filter((p) => {
        const dyn = dynamicMap.get(p.code.toUpperCase());
        return dyn?.active !== false;
      })
      .map((p) => this.mergeProduct(p, dynamicMap));
  },

  /**
   * Fetch a single merged product by code or slug.
   */
  getProductByCode(code: string): Product | null {
    const staticProd = findStaticProduct(code);
    if (!staticProd) return null;

    const adminProducts = getAdminProducts();
    const dynamicMap = new Map<string, any>();
    adminProducts.forEach((ap) => dynamicMap.set(ap.product_id.toUpperCase(), ap));

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
