import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { getProductByCode } from "@/data/products";
import Layout from "@/components/Layout";
import { useState, useEffect } from "react";
import { Truck, RotateCcw, Phone, ShieldCheck, Heart } from "lucide-react";
import { useStore } from "@/context/StoreContext";
import { toast } from "sonner";

export const Route = createFileRoute("/product/$productId")({
  head: ({ params }) => {
    const product = getProductByCode(params.productId);
    const title = product ? `${product.name} — Vassio` : "Product Not Found — Vassio";
    return {
      meta: [
        { title },
        { name: "description", content: product?.description || "Product Details" },
      ],
    };
  },
  component: ProductPage,
});

function ProductPage() {
  const { productId } = useParams({ from: "/product/$productId" });
  const product = getProductByCode(productId);

  // If product is not found
  if (!product) {
    return (
      <Layout>
        <div className="mx-auto max-w-lg px-6 py-32 text-center">
          <h2 className="serif text-4xl text-foreground">Product Not Found</h2>
          <p className="mt-4 text-sm text-muted-foreground">
            We couldn't find the product with code "
            <span className="font-semibold">{productId}</span>".
          </p>
          <div className="mt-8">
            <Link
              to="/"
              className="inline-block bg-primary text-primary-foreground px-8 py-3 text-xs uppercase tracking-[0.2em] font-semibold hover:bg-primary/95 transition duration-300 rounded-lg"
            >
              Go Back Home
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
          <Link to="/" className="hover:text-foreground transition-colors">
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
      </div>
    </Layout>
  );
}

function ProductImages({
  product,
}: {
  product: ReturnType<typeof getProductByCode> & { img: string };
}) {
  const [activeImage, setActiveImage] = useState(product.img);
  const thumbnails = product.thumbnails || [product.img];
  const { toggleWishlist, isInWishlist } = useStore();
  const wishlisted = isInWishlist(product.code);

  // Reset active image if the product updates
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

      {/* Main Image display */}
      <div className="flex-1 aspect-square bg-secondary border border-border/20 overflow-hidden relative rounded-xl">
        <img src={activeImage} alt={product.name} className="h-full w-full object-cover" />
        {(product as any).isSoldOut && (
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
          <Heart className={`h-4.5 w-4.5 ${wishlisted ? "fill-primary" : ""}`} />
        </button>
      </div>
    </div>
  );
}

function ProductDetails({
  product,
}: {
  product: ReturnType<typeof getProductByCode> & { code: string; sizes?: any[] };
}) {
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState(product.sizes ? product.sizes[0] : null);
  const { addToCart } = useStore();

  // Reset selected size when product changes
  useEffect(() => {
    setSelectedSize(product.sizes ? product.sizes[0] : null);
  }, [product.code, product.sizes]);

  const displayPrice = selectedSize ? selectedSize.price : product.price;
  const displayMrp = selectedSize ? selectedSize.mrp : product.mrp;
  const off = Math.round(((displayMrp - displayPrice) / displayMrp) * 100);
  const displayDimensions = selectedSize ? selectedSize.dimensions : product.dimensions;

  const handleAddToCart = () => {
    addToCart({
      code: product.code,
      name: product.name,
      img: product.img,
      price: displayPrice,
      mrp: displayMrp,
      quantity,
      sizeName: selectedSize?.name,
    });
    toast.success(`${product.name} added to cart!`);
  };

  return (
    <div className="w-full lg:w-1/2 flex flex-col justify-between">
      <div>
        {/* Title */}
        <h1 className="product-name font-sans font-extrabold text-3xl md:text-5xl text-foreground leading-tight">{product.name}</h1>

        {/* Product Code */}
        <p className="text-[11px] text-muted-foreground uppercase tracking-widest mt-2">
          SKU: {product.code}
        </p>

        {/* Price Tag */}
        <div className="mt-5 flex items-center gap-3.5">
          <span className="product-price font-sans font-bold text-2xl md:text-3xl text-primary">
            ₹{displayPrice.toLocaleString("en-IN")}
          </span>
          <span className="text-base text-muted-foreground line-through font-sans">
            ₹{displayMrp.toLocaleString("en-IN")}
          </span>
          <span className="text-[10px] bg-[#3F673F] text-white border border-[#5B8550]/60 px-2 py-0.5 font-bold uppercase tracking-wider rounded">
            {off}% OFF
          </span>
        </div>

        <p className="text-[10px] text-muted-foreground/80 mt-1.5 italic">
          (Inclusive of all Taxes)
        </p>

        {/* Size Selection */}
        {product.sizes && (
          <div className="mt-6">
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold mb-3">
              Select Size
            </p>
            <div className="flex flex-wrap gap-2.5">
              {product.sizes.map((sz) => (
                <button
                  key={sz.name}
                  onClick={() => setSelectedSize(sz)}
                  className={`px-4 py-2 text-xs font-semibold tracking-wide border transition-all duration-200 rounded cursor-pointer ${
                    selectedSize?.name === sz.name
                      ? "border-primary bg-primary text-primary-foreground shadow-sm"
                      : "border-border/60 bg-background text-foreground hover:border-muted-foreground"
                  }`}
                >
                  {sz.name.split(" (")[0]}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Stock Level Warning */}
        <div className="mt-6">
          <p className="text-[10px] font-bold text-accent tracking-[0.1em] uppercase">
            {(product as any).isSoldOut ? "Temporarily Out of Stock" : "Hurry, Only 1 Item Left in Stock!"}
          </p>
          <div className="h-1 bg-border/40 mt-2 overflow-hidden rounded-full">
            <div
              className={`h-full ${(product as any).isSoldOut ? "w-0" : "w-1/12 bg-accent animate-pulse"}`}
            />
          </div>
        </div>

        {/* Specifications properties table */}
        <div className="mt-8 border-t border-border/30 text-xs">
          {[
            ["Color", product.color],
            ["Material", product.material],
            ["Dimensions", displayDimensions],
            ["Inside the Box", product.insideBox],
            ["Delivery Time", product.delivery],
            ["COD Support", product.cod],
          ].map(([prop, val]) => (
            <div
              key={prop}
              className="flex py-3.5 border-b border-border/30 items-center justify-between"
            >
              <span className="font-semibold text-foreground/75 tracking-wide">{prop}</span>
              <span className="text-muted-foreground font-medium text-right pl-4">{val}</span>
            </div>
          ))}
        </div>

        {/* Return Warning details */}
        <div className="mt-6 p-3.5 rounded-lg bg-secondary/30 border border-border/25 text-[11px] text-muted-foreground flex items-start gap-2.5">
          <span className="text-accent text-sm leading-none font-bold">⚠</span>
          <span>
            <strong>Non-returnable & Non-exchangeable</strong> — Hand-styled curated item. Learn
            more about terms.
          </span>
        </div>
      </div>

      {/* Action panel & Cart section */}
      <div className="mt-8 pt-6 border-t border-border/30">
        {!(product as any).isSoldOut && (
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

            {/* Cart trigger button */}
            <button
              onClick={handleAddToCart}
              className="flex-1 bg-primary text-primary-foreground py-4 text-xs uppercase tracking-[0.2em] font-semibold hover:bg-primary/95 transition duration-300 rounded-md shadow-sm active:scale-[0.99] cursor-pointer"
            >
              Add to Cart
            </button>
          </div>
        )}

        {(product as any).isSoldOut && (
          <button
            className="w-full bg-muted text-muted-foreground py-4 text-xs uppercase tracking-[0.2em] font-semibold cursor-not-allowed mb-6 rounded-md"
            disabled
          >
            Sold Out
          </button>
        )}

        {/* Pairs Well With overlay recommendation */}
        {product.pairsWith && (
          <div className="mt-6">
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold mb-3">
              Pairs Well With
            </p>
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
                <p className="mt-1 text-xs">
                  <span className="font-semibold text-primary serif">
                    ₹{product.pairsWith.price.toLocaleString("en-IN")}
                  </span>
                  <span className="ml-2 text-muted-foreground line-through text-[10px] serif">
                    ₹{product.pairsWith.mrp.toLocaleString("en-IN")}
                  </span>
                </p>
              </div>
            </Link>
          </div>
        )}

        {/* Reassurance value props */}
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
            <p className="text-[11px] font-semibold text-foreground/90 tracking-wide">24/7 Support (Chat & E-mail)</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <ShieldCheck className="h-6 w-6 text-foreground/75 mb-1.5 shrink-0" />
            <p className="text-[11px] font-semibold text-foreground/90 tracking-wide">100% Secure Payment</p>
          </div>
        </div>

        {/* Full description */}
        <div className="mt-8 border-t border-border/30 pt-5 text-xs text-muted-foreground leading-relaxed">
          <p className="font-semibold text-foreground/75 tracking-wider uppercase text-[10px] mb-2">
            Description
          </p>
          {product.description}
        </div>
      </div>
    </div>
  );
}
