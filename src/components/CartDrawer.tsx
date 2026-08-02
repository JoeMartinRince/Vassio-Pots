import React from "react";
import { useStore } from "@/context/StoreContext";
import { Link } from "@tanstack/react-router";
import { ShoppingBag, X, Trash2, Plus, Minus, ArrowRight, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export function CartDrawer() {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    cartCount,
    cartSubtotal,
    cartSavings,
    isCartOpen,
    setIsCartOpen,
    clearCart,
  } = useStore();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
      />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-md bg-background h-full shadow-2xl flex flex-col justify-between z-10 border-l border-border/40 font-sans">
        {/* Header */}
        <div className="p-5 border-b border-border/40 bg-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-5 h-5 text-primary" />
            <h3 className="serif text-xl font-extrabold text-foreground">Shopping Cart</h3>
            <span className="bg-primary/15 text-primary px-2.5 py-0.5 rounded-full text-xs font-bold">
              {cartCount} {cartCount === 1 ? "Item" : "Items"}
            </span>
          </div>

          <button
            onClick={() => setIsCartOpen(false)}
            className="p-1.5 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {cart.length === 0 ? (
            <div className="py-24 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-secondary/80 text-muted-foreground flex items-center justify-center mx-auto">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h4 className="serif text-2xl font-bold text-foreground">Your cart is empty.</h4>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                Explore our handcrafted fiberglass planters & minimalist vases to elevate your living spaces.
              </p>
              <div className="pt-2">
                <Link
                  to="/shop"
                  onClick={() => setIsCartOpen(false)}
                  className="inline-block bg-primary hover:bg-primary/90 text-white px-8 py-3 text-xs uppercase tracking-[0.2em] font-bold transition duration-300 rounded-full shadow-sm cursor-pointer"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-3.5">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-2xl bg-white border border-border/40 flex items-center gap-3.5 shadow-xs"
                >
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-secondary border border-border/30 shrink-0">
                    <img src={item.img} alt={item.name} className="w-full h-full object-cover" />
                  </div>

                  <div className="flex-1 overflow-hidden">
                    <div className="flex items-start justify-between gap-2">
                      <h5 className="font-sans font-bold text-xs text-foreground truncate">{item.name}</h5>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-muted-foreground/60 hover:text-destructive transition cursor-pointer p-0.5"
                        title="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {item.sizeName && (
                      <span className="text-[10px] text-muted-foreground font-semibold bg-secondary px-2 py-0.5 rounded mt-1 inline-block">
                        Size: {item.sizeName}
                      </span>
                    )}

                    <div className="mt-2.5 flex items-center justify-between">
                      <div className="flex items-center border border-border/60 rounded-lg bg-background overflow-hidden">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-7 text-center text-xs font-bold text-foreground">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="text-right">
                        <span className="font-bold text-xs text-primary">
                          ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer / Checkout section */}
        {cart.length > 0 && (
          <div className="p-5 border-t border-border/40 bg-white space-y-4">
            {cartSavings > 0 && (
              <div className="p-2.5 rounded-xl bg-[#3F673F]/10 border border-[#5B8550]/30 text-[#3F673F] text-[11px] font-bold flex items-center justify-between">
                <span>Total Offer Discount</span>
                <span>- ₹{cartSavings.toLocaleString("en-IN")}</span>
              </div>
            )}

            <div className="flex items-center justify-between text-sm font-sans">
              <span className="font-semibold text-muted-foreground">Subtotal</span>
              <span className="serif text-xl font-extrabold text-primary">
                ₹{cartSubtotal.toLocaleString("en-IN")}
              </span>
            </div>

            <p className="text-[10px] text-muted-foreground text-center font-medium">
              Taxes & PAN-India Express Delivery calculated at checkout
            </p>

            <button
              onClick={() => {
                toast.success("Proceeding to Checkout!");
              }}
              className="w-full py-4 rounded-full bg-primary hover:bg-primary/90 text-white font-bold text-xs uppercase tracking-[0.2em] shadow-md transition duration-300 cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground/80 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-primary" />
              <span>100% Encrypted & Secure Checkout</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
