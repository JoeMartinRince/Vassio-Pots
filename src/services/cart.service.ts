import type { CartItem, CartSummary } from "@/types/cart";

const CART_KEY = "vassio_cart_v1";

/**
 * Service Layer abstraction for Shopping Cart Operations.
 * Prepared for Supabase Realtime Cart Sync.
 */
export const cartService = {
  getCart(): CartItem[] {
    try {
      const data = localStorage.getItem(CART_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },

  saveCart(items: CartItem[]): void {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  },

  getCartSummary(items: CartItem[]): CartSummary {
    const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const mrpTotal = items.reduce((acc, item) => acc + (item.mrp || item.price) * item.quantity, 0);
    const discount = Math.max(0, mrpTotal - subtotal);
    const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

    return {
      subtotal,
      discount,
      total: subtotal,
      itemCount,
    };
  },
};

export default cartService;
