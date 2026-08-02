import React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import Layout from "@/components/Layout";
import { useStore } from "@/context/StoreContext";
import { products, getProductByCode } from "@/data/products";
import { Heart, ShoppingBag, Trash2, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/wishlist")({
  head: () => ({
    meta: [
      { title: "My Saved Wishlist — Vassio" },
      { name: "description", content: "Saved luxury fiberglass planters and minimalist ceramic vases." },
    ],
  }),
  component: WishlistPage,
});

function WishlistPage() {
  const { wishlist, toggleWishlist, addToCart } = useStore();

  const savedProducts = wishlist
    .map((code) => getProductByCode(code))
    .filter(Boolean) as typeof products;

  return (
    <Layout>
      <div className="mx-auto max-w-[1400px] px-6 py-12 md:py-16 font-sans">
        {/* Breadcrumb */}
        <nav className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground font-semibold mb-8 flex items-center gap-1.5">
          <Link to="/" className="hover:text-foreground transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-foreground">Wishlist</span>
        </nav>

        {/* Page Title */}
        <div className="mb-12 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/25 text-primary text-[11px] font-bold uppercase tracking-[0.2em] mb-4">
            <Heart className="w-3.5 h-3.5 fill-primary text-primary" />
            <span>Saved Botanicals</span>
          </div>

          <h1 className="serif text-4xl md:text-5xl text-foreground">My Wishlist</h1>
          <p className="mt-3 text-xs md:text-sm text-muted-foreground leading-relaxed">
            Your curated collection of premium fiberglass planters & architectural ceramic vases.
          </p>
        </div>

        {/* Wishlist Items Grid */}
        {savedProducts.length === 0 ? (
          <div className="max-w-md mx-auto text-center py-20 bg-white border border-border/40 rounded-3xl p-8 shadow-sm space-y-4">
            <div className="w-16 h-16 rounded-full bg-secondary text-muted-foreground flex items-center justify-center mx-auto">
              <Heart className="w-8 h-8" />
            </div>
            <h2 className="serif text-2xl font-bold text-foreground">Your wishlist is empty.</h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Explore our handcrafted collections and click the heart icon on any planter to save it for later.
            </p>
            <div className="pt-3">
              <Link
                to="/shop"
                className="inline-block bg-primary hover:bg-primary/90 text-white px-8 py-3 text-xs uppercase tracking-[0.2em] font-bold transition duration-300 rounded-full shadow-sm cursor-pointer"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {savedProducts.map((p) => {
              const off = Math.round(((p.mrp - p.price) / p.mrp) * 100);
              return (
                <div
                  key={p.code}
                  className="bg-white border border-border/40 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between group"
                >
                  <div>
                    {/* Image Container */}
                    <div className="relative overflow-hidden bg-secondary aspect-[4/5] rounded-xl border border-border/30 mb-4">
                      <img
                        src={p.img}
                        alt={p.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <span className="absolute left-3 top-3 bg-[#3F673F] text-white border border-[#5B8550] text-[10px] uppercase tracking-[0.2em] px-2.5 py-1 font-bold rounded shadow-sm">
                        {off}% OFF
                      </span>
                      <button
                        onClick={() => toggleWishlist(p.code)}
                        className="absolute right-3 top-3 bg-white/90 hover:bg-white text-rose-500 p-2 rounded-full shadow-sm transition-colors cursor-pointer"
                        aria-label="Remove from Wishlist"
                      >
                        <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
                      </button>
                    </div>

                    {/* Product Info */}
                    <Link to="/product/$productId" params={{ productId: p.code }}>
                      <h3 className="font-sans font-bold text-foreground text-sm tracking-wide group-hover:text-primary transition-colors leading-snug">
                        {p.name}
                      </h3>
                    </Link>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">
                      SKU: {p.code}
                    </p>

                    <div className="mt-2 flex items-center gap-2">
                      <span className="font-semibold text-sm text-primary">
                        ₹{p.price.toLocaleString("en-IN")}
                      </span>
                      <span className="text-xs text-muted-foreground line-through font-medium">
                        ₹{p.mrp.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-5 pt-3 border-t border-border/30 flex items-center gap-2">
                    <button
                      onClick={() => addToCart(p)}
                      className="flex-1 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Add to Cart</span>
                    </button>
                    <button
                      onClick={() => toggleWishlist(p.code)}
                      className="p-2.5 rounded-xl border border-border/50 text-muted-foreground hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
