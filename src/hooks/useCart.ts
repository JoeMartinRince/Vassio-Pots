import { useStore } from "@/context/StoreContext";

export function useCart() {
  const { cart, addToCart, removeFromCart, updateQuantity, clearCart, isCartOpen, setIsCartOpen } = useStore();

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartSubtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const cartMrpTotal = cart.reduce((acc, item) => acc + (item.mrp || item.price) * item.quantity, 0);
  const cartSavings = Math.max(0, cartMrpTotal - cartSubtotal);

  return {
    cart,
    cartCount,
    cartSubtotal,
    cartMrpTotal,
    cartSavings,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    isCartOpen,
    setIsCartOpen,
  };
}

export default useCart;
