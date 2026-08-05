import { useState, useEffect, useCallback } from "react";
import productService from "@/services/product.service";
import type { Product } from "@/types/product";

interface UseProductsReturn {
  products: Product[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  filterByCategory: (cat: string) => Product[];
  search: (query: string) => Product[];
}

/**
 * useProducts — fetches the full merged product catalog (static + Supabase).
 *
 * - No synchronous pre-render from stale module cache.
 * - Single async fetch on mount (and on explicit refetch()).
 * - Optional category filter: re-runs locally on the fetched list.
 */
export function useProducts(category?: string): UseProductsReturn {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fetchTick, setFetchTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    productService
      .getAllProductsAsync()
      .then((list) => {
        if (!cancelled) {
          setAllProducts(list);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          console.error("[useProducts] fetch failed:", err);
          setError("Failed to load product catalog. Please refresh.");
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, [fetchTick]);

  const refetch = useCallback(() => {
    setFetchTick((t) => t + 1);
  }, []);

  const filteredProducts = category
    ? productService.filterByCategory(allProducts, category)
    : allProducts;

  const filterByCategory = useCallback(
    (cat: string) => productService.filterByCategory(allProducts, cat),
    [allProducts]
  );

  const search = useCallback(
    (query: string) => productService.searchInProducts(allProducts, query),
    [allProducts]
  );

  return {
    products: filteredProducts,
    loading,
    error,
    refetch,
    filterByCategory,
    search,
  };
}

/**
 * useProduct — fetches a single product by code.
 * Always fresh from Supabase.
 */
export function useProduct(code: string | undefined | null) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fetchTick, setFetchTick] = useState(0);

  useEffect(() => {
    if (!code) {
      setProduct(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    productService
      .getProductByCodeAsync(code)
      .then((p) => {
        if (!cancelled) {
          setProduct(p);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          console.error(`[useProduct] fetch failed for ${code}:`, err);
          setError("Failed to load product.");
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, [code, fetchTick]);

  const refetch = useCallback(() => {
    setFetchTick((t) => t + 1);
  }, []);

  return { product, loading, error, refetch };
}

export default useProducts;
