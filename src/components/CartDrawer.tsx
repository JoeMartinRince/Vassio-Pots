import { useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight } from "lucide-react";
import { useStore, useCartSubtotal } from "@/context/StoreContext";

export default function CartDrawer() {
  const { cartItems, isCartOpen, closeCart, removeFromCart, updateCartQuantity } = useStore();
  const subtotal = useCartSubtotal();

  // Close on Escape key
  useEffect(() => {
    if (!isCartOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeCart();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isCartOpen, closeCart]);

  // Lock body scroll when open
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isCartOpen]);

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={closeCart}
      />

      {/* Drawer */}
      <div className="ml-auto relative flex flex-col w-full max-w-[420px] h-full bg-[#FCFCF8] shadow-2xl animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border/30">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="h-5 w-5 text-primary" />
            <h2 className="serif text-xl text-foreground">Your Cart</h2>
            {cartItems.length > 0 && (
              <span className="bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                {cartItems.reduce((s, i) => s + i.quantity, 0)}
              </span>
            )}
          </div>
          <button
            onClick={closeCart}
            className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer p-1 rounded-md hover:bg-secondary/40"
            aria-label="Close cart"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-16">
              <ShoppingBag className="h-14 w-14 text-muted-foreground/30 mb-4" />
              <p className="serif text-xl text-foreground mb-2">Your cart is empty</p>
              <p className="text-sm text-muted-foreground mb-8">
                Add some beautiful planters to get started.
              </p>
              <button
                onClick={closeCart}
                className="bg-primary text-white px-8 py-3 text-xs font-bold uppercase tracking-[0.2em] rounded hover:bg-primary/90 transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            cartItems.map((item) => (
              <div
                key={`${item.code}-${item.sizeName ?? ""}`}
                className="flex gap-4 bg-white rounded-xl p-3 border border-border/20 shadow-sm"
              >
                {/* Product Image */}
                <Link
                  to="/product/$productId"
                  params={{ productId: item.code }}
                  onClick={closeCart}
                  className="shrink-0"
                >
                  <div className="h-20 w-16 overflow-hidden rounded-lg bg-secondary border border-border/20">
                    <img
                      src={item.img}
                      alt={item.name}
                      className="h-full w-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                </Link>

                {/* Info */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <Link
                      to="/product/$productId"
                      params={{ productId: item.code }}
                      onClick={closeCart}
                    >
                      <p className="font-sans font-bold text-sm text-foreground/90 leading-snug hover:text-primary transition-colors line-clamp-2">
                        {item.name}
                      </p>
                    </Link>
                    {item.sizeName && (
                      <p className="text-[10px] text-muted-foreground mt-0.5">{item.sizeName}</p>
                    )}
                    <p className="text-sm font-semibold text-primary mt-1">
                      ₹{(item.price || 0).toLocaleString("en-IN")}
                    </p>
                  </div>

                  {/* Quantity & Remove */}
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center border border-border/60 rounded-lg overflow-hidden bg-[#FCFCF8]">
                      <button
                        onClick={() =>
                          item.quantity <= 1
                            ? removeFromCart(item.code)
                            : updateCartQuantity(item.code, item.quantity - 1)
                        }
                        className="h-7 w-7 flex items-center justify-center text-foreground/70 hover:bg-secondary/50 transition-colors cursor-pointer"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="h-7 w-7 flex items-center justify-center text-xs font-bold text-foreground select-none">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateCartQuantity(item.code, item.quantity + 1)}
                        className="h-7 w-7 flex items-center justify-center text-foreground/70 hover:bg-secondary/50 transition-colors cursor-pointer"
                        aria-label="Increase quantity"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.code)}
                      className="text-muted-foreground hover:text-red-500 transition-colors cursor-pointer p-1"
                      aria-label="Remove item"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="border-t border-border/30 px-6 py-5 bg-white/60">
            {/* Subtotal */}
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-semibold text-foreground/70">Subtotal</span>
              <span className="text-base font-bold text-foreground">
                ₹{subtotal.toLocaleString("en-IN")}
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground mb-5">
              Taxes and shipping calculated at checkout
            </p>

            {/* Actions */}
            <button
              className="w-full bg-primary text-white py-3.5 text-xs font-bold uppercase tracking-[0.2em] rounded hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              Proceed to Checkout
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={closeCart}
              className="w-full mt-3 border border-border/60 text-foreground py-3 text-xs font-semibold uppercase tracking-[0.15em] rounded hover:bg-secondary/40 transition-colors cursor-pointer"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
