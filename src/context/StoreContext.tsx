import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import productService from "@/services/product.service";
import { useProducts } from "@/hooks/useProducts";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CartItem {
  code: string;
  name: string;
  img: string;
  price: number;
  mrp: number;
  quantity: number;
  /** Optional: selected size name */
  sizeName?: string;
}

export interface StoreState {
  // Cart
  cartItems: CartItem[];
  isCartOpen: boolean;
  // Wishlist
  wishlistIds: Set<string>;
  // Search
  isSearchOpen: boolean;
  searchQuery: string;
}

export interface StoreActions {
  // Cart
  addToCart: (product: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  removeFromCart: (code: string) => void;
  updateCartQuantity: (code: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  // Wishlist
  toggleWishlist: (code: string) => void;
  isInWishlist: (code: string) => boolean;
  // Search
  openSearch: () => void;
  closeSearch: () => void;
  setSearchQuery: (q: string) => void;
}

export type StoreContextType = StoreState & StoreActions;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const CART_KEY = "vassio_cart_v1";
const WISHLIST_KEY = "vassio_wishlist_v1";

function readLocalJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeLocal(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch { /* quota exceeded – ignore */ }
}

// ─── Context ──────────────────────────────────────────────────────────────────

const StoreCtx = createContext<StoreContextType | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  // ---------- Cart ----------
  const [cartItems, setCartItems] = useState<CartItem[]>(() =>
    readLocalJson<CartItem[]>(CART_KEY, [])
  );
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    writeLocal(CART_KEY, cartItems);
  }, [cartItems]);

  const addToCart = useCallback(
    (product: Omit<CartItem, "quantity"> & { quantity?: number }) => {
      setCartItems((prev) => {
        const key = product.sizeName ? `${product.code}__${product.sizeName}` : product.code;
        const existing = prev.find((i) =>
          (i.sizeName ? `${i.code}__${i.sizeName}` : i.code) === key
        );
        if (existing) {
          return prev.map((i) =>
            (i.sizeName ? `${i.code}__${i.sizeName}` : i.code) === key
              ? { ...i, quantity: i.quantity + (product.quantity ?? 1) }
              : i
          );
        }
        return [...prev, { ...product, quantity: product.quantity ?? 1 }];
      });
      setIsCartOpen(true);
    },
    []
  );

  const removeFromCart = useCallback((code: string) => {
    setCartItems((prev) => prev.filter((i) => i.code !== code));
  }, []);

  const updateCartQuantity = useCallback((code: string, quantity: number) => {
    if (quantity < 1) return;
    setCartItems((prev) =>
      prev.map((i) => (i.code === code ? { ...i, quantity } : i))
    );
  }, []);

  const clearCart = useCallback(() => setCartItems([]), []);
  const openCart = useCallback(() => setIsCartOpen(true), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);

  // ---------- Wishlist ----------
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(() => {
    const arr = readLocalJson<string[]>(WISHLIST_KEY, []);
    return new Set(arr);
  });

  useEffect(() => {
    writeLocal(WISHLIST_KEY, [...wishlistIds]);
  }, [wishlistIds]);

  const toggleWishlist = useCallback((code: string) => {
    setWishlistIds((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  }, []);

  const isInWishlist = useCallback(
    (code: string) => wishlistIds.has(code),
    [wishlistIds]
  );

  // ---------- Search ----------
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const openSearch = useCallback(() => setIsSearchOpen(true), []);
  const closeSearch = useCallback(() => {
    setIsSearchOpen(false);
    setSearchQuery("");
  }, []);

  const ctx: StoreContextType = {
    // Cart
    cartItems,
    isCartOpen,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    openCart,
    closeCart,
    // Wishlist
    wishlistIds,
    isInWishlist,
    toggleWishlist,
    // Search
    isSearchOpen,
    searchQuery,
    openSearch,
    closeSearch,
    setSearchQuery,
  };

  return <StoreCtx.Provider value={ctx}>{children}</StoreCtx.Provider>;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useStore(): StoreContextType {
  const ctx = useContext(StoreCtx);
  if (!ctx) throw new Error("useStore must be used within a StoreProvider");
  return ctx;
}

// ─── Derived selectors ────────────────────────────────────────────────────────

/** Total item count in cart */
export function useCartCount() {
  const { cartItems } = useStore();
  return cartItems.reduce((sum, i) => sum + i.quantity, 0);
}

/** Cart subtotal */
export function useCartSubtotal() {
  const { cartItems } = useStore();
  return cartItems.reduce((sum, i) => sum + (i.price || 0) * i.quantity, 0);
}

/** All products that are in the wishlist (with live merged Supabase pricing) */
export function useWishlistProducts() {
  const { wishlistIds } = useStore();
  const { products: allProds } = useProducts();
  return allProds.filter((p) => wishlistIds.has(p.code));
}

/**
 * Search result: fuzzy filter over merged products.
 */
export function useSearchResults(query: string) {
  const { products: allProds } = useProducts();
  if (!query.trim()) return [];
  return productService.searchInProducts(allProds, query);
}
