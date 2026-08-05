import { products, vases, auxiliaryProducts, getProductByCode as findProductByCode } from "@/data/products";
import type { Product } from "@/types/products";

/**
 * Service Layer abstraction for Product Operations.
 * Future-ready for Supabase DB query integration.
 */
export const productService = {
  /**
   * Fetch all active products across all collections.
   */
  getAllProducts(): Product[] {
    return [...products, ...vases, ...auxiliaryProducts];
  },

  /**
   * Get a single product by code or slug.
   */
  getProductByCode(code: string): Product | null {
    return findProductByCode(code);
  },

  /**
   * Search products by keyword, category, or code.
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
   * Get products by category type (e.g. 'frp-pots', 'artificial-plants', 'terracotta-pots', 'pebbles').
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
