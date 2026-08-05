import { useState, useEffect, useMemo } from "react";
import productService from "@/services/productService";
import type { Product } from "@/types/product";

export function useProducts(category?: string) {
  const [productList, setProductList] = useState<Product[]>(() => {
    if (!category) return productService.getAllProducts();
    return productService.getProductsByCategory(category);
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    productService.getAllProductsAsync().then((freshProducts) => {
      if (isMounted) {
        if (!category) {
          setProductList(freshProducts);
        } else {
          setProductList(productService.getProductsByCategory(category));
        }
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [category]);

  return {
    products: productList,
    totalCount: productList.length,
    loading,
    getProductByCode: (code: string) => productService.getProductByCode(code),
    searchProducts: (q: string) => productService.searchProducts(q),
  };
}

export default useProducts;
