import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import Layout from "@/components/Layout";
import { products, auxiliaryProducts } from "@/data/products";
import { ShoppingBag, SlidersHorizontal } from "lucide-react";
import { useMemo } from "react";
import { useStore } from "@/context/StoreContext";
import { toast } from "sonner";

interface PlantSearch {
  height?: string;
  sort?: string;
}

export const Route = createFileRoute("/artificial-plants")({
  validateSearch: (search: Record<string, unknown>): PlantSearch => {
    return {
      height: (search.height as string) || undefined,
      sort: (search.sort as string) || undefined,
    };
  },
  head: () => ({
    meta: [
      { title: "Artificial Plants & Faux Botanicals — Vassio" },
      {
        name: "description",
        content:
          "Explore life-like artificial trees, faux palms, ficus, and hanging greenery designed to stay vibrant year-round without maintenance.",
      },
    ],
  }),
  component: ArtificialPlantsPage,
});

interface HeightOption {
  id: string;
  label: string;
}

const HEIGHT_OPTIONS: HeightOption[] = [
  { id: "all", label: "ALL" },
  { id: "1ft", label: "1 FT" },
  { id: "2ft", label: "2 FT" },
  { id: "3ft", label: "3 FT" },
  { id: "4ft", label: "4 FT" },
  { id: "5ft", label: "5 FT" },
  { id: "6ft+", label: "6 FT+" },
];

import { useProducts } from "@/hooks/useProducts";

function ArtificialPlantsPage() {
  const { products: livePlantsList } = useProducts("artificial-plants");
  const search = useSearch({ from: "/artificial-plants" });
  const navigate = useNavigate({ from: "/artificial-plants" });
  const { addToCart } = useStore();

  const selectedHeight = search.height || "all";
  const sortBy = search.sort || "featured";

  // Helper to update search params in URL
  const updateSearch = (newParams: Partial<PlantSearch>) => {
    navigate({
      search: (prev: any) => {
        const updated = { ...prev, ...newParams };
        if (updated.height === "all") delete updated.height;
        if (updated.sort === "featured") delete updated.sort;
        return updated;
      },
      replace: true,
    });
  };

  // Enriched Artificial Plant Products List with Height Metadata
  const allPlantProducts = useMemo(() => {
    const rawList = livePlantsList;
    const uniqueMap = new Map<string, any>();

    rawList.forEach((item) => {
      const lname = item.name.toLowerCase();
      const isPlant =
        lname.includes("plant") ||
        lname.includes("tree") ||
        lname.includes("faux") ||
        lname.includes("palm") ||
        lname.includes("ficus") ||
        lname.includes("bougainvillea") ||
        lname.includes("pothos") ||
        lname.includes("monstera") ||
        item.code.startsWith("FFT") ||
        item.code.startsWith("FBV") ||
        item.code.startsWith("TPT");

      if (isPlant && !uniqueMap.has(item.code)) {
        // Height classification using product height metadata or title keywords
        let heightId = "3ft";
        if (lname.includes("6 feet") || lname.includes("6 ft") || lname.includes("180 cm")) {
          heightId = "6ft+";
        } else if (lname.includes("5 feet") || lname.includes("5 ft") || lname.includes("150 cm")) {
          heightId = "5ft";
        } else if (lname.includes("4 feet") || lname.includes("4 ft") || lname.includes("120 cm")) {
          heightId = "4ft";
        } else if (lname.includes("3 feet") || lname.includes("3 ft")) {
          heightId = "3ft";
        } else if (lname.includes("2 feet") || lname.includes("2 ft")) {
          heightId = "2ft";
        } else {
          heightId = "1ft";
        }

        uniqueMap.set(item.code, {
          ...item,
          height: heightId,
        });
      }
    });

    return Array.from(uniqueMap.values());
  }, []);

  // Filtered & Sorted List
  const filteredProducts = useMemo(() => {
    let result = [...allPlantProducts];

    // Filter by Height
    if (selectedHeight !== "all") {
      result = result.filter((p) => p.height === selectedHeight);
    }

    // Sort
    if (sortBy === "price-asc") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-desc") {
      result.sort((a, b) => b.price - a.price);
    }

    return result;
  }, [allPlantProducts, selectedHeight, sortBy]);

  return (
    <Layout>
      <div className="mx-auto max-w-[1400px] px-6 py-12 md:py-16">
        {/* Breadcrumbs */}
        <nav className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground font-semibold mb-8 flex items-center gap-1.5">
          <Link to="/" className="hover:text-foreground transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-foreground">Artificial Plants</span>
          {selectedHeight !== "all" && (
            <>
              <span>/</span>
              <span className="text-foreground">
                {HEIGHT_OPTIONS.find((h) => h.id === selectedHeight)?.label}
              </span>
            </>
          )}
        </nav>

        {/* Hero Header */}
        <div className="mb-10 border-b border-border/30 pb-8">
          <p className="text-xs uppercase tracking-[0.4em] text-primary font-bold mb-2">
            Maintenance-Free Greenery
          </p>
          <h1 className="serif text-4xl md:text-6xl text-foreground">Artificial Plants Collection</h1>
          <p className="mt-4 text-sm text-muted-foreground max-w-2xl leading-relaxed">
            Ultra-realistic botanical creations with natural wood stems and silk foliage. Designed to bring lush nature into interior spaces with zero watering required.
          </p>
        </div>

        {/* ─── HORIZONTAL FILTER PILLS BAR ABOVE PRODUCT GRID ───────────────── */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-card border border-border/30 rounded-2xl p-4 md:p-5 mb-10 shadow-xs">
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 mr-2 font-sans">
              <SlidersHorizontal className="h-3.5 w-3.5" /> FILTER:
            </span>
            {HEIGHT_OPTIONS.map((ht) => {
              const isSelected = selectedHeight === ht.id;
              return (
                <button
                  key={ht.id}
                  onClick={() => updateSearch({ height: ht.id })}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? "bg-[#739D30] text-white shadow-xs font-bold scale-102"
                      : "bg-[#EEF5E3] text-[#2F4B2F] hover:bg-[#E2EDCE] hover:scale-102 font-semibold"
                  }`}
                >
                  {ht.label}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-3 shrink-0 self-end md:self-auto">
            <span className="text-xs text-muted-foreground font-medium">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => updateSearch({ sort: e.target.value })}
              className="bg-background border border-border/40 rounded-xl px-3.5 py-1.5 text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
            >
              <option value="featured">Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* ─── MAIN PRODUCT CATALOG GRID ───────────────────────────────────── */}
        <main>
          {filteredProducts.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-border/40 rounded-3xl bg-card">
              <p className="serif text-2xl text-foreground mb-2">
                No plants found for height {HEIGHT_OPTIONS.find((h) => h.id === selectedHeight)?.label}
              </p>
              <p className="text-xs text-muted-foreground mb-6">
                Try selecting a different height or resetting your filter.
              </p>
              <button
                onClick={() => updateSearch({ height: "all" })}
                className="px-6 py-2.5 bg-[#739D30] text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-[#628828] transition-colors cursor-pointer"
              >
                Show All Heights
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
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <span className="absolute top-3 left-3 bg-[#3F673F] text-white border border-[#5B8550] text-[10px] uppercase tracking-widest px-2.5 py-1 font-bold rounded">
                        {off}% OFF
                      </span>
                      <span className="absolute top-3 right-3 bg-card/90 backdrop-blur-sm text-foreground border border-border/40 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shadow-xs">
                        {HEIGHT_OPTIONS.find((h) => h.id === p.height)?.label}
                      </span>
                    </Link>
                    <div className="p-4 flex flex-col flex-1 justify-between">
                      <div>
                        <span className="text-[10px] text-muted-foreground uppercase tracking-widest block mb-1">
                          {p.color || "Botanical Green"}
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
                          <span className="text-sm font-bold text-primary">₹{(p.price || 0).toLocaleString("en-IN")}</span>
                          <span className="text-xs text-muted-foreground line-through ml-2">
                            ₹{(p.mrp || p.price || 0).toLocaleString("en-IN")}
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
        </main>
      </div>
    </Layout>
  );
}
