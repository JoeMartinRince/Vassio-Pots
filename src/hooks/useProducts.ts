import { useState, useEffect } from "react";
import productService from "@/services/product.service";
import type { Product } from "@/types/product";

/**
 * useProducts hook — provides merged product list (static + Supabase dynamic).
 * 
 * Initial render: returns static data immediately (fast SSR-friendly).
 * After mount: fetches Supabase dynamic data, updates state with merged results.
 */
export function useProducts(category?: string) {
  // Start with static products so the page renders immediately
  const [productList, setProductList] = useState<Product[]>(() => {
    const all = productService.getAllProducts();
    return category ? productService.getProductsByCategory(category) : all;
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    productService
      .getAllProductsAsync()
      .then(() => {
        if (!isMounted) return;
        // After cache is populated from Supabase, re-read merged data
        const fresh = category
          ? productService.getProductsByCategory(category)
          : productService.getAllProducts();
        setProductList(fresh);
        setLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.warn("[useProducts] Failed to load dynamic data:", err);
        setError("Could not load live pricing. Displaying catalog prices.");
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [category]);

  return {
    products: productList,
    totalCount: productList.length,
    loading,
    error,
    getProductByCode: (code: string) => productService.getProductByCode(code),
    searchProducts: (q: string) => productService.searchProducts(q),
  };
}

export default useProducts;
