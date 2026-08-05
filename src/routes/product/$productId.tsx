import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import productService from "@/services/product.service";
import { useProduct } from "@/hooks/useProducts";
import Layout from "@/components/Layout";
import { useState, useEffect } from "react";
import { Truck, RotateCcw, Phone, ShieldCheck, Heart, Check, Star, ArrowLeft, ShoppingBag } from "lucide-react";
import { useStore } from "@/context/StoreContext";
import { toast } from "sonner";
import { getVariants } from "@/services/variantStore";
import type { ProductSizeVariant, ProductColorVariant } from "@/types/variants";
import ProductReviews from "@/components/ProductReviews";
import { reviewStore } from "@/services/reviewStore";
import type { Product, ProductVariant } from "@/types/product";

export const Route = createFileRoute("/product/$productId")({
  head: ({ params }) => {
    try {
      const meta = productService.getStaticProductMetadata(params?.productId);
      const title = meta ? `${meta.name} — Vassio` : "Product Details — Vassio";
      return {
        meta: [
          { title },
          { name: "description", content: meta?.description || "Product Details" },
        ],
      };
    } catch {
      return { meta: [{ title: "Vassio Pots" }] };
    }
  },
  component: ProductPage,
});

function ProductPage() {
  const { productId } = useParams({ from: "/product/$productId" });
  const { product, loading } = useProduct(productId);

  if (loading) {
    return (
      <Layout>
        <div className="mx-auto max-w-[1400px] px-6 py-28 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4 text-muted-foreground">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="text-sm">Loading product…</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="mx-auto max-w-xl px-6 py-28 md:py-36 text-center">
          <div className="w-16 h-16 rounded-full bg-[#739D30]/10 border border-[#739D30]/20 flex items-center justify-center mx-auto mb-6 text-[#739D30]">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h1 className="serif text-3xl md:text-5xl text-foreground font-bold">Product Not Found</h1>
          <p className="mt-4 text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
            This product may have been removed or is no longer available in our active catalog.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/products"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#739D30] hover:bg-[#628828] text-white px-8 py-3.5 text-xs uppercase tracking-[0.2em] font-semibold transition duration-300 rounded-xl shadow-xs"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Products
            </Link>
            <Link
              to="/"
              className="w-full sm:w-auto inline-flex items-center justify-center bg-card hover:bg-secondary text-foreground border border-border/50 px-8 py-3.5 text-xs uppercase tracking-[0.2em] font-semibold transition duration-300 rounded-xl"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div key={product.code} className="mx-auto max-w-[1400px] px-6 py-12 md:py-16">
        {/* Breadcrumb */}
        <nav className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground font-semibold mb-8 flex flex-wrap items-center gap-1.5">
          <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
          <span>/</span>
          <Link to="/products" className="hover:text-foreground transition-colors">Shop</Link>
          <span>/</span>
          <span className="text-foreground/90 truncate max-w-xs">{product.name}</span>
        </nav>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-14 bg-background">
          <ProductImages product={product} />
          <ProductDetails product={product} />
        </div>

        <ProductReviews productId={product.code} productName={product.name} />
      </div>
    </Layout>
  );
}

// ─── Product Images Panel ──────────────────────────────────────────────────────

function ProductImages({ product }: { product: Product }) {
  const { toggleWishlist, isInWishlist } = useStore();
  const wishlisted = isInWishlist(product.code);

  const thumbnails = (product.thumbnails && product.thumbnails.length > 0)
    ? product.thumbnails
    : [product.img];

  const [activeImage, setActiveImage] = useState<string>(product.img);

  useEffect(() => {
    setActiveImage(product.img);
  }, [product.code, product.img]);

  return (
    <div className="w-full lg:w-1/2 flex flex-col-reverse md:flex-row gap-4 bg-white/40 p-4 md:p-6 border border-border/30 rounded-[24px]">
      {/* Thumbnail strip */}
      <div className="flex md:flex-col gap-2.5 overflow-x-auto md:overflow-x-visible shrink-0 md:w-20 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {thumbnails.map((t, idx) => (
          <button
            key={idx}
            onClick={() => setActiveImage(t)}
            className={`h-16 w-14 border shrink-0 overflow-hidden rounded-md transition-all duration-200 ${
              activeImage === t
                ? "border-primary scale-95 shadow-sm"
                : "border-border/30 hover:border-muted-foreground"
            }`}
          >
            <img src={t} alt={`thumbnail ${idx}`} className="h-full w-full object-cover" />
          </button>
        ))}
      </div>

      {/* Main Image */}
      <div className="flex-1 aspect-square bg-secondary border border-border/20 overflow-hidden relative rounded-xl">
        <img src={activeImage} alt={product.name} className="h-full w-full object-cover" />
        {product.isSoldOut && (
          <span className="absolute top-4 left-4 bg-[#3F673F] text-white border border-[#5B8550] text-[10px] uppercase tracking-widest px-3 py-1.5 font-semibold shadow-sm rounded">
            Sold Out
          </span>
        )}
        <button
          onClick={() => {
            toggleWishlist(product.code);
            toast.success(wishlisted ? "Removed from wishlist" : "Saved to wishlist!");
          }}
          className={`absolute top-4 right-4 h-9 w-9 flex items-center justify-center rounded-full shadow-md transition-all duration-200 cursor-pointer ${
            wishlisted ? "bg-white text-primary scale-110" : "bg-white/80 text-muted-foreground hover:text-primary hover:scale-110"
          }`}
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart className={`h-[18px] w-[18px] ${wishlisted ? "fill-primary" : ""}`} />
        </button>
      </div>
    </div>
  );
}

// ─── Product Details Panel ─────────────────────────────────────────────────────

function ProductDetails({ product }: { product: Product }) {
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useStore();

  // ── Variant State (color / size UI from variantStore — not prices) ──────────
  const uiVariants = getVariants(product.code);
  const sortedSizes = [...(uiVariants?.sizes || [])].sort((a, b) => a.displayOrder - b.displayOrder);
  const sortedColors = [...(uiVariants?.colors || [])].sort((a, b) => a.displayOrder - b.displayOrder);

  const [selectedVariantSize, setSelectedVariantSize] = useState<ProductSizeVariant | null>(
    sortedSizes.find((s) => s.available) ?? null
  );
  const [selectedVariantColor, setSelectedVariantColor] = useState<ProductColorVariant | null>(
    sortedColors.find((c) => c.available) ?? null
  );

  // Reset selections when product changes
  useEffect(() => {
    const fresh = getVariants(product.code);
    const freshSizes = [...(fresh?.sizes || [])].sort((a, b) => a.displayOrder - b.displayOrder);
    const freshColors = [...(fresh?.colors || [])].sort((a, b) => a.displayOrder - b.displayOrder);
    setSelectedVariantSize(freshSizes.find((s) => s.available) ?? null);
    setSelectedVariantColor(freshColors.find((c) => c.available) ?? null);
  }, [product.code]);

  // ── Supabase / Fallback Variant Pricing ─────────────────────────────────────
  // Safe matching against product.variants
  const matchedDbVariant: ProductVariant | undefined = (selectedVariantSize && product.variants)
    ? product.variants.find((v) => {
        if (!v || !v.variant_name) return false;
        const vName = v.variant_name.toUpperCase();
        const sLabel = selectedVariantSize.label.toUpperCase();
        return (
          vName === sLabel ||
          vName.startsWith(`${sLabel} `) ||
          vName.startsWith(`${sLabel}(`) ||
          vName.includes(`(${sLabel})`) ||
          vName.includes(`-${sLabel}`) ||
          vName.startsWith(`SIZE ${sLabel}`) ||
          vName.startsWith(`FLAX-${sLabel}`) ||
          vName.startsWith(`${sLabel} (`)
        );
      })
    : undefined;

  // Fall back to first available variant, else first variant in array
  const activeDbVariant = matchedDbVariant
    ?? product.variants?.find((v) => v && v.available)
    ?? product.variants?.[0];

  // Prices: active variant -> product root -> 0 fallback
  const displayPrice = activeDbVariant ? Number(activeDbVariant.selling_price || 0) : Number(product.price || 0);
  const displayMrp = activeDbVariant ? Number(activeDbVariant.original_price || 0) : Number(product.mrp || 0);
  const off = displayMrp > displayPrice
    ? Math.round(((displayMrp - displayPrice) / displayMrp) * 100)
    : 0;
  const displayStock = activeDbVariant ? Number(activeDbVariant.stock_quantity || 0) : Number(product.stockQuantity || 0);
  const isAvailable = activeDbVariant
    ? Boolean(activeDbVariant.available && (activeDbVariant.stock_quantity ?? 0) > 0)
    : !product.isSoldOut;

  const displayDimensions = activeDbVariant?.dimensions
    || selectedVariantSize?.dimensions
    || product.dimensions
    || "Dimensions available on request";

  const handleAddToCart = () => {
    addToCart({
      code: product.code,
      name: product.name,
      img: product.img,
      price: displayPrice,
      mrp: displayMrp,
      quantity,
      sizeName: [
        selectedVariantSize ? `Size ${selectedVariantSize.label}` : null,
        selectedVariantColor ? selectedVariantColor.name : null,
      ].filter(Boolean).join(" · ") || undefined,
    });
    toast.success(`${product.name} added to cart!`);
  };

  const stats = reviewStore.getProductStats(product.code);

  return (
    <div className="w-full lg:w-1/2 flex flex-col justify-between">
      <div>
        {/* Title */}
        <h1 className="product-name font-sans font-extrabold text-3xl md:text-5xl text-foreground leading-tight">
          {product.name}
        </h1>

        {/* Product Code & Rating */}
        <div className="flex items-center gap-4 mt-2 flex-wrap">
          <p className="text-[11px] text-muted-foreground uppercase tracking-widest">
            SKU: {product.code}
          </p>
          <span className="text-muted-foreground/40">|</span>
          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`h-3.5 w-3.5 ${
                    s <= Math.round(stats.averageRating)
                      ? "fill-[#739D30] text-[#739D30]"
                      : "text-muted-foreground/30"
                  }`}
                />
              ))}
            </div>
            <span className="text-xs font-bold text-foreground">{stats.averageRating.toFixed(1)}</span>
            <span className="text-xs text-muted-foreground font-medium">({stats.totalReviews} Reviews)</span>
          </div>
        </div>

        {/* Price Tag */}
        <div className="mt-5 flex items-center gap-3.5">
          {displayPrice > 0 ? (
            <>
              <span className="product-price font-sans font-bold text-2xl md:text-3xl text-primary">
                ₹{displayPrice.toLocaleString("en-IN")}
              </span>
              {displayMrp > displayPrice && (
                <>
                  <span className="text-base text-muted-foreground line-through font-sans">
                    ₹{displayMrp.toLocaleString("en-IN")}
                  </span>
                  <span className="text-[10px] bg-[#3F673F] text-white border border-[#5B8550]/60 px-2 py-0.5 font-bold uppercase tracking-wider rounded">
                    {off}% OFF
                  </span>
                </>
              )}
            </>
          ) : (
            <span className="text-sm text-muted-foreground italic">Price on request</span>
          )}
        </div>
        <p className="text-[10px] text-muted-foreground/80 mt-1.5 italic">(Inclusive of all Taxes)</p>

        {/* ─── Size Variant Selector (A / B / C) ───────────────────────────── */}
        {sortedSizes.length > 0 && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold">Size</p>
              {selectedVariantSize && (
                <p className="text-xs text-primary font-semibold">
                  Selected Size: <span className="font-bold">{selectedVariantSize.label}</span>
                  {selectedVariantSize.dimensions && (
                    <span className="text-muted-foreground font-normal ml-1">
                      ({selectedVariantSize.dimensions})
                    </span>
                  )}
                </p>
              )}
            </div>
            <div className="flex flex-wrap gap-2.5">
              {sortedSizes.map((sz) => {
                const isSelected = selectedVariantSize?.id === sz.id;
                return (
                  <button
                    key={sz.id}
                    type="button"
                    onClick={() => sz.available && setSelectedVariantSize(sz)}
                    disabled={!sz.available}
                    title={!sz.available ? "Unavailable" : `Size ${sz.label}`}
                    className={`
                      relative h-11 min-w-[44px] px-4 text-sm font-bold tracking-wide border-2
                      rounded-xl transition-all duration-200 select-none shadow-sm
                      ${isSelected
                        ? "border-primary bg-primary text-white shadow-md scale-105"
                        : sz.available
                          ? "border-border/50 bg-background text-foreground hover:border-primary/60 hover:bg-primary/5 cursor-pointer"
                          : "border-border/20 bg-muted/30 text-muted-foreground/40 cursor-not-allowed opacity-50"
                      }
                    `}
                    aria-label={`Size ${sz.label}${!sz.available ? " — Unavailable" : ""}`}
                  >
                    {sz.label}
                    {isSelected && (
                      <span className="absolute -top-1.5 -right-1.5 h-4 w-4 bg-white rounded-full flex items-center justify-center shadow-sm border border-primary/30">
                        <Check className="h-2.5 w-2.5 text-primary" strokeWidth={3} />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ─── Color Swatch Selector ───────────────────────────────────────── */}
        {sortedColors.length > 0 && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold">Color</p>
              {selectedVariantColor && (
                <p className="text-[10px] text-primary font-semibold">
                  Selected: <span className="font-bold">{selectedVariantColor.name}</span>
                </p>
              )}
            </div>
            <div className="flex flex-wrap gap-3">
              {sortedColors.map((c) => {
                const isSelected = selectedVariantColor?.id === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => c.available && setSelectedVariantColor(c)}
                    disabled={!c.available}
                    title={c.available ? c.name : `${c.name} — Unavailable`}
                    className={`relative group flex flex-col items-center gap-1.5 ${c.available ? "cursor-pointer" : "cursor-not-allowed opacity-40"}`}
                    aria-label={`Color: ${c.name}${!c.available ? " — Unavailable" : ""}`}
                  >
                    <span
                      className={`
                        h-8 w-8 rounded-full border-2 transition-all duration-200 block shadow-sm
                        ${isSelected
                          ? "border-primary scale-110 shadow-md ring-2 ring-primary/30"
                          : c.available
                            ? "border-border/40 hover:border-primary/50 hover:scale-105"
                            : "border-border/20"
                        }
                      `}
                      style={{ backgroundColor: c.hex }}
                    />
                    <span className={`text-[9px] font-semibold uppercase tracking-wide leading-none text-center max-w-[48px] truncate ${isSelected ? "text-primary" : "text-muted-foreground"}`}>
                      {c.name}
                    </span>
                    {isSelected && (
                      <span className="absolute -top-1 -right-1 h-4 w-4 bg-primary rounded-full flex items-center justify-center shadow">
                        <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Stock Level Warning */}
        <div className="mt-6">
          <p className="text-[10px] font-bold text-accent tracking-[0.1em] uppercase">
            {!isAvailable ? "Temporarily Out of Stock" : displayStock <= 3 ? `Hurry, Only ${displayStock} Left in Stock!` : "In Stock — Ready to Ship"}
          </p>
          <div className="h-1 bg-border/40 mt-2 overflow-hidden rounded-full">
            <div className={`h-full ${!isAvailable ? "w-0" : displayStock <= 3 ? "w-1/12 bg-accent animate-pulse" : "w-2/12 bg-primary/60"}`} />
          </div>
        </div>

        {/* Specifications table */}
        <div className="mt-8 border-t border-border/30 text-xs">
          {[
            ["Color", selectedVariantColor ? selectedVariantColor.name : product.color],
            ["Material", product.material],
            ["Dimensions", displayDimensions],
            ["Inside the Box", (product as any).insideBox],
            ["Delivery Time", (product as any).delivery],
            ["Payment Method", "100% Secure Online Payment"],
          ].map(([prop, val]) =>
            val ? (
              <div key={prop} className="flex py-3.5 border-b border-border/30 items-center justify-between">
                <span className="font-semibold text-foreground/75 tracking-wide">{prop}</span>
                <span className="text-muted-foreground font-medium text-right pl-4">{val}</span>
              </div>
            ) : null
          )}
        </div>

        {/* Return Warning */}
        <div className="mt-6 p-3.5 rounded-lg bg-secondary/30 border border-border/25 text-[11px] text-muted-foreground flex items-start gap-2.5">
          <span className="text-accent text-sm leading-none font-bold">⚠</span>
          <span>
            <strong>Non-returnable &amp; Non-exchangeable</strong> — Hand-styled curated item. Learn more about terms.
          </span>
        </div>
      </div>

      {/* Action Panel */}
      <div className="mt-8 pt-6 border-t border-border/30">
        {isAvailable ? (
          <div className="flex gap-4 items-center mb-6">
            {/* Quantity adjust */}
            <div className="flex items-center border border-border/70 rounded-md overflow-hidden bg-background">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="h-11 w-11 flex items-center justify-center font-semibold hover:bg-secondary/40 transition active:scale-95"
              >
                -
              </button>
              <span className="h-11 w-11 flex items-center justify-center text-xs font-semibold select-none">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="h-11 w-11 flex items-center justify-center font-semibold hover:bg-secondary/40 transition active:scale-95"
              >
                +
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              className="flex-1 bg-primary text-primary-foreground py-4 text-xs uppercase tracking-[0.2em] font-semibold hover:bg-primary/95 transition duration-300 rounded-md shadow-sm active:scale-[0.99] cursor-pointer"
            >
              Add to Cart
            </button>
          </div>
        ) : (
          <button
            className="w-full bg-muted text-muted-foreground py-4 text-xs uppercase tracking-[0.2em] font-semibold cursor-not-allowed mb-6 rounded-md"
            disabled
          >
            Sold Out
          </button>
        )}

        {/* Pairs Well With — no prices (they come from Supabase) */}
        {product.pairsWith && (
          <div className="mt-6">
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold mb-3">Pairs Well With</p>
            <Link
              to="/product/$productId"
              params={{ productId: product.pairsWith.code }}
              className="flex gap-4 p-3.5 border border-border/30 bg-secondary/15 hover:bg-secondary/35 rounded-xl transition-colors duration-200 group"
            >
              <div className="h-14 w-12 overflow-hidden bg-secondary border border-border/20 shrink-0 rounded-md">
                <img
                  src={product.pairsWith.img}
                  alt={product.pairsWith.name}
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="flex-1 flex flex-col justify-center">
                <p className="text-xs font-semibold tracking-wide text-foreground/90 leading-tight group-hover:text-primary transition-colors">
                  {product.pairsWith.name}
                </p>
                <p className="mt-1 text-[10px] text-muted-foreground">View product →</p>
              </div>
            </Link>
          </div>
        )}

        {/* Reassurance */}
        <div className="mt-8 border-t border-border/30 pt-8 flex flex-col gap-7 items-center bg-secondary/15 py-8 rounded-xl border border-border/10">
          <div className="flex flex-col items-center text-center">
            <Truck className="h-6 w-6 text-foreground/75 mb-1.5 shrink-0" />
            <p className="text-[11px] font-semibold text-foreground/90 tracking-wide">Free Shipping PAN India</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <RotateCcw className="h-6 w-6 text-foreground/75 mb-1.5 shrink-0" />
            <p className="text-[11px] font-semibold text-foreground/90 tracking-wide">Easy Replacement</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <Phone className="h-6 w-6 text-foreground/75 mb-1.5 shrink-0" />
            <p className="text-[11px] font-semibold text-foreground/90 tracking-wide">24/7 Support (Chat &amp; E-mail)</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <ShieldCheck className="h-6 w-6 text-foreground/75 mb-1.5 shrink-0" />
            <p className="text-[11px] font-semibold text-foreground/90 tracking-wide">100% Secure Payment</p>
          </div>
        </div>

        {/* Full description */}
        <div className="mt-8 border-t border-border/30 pt-5 text-xs text-muted-foreground leading-relaxed">
          <p className="font-semibold text-foreground/75 tracking-wider uppercase text-[10px] mb-2">Description</p>
          {product.description}
        </div>
      </div>
    </div>
  );
}
