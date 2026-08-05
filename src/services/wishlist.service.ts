import type { WishlistItem } from "@/types/wishlist";

const WISHLIST_KEY = "vassio_wishlist_v1";

/**
 * Service Layer abstraction for Wishlist Operations.
 * Prepared for Supabase Database sync.
 */
export const wishlistService = {
  getWishlist(): WishlistItem[] {
    try {
      const data = localStorage.getItem(WISHLIST_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },

  saveWishlist(items: WishlistItem[]): void {
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(items));
  },
};

export default wishlistService;
