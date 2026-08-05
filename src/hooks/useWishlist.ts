import { useStore } from "@/context/StoreContext";

export function useWishlist() {
  const { wishlist, toggleWishlist, isInWishlist, isWishlistOpen, setIsWishlistOpen } = useStore();

  const wishlistCount = wishlist.length;

  return {
    wishlist,
    wishlistCount,
    toggleWishlist,
    isInWishlist,
    isWishlistOpen,
    setIsWishlistOpen,
  };
}

export default useWishlist;
