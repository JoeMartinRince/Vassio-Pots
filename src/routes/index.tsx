import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef, useState, useEffect } from "react";
import Layout from "@/components/Layout";
import FiberplanterFeatures from "@/components/FiberplanterFeatures";
import { useStore } from "@/context/StoreContext";
import { Instagram, Heart, Share2, Volume2, VolumeX, X, ShoppingBag, Truck, RotateCcw, ShieldCheck, Phone, ExternalLink, ArrowRight, ShoppingCart, ArrowDownLeft, ArrowDownRight } from "lucide-react";
import { toast, Toaster } from "sonner";
import {
  products,
  vases,
  auxiliaryProducts,
  categories,
  featuresImages,
  reels,
  blogs,
  heroPlants,
  livingRoomVases,
  bathroomAroma,
  woodenBeadsDecor,
  aboutUsWindow,
  reel1,
  reel2,
  reel3,
  reel4,
  reel5,
  prod1,
} from "@/data/products";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Vassio — Modern Home Decor & Furniture" },
      {
        name: "description",
        content:
          "Vassio brings warmth, craft and calm into your home — discover furniture, planters, decor, bedding, bath and kitchen essentials.",
      },
      { property: "og:title", content: "Vassio — Modern Home Decor & Furniture" },
      {
        property: "og:description",
        content:
          "Vassio brings warmth, craft and calm into your home — discover furniture, planters, decor, bedding, bath and kitchen essentials.",
      },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Inter:wght@300;400;500;600&family=Playball&display=swap",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const { addToCart, toggleWishlist, isInWishlist } = useStore();
  const [selectedReelIndex, setSelectedReelIndex] = useState<number | null>(null);
  const visibleProducts = products.slice(0, 4);
  const visibleVases = vases.slice(0, 4);

  return (
    <Layout>
      {/* Hero */}
      <section className="relative min-h-[75vh] h-[75vh] md:min-h-[calc(100vh-5.5rem)] md:h-screen w-full flex items-center justify-center bg-muted/30 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden w-full h-full">
          <img
            src={heroPlants}
            alt="Hero plants"
            className="w-full h-full object-cover object-center animate-fade-in"
          />
          {/* Soft, refined botanical green color grade overlay preserving natural image details */}
          <div className="absolute inset-0 bg-[#7FA93A]/25 mix-blend-soft-light" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#2F4B2F]/80 via-[#2F4B2F]/40 to-[#2F4B2F]/20" />
        </div>
        <div className="relative text-center z-10 px-6 my-auto pt-4 md:pt-6 max-w-4xl mx-auto">
          <h1 className="serif text-4xl sm:text-5xl md:text-8xl tracking-wide uppercase font-extrabold leading-tight drop-shadow-md select-none">
            <span className="text-[#FCFCF8] block">Elevate</span>
            <span className="text-[#7FA93A] block">Every Space</span>
          </h1>
          <p className="text-[#FCFCF8]/90 text-[11px] sm:text-xs md:text-sm tracking-wide mt-4 md:mt-6 max-w-2xl mx-auto leading-relaxed font-sans font-medium">
            Discover premium fiberglass planters crafted to bring timeless elegance and greenery to homes, gardens, balconies, offices, hotels, cafés, and commercial spaces. Designed for durability, style, and modern living.
          </p>
          <div className="mt-6 md:mt-10">
            <a
              href="#shop"
              className="inline-block bg-[#7FA93A] text-[#FCFCF8] hover:bg-[#6E9432] px-8 sm:px-10 py-3.5 sm:py-4 text-[10px] uppercase tracking-[0.25em] font-semibold transition duration-300 rounded-full shadow-lg hover:scale-105 active:scale-95 duration-200 cursor-pointer font-sans"
            >
              Shop Now
            </a>
          </div>
        </div>
      </section>

      {/* Value props */}
      <section className="hidden md:block border-b border-border/30 bg-card">
        <div className="mx-auto grid max-w-[1400px] grid-cols-2 md:grid-cols-4 gap-px bg-border/20">
          {[
            { Icon: Truck, label: "Free Shipping PAN India" },
            { Icon: RotateCcw, label: "Easy Replacement" },
            { Icon: Phone, label: "24/7 Support (Chat & E-mail)" },
            { Icon: ShieldCheck, label: "100% Secure Payment" },
          ].map(({ Icon, label }, idx) => (
            <div key={idx} className="bg-background px-6 py-8 flex flex-col items-center justify-center text-center">
              <Icon className="h-6 w-6 text-primary mb-2.5 shrink-0" />
              <p className="text-xs font-semibold tracking-wide text-foreground/90">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Shop our products */}
      <section id="shop" className="mx-auto max-w-[1400px] px-6 py-16 md:py-24">
        <div className="mb-14 text-center">
          <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">
            Curated Greenery
          </p>
          <h2 className="serif mt-3 text-4xl md:text-5xl text-foreground">Shop Our Products</h2>
        </div>
        <div className="flex overflow-x-auto gap-x-4 pb-6 snap-x snap-mandatory scrollbar-none lg:grid lg:grid-cols-4 lg:gap-x-5 lg:gap-y-12 lg:overflow-visible lg:pb-0 scroll-smooth">
          {visibleProducts.map((p) => {
            const off = Math.round(((p.mrp - p.price) / p.mrp) * 100);
            const isSaved = isInWishlist(p.code);
            return (
              <Link
                key={p.code}
                to="/product/$productId"
                params={{ productId: p.code }}
                className="group snap-start flex-none w-[43%] sm:w-[200px] lg:w-auto cursor-pointer flex flex-col"
              >
                <div className="relative overflow-hidden bg-secondary aspect-[4/5] border border-border/40 rounded-2xl shadow-sm group-hover:shadow-md transition-all duration-300">
                  <img
                    src={p.img}
                    alt={p.name}
                    width={800}
                    height={1000}
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                  />
                  <span className="absolute left-3 top-3 bg-[#3F673F] text-white border border-[#5B8550] text-[10px] uppercase tracking-[0.2em] px-2.5 py-1 font-bold rounded shadow-sm">
                    {(p as any).isSoldOut ? "Sold Out" : `${off}% OFF`}
                  </span>

                  {/* Wishlist toggle button */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleWishlist(p.code);
                    }}
                    className={`absolute right-3 top-3 p-2 rounded-full shadow-sm transition-colors cursor-pointer z-20 ${
                      isSaved
                        ? "bg-white text-rose-500"
                        : "bg-white/80 hover:bg-white text-muted-foreground hover:text-rose-500"
                    }`}
                    aria-label="Toggle Wishlist"
                  >
                    <Heart className={`h-4 w-4 ${isSaved ? "fill-rose-500" : ""}`} />
                  </button>

                  {/* View Product Banner (aligned to the bottom of the image container, appearing on hover - Desktop only) */}
                  <div className="hidden lg:block absolute bottom-0 left-0 right-0 bg-primary py-3.5 text-center transition-all duration-300 ease-out translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 shadow-md">
                    <span className="text-white text-xs font-semibold tracking-[0.2em] uppercase font-serif">
                      View Product
                    </span>
                  </div>
                  {/* Quick Add to Cart Button (Mobile only) */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      addToCart(p);
                    }}
                    className="lg:hidden absolute bottom-3 right-3 bg-primary hover:bg-primary/90 text-white w-8 h-8 flex items-center justify-center rounded-full shadow-md transition-colors z-20"
                    aria-label="Add to Cart"
                  >
                    <ShoppingBag className="h-4 w-4" />
                  </button>
                </div>
                <p className="product-name font-sans font-bold mt-4 text-base tracking-wide text-foreground/90 leading-tight group-hover:text-primary transition-colors">
                  {p.name}
                </p>
                <p className="mt-1.5 text-sm">
                  <span className="product-price font-sans font-semibold text-primary">
                    ₹{p.price.toLocaleString("en-IN")}
                  </span>
                  <span className="ml-2 text-muted-foreground line-through text-xs font-sans font-medium">
                    ₹{p.mrp.toLocaleString("en-IN")}
                  </span>
                </p>
              </Link>
            );
          })}
        </div>
        <div className="mt-8 md:mt-16 text-center">
          <Link
            to="/shop"
            search={{ category: "plants" }}
            className="inline-block bg-primary hover:bg-primary/90 text-white px-10 py-3.5 text-xs uppercase tracking-[0.25em] font-semibold transition duration-300 rounded cursor-pointer animate-fade-in"
          >
            View All
          </Link>
        </div>
      </section>

      {/* Combined Curved Forest-Green Section (Watch & Buy + Gifts & Vases) */}
      <section className="bg-primary text-primary-foreground py-16 md:py-24 rounded-t-[40px] md:rounded-t-[60px] rounded-b-[40px] md:rounded-b-[60px] my-12 shadow-xl">
        {/* Watch and Buy */}
        <WatchAndBuy onReelClick={(index) => setSelectedReelIndex(index)} />

        {/* Gifts & Vases */}
        <div className="mx-auto max-w-[1400px] px-6 pt-10 mt-6">
          <div className="mb-14 text-center">
            <p className="text-xs uppercase tracking-[0.4em] text-primary-foreground/60">
              Minimalist Styling
            </p>
            <h2 className="serif mt-3 text-4xl md:text-5xl text-primary-foreground">Gifts & Vases</h2>
          </div>
          <div className="flex overflow-x-auto gap-x-4 pb-6 snap-x snap-mandatory scrollbar-none lg:grid lg:grid-cols-4 lg:gap-x-5 lg:gap-y-12 lg:overflow-visible lg:pb-0 scroll-smooth">
            {visibleVases.map((p) => {
              const off = Math.round(((p.mrp - p.price) / p.mrp) * 100);
              const isSaved = isInWishlist(p.code);
              return (
                <Link
                  key={p.code}
                  to="/product/$productId"
                  params={{ productId: p.code }}
                  className="group snap-start flex-none w-[43%] sm:w-[200px] lg:w-auto cursor-pointer flex flex-col"
                >
                  <div className="relative overflow-hidden bg-secondary aspect-[4/5] border border-border/40 rounded-2xl shadow-sm group-hover:shadow-md transition-all duration-300">
                    <img
                      src={p.img}
                      alt={p.name}
                      width={800}
                      height={1000}
                      loading="lazy"
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                    />
                    <span className="absolute left-3 top-3 bg-[#3F673F] text-white border border-[#5B8550] text-[10px] uppercase tracking-[0.2em] px-2.5 py-1 font-bold rounded shadow-sm">
                      {(p as any).isSoldOut ? "Sold Out" : `${off}% OFF`}
                    </span>

                    {/* Wishlist toggle button */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleWishlist(p.code);
                      }}
                      className={`absolute right-3 top-3 p-2 rounded-full shadow-sm transition-colors cursor-pointer z-20 ${
                        isSaved
                          ? "bg-white text-rose-500"
                          : "bg-white/80 hover:bg-white text-muted-foreground hover:text-rose-500"
                      }`}
                      aria-label="Toggle Wishlist"
                    >
                      <Heart className={`h-4 w-4 ${isSaved ? "fill-rose-500" : ""}`} />
                    </button>

                    {/* View Product Banner (aligned to the bottom of the image container, appearing on hover - Desktop only) */}
                    <div className="hidden lg:block absolute bottom-0 left-0 right-0 bg-[#FCFCF8] py-3.5 text-center transition-all duration-300 ease-out translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 shadow-md">
                      <span className="text-primary text-xs font-semibold tracking-[0.2em] uppercase font-serif">
                        View Product
                      </span>
                    </div>
                    {/* Quick Add to Cart Button (Mobile only) */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        addToCart(p);
                      }}
                      className="lg:hidden absolute bottom-3 right-3 bg-secondary hover:bg-secondary/90 text-foreground w-8 h-8 flex items-center justify-center rounded-full shadow-md transition-colors z-20"
                      aria-label="Add to Cart"
                    >
                      <ShoppingBag className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="product-name font-sans font-bold mt-4 text-base tracking-wide text-primary-foreground/95 leading-tight group-hover:text-secondary transition-colors">
                    {p.name}
                  </p>
                  <p className="mt-1.5 text-sm">
                    <span className="product-price font-sans font-semibold text-secondary">
                      ₹{p.price.toLocaleString("en-IN")}
                    </span>
                    <span className="ml-2 text-primary-foreground/60 line-through text-xs font-sans font-medium">
                      ₹{p.mrp.toLocaleString("en-IN")}
                    </span>
                  </p>
                </Link>
              );
            })}
          </div>
          <div className="mt-16 text-center">
            <Link
              to="/shop"
              search={{ category: "vases" }}
              className="inline-block bg-secondary hover:bg-secondary/90 text-foreground px-10 py-3.5 text-xs uppercase tracking-[0.25em] font-semibold transition duration-300 rounded cursor-pointer animate-fade-in"
            >
              View All
            </Link>
          </div>
        </div>
      </section>

      {/* Shop by Category */}
      <section className="mx-auto max-w-[1400px] px-6 py-24 border-t border-border/30">
        <div className="mb-14 text-center">
          <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">Discover More</p>
          <h2 className="serif mt-3 text-4xl md:text-5xl text-foreground">Shop by Category</h2>
        </div>
        <div className="flex flex-wrap justify-center gap-8 md:gap-14">
          {categories.map((c) => (
            <a key={c.name} href="#" className="group block text-center">
              <div className="h-28 w-28 md:h-36 md:w-36 overflow-hidden rounded-full border border-border/40 bg-secondary mx-auto">
                <img
                  src={c.img}
                  alt={c.name}
                  width={300}
                  height={300}
                  loading="lazy"
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                />
              </div>
              <p className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-foreground/85 transition group-hover:text-primary">
                {c.name}
              </p>
            </a>
          ))}
        </div>
      </section>

      {/* Brand Journey (Growing Green Together) */}
      <section className="bg-background py-14 border-t border-border/30">
        <div className="mx-auto max-w-[1400px] px-6">
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <span className="text-xs uppercase tracking-[0.2em] font-bold text-primary flex items-center gap-1.5">
                About us <ArrowDownRight className="h-3.5 w-3.5" />
              </span>
              <h2 className="serif text-3xl md:text-5xl text-foreground mt-3 tracking-wide">
                Growing Green Together
              </h2>
            </div>
            <div className="hidden sm:flex h-12 w-12 rounded-full border border-primary/10 items-center justify-center text-primary/45">
              <ArrowDownLeft className="h-6 w-6 stroke-[1.5]" />
            </div>
          </div>

          {/* Text Paragraphs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 mb-10 text-sm text-muted-foreground leading-relaxed max-w-5xl">
            <p>
              At Vassio, we believe that bringing plants and natural elements indoors is more than a styling choice—it's a way of living. Whether you are creating a quiet sanctuary in a corner or adding character to a full space, we are here to help you grow with style and confidence.
            </p>
            <p>
              Driven by a deep appreciation for craftsmanship, we source premium fiber-glass planters, artisan ceramic pots, and handpicked greenery. Our goal is to bring nature and modern design together, creating warmth and organic calm for your home.
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
            {/* Card 1: 130+ Customers */}
            <div className="flex flex-col gap-4">
              <div className="text-left">
                <span className="serif text-3xl md:text-4xl font-bold text-primary block">130+</span>
                <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground mt-1 block">
                  Satisfied Customers
                </span>
              </div>
              <div className="aspect-[4/3] rounded-[20px] overflow-hidden shadow-sm border border-border/30">
                <img
                  src={aboutUsWindow}
                  alt="Cozy home plants"
                  className="w-full h-full object-cover hover:scale-105 transition duration-700"
                  loading="lazy"
                />
              </div>
            </div>

            {/* Card 2: Soil/Artisan Horizontal Image */}
            <div className="aspect-[4/3] lg:aspect-[3/2] rounded-[20px] overflow-hidden shadow-sm border border-border/30">
              <img
                src={livingRoomVases}
                alt="Artisan ceramic styling"
                className="w-full h-full object-cover hover:scale-105 transition duration-700"
                loading="lazy"
              />
            </div>

            {/* Card 3: Green Card 3k+ Unique Products */}
            <div className="bg-primary text-primary-foreground rounded-[20px] p-5 flex flex-col justify-between aspect-[4/3] relative overflow-hidden shadow-lg border border-primary/20 group">
              <div className="flex justify-between items-start">
                <ArrowDownRight className="h-5 w-5 text-secondary/40 stroke-[1.5] group-hover:translate-x-1 group-hover:translate-y-1 transition-transform" />
              </div>
              <div className="z-10 mt-auto">
                <span className="serif text-3xl md:text-4xl font-bold text-secondary block">3k+</span>
                <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-primary-foreground/75 mt-1 block">
                  Unique Products
                </span>
              </div>
              {/* Plant artwork mockup in bottom right */}
              <div className="absolute -bottom-1 -right-1 w-24 h-24 rounded-full overflow-hidden border-4 border-secondary/15 shadow-inner">
                <img
                  src={woodenBeadsDecor}
                  alt="Organic beads decor"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
              </div>
            </div>

            {/* Card 4: 20+ Service Providers */}
            <div className="bg-gradient-to-b from-primary/5 to-transparent rounded-[20px] p-5 flex flex-col justify-between aspect-[4/3] border border-primary/10 shadow-sm">
              <div>
                <span className="serif text-3xl md:text-4xl font-bold text-primary block">20+</span>
                <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground mt-1 block">
                  Service Providers
                </span>
              </div>
              <div className="aspect-[3/2] rounded-[16px] overflow-hidden mt-2 shadow-inner border border-border/20">
                <img
                  src={bathroomAroma}
                  alt="Aroma interior decor"
                  className="w-full h-full object-cover hover:scale-105 transition duration-700"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What Makes Fiberplanter's Different? */}
      <FiberplanterFeatures />



      {/* About Us */}
      <section className="relative h-[65vh] flex items-center justify-center bg-muted/40">
        <div className="absolute inset-0">
          <img src={aboutUsWindow} alt="Sunny window" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/5" />
        </div>
        <div className="relative text-center z-10 px-6 max-w-2xl bg-background/90 backdrop-blur-sm p-8 md:p-12 border border-border/30 rounded-3xl shadow-xl mx-4">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Vassio Pots</p>
          <h2 className="serif mt-4 text-3xl md:text-4xl text-foreground">Handcrafted Planters & Organic Calm</h2>
          <p className="mt-5 text-sm leading-relaxed text-muted-foreground/90">
            Elevate your spaces with our premium range of handcrafted ceramic pots, minimalist fiber-glass planters, and curated indoor plants. We design statement pieces that bring natural warmth, craftsmanship, and organic calm to your home sanctuary.
          </p>
          <div className="mt-8">
            <Link
              to="/shop"
              className="inline-block bg-primary hover:bg-primary/90 text-white px-8 py-3.5 text-xs uppercase tracking-[0.2em] font-semibold transition duration-300 rounded cursor-pointer"
            >
              Explore Collection
            </Link>
          </div>
        </div>
      </section>



      {/* Instagram Grid */}
      <section className="bg-secondary/20 border-t border-border/30 py-24">
        <div className="mx-auto max-w-[1400px] px-6">
          <div className="mb-14 text-center">
            <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">Instagram</p>
            <h2 className="serif mt-3 text-4xl md:text-5xl text-foreground">#VassioInRealHome</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {[reel1, reel2, reel3, reel4, reel5].map((img, i) => (
              <a
                key={i}
                href="#"
                className="group block relative aspect-square overflow-hidden bg-secondary border border-border/40 rounded-2xl"
              >
                <img
                  src={img}
                  alt="Instagram post"
                  loading="lazy"
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition duration-300 flex items-center justify-center">
                  <Instagram className="text-white h-6 w-6" />
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>


      {/* Reel Modal overlay */}
      {selectedReelIndex !== null && (
        <ReelsViewerModal
          initialIndex={selectedReelIndex}
          onClose={() => setSelectedReelIndex(null)}
        />
      )}
      <Toaster position="bottom-center" />
    </Layout>
  );
}

// Reels Scroll Swiper Component (on mobile, vertically swipable/scrollable)
function ReelsViewerModal({
  initialIndex,
  onClose,
}: {
  initialIndex: number;
  onClose: () => void;
}) {
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [isMuted, setIsMuted] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<any | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Scroll to the active reel index on mount (mobile only)
  useEffect(() => {
    if (isMobile && containerRef.current) {
      const container = containerRef.current;
      const timer = setTimeout(() => {
        const itemHeight = container.clientHeight;
        container.scrollTop = initialIndex * itemHeight;
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [initialIndex, isMobile]);

  // Handle scrolling to update active index on mobile swipe
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const itemHeight = container.clientHeight;
    if (itemHeight > 0) {
      const index = Math.round(container.scrollTop / itemHeight);
      if (index !== activeIndex && index >= 0 && index < reels.length) {
        setActiveIndex(index);
      }
    }
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : reels.length - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev < reels.length - 1 ? prev + 1 : 0));
  };

  // Sync scroll position when index changes on mobile
  useEffect(() => {
    if (isMobile && containerRef.current) {
      const container = containerRef.current;
      const itemHeight = container.clientHeight;
      if (container.scrollTop !== activeIndex * itemHeight) {
        container.scrollTop = activeIndex * itemHeight;
      }
    }
  }, [activeIndex, isMobile]);

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center animate-in fade-in duration-200">
      {/* Background close trigger */}
      <div className="absolute inset-0 hidden lg:block" onClick={onClose} />

      {/* Desktop Prev Arrow */}
      <button
        onClick={handlePrev}
        className="hidden lg:flex absolute left-8 top-1/2 -translate-y-1/2 z-50 bg-white/15 hover:bg-white/30 text-white h-12 w-12 rounded-full items-center justify-center text-2xl transition duration-200 shadow-lg"
        aria-label="Previous Reel"
      >
        ‹
      </button>

      {/* Desktop Next Arrow */}
      <button
        onClick={handleNext}
        className="hidden lg:flex absolute right-8 top-1/2 -translate-y-1/2 z-50 bg-white/15 hover:bg-white/30 text-white h-12 w-12 rounded-full items-center justify-center text-2xl transition duration-200 shadow-lg"
        aria-label="Next Reel"
      >
        ›
      </button>

      {/* Desktop Close Button (Top Right) */}
      <button
        onClick={onClose}
        className="hidden lg:flex absolute right-6 top-6 z-50 bg-white/15 hover:bg-white/30 text-white h-10 w-10 rounded-full items-center justify-center text-lg transition duration-200 shadow-lg"
        aria-label="Close"
      >
        ✕
      </button>

      {/* Desktop Layout (overlapping cards) */}
      {!isMobile ? (
        <div className="relative w-full max-w-[1200px] h-[85vh] max-h-[750px] flex items-center justify-center overflow-hidden">
          {reels.map((r, idx) => {
            const isActive = idx === activeIndex;
            
            // Calculate relative offset with wrap-around looping
            let offset = idx - activeIndex;
            if (offset < -reels.length / 2) {
              offset += reels.length;
            } else if (offset > reels.length / 2) {
              offset -= reels.length;
            }
            
            const isVisible = Math.abs(offset) <= 1;
            
            return (
              <div
                key={r.caption}
                onClick={() => {
                  if (offset === -1) handlePrev();
                  if (offset === 1) handleNext();
                }}
                style={{
                  transform: `translateX(${offset * 85}%) scale(${isActive ? 1 : 0.82})`,
                  opacity: isVisible ? (isActive ? 1 : 0.35) : 0,
                  zIndex: isActive ? 30 : 10,
                  transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
                  filter: isActive ? "none" : "blur(2.5px)",
                  pointerEvents: isVisible ? "auto" : "none",
                }}
                className={`absolute h-[80vh] max-h-[660px] aspect-[9/19] rounded-[32px] overflow-hidden border border-white/10 shadow-2xl bg-zinc-950 ${
                  !isActive ? "cursor-pointer hover:opacity-50" : ""
                }`}
              >
                <ReelItem
                  reel={r}
                  index={idx}
                  isActive={isActive}
                  isMuted={isMuted}
                  onToggleMute={() => setIsMuted(!isMuted)}
                  onClose={onClose}
                  onQuickView={(p) => setQuickViewProduct(p)}
                />
              </div>
            );
          })}
        </div>
      ) : (
        /* Mobile Layout (Immersive vertical snap scroll) */
        <div
          ref={containerRef}
          onScroll={handleScroll}
          className="w-full h-[100dvh] overflow-y-auto snap-y snap-mandatory scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden relative bg-zinc-950"
        >
          {reels.map((r, idx) => {
            const isActive = idx === activeIndex;
            return (
              <div key={r.caption} className="w-full h-[100dvh] snap-start">
                <ReelItem
                  reel={r}
                  index={idx}
                  isActive={isActive}
                  isMuted={isMuted}
                  onToggleMute={() => setIsMuted(!isMuted)}
                  onClose={onClose}
                  onQuickView={(p) => setQuickViewProduct(p)}
                />
              </div>
            );
          })}
        </div>
      )}

      {/* Quick View Modal Overlay */}
      {quickViewProduct && (
        <QuickViewModal
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
          onCloseReels={onClose}
        />
      )}
    </div>
  );
}

function ReelItem({
  reel,
  index,
  isActive,
  isMuted,
  onToggleMute,
  onClose,
  onQuickView,
}: {
  reel: (typeof reels)[0];
  index: number;
  isActive: boolean;
  isMuted: boolean;
  onToggleMute: () => void;
  onClose: () => void;
  onQuickView: (product: any) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [progress, setProgress] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(8);

  useEffect(() => {
    if (videoRef.current) {
      if (isActive) {
        videoRef.current.currentTime = 0;
        videoRef.current.play().catch((err) => {
          console.log("Video auto-play failed/interrupted:", err);
        });
      } else {
        videoRef.current.pause();
        setProgress(0);
      }
    }
  }, [isActive]);

  const handleTimeUpdate = () => {
    if (videoRef.current && videoRef.current.duration) {
      setProgress((videoRef.current.currentTime / videoRef.current.duration) * 100);
    }
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
    setLikeCount((prev) => (isLiked ? prev - 1 : prev + 1));
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`${window.location.origin}/product/${reel.products[0].code}`);
    toast.success("Product link copied to clipboard!");
  };

  const handleAddToCart = (e: React.MouseEvent, productName: string) => {
    e.stopPropagation();
    toast.success(`Added ${productName} to Cart!`);
  };

  const mainProduct = reel.products[0];
  const off = mainProduct
    ? Math.round(((mainProduct.mrp - mainProduct.price) / mainProduct.mrp) * 100)
    : 0;

  return (
    <div className="snap-start h-full w-full relative flex flex-col justify-between p-4 pb-6 select-none shrink-0 bg-black">
      {/* Background Video */}
      <div className="absolute inset-0 h-full w-full">
        <video
          ref={videoRef}
          src={reel.video}
          loop
          muted={isMuted}
          playsInline
          onTimeUpdate={handleTimeUpdate}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />
      </div>

      {/* Progress Bar */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-white/20 z-30">
        <div
          className="h-full bg-white transition-all duration-75"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Top Bar controls */}
      <div className="relative z-20 flex justify-between items-center w-full mt-2">
        <button
          onClick={onClose}
          className="md:hidden flex h-9 w-9 items-center justify-center rounded-full bg-black/45 hover:bg-black/60 text-white transition duration-200"
          aria-label="Close Reels"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="hidden md:block" />

        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleMute();
          }}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-black/45 hover:bg-black/60 text-white transition duration-200"
          aria-label={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </button>
      </div>

      {/* Bottom overlay details and Actions */}
      <div className="relative z-20 mt-auto flex flex-col gap-4 w-full">
        {/* Like and Share overlays */}
        <div className="flex flex-col items-end gap-5 pr-2">
          <button onClick={handleLike} className="flex flex-col items-center gap-1 group">
            <div
              className={`h-11 w-11 rounded-full flex items-center justify-center transition-all duration-200 ${
                isLiked
                  ? "bg-red-600 text-white scale-110"
                  : "bg-black/45 hover:bg-black/60 text-white"
              }`}
            >
              <Heart className={`h-5 w-5 ${isLiked ? "fill-current" : ""}`} />
            </div>
            <span className="text-[10px] font-bold text-white drop-shadow-md select-none">
              {likeCount}
            </span>
          </button>

          <button onClick={handleShare} className="flex flex-col items-center gap-1 group">
            <div className="h-11 w-11 rounded-full flex items-center justify-center bg-black/45 hover:bg-black/60 text-white transition duration-200">
              <Share2 className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-bold text-white drop-shadow-md select-none">
              Share
            </span>
          </button>
        </div>

        {/* Product Cards Slider */}
        {reel.products && reel.products.length > 0 && (
          <div className="flex gap-2.5 overflow-x-auto pb-2 px-2 snap-x snap-mandatory scrollbar-none [&::-webkit-scrollbar]:hidden w-full scroll-smooth">
            {reel.products.map((p) => {
              const off = Math.round(((p.mrp - p.price) / p.mrp) * 100);
              return (
                <div
                  key={p.code}
                  className="bg-white text-black p-3.5 lg:p-2 rounded-[20px] lg:rounded-xl shadow-xl flex flex-col gap-2.5 lg:gap-1.5 w-[225px] lg:w-[170px] shrink-0 snap-center mx-auto"
                >
                  <Link
                    to="/product/$productId"
                    params={{ productId: p.code }}
                    onClick={onClose}
                    className="flex gap-2.5 lg:gap-1.5 text-left group cursor-pointer"
                  >
                    <div className="h-11 w-11 lg:h-8 lg:w-8 rounded-lg overflow-hidden bg-secondary border border-border/20 shrink-0">
                      <img
                        src={p.img}
                        alt={p.name}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <p className="product-name font-sans font-extrabold text-[11px] lg:text-[9.5px] text-foreground group-hover:text-primary transition-colors truncate leading-tight">
                        {p.name}
                      </p>
                      <div className="mt-1 flex items-baseline gap-1 lg:gap-0.5 flex-wrap">
                        <span className="product-price font-sans font-bold text-xs lg:text-[10px] text-primary">
                          ₹{p.price.toLocaleString("en-IN")}
                        </span>
                        <span className="text-[9px] lg:text-[7.5px] text-muted-foreground line-through ml-1.5 lg:ml-1 font-sans">
                          ₹{p.mrp.toLocaleString("en-IN")}
                        </span>
                        <span className="text-[8px] lg:text-[6.5px] bg-[#3F673F] text-white border border-[#5B8550]/40 px-1 py-0.5 font-bold uppercase rounded ml-1.5 lg:ml-1">
                          {off}% OFF
                        </span>
                      </div>
                    </div>
                  </Link>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onQuickView(p);
                    }}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground py-2 lg:py-1 rounded-lg lg:rounded text-[10px] lg:text-[8.5px] font-bold uppercase tracking-wider text-center w-full block transition-colors duration-200 cursor-pointer"
                  >
                    View Product
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function WatchAndBuy({ onReelClick }: { onReelClick: (index: number) => void }) {
  const scroller = useRef<HTMLDivElement>(null);
  const scrollBy = (dir: 1 | -1) => {
    scroller.current?.scrollBy({ left: dir * 360, behavior: "smooth" });
  };
  return (
    <div className="mx-auto max-w-[1400px] px-6">
        <div className="mb-14 relative text-center">
          <h2 className="serif text-4xl md:text-5xl text-primary-foreground">
            Watch and Buy
          </h2>
          <div className="hidden md:flex gap-2.5 absolute right-0 top-1/2 -translate-y-1/2">
            <button
              onClick={() => scrollBy(-1)}
              aria-label="Previous"
              className="h-10 w-10 grid place-items-center border border-primary-foreground/30 hover:bg-primary-foreground hover:text-primary transition text-lg rounded-full"
            >
              ‹
            </button>
            <button
              onClick={() => scrollBy(1)}
              aria-label="Next"
              className="h-10 w-10 grid place-items-center border border-primary-foreground/30 hover:bg-primary-foreground hover:text-primary transition text-lg rounded-full"
            >
              ›
            </button>
          </div>
        </div>

        <div
          ref={scroller}
          className="flex gap-4 md:gap-5 overflow-x-auto pb-4 snap-x snap-mandatory scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {reels.map((r, index) => {
            const mainProduct = r.products[0];
            const off = mainProduct
              ? Math.round(((mainProduct.mrp - mainProduct.price) / mainProduct.mrp) * 100)
              : 0;
            return (
              <div
                key={r.caption}
                className="shrink-0 w-[43%] md:w-[280px] snap-start flex flex-col cursor-pointer"
                onClick={() => onReelClick(index)}
              >
                <article className="group relative w-full aspect-[9/16] overflow-hidden bg-muted border border-border/20 rounded-2xl md:rounded-3xl">
                  <div className="absolute inset-0 h-full w-full">
                    <video
                      src={r.video}
                      poster={r.img}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-black/30" />
                  <div className="hidden md:block absolute left-3 top-3 text-[10px] uppercase tracking-[0.25em] text-white/90 font-medium">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent mr-1.5 animate-pulse" />
                    Reel
                  </div>
                  <p className="hidden md:block absolute left-4 right-4 top-12 text-white text-xs md:text-sm font-medium drop-shadow leading-snug">
                    {r.caption}
                  </p>

                  <div className="hidden md:block absolute left-3 right-3 bottom-3 translate-y-2 opacity-95 group-hover:translate-y-0 group-hover:opacity-100 transition duration-300">
                    <div className="bg-background/95 backdrop-blur-sm p-4 shadow-lg border border-border/30 rounded-xl">
                      <p className="text-xs leading-snug font-semibold text-center text-primary uppercase tracking-wider">
                        Shop the Look
                      </p>
                    </div>
                  </div>
                </article>

                {mainProduct && (
                  <div className="mt-3 px-1">
                    <p className="product-name font-sans font-extrabold text-xs md:text-sm text-primary-foreground/95 truncate leading-tight">
                      {mainProduct.name}
                    </p>
                    <div className="mt-1 flex items-baseline gap-1.5 flex-wrap">
                      <span className="product-price font-sans font-bold text-xs md:text-sm text-secondary">
                        ₹{mainProduct.price.toLocaleString("en-IN")}
                      </span>
                      <span className="text-[10px] md:text-xs text-primary-foreground/60 line-through font-sans">
                        ₹{mainProduct.mrp.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="mt-1.5">
                      <span className="inline-block text-[9px] font-bold bg-[#3F673F] text-white border border-[#5B8550]/40 px-2 py-0.5 rounded tracking-wide">
                        {off}% off
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
  );
}

function QuickViewModal({
  product,
  onClose,
  onCloseReels,
}: {
  product: any;
  onClose: () => void;
  onCloseReels: () => void;
}) {
  const [cartCount, setCartCount] = useState(2);
  const [qty, setQty] = useState(1);
  const images = product.thumbnails || [product.img];
  const off = product.mrp && product.price ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0;

  const handleAddToCart = () => {
    setQty((prev) => prev + 1);
    setCartCount((prev) => prev + 1);
    toast.success(`Added ${product.name} to Cart!`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-end lg:items-center justify-center p-0 lg:p-4 animate-in fade-in duration-200">
      {/* Background close trigger */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Box */}
      <div className="bg-white text-black lg:rounded-[24px] rounded-t-[24px] rounded-b-none w-full lg:max-w-[380px] p-5.5 shadow-2xl relative flex flex-col gap-4.5 animate-in lg:zoom-in-95 slide-in-from-bottom duration-300 lg:duration-200 z-10 self-end lg:self-center">
        {/* Close Button (Top Right) */}
        <button
          onClick={onClose}
          className="absolute right-4.5 top-4.5 text-gray-400 hover:text-gray-700 transition cursor-pointer"
          aria-label="Close"
        >
          <X className="h-4.5 w-4.5" />
        </button>

        {/* Title */}
        <h3 className="serif text-center text-[15px] font-bold tracking-widest text-primary">
          SHOP NOW
        </h3>

        {/* Image Gallery (Scrollable horizontal list) */}
        <div className="flex gap-3 overflow-x-auto pb-2.5 px-1 snap-x snap-mandatory scrollbar-none [&::-webkit-scrollbar]:hidden scroll-smooth">
          {images.map((imgUrl: string, i: number) => (
            <div
              key={i}
              className="w-[110px] aspect-[2/3.2] shrink-0 snap-center rounded-[18px] overflow-hidden shadow-md border border-gray-100"
            >
              <img
                src={imgUrl}
                alt={`${product.name} view ${i + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>

        {/* Product Details Name & Link */}
        <div className="flex justify-between items-start gap-4 mt-0.5 px-1">
          <h4 className="product-name font-sans font-extrabold text-[13px] text-gray-800 leading-tight">
            {product.name}
          </h4>
          <Link
            to="/product/$productId"
            params={{ productId: product.code }}
            onClick={() => {
              onClose();
              onCloseReels();
            }}
            className="text-gray-400 hover:text-gray-700 transition cursor-pointer shrink-0"
            aria-label="Open detail page"
          >
            <ExternalLink className="h-4 w-4" />
          </Link>
        </div>

        {/* Price Row */}
        <div className="flex items-center gap-3 px-1">
          {product.mrp && (
            <span className="text-[11px] text-gray-400 line-through font-sans">
              ₹{product.mrp.toLocaleString("en-IN")}
            </span>
          )}
          <span className="product-price font-sans font-bold text-sm text-gray-900">
            ₹{product.price.toLocaleString("en-IN")}
          </span>
          {off > 0 && (
            <span className="text-[9px] bg-[#3F673F] text-white border border-[#5B8550]/40 px-2 py-0.5 font-bold uppercase rounded serif tracking-wider">
              {off}% off
            </span>
          )}
        </div>

        {/* Action Buttons Row */}
        <div className="flex items-center gap-2 mt-1 px-1">
          {/* Quantity selector button */}
          <div className="flex-1 border border-primary text-gray-800 rounded-xl h-10 px-3 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-gray-500">
              <ShoppingCart className="h-4 w-4 text-primary" />
            </div>
            <span className="text-xs font-bold text-gray-800">{qty}</span>
            <button
              onClick={handleAddToCart}
              className="bg-primary hover:bg-primary/90 text-white w-5 h-5 flex items-center justify-center rounded-md font-bold text-xs cursor-pointer transition active:scale-95"
            >
              +
            </button>
          </div>

          {/* More Info Link */}
          <Link
            to="/product/$productId"
            params={{ productId: product.code }}
            onClick={() => {
              onClose();
              onCloseReels();
            }}
            className="flex-1 border border-primary text-primary hover:bg-primary/10 py-2.5 rounded-xl text-[9.5px] font-bold uppercase tracking-wider text-center flex items-center justify-center gap-1 transition duration-200 active:scale-95 cursor-pointer h-10"
          >
            MORE INFO <ArrowRight className="h-3 w-3" />
          </Link>

          {/* Cart Shopping Bag Button with Badge */}
          <button
            onClick={handleAddToCart}
            className="h-10 w-10 shrink-0 border border-gray-300 rounded-xl flex items-center justify-center relative hover:bg-gray-50 transition active:scale-95 cursor-pointer"
            aria-label="View Cart"
          >
            <ShoppingBag className="h-4 w-4 text-gray-700" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-primary text-white text-[9px] font-bold h-5 w-5 rounded-full flex items-center justify-center shadow-md animate-in zoom-in duration-200">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
