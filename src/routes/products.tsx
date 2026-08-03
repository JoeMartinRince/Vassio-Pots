import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import Layout from "@/components/Layout";
import { products, vases, auxiliaryProducts } from "@/data/products";
import { ShoppingBag, Search, SlidersHorizontal, ArrowUpDown, X, Check, Sparkles } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { useStore } from "@/context/StoreContext";
import { toast } from "sonner";

interface ProductsSearch {
  type?: "pots" | "plants";
  category?: "all" | "frp" | "terracotta" | "pebbles";
  height?: "all" | "1ft" | "2ft" | "3ft" | "4ft" | "5ft" | "6ft+";
  sort?: "featured" | "newest" | "price-asc" | "price-desc" | "alphabetical";
  q?: string;
}

export const Route = createFileRoute("/products")({
  validateSearch: (search: Record<string, unknown>): ProductsSearch => {
    return {
      type: (search.type as "pots" | "plants") || undefined,
      category: (search.category as any) || undefined,
      height: (search.height as any) || undefined,
      sort: (search.sort as any) || undefined,
      q: (search.q as string) || undefined,
    };
  },
  head: () => ({
    meta: [
      { title: "Products — Vassio Planters, Pots & Faux Botanicals" },
      {
        name: "description",
        content:
          "Browse the complete collection of Vassio fiberglass planters, terracotta pots, pebbles, and artificial plants.",
      },
    ],
  }),
  component: ProductsPage,
});

// Comprehensive Unified Catalog Items
interface CatalogItem {
  code: string;
  name: string;
  price: number;
  mrp: number;
  img: string;
  color: string;
  material: string;
  dimensions: string;
  productType: "pots" | "plants";
  potCategory?: "frp" | "terracotta" | "pebbles";
  plantHeight?: "1ft" | "2ft" | "3ft" | "4ft" | "5ft" | "6ft+";
  isNewArrival?: boolean;
}

function ProductsPage() {
  const search = useSearch({ from: "/products" });
  const navigate = useNavigate({ from: "/products" });
  const { addToCart } = useStore();

  // Active state initialized from search params or defaults
  const activeType: "pots" | "plants" = search.type === "plants" ? "plants" : "pots";
  const activeCategory: "all" | "frp" | "terracotta" | "pebbles" = search.category || "all";
  const activeHeight: "all" | "1ft" | "2ft" | "3ft" | "4ft" | "5ft" | "6ft+" = search.height || "all";
  const activeSort: "featured" | "newest" | "price-asc" | "price-desc" | "alphabetical" =
    search.sort || "featured";
  const [searchQuery, setSearchQuery] = useState(search.q || "");

  // Sync internal search input with URL search query
  useEffect(() => {
    setSearchQuery(search.q || "");
  }, [search.q]);

  // Master product catalog list with smart categorization
  const masterCatalog: CatalogItem[] = useMemo(() => {
    const rawList = [...products, ...vases, ...auxiliaryProducts];
    const uniqueMap = new Map<string, CatalogItem>();

    rawList.forEach((item) => {
      if (uniqueMap.has(item.code)) return;

      const lname = item.name.toLowerCase();
      const lmat = item.material.toLowerCase();
      const lcode = item.code.toLowerCase();

      // Determine product type (plants vs pots)
      const isPlant =
        lname.includes("plant") ||
        lname.includes("tree") ||
        lname.includes("faux") ||
        lname.includes("palm") ||
        lname.includes("ficus") ||
        lname.includes("bougainvillea") ||
        lname.includes("pothos") ||
        lname.includes("monstera") ||
        lcode.startsWith("fft") ||
        lcode.startsWith("fbv") ||
        lcode.startsWith("tpt");

      const productType: "pots" | "plants" = isPlant ? "plants" : "pots";

      // Categorize pots
      let potCategory: "frp" | "terracotta" | "pebbles" = "frp";
      if (!isPlant) {
        if (lmat.includes("marble") || lname.includes("pebble") || lname.includes("stone bowl") || lcode.startsWith("hmb")) {
          potCategory = "pebbles";
        } else if (lmat.includes("ceramic") || lmat.includes("stone") || lcode.startsWith("lfs") || lcode.startsWith("vnl") || lcode.startsWith("abv") || lcode.startsWith("dsv")) {
          potCategory = "terracotta";
        } else {
          potCategory = "frp"; // Fiber glass / default
        }
      }

      // Categorize plant height
      let plantHeight: "1ft" | "2ft" | "3ft" | "4ft" | "5ft" | "6ft+" = "3ft";
      if (isPlant) {
        if (lname.includes("6 feet") || lname.includes("6 ft") || lname.includes("180 cm")) {
          plantHeight = "6ft+";
        } else if (lname.includes("5 feet") || lname.includes("5 ft") || lname.includes("150 cm")) {
          plantHeight = "5ft";
        } else if (lname.includes("4 feet") || lname.includes("4 ft") || lname.includes("120 cm")) {
          plantHeight = "4ft";
        } else if (lname.includes("3 feet") || lname.includes("3 ft")) {
          plantHeight = "3ft";
        } else if (lname.includes("2 feet") || lname.includes("2 ft")) {
          plantHeight = "2ft";
        } else {
          plantHeight = "1ft";
        }
      }

      uniqueMap.set(item.code, {
        code: item.code,
        name: item.name,
        price: item.price,
        mrp: item.mrp,
        img: item.img,
        color: item.color,
        material: item.material,
        dimensions: item.dimensions,
        productType,
        potCategory,
        plantHeight,
        isNewArrival: (item as any).new_arrival || item.code.startsWith("FLX") || item.code.startsWith("FFT"),
      });
    });

    return Array.from(uniqueMap.values());
  }, []);

  // Update URL helper
  const updateFilters = (newParams: Partial<ProductsSearch>) => {
    navigate({
      search: (prev: any) => {
        const updated = { ...prev, ...newParams };
        // Clean undefined or 'all' defaults for clean URL parameters
        if (updated.category === "all") delete updated.category;
        if (updated.height === "all") delete updated.height;
        if (updated.sort === "featured") delete updated.sort;
        if (!updated.q) delete updated.q;
        return updated;
      },
      replace: true,
    });
  };

  // Switch primary product type tab
  const handleTypeChange = (type: "pots" | "plants") => {
    updateFilters({
      type,
      category: "all",
      height: "all",
    });
  };

  // Filter & Sort logic
  const filteredProducts = useMemo(() => {
    let result = masterCatalog.filter((item) => item.productType === activeType);

    // Sub-category filter for Pots
    if (activeType === "pots" && activeCategory !== "all") {
      result = result.filter((item) => item.potCategory === activeCategory);
    }

    // Height filter for Artificial Plants
    if (activeType === "plants" && activeHeight !== "all") {
      result = result.filter((item) => item.plantHeight === activeHeight);
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.code.toLowerCase().includes(q) ||
          item.material.toLowerCase().includes(q) ||
          item.color.toLowerCase().includes(q)
      );
    }

    // Sorting
    if (activeSort === "price-asc") {
      result.sort((a, b) => a.price - b.price);
    } else if (activeSort === "price-desc") {
      result.sort((a, b) => b.price - a.price);
    } else if (activeSort === "alphabetical") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (activeSort === "newest") {
      result.sort((a, b) => (b.isNewArrival ? 1 : 0) - (a.isNewArrival ? 1 : 0));
    }

    return result;
  }, [masterCatalog, activeType, activeCategory, activeHeight, searchQuery, activeSort]);

  // Breadcrumb dynamic text
  const breadcrumbCategoryName = useMemo(() => {
    if (activeType === "pots") {
      if (activeCategory === "frp") return "FRP Pots";
      if (activeCategory === "terracotta") return "Terracotta Pots";
      if (activeCategory === "pebbles") return "Pebbles";
      return "All Pots";
    } else {
      if (activeHeight !== "all") return `Artificial Plants (${activeHeight})`;
      return "Artificial Plants";
    }
  }, [activeType, activeCategory, activeHeight]);

  return (
    <Layout>
      <div className="mx-auto max-w-[1400px] px-6 py-10 md:py-16">
        {/* Breadcrumbs */}
        <nav className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground font-semibold mb-8 flex items-center gap-1.5">
          <Link to="/" className="hover:text-foreground transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link to="/products" className="hover:text-foreground transition-colors">
            Products
          </Link>
          {(activeCategory !== "all" || activeHeight !== "all") && (
            <>
              <span>/</span>
              <span className="text-foreground">{breadcrumbCategoryName}</span>
            </>
          )}
        </nav>

        {/* Header */}
        <div className="mb-10 text-center max-w-3xl mx-auto">
          <p className="text-xs uppercase tracking-[0.4em] text-primary font-bold mb-2">
            Complete Vassio Collection
          </p>
          <h1 className="serif text-4xl md:text-6xl text-foreground">Explore Our Products</h1>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
            Discover premium fiberglass planters, natural terracotta vessels, decorative stones, and lifelike artificial plants designed for modern architectural spaces.
          </p>
        </div>

        {/* ─── PRIMARY TYPE SELECTION TABS (Pots vs Artificial Plants) ────────── */}
        <div className="flex justify-center mb-8">
          <div className="bg-secondary/60 p-1.5 rounded-full border border-border/40 inline-flex items-center gap-2 shadow-xs">
            <button
              onClick={() => handleTypeChange("pots")}
              className={`px-8 py-3 rounded-full text-xs font-bold uppercase tracking-[0.2em] transition-all duration-300 cursor-pointer select-none ${
                activeType === "pots"
                  ? "bg-primary text-white shadow-md scale-102"
                  : "text-foreground/80 hover:text-foreground hover:bg-background/60"
              }`}
            >
              Pots
            </button>
            <button
              onClick={() => handleTypeChange("plants")}
              className={`px-8 py-3 rounded-full text-xs font-bold uppercase tracking-[0.2em] transition-all duration-300 cursor-pointer select-none ${
                activeType === "plants"
                  ? "bg-primary text-white shadow-md scale-102"
                  : "text-foreground/80 hover:text-foreground hover:bg-background/60"
              }`}
            >
              Artificial Plants
            </button>
          </div>
        </div>

        {/* ─── SECONDARY SUB-FILTERS (Category vs Height) ──────────────────────── */}
        <div className="bg-card border border-border/40 rounded-3xl p-5 md:p-6 mb-10 shadow-xs space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Sub Filter Pills */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 mr-2 shrink-0">
                <SlidersHorizontal className="h-3.5 w-3.5" />
                {activeType === "pots" ? "Category:" : "Height:"}
              </span>

              {activeType === "pots" ? (
                // Pots Sub-categories: All, FRP Pots, Terracotta Pots, Pebbles
                [
                  { id: "all", label: "All" },
                  { id: "frp", label: "FRP Pots" },
                  { id: "terracotta", label: "Terracotta Pots" },
                  { id: "pebbles", label: "Pebbles" },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => updateFilters({ category: cat.id as any })}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                      activeCategory === cat.id
                        ? "bg-primary text-white shadow-xs"
                        : "bg-background border border-border/40 text-muted-foreground hover:border-primary/40 hover:text-foreground"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))
              ) : (
                // Artificial Plants Sub-categories: All, 1 ft, 2 ft, 3 ft, 4 ft, 5 ft, 6 ft+
                [
                  { id: "all", label: "All" },
                  { id: "1ft", label: "1 ft" },
                  { id: "2ft", label: "2 ft" },
                  { id: "3ft", label: "3 ft" },
                  { id: "4ft", label: "4 ft" },
                  { id: "5ft", label: "5 ft" },
                  { id: "6ft+", label: "6 ft+" },
                ].map((ht) => (
                  <button
                    key={ht.id}
                    onClick={() => updateFilters({ height: ht.id as any })}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                      activeHeight === ht.id
                        ? "bg-primary text-white shadow-xs"
                        : "bg-background border border-border/40 text-muted-foreground hover:border-primary/40 hover:text-foreground"
                    }`}
                  >
                    {ht.label}
                  </button>
                ))
              )}
            </div>

            {/* Search Input & Sort Dropdown */}
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
              {/* Search Bar */}
              <div className="relative w-full sm:w-64">
                <Search className="h-3.5 w-3.5 absolute left-3 top.1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    updateFilters({ q: e.target.value || undefined });
                  }}
                  className="w-full pl-9 pr-8 py-2 bg-background border border-border/40 rounded-xl text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary"
                />
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      updateFilters({ q: undefined });
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Sort Dropdown */}
              <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end">
                <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground hidden sm:block" />
                <select
                  value={activeSort}
                  onChange={(e) => updateFilters({ sort: e.target.value as any })}
                  className="w-full sm:w-auto bg-background border border-border/40 rounded-xl px-3.5 py-2 text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                >
                  <option value="featured">Sort by: Featured</option>
                  <option value="newest">Sort by: New Arrivals</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="alphabetical">Alphabetical: A–Z</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Results Counter */}
        <div className="mb-6 flex items-center justify-between text-xs text-muted-foreground">
          <p className="font-medium">
            Showing <span className="font-bold text-foreground">{filteredProducts.length}</span>{" "}
            {filteredProducts.length === 1 ? "product" : "products"}
          </p>
          {(activeCategory !== "all" || activeHeight !== "all" || searchQuery) && (
            <button
              onClick={() => updateFilters({ category: "all", height: "all", q: undefined })}
              className="text-primary font-bold hover:underline cursor-pointer flex items-center gap-1"
            >
              <X className="h-3 w-3" /> Clear Filters
            </button>
          )}
        </div>

        {/* ─── PRODUCT GRID (Desktop: 4 cols, Tablet: 2-3 cols, Mobile: 2 cols) ─── */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-border/40 rounded-3xl bg-card">
            <p className="serif text-2xl text-foreground mb-2">No matching products found</p>
            <p className="text-xs text-muted-foreground mb-6">
              Try resetting your filters or search keywords.
            </p>
            <button
              onClick={() => updateFilters({ category: "all", height: "all", q: undefined })}
              className="px-6 py-2.5 bg-primary text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-primary/90 transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {filteredProducts.map((p) => {
              const off = Math.round(((p.mrp - p.price) / p.mrp) * 100);
              return (
                <div
                  key={p.code}
                  className="group flex flex-col bg-background border border-border/40 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-300"
                >
                  <Link
                    to="/product/$productId"
                    params={{ productId: p.code }}
                    className="block overflow-hidden relative aspect-[4/5] bg-secondary"
                  >
                    <img
                      src={p.img}
                      alt={p.name}
                      loading="lazy"
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <span className="absolute top-3 left-3 bg-[#3F673F] text-white border border-[#5B8550] text-[10px] uppercase tracking-widest px-2.5 py-1 font-bold rounded shadow-xs">
                      {off}% OFF
                    </span>
                    {p.isNewArrival && (
                      <span className="absolute top-3 right-3 bg-primary text-white text-[9px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full shadow-xs">
                        NEW
                      </span>
                    )}
                  </Link>

                  <div className="p-4 flex flex-col flex-1 justify-between">
                    <div>
                      <span className="text-[10px] text-muted-foreground uppercase tracking-widest block mb-1">
                        {p.color || p.material}
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
                        <span className="text-xs text-muted-foreground line-through ml-2">
                          ₹{p.mrp.toLocaleString("en-IN")}
                        </span>
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
        )}
      </div>
    </Layout>
  );
}
