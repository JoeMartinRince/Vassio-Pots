import React, { createContext, useContext, useState, useEffect } from "react";
import { products as staticProducts } from "@/data/products";
import { toast } from "sonner";

export interface CartItem {
  id: string; // Unique key e.g. "FLX48-Flax-D"
  product_code: string;
  name: string;
  price: number;
  mrp: number;
  sizeName?: string;
  img: any;
  quantity: number;
}

interface StoreContextType {
  // Cart State & Operations
  cart: CartItem[];
  addToCart: (product: any, sizeObj?: any, quantity?: number) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, delta: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartSubtotal: number;
  cartSavings: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;

  // Wishlist State & Operations
  wishlist: string[];
  toggleWishlist: (productCode: string) => void;
  isInWishlist: (productCode: string) => boolean;
  wishlistCount: number;

  // Search State & Operations
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Persistent Cart state
  const [cart, setCart] = useState<CartItem[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("vassio_cart");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error("Failed to parse stored cart", e);
        }
      }
    }
    return [];
  });

  // Persistent Wishlist state
  const [wishlist, setWishlist] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("vassio_wishlist");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error("Failed to parse stored wishlist", e);
        }
      }
    }
    return [];
  });

  // Search & Overlay states
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem("vassio_cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem("vassio_wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  // Cart operations
  const addToCart = (product: any, sizeObj?: any, quantity: number = 1) => {
    const sizeName = sizeObj ? sizeObj.name.split(" (")[0] : undefined;
    const price = sizeObj ? sizeObj.price : product.price;
    const mrp = sizeObj ? sizeObj.mrp : product.mrp;
    const cartItemId = sizeName ? `${product.code}-${sizeName}` : product.code;

    setCart((prev) => {
      const existingIdx = prev.findIndex((item) => item.id === cartItemId);
      if (existingIdx > -1) {
        const updated = [...prev];
        updated[existingIdx].quantity += quantity;
        return updated;
      } else {
        return [
          ...prev,
          {
            id: cartItemId,
            product_code: product.code,
            name: product.name,
            price,
            mrp,
            sizeName,
            img: product.img,
            quantity,
          },
        ];
      }
    });

    toast.success(`Added ${product.name} to Cart!`);
    setIsCartOpen(true);
  };

  const removeFromCart = (cartItemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== cartItemId));
    toast.info("Item removed from Cart");
  };

  const updateQuantity = (cartItemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === cartItemId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  // Calculations
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartMrpTotal = cart.reduce((sum, item) => sum + item.mrp * item.quantity, 0);
  const cartSavings = Math.max(0, cartMrpTotal - cartSubtotal);

  // Wishlist operations
  const toggleWishlist = (productCode: string) => {
    setWishlist((prev) => {
      const exists = prev.includes(productCode);
      if (exists) {
        toast.info("Removed from Wishlist");
        return prev.filter((code) => code !== productCode);
      } else {
        toast.success("Saved to Wishlist!");
        return [...prev, productCode];
      }
    });
  };

  const isInWishlist = (productCode: string) => wishlist.includes(productCode);
  const wishlistCount = wishlist.length;

  return (
    <StoreContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartSubtotal,
        cartSavings,
        isCartOpen,
        setIsCartOpen,
        wishlist,
        toggleWishlist,
        isInWishlist,
        wishlistCount,
        searchQuery,
        setSearchQuery,
        isSearchOpen,
        setIsSearchOpen,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
};
