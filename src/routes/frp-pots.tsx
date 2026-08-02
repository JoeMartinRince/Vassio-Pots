import { createFileRoute, Link } from "@tanstack/react-router";
import Layout from "@/components/Layout";
import { products } from "@/data/products";
import { ShoppingBag, SlidersHorizontal, Check } from "lucide-react";
import { useState, useMemo } from "react";
import { useStore } from "@/context/StoreContext";
import { toast } from "sonner";

export const Route = createFileRoute("/frp-pots")({
  head: () => ({
    meta: [
      { title: "FRP Pots & Fiberglass Planters — Vassio" },
      {
        name: "description",
        content:
          "Discover premium fiberglass (FRP) planters crafted for durability, modern aesthetics, UV protection, and weather resistance.",
      },
    ],
  }),
  component: FrpPotsPage,
});

function FrpPotsPage() {
  const { addToCart } = useStore();
  const [selectedColor, setSelectedColor] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("featured");

  const frpProducts = useMemo(() => {
    let result = products.filter((p) => p.material.toLowerCase().includes("fiber") || p.code.startsWith("FLX") || p.code.startsWith("ARC"));
    if (frpProductsLength(result) === 0) result = products; // fallback

    if (selectedColor !== "all") {
      result = result.filter((p) => p.color.toLowerCase().includes(selectedColor.toLowerCase()));
    }

    if (sortBy === "price-asc") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-desc") {
      result.sort((a, b) => b.price - a.price);
    }

    return result;
  }, [selectedColor, sortBy]);

  function frpProductsLength(arr: any[]) {
    return arr.length;
  }

  return (
    <Layout>
      <div className="mx-auto max-w-[1400px] px-6 py-12 md:py-16">
        {/* Breadcrumbs */}
        <nav className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground font-semibold mb-8 flex items-center gap-1.5">
          <Link to="/" className="hover:text-foreground transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-foreground">FRP Pots</span>
        </nav>

        {/* Hero Header */}
        <div className="mb-12 border-b border-border/30 pb-8">
          <p className="text-xs uppercase tracking-[0.4em] text-primary font-bold mb-2">
            Fiberglass Excellence
          </p>
          <h1 className="serif text-4xl md:text-6xl text-foreground">FRP Pots Collection</h1>
          <p className="mt-4 text-sm text-muted-foreground max-w-2xl leading-relaxed">
            Lightweight, frost-resistant, and UV-protected fiberglass planters designed for indoor and outdoor environments. Engineered for lasting architectural beauty.
          </p>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-card border border-border/30 rounded-2xl p-4 mb-10 shadow-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 mr-2">
              <SlidersHorizontal className="h-3.5 w-3.5" /> Filter:
            </span>
            {["all", "sea green", "grey", "black", "sage"].map((c) => (
              <button
                key={c}
                onClick={() => setSelectedColor(c)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
                  selectedColor === c
                    ? "bg-primary text-white shadow-xs"
                    : "bg-secondary/40 text-muted-foreground hover:bg-secondary"
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <span className="text-xs text-muted-foreground font-medium">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-background border border-border/40 rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
            >
              <option value="featured">Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {frpProducts.map((p) => {
            const off = Math.round(((p.mrp - p.price) / p.mrp) * 100);
            return (
              <div
                key={p.code}
                className="group flex flex-col bg-background border border-border/40 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-300"
              >
                <Link to="/product/$productId" params={{ productId: p.code }} className="block overflow-hidden relative aspect-[4/5] bg-secondary">
                  <img
                    src={p.img}
                    alt={p.name}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <span className="absolute top-3 left-3 bg-[#3F673F] text-white border border-[#5B8550] text-[10px] uppercase tracking-widest px-2.5 py-1 font-bold rounded">
                    {off}% OFF
                  </span>
                </Link>
                <div className="p-4 flex flex-col flex-1 justify-between">
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-widest block mb-1">
                      {p.color}
                    </span>
                    <Link
                      to="/product/$productId"
                      params={{ productId: p.code }}
                      className="font-bold text-sm text-foreground hover:text-primary transition-colors line-clamp-1"
                    >
                      {p.name}
                    </Link>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div>
                      <span className="text-sm font-bold text-primary">₹{p.price.toLocaleString("en-IN")}</span>
                      <span className="text-xs text-muted-foreground line-through ml-2">₹{p.mrp.toLocaleString("en-IN")}</span>
                    </div>
                    <button
                      onClick={() => {
                        addToCart({
                          code: p.code,
                          name: p.name,
                          img: p.img,
                          price: p.price,
                          mrp: p.mrp,
                          quantity: 1,
                        });
                        toast.success(`${p.name} added to cart!`);
                      }}
                      className="p-2 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors cursor-pointer"
                      title="Add to Cart"
                    >
                      <ShoppingBag className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}
