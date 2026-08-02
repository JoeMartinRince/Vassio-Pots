import React, { useEffect, useRef } from "react";
import { useStore } from "@/context/StoreContext";
import { products } from "@/data/products";
import { Link } from "@tanstack/react-router";
import { Search, X, ShoppingBag, ArrowRight } from "lucide-react";

export function SearchOverlay() {
  const { isSearchOpen, setIsSearchOpen, searchQuery, setSearchQuery } = useStore();
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when opened
  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isSearchOpen]);

  // Handle Escape Key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isSearchOpen) {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSearchOpen, setIsSearchOpen]);

  if (!isSearchOpen) return null;

  // Real-time filtering matching name, code, category, material, or description
  const filtered = searchQuery.trim()
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.material?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.color?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background/95 backdrop-blur-md animate-in fade-in duration-200">
      {/* Search Header */}
      <div className="border-b border-border/40 bg-white py-6 px-6">
        <div className="mx-auto max-w-4xl flex items-center justify-between gap-4">
          <div className="relative flex-1 flex items-center">
            <Search className="w-5 h-5 text-primary absolute left-4 pointer-events-none" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search products by name, code, material (e.g. Flax, Vanilla, Areca, LFS)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-10 py-3.5 text-sm sm:text-base font-sans font-medium text-foreground bg-secondary/30 rounded-full border border-border/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-4 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <button
            onClick={() => setIsSearchOpen(false)}
            className="p-2.5 rounded-full border border-border/50 hover:bg-secondary text-muted-foreground hover:text-foreground transition cursor-pointer shrink-0"
            aria-label="Close Search"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Results Container */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-4xl">
          {searchQuery.trim() === "" ? (
            <div className="py-16 text-center">
              <p className="text-xs uppercase tracking-[0.3em] font-bold text-muted-foreground mb-3">
                Suggested Searches
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {["Flax", "Vanilla", "Areca", "Leaf", "Fiberglass", "Terracotta"].map((term) => (
                  <button
                    key={term}
                    onClick={() => setSearchQuery(term)}
                    className="px-4 py-2 rounded-full border border-border/60 text-xs font-semibold text-foreground/80 hover:bg-primary hover:text-white transition cursor-pointer"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-muted/60 text-muted-foreground flex items-center justify-center mx-auto">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="serif text-xl font-bold text-foreground">No matching products found.</h3>
              <p className="text-xs text-muted-foreground max-w-md mx-auto">
                We couldn't find any products matching "{searchQuery}". Try checking for spelling errors or searching for broader terms.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                Found {filtered.length} matching {filtered.length === 1 ? "product" : "products"}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map((p) => {
                  const off = Math.round(((p.mrp - p.price) / p.mrp) * 100);
                  return (
                    <Link
                      key={p.code}
                      to="/product/$productId"
                      params={{ productId: p.code }}
                      onClick={() => setIsSearchOpen(false)}
                      className="flex items-center gap-3.5 p-3 rounded-2xl border border-border/40 bg-white hover:border-primary/50 hover:shadow-md transition-all duration-300 group cursor-pointer"
                    >
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-secondary border border-border/30 shrink-0">
                        <img src={p.img} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <h4 className="font-sans font-bold text-xs text-foreground group-hover:text-primary transition-colors truncate">
                          {p.name}
                        </h4>
                        <div className="text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">
                          {p.code}
                        </div>
                        <div className="mt-1 flex items-center gap-2">
                          <span className="font-semibold text-xs text-primary">₹{p.price.toLocaleString("en-IN")}</span>
                          <span className="text-[10px] text-muted-foreground line-through">₹{p.mrp.toLocaleString("en-IN")}</span>
                          <span className="text-[9px] bg-[#3F673F] text-white px-1.5 py-0.5 rounded font-bold">{off}% OFF</span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
