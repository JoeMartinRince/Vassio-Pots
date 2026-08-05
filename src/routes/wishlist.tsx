import { createFileRoute, Link } from "@tanstack/react-router";
import Layout from "@/components/Layout";
import { Heart, ShoppingBag, ArrowRight } from "lucide-react";
import { useStore, useWishlistProducts } from "@/context/StoreContext";
import { toast } from "sonner";

export const Route = createFileRoute("/wishlist")({
  head: () => ({
    meta: [
      { title: "Wishlist — Vassio" },
      { name: "description", content: "Your saved Vassio planters and decoratives." },
    ],
  }),
  component: WishlistPage,
});

function WishlistPage() {
  const { toggleWishlist, addToCart } = useStore();
  const wishlistProducts = useWishlistProducts();

  return (
    <Layout>
      <div className="mx-auto max-w-[1400px] px-6 py-12 md:py-16">
        {/* Breadcrumb */}
        <nav className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground font-semibold mb-8 flex items-center gap-1.5">
          <Link to="/" className="hover:text-foreground transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-foreground">Wishlist</span>
        </nav>

        {/* Heading */}
        <div className="mb-10">
          <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground mb-2">Saved Items</p>
          <h1 className="serif text-4xl md:text-5xl text-foreground flex items-center gap-3">
            Your Wishlist
            {wishlistProducts.length > 0 && (
              <span className="bg-primary text-white text-sm font-bold px-3 py-1 rounded-full">
                {wishlistProducts.length}
              </span>
            )}
          </h1>
        </div>

        {wishlistProducts.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center text-center py-24 border border-dashed border-border/40 rounded-2xl">
            <Heart className="h-16 w-16 text-muted-foreground/20 mb-5" />
            <p className="serif text-2xl text-foreground mb-2">Your wishlist is empty</p>
            <p className="text-sm text-muted-foreground mb-8 max-w-xs">
              Save your favourite Vassio planters and decoratives here to revisit them later.
            </p>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 bg-primary text-white px-8 py-3.5 text-xs font-bold uppercase tracking-[0.2em] rounded hover:bg-primary/90 transition-colors"
            >
              Continue Shopping
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <>
            {/* Product Grid */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:gap-x-5 md:gap-y-12 lg:grid-cols-4">
              {wishlistProducts.map((p) => {
                const off = Math.round(((p.mrp - p.price) / p.mrp) * 100);
                return (
                  <div key={p.code} className="group flex flex-col">
                    <div className="relative overflow-hidden bg-secondary aspect-[4/5] border border-border/40 rounded-2xl shadow-sm group-hover:shadow-md transition-all duration-300">
                      <Link to="/product/$productId" params={{ productId: p.code }}>
                        <img
                          src={p.img}
                          alt={p.name}
                          className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                          loading="lazy"
                        />
                      </Link>

                      {/* Off Badge */}
                      <span className="absolute left-3 top-3 bg-[#3F673F] text-white border border-[#5B8550] text-[10px] uppercase tracking-[0.2em] px-2.5 py-1 font-bold rounded shadow-sm">
                        {off}% OFF
                      </span>

                      {/* Remove from Wishlist */}
                      <button
                        onClick={() => {
                          toggleWishlist(p.code);
                          toast.success(`Removed from wishlist`);
                        }}
                        className="absolute top-3 right-3 h-8 w-8 flex items-center justify-center bg-white/90 rounded-full shadow text-primary hover:bg-white hover:scale-110 transition-all duration-200 cursor-pointer"
                        aria-label="Remove from wishlist"
                      >
                        <Heart className="h-4 w-4 fill-primary" />
                      </button>

                      {/* Quick Add to Cart */}
                      <div className="hidden lg:block absolute bottom-0 left-0 right-0 bg-primary py-3.5 text-center transition-all duration-300 ease-out translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 shadow-md cursor-pointer"
                        onClick={() => {
                          addToCart({
                            code: p.code,
                            name: p.name,
                            img: p.img,
                            price: p.price,
                            mrp: p.mrp,
                          });
                          toast.success(`${p.name} added to cart!`);
                        }}
                      >
                        <span className="text-white text-xs font-semibold tracking-[0.2em] uppercase">
                          Add to Cart
                        </span>
                      </div>

                      {/* Mobile cart button */}
                      <button
                        onClick={() => {
                          addToCart({
                            code: p.code,
                            name: p.name,
                            img: p.img,
                            price: p.price,
                            mrp: p.mrp,
                          });
                          toast.success(`${p.name} added to cart!`);
                        }}
                        className="lg:hidden absolute bottom-3 right-3 bg-primary hover:bg-primary/90 text-white w-8 h-8 flex items-center justify-center rounded-full shadow-md transition-colors z-20 cursor-pointer"
                        aria-label="Add to cart"
                      >
                        <ShoppingBag className="h-4 w-4" />
                      </button>
                    </div>

                    <Link to="/product/$productId" params={{ productId: p.code }}>
                      <p className="product-name font-sans font-bold mt-4 text-base tracking-wide text-foreground/90 leading-tight hover:text-primary transition-colors">
                        {p.name}
                      </p>
                    </Link>
                    <p className="mt-1.5 text-sm">
                      <span className="product-price font-sans font-semibold text-primary">
                        ₹{(p.price || 0).toLocaleString("en-IN")}
                      </span>
                      <span className="ml-2 text-muted-foreground line-through text-xs font-sans font-medium">
                        ₹{(p.mrp || p.price || 0).toLocaleString("en-IN")}
                      </span>
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Continue Shopping */}
            <div className="mt-16 text-center">
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 bg-primary text-white px-10 py-3.5 text-xs font-bold uppercase tracking-[0.25em] rounded hover:bg-primary/90 transition-colors"
              >
                Continue Shopping
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
