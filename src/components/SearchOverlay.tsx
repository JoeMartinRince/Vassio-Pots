import { useEffect, useRef } from "react";
import { Link } from "@tanstack/react-router";
import { Search, X, ArrowRight } from "lucide-react";
import { useStore, useSearchResults } from "@/context/StoreContext";

export default function SearchOverlay() {
  const { isSearchOpen, closeSearch, searchQuery, setSearchQuery } = useStore();
  const inputRef = useRef<HTMLInputElement>(null);
  const results = useSearchResults(searchQuery);

  // Focus input on open
  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isSearchOpen]);

  // Escape key to close
  useEffect(() => {
    if (!isSearchOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeSearch();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isSearchOpen, closeSearch]);

  // Lock body scroll
  useEffect(() => {
    if (isSearchOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isSearchOpen]);

  if (!isSearchOpen) return null;

  const hasQuery = searchQuery.trim().length > 0;

  return (
    <div className="fixed inset-0 z-[60] flex flex-col">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-md animate-in fade-in duration-200"
        onClick={closeSearch}
      />

      {/* Search Panel — top-anchored */}
      <div className="relative z-10 bg-[#FCFCF8] border-b border-border/20 shadow-2xl animate-in slide-in-from-top duration-300">
        {/* Search Input Row */}
        <div className="mx-auto max-w-[860px] px-6 py-5 flex items-center gap-4">
          <Search className="h-5 w-5 text-primary shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for planters, vases, decoratives…"
            className="flex-1 bg-transparent text-lg font-sans text-foreground placeholder-muted-foreground/50 outline-none font-medium"
            aria-label="Search products"
          />
          {hasQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer p-1 shrink-0"
              aria-label="Clear search"
            >
              <X className="h-5 w-5" />
            </button>
          )}
          <button
            onClick={closeSearch}
            className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer ml-2 text-xs font-semibold uppercase tracking-widest hidden sm:block shrink-0"
            aria-label="Close search"
          >
            Esc
          </button>
          <button
            onClick={closeSearch}
            className="sm:hidden text-muted-foreground hover:text-foreground transition-colors cursor-pointer p-1 shrink-0"
            aria-label="Close search"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Results */}
        {hasQuery && (
          <div className="mx-auto max-w-[860px] px-6 pb-6">
            {results.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-muted-foreground text-sm">
                  No matching products found for &ldquo;
                  <span className="font-semibold text-foreground">{searchQuery}</span>&rdquo;.
                </p>
              </div>
            ) : (
              <>
                <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground font-semibold mb-4">
                  {results.length} result{results.length !== 1 ? "s" : ""} found
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[55vh] overflow-y-auto pr-1">
                  {results.map((p) => {
                    const off = Math.round(((p.mrp - p.price) / p.mrp) * 100);
                    return (
                      <Link
                        key={p.code}
                        to="/product/$productId"
                        params={{ productId: p.code }}
                        onClick={closeSearch}
                        className="group flex items-center gap-4 bg-white rounded-xl border border-border/20 p-3 shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-200"
                      >
                        <div className="h-16 w-14 shrink-0 overflow-hidden rounded-lg bg-secondary border border-border/20">
                          <img
                            src={p.img}
                            alt={p.name}
                            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-sans font-bold text-sm text-foreground/90 leading-snug group-hover:text-primary transition-colors line-clamp-2">
                            {p.name}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm font-semibold text-primary">
                              ₹{p.price.toLocaleString("en-IN")}
                            </span>
                            <span className="text-xs text-muted-foreground line-through">
                              ₹{p.mrp.toLocaleString("en-IN")}
                            </span>
                            <span className="text-[10px] bg-[#3F673F] text-white px-1.5 py-0.5 rounded font-bold">
                              {off}% OFF
                            </span>
                          </div>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-primary transition-colors shrink-0" />
                      </Link>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}

        {!hasQuery && (
          <div className="mx-auto max-w-[860px] px-6 pb-6">
            <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground font-semibold mb-3">
              Popular Searches
            </p>
            <div className="flex flex-wrap gap-2">
              {["Flax Vase", "Planter Set", "Bougainvillea", "Leaf Planter", "Dune Vase"].map(
                (term) => (
                  <button
                    key={term}
                    onClick={() => setSearchQuery(term)}
                    className="px-3 py-1.5 bg-secondary border border-border/30 rounded-full text-xs font-semibold text-foreground/80 hover:text-primary hover:border-primary/40 transition-colors cursor-pointer"
                  >
                    {term}
                  </button>
                )
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
