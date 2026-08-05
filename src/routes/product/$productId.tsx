import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import productService from "@/services/product.service";
import Layout from "@/components/Layout";
import { useState, useEffect } from "react";
import { Truck, RotateCcw, Phone, ShieldCheck, Heart, Check, Star, ArrowLeft, ShoppingBag } from "lucide-react";
import { useStore } from "@/context/StoreContext";
import { toast } from "sonner";
import { getVariants } from "@/services/variantStore";
import type { ProductSizeVariant, ProductColorVariant } from "@/types/variants";
import ProductReviews from "@/components/ProductReviews";
import type { Product } from "@/types/product";

export const Route = createFileRoute("/product/$productId")({
  head: ({ params }) => {
    try {
      const product = productService.getProductByCode(params?.productId);
      const title = product ? `${product.name} — Vassio` : "Product Details — Vassio";
      return {
        meta: [
          { title },
          { name: "description", content: product?.description || "Product Details" },
        ],
      };
    } catch (e) {
      return {
        meta: [{ title: "Vassio Pots" }],
      };
    }
  },
  component: ProductPage,
});

function ProductPage() {
  const { productId } = useParams({ from: "/product/$productId" });
  const [product, setProduct] = useState<Product | null>(() => productService.getProductByCode(productId));
  const [loading, setLoading] = useState(false);

  // Fetch live dynamic product from Supabase products_dynamic table on mount / route param change
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    productService.getProductByCodeAsync(productId).then((merged) => {
      if (isMounted) {
        setProduct(merged || productService.getProductByCode(productId));
        setLoading(false);
      }
    }).catch((err) => {
      console.warn("[Vassio Product Page] Supabase fetch fallback:", err);
      if (isMounted) {
        setProduct(productService.getProductByCode(productId));
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [productId]);

  // If product is not found, display defensive 404 page
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

  // Force reset state when product changes by using a key on the inner container
  return (
    <Layout>
      <div key={product.code} className="mx-auto max-w-[1400px] px-6 py-12 md:py-16">
        {/* Breadcrumb */}
        <nav className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground font-semibold mb-8 flex flex-wrap items-center gap-1.5">
          <Link to="/" className="hover:text-foreground transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link to="/products" className="hover:text-foreground transition-colors">
            Shop
          </Link>
          <span>/</span>
          <span className="text-foreground/90 truncate max-w-xs">{product.name}</span>
        </nav>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-14 bg-background">
          {/* Images Section */}
          <ProductImages product={product} />

          {/* Details Section */}
          <ProductDetails product={product} />
        </div>

        {/* Verified Customer Reviews Section */}
        <ProductReviews productId={product.code} productName={product.name} />
      </div>
    </Layout>
  );
}

function ProductImages({
  product,
}: {
  product: Product;
}) {
  const { wishlist, toggleWishlist } = useStore();
  const wishlisted = wishlist.some((item) => item.code === product.code);

  const thumbnails =
    product.thumbnails && product.thumbnails.length > 0
      ? product.thumbnails
      : [product.img];

  const [activeImage, setActiveImage] = useState<string>(product.img);

  // Sync active image when product changes
  useEffect(() => {
    setActiveImage(product.img);
  }, [product.code, product.img]);

  return (
    <div className="flex-1 flex flex-col-reverse md:flex-row gap-4">
      {/* Thumbnails */}
      {thumbnails.length > 1 && (
        <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto max-h-[550px] scrollbar-none py-1">
          {thumbnails.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setActiveImage(img)}
              className={`relative flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden border-2 transition-all duration-200 cursor-pointer ${
                activeImage === img
                  ? "border-[#739D30] shadow-sm scale-95"
                  : "border-border/40 opacity-70 hover:opacity-100 hover:border-border"
              }`}
            >
              <img src={img} alt={`${product.name} view ${idx + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Main Image display */}
      <div className="flex-1 aspect-square bg-secondary border border-border/20 overflow-hidden relative rounded-xl">
        <img src={activeImage} alt={product.name} className="h-full w-full object-cover" />
        {product.isSoldOut && (
          <span className="absolute top-4 left-4 bg-[#3F673F] text-white border border-[#5B8550] text-[10px] uppercase tracking-widest px-3 py-1.5 font-semibold shadow-sm rounded">
            Sold Out
          </span>
        )}
        {/* Wishlist heart button */}
        <button
          onClick={() => {
            toggleWishlist(product.code);
            toast.success(wishlisted ? "Removed from wishlist" : "Saved to wishlist!");
          }}
          className={`absolute top-4 right-4 h-9 w-9 flex items-center justify-center rounded-full shadow-md transition-all duration-200 cursor-pointer ${
            wishlisted
              ? "bg-white text-primary scale-110"
              : "bg-white/80 text-muted-foreground hover:text-primary hover:scale-110"
          }`}
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart className={`h-[18px] w-[18px] ${wishlisted ? "fill-primary" : ""}`} />
        </button>
      </div>
    </div>
  );
}

function ProductDetails({
  product,
}: {
  product: Product;
}) {
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useStore();

  // ── Variant State ──────────────────────────────────────────────────────────
  const variants = getVariants(product.code || "FLX48");
  const sortedSizes = [...(variants?.sizes || [])].sort((a, b) => a.displayOrder - b.displayOrder);
  const sortedColors = [...(variants?.colors || [])].sort((a, b) => a.displayOrder - b.displayOrder);

  const [selectedVariantSize, setSelectedVariantSize] = useState<ProductSizeVariant | null>(
    sortedSizes.find((s) => s.available) ?? null
  );
  const [selectedVariantColor, setSelectedVariantColor] = useState<ProductColorVariant | null>(
    sortedColors.find((c) => c.available) ?? null
  );

  // Reset variant selections when product changes
  useEffect(() => {
    const freshVariants = getVariants(product.code || "FLX48");
    const freshSizes = [...(freshVariants?.sizes || [])].sort((a, b) => a.displayOrder - b.displayOrder);
    const freshColors = [...(freshVariants?.colors || [])].sort((a, b) => a.displayOrder - b.displayOrder);
    setSelectedVariantSize(freshSizes.find((s) => s.available) ?? null);
    setSelectedVariantColor(freshColors.find((c) => c.available) ?? null);
  }, [product.code]);

  // Display Pricing derived EXCLUSIVELY from dynamic Supabase Product object (product.price & product.mrp)
  const displayPrice = Number(product.price ?? 0);
  const displayMrp = Number(product.mrp ?? displayPrice);
  const off = product.discountPercentage !== undefined
    ? Number(product.discountPercentage)
    : (displayMrp > displayPrice ? Math.max(0, Math.round(((displayMrp - displayPrice) / displayMrp) * 100)) : 0);

  const displayDimensions = selectedVariantSize?.dimensions || product.dimensions || "Dimensions available on request";

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
      ]
        .filter(Boolean)
        .join(" | ") || undefined,
    });
    toast.success(`Added ${product.name} to cart!`);
  };

  return (
    <div className="flex-1 space-y-6">
      {/* Header Info */}
      <div>
        <div className="flex items-center justify-between gap-4 mb-2">
          <span className="text-[11px] uppercase tracking-[0.25em] text-[#739D30] font-bold">
            {product.category || "Planter Collection"}
          </span>
          <span className="text-[10px] tracking-widest text-muted-foreground font-mono bg-secondary px-2.5 py-1 rounded">
            CODE: {product.code}
          </span>
        </div>
        <h1 className="serif text-3xl md:text-4xl text-foreground font-bold leading-tight mb-3">
          {product.name}
        </h1>

        {/* Rating Summary */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex items-center text-amber-500">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
            ))}
          </div>
          <span className="text-xs font-semibold text-foreground">4.9</span>
          <span className="text-xs text-muted-foreground">(126 Verified Reviews)</span>
        </div>
      </div>

      {/* Pricing Banner - Powered by Supabase products_dynamic */}
      <div className="p-4 rounded-2xl bg-[#EEF5E3]/60 border border-[#D9E3C5] flex items-baseline gap-4">
        <span className="text-3xl font-extrabold text-[#2F4B2F]">
          ₹{displayPrice.toLocaleString("en-IN")}
        </span>
        {displayMrp > displayPrice && (
          <>
            <span className="text-base text-muted-foreground line-through">
              ₹{displayMrp.toLocaleString("en-IN")}
            </span>
            <span className="text-xs font-bold bg-[#739D30] text-white px-2.5 py-1 rounded-full uppercase tracking-wider">
              {off}% OFF
            </span>
          </>
        )}
      </div>

      {/* Description */}
      {product.description && (
        <p className="text-sm text-muted-foreground leading-relaxed">
          {product.description}
        </p>
      )}

      {/* Material & Finish */}
      <div className="grid grid-cols-2 gap-4 py-3 border-y border-border/40 text-xs">
        {product.material && (
          <div>
            <span className="block text-muted-foreground uppercase tracking-wider text-[10px] font-semibold">
              Material
            </span>
            <span className="font-medium text-foreground">{product.material}</span>
          </div>
        )}
        {product.color && (
          <div>
            <span className="block text-muted-foreground uppercase tracking-wider text-[10px] font-semibold">
              Finish / Color
            </span>
            <span className="font-medium text-foreground">{product.color}</span>
          </div>
        )}
      </div>

      {/* Dimensions & Specifications */}
      <div>
        <span className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
          Dimensions & Size Specification
        </span>
        <div className="p-3 bg-secondary/50 rounded-xl text-xs text-foreground font-mono">
          {displayDimensions}
        </div>
      </div>

      {/* Quantity & CTA */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center gap-4">
          <div className="flex items-center border border-border rounded-xl overflow-hidden bg-background">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="px-3.5 py-2.5 text-foreground hover:bg-secondary transition-colors cursor-pointer text-sm font-semibold"
            >
              -
            </button>
            <span className="px-4 text-sm font-semibold font-mono">{quantity}</span>
            <button
              onClick={() => setQuantity((q) => q + 1)}
              className="px-3.5 py-2.5 text-foreground hover:bg-secondary transition-colors cursor-pointer text-sm font-semibold"
            >
              +
            </button>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={product.isSoldOut}
            className="flex-1 py-3.5 px-6 rounded-xl bg-[#739D30] hover:bg-[#628828] text-white font-semibold text-xs uppercase tracking-[0.2em] shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>{product.isSoldOut ? "Sold Out" : "Add to Cart"}</span>
          </button>
        </div>
      </div>

      {/* Value Badges */}
      <div className="grid grid-cols-2 gap-3 pt-4 text-xs text-muted-foreground border-t border-border/40">
        <div className="flex items-center gap-2">
          <Truck className="w-4 h-4 text-[#739D30]" />
          <span>Pan-India Delivery (5-7 Days)</span>
        </div>
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#739D30]" />
          <span>100% Quality Inspected</span>
        </div>
        <div className="flex items-center gap-2">
          <RotateCcw className="w-4 h-4 text-[#739D30]" />
          <span>7-Day Replacement Guarantee</span>
        </div>
        <div className="flex items-center gap-2">
          <Phone className="w-4 h-4 text-[#739D30]" />
          <span>Dedicated Studio Support</span>
        </div>
      </div>
    </div>
  );
}
