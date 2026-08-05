import { useMemo } from "react";
import productService from "@/services/productService";
import type { Product } from "@/types/product";

export function useProducts(category?: string) {
  const products = useMemo<Product[]>(() => {
    if (!category) return productService.getAllProducts();
    return productService.getProductsByCategory(category);
  }, [category]);

  return {
    products,
    totalCount: products.length,
    getProductByCode: (code: string) => productService.getProductByCode(code),
    searchProducts: (q: string) => productService.searchProducts(q),
  };
}

export default useProducts;
