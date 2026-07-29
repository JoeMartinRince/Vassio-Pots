import { useState, useEffect, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import {
  Search,
  ShoppingBag,
  User,
  Heart,
  Menu,
  X,
  Instagram,
  Facebook,
  Youtube,
  ArrowUpRight,
  ChevronDown,
} from "lucide-react";
import { announcements, logo } from "@/data/products";

export interface NavSubItem {
  label: string;
  href: string;
  search?: Record<string, string>;
}

export interface NavItem {
  label: string;
  href: string;
  search?: Record<string, string>;
  subItems?: NavSubItem[];
}

export const mainNavigationItems: NavItem[] = [
  { label: "Home", href: "/" },
  {
    label: "FRP Pots",
    href: "/shop",
    search: { category: "frp-pots" },
    subItems: [
      { label: "Off-White", href: "/shop", search: { category: "frp-pots", color: "off-white" } },
      { label: "Black", href: "/shop", search: { category: "frp-pots", color: "black" } },
      { label: "Beige", href: "/shop", search: { category: "frp-pots", color: "beige" } },
      { label: "Grey", href: "/shop", search: { category: "frp-pots", color: "grey" } },
      { label: "Other Colors", href: "/shop", search: { category: "frp-pots", color: "other" } },
    ],
  },
  {
    label: "Artificial Plants",
    href: "/shop",
    search: { category: "artificial-plants" },
    subItems: [
      { label: "1 ft", href: "/shop", search: { category: "artificial-plants", height: "1-ft" } },
      { label: "2 ft", href: "/shop", search: { category: "artificial-plants", height: "2-ft" } },
      { label: "3 ft", href: "/shop", search: { category: "artificial-plants", height: "3-ft" } },
      { label: "4 ft", href: "/shop", search: { category: "artificial-plants", height: "4-ft" } },
      { label: "5 ft", href: "/shop", search: { category: "artificial-plants", height: "5-ft" } },
      { label: "6 ft+", href: "/shop", search: { category: "artificial-plants", height: "6-ft-plus" } },
    ],
  },
  { label: "Terracotta Pots", href: "/shop", search: { category: "terracotta-pots" } },
  { label: "Pebbles", href: "/shop", search: { category: "pebbles" } },
  { label: "New Arrivals", href: "/shop", search: { filter: "new-arrivals" } },
  { label: "Track My Order", href: "/track-order" },
  { label: "Locations", href: "/locations" },
  { label: "Contact", href: "/contact" },
];

function FooterTime() {
  const [time, setTime] = useState("");
  useEffect(() => {
    const updateTime = () => {
      const options: Intl.DateTimeFormatOptions = {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
        timeZone: "Asia/Kolkata",
      };
      setTime(new Date().toLocaleTimeString("en-US", options));
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);
  return <span>{time}</span>;
}

export default function Layout({ children }: { children: ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openMobileAccordions, setOpenMobileAccordions] = useState<Record<string, boolean>>({});
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const toggleMobileAccordion = (label: string) => {
    setOpenMobileAccordions((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > 40);

      if (currentScrollY <= 40) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY) {
        setIsVisible(false); // Hide on scroll down
      } else {
        setIsVisible(true); // Show when scrolling towards top
      }
      setLastScrollY(currentScrollY);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Announcement marquee */}
      <div className="bg-announce text-announce-foreground overflow-hidden shrink-0">
        <div className="flex animate-marquee whitespace-nowrap py-2 text-xs tracking-wide">
          {[...announcements, ...announcements, ...announcements, ...announcements].map((a, i) => (
            <span key={i} className="mx-10 inline-flex items-center font-medium">
              <span className="mr-10 opacity-50">◆</span>
              {a}
            </span>
          ))}
        </div>
      </div>

      {/* Header */}
      <header
        className={`shrink-0 sticky top-0 z-40 transition-all duration-300 transform ease-in-out bg-primary text-primary-foreground border-b border-white/10 shadow-md ${
          isVisible ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div
          className={`mx-auto max-w-[1400px] relative flex items-center justify-between px-6 transition-all duration-300 ${
            isScrolled ? "py-3.5" : "py-4 md:py-5"
          }`}
        >
          {/* Left Column */}
          <div className="flex items-center gap-4 z-10">
            {/* Hamburger menu - mobile only */}
            <button
              className="lg:hidden text-primary-foreground hover:text-white transition-colors cursor-pointer"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Open Menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            {/* Search - desktop only */}
            <button
              className="hidden lg:inline-flex items-center gap-2 text-sm text-primary-foreground/90 hover:text-white transition-colors cursor-pointer"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </button>
          </div>

          {/* Centered Logo */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
            <Link to="/" className="flex items-center justify-center">
              <img
                src={logo}
                alt="VASSIO Logo"
                className={`w-auto object-contain brightness-0 invert transition-all duration-300 ${
                  isScrolled ? "h-6 md:h-8" : "h-7 md:h-9"
                }`}
              />
            </Link>
          </div>

          {/* Right Column */}
          <div className="flex items-center gap-4 sm:gap-5 z-10">
            {/* Search - mobile only */}
            <button
              className="lg:hidden text-primary-foreground/90 hover:text-white transition-colors cursor-pointer"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </button>
            {/* Wishlist */}
            <button
              aria-label="Wishlist"
              className="text-primary-foreground/90 hover:text-white transition-colors cursor-pointer"
            >
              <Heart className="h-5 w-5" />
            </button>
            {/* Cart */}
            <button
              aria-label="Cart"
              className="relative text-primary-foreground/90 hover:text-white transition-colors cursor-pointer"
            >
              <ShoppingBag className="h-5 w-5" />
              <span className="absolute -right-2 -top-2 grid h-4 w-4 place-items-center rounded-full text-[10px] font-bold bg-white text-primary shadow-sm">
                0
              </span>
            </button>
          </div>
        </div>

        {/* Nav (Desktop) */}
        {!isScrolled && (
          <nav className="hidden lg:block border-t border-white/15 animate-in fade-in duration-300">
            <ul className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-center gap-x-7 gap-y-2 px-6 py-3.5 text-[11px] md:text-[12px] font-bold uppercase tracking-[0.2em] text-[#1C331C]">
              {mainNavigationItems.map((item) => {
                const hasSub = item.subItems && item.subItems.length > 0;
                return (
                  <li key={item.label} className="relative group py-1">
                    <Link
                      to={item.href}
                      search={item.search}
                      className="inline-flex items-center gap-1.5 hover:text-black transition-colors cursor-pointer py-1 text-[#1C331C] font-bold"
                    >
                      <span>{item.label}</span>
                      {hasSub && (
                        <ChevronDown className="h-3.5 w-3.5 transition-transform duration-200 group-hover:rotate-180 text-[#1C331C] group-hover:text-black" />
                      )}
                    </Link>

                    {hasSub && (
                      <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 ease-out z-50">
                        <ul className="w-48 bg-primary border border-white/25 shadow-xl rounded-xl py-2.5 px-1.5 space-y-1 text-[#1C331C]">
                          {item.subItems!.map((sub) => (
                            <li key={sub.label}>
                              <Link
                                to={sub.href}
                                search={sub.search}
                                className="block px-3.5 py-2 text-[10px] font-bold uppercase tracking-wider text-[#1C331C] hover:text-black hover:bg-white/20 rounded-lg transition-colors"
                              >
                                {sub.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>
        )}
      </header>

      {/* Mobile Drawer Navigation */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden animate-in fade-in duration-200">
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          {/* Drawer content */}
          <div className="relative flex flex-col w-full max-w-[320px] h-full bg-primary text-primary-foreground p-6 shadow-2xl border-r border-white/10 animate-in slide-in-from-left duration-250">
            <div className="flex items-center justify-between pb-6 border-b border-primary-foreground/20">
              <img src={logo} alt="VASSIO Logo" className="h-6 w-auto object-contain brightness-0 invert" />
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-primary-foreground/90 hover:text-white transition-colors cursor-pointer"
                aria-label="Close Menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="mt-6 flex-1 overflow-y-auto pr-1">
              <ul className="space-y-4 text-xs font-semibold uppercase tracking-[0.15em] text-primary-foreground/90">
                {mainNavigationItems.map((item) => {
                  const hasSub = item.subItems && item.subItems.length > 0;
                  const isOpen = !!openMobileAccordions[item.label];
                  return (
                    <li key={item.label} className="border-b border-primary-foreground/15 pb-3">
                      {hasSub ? (
                        <div>
                          <div className="flex items-center justify-between">
                            <Link
                              to={item.href}
                              search={item.search}
                              onClick={() => setIsMobileMenuOpen(false)}
                              className="hover:text-white transition-colors py-1 flex-1 text-primary-foreground"
                            >
                              {item.label}
                            </Link>
                            <button
                              type="button"
                              onClick={() => toggleMobileAccordion(item.label)}
                              className="p-1.5 text-primary-foreground/80 hover:text-white transition-colors cursor-pointer"
                              aria-label={`Toggle ${item.label} sub-navigation`}
                            >
                              <ChevronDown
                                className={`h-4 w-4 transition-transform duration-200 ${
                                  isOpen ? "rotate-180 text-white" : "text-primary-foreground/70"
                                }`}
                              />
                            </button>
                          </div>

                          {isOpen && (
                            <ul className="mt-2.5 ml-3 space-y-2.5 border-l-2 border-primary-foreground/40 pl-3 animate-in fade-in duration-200">
                              {item.subItems!.map((sub) => (
                                <li key={sub.label}>
                                  <Link
                                    to={sub.href}
                                    search={sub.search}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="block text-[11px] font-semibold tracking-wider text-primary-foreground/80 hover:text-white transition-colors py-0.5"
                                  >
                                    {sub.label}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ) : (
                        <Link
                          to={item.href}
                          search={item.search}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="block text-primary-foreground hover:text-white transition-colors py-1"
                        >
                          {item.label}
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div className="border-t border-primary-foreground/20 pt-6 mt-auto">
              <div className="flex justify-center gap-6 text-primary-foreground/80">
                <a href="#" aria-label="Instagram" className="hover:text-white transition-colors">
                  <Instagram className="h-5 w-5" />
                </a>
                <a href="#" aria-label="Facebook" className="hover:text-white transition-colors">
                  <Facebook className="h-5 w-5" />
                </a>
                <a href="#" aria-label="Youtube" className="hover:text-white transition-colors">
                  <Youtube className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main content body */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="bg-background shrink-0 mt-auto px-4 pb-4 md:px-6 md:pb-6">
        <div className="mx-auto max-w-[1400px] bg-primary text-primary-foreground rounded-[32px] md:rounded-[48px] p-6 py-10 md:p-12 lg:p-16 shadow-xl relative overflow-hidden flex flex-col justify-between min-h-[400px]">
          {/* Top Section */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-8 lg:gap-10 items-start">
            {/* Brand Intro */}
            <div className="flex flex-col gap-3 col-span-2 lg:col-span-1">
              <h3 className="serif text-xl md:text-3xl text-primary-foreground leading-snug">
                Vassio brings warmth, craft and calm into your home
              </h3>
              <p className="text-xs text-primary-foreground/75 leading-relaxed max-w-sm">
                Discover handcrafted ceramic pots, minimalist fiber-glass planters, and premium indoor greenery.
              </p>
            </div>

            {/* Explore links */}
            <div className="col-span-1">
              <p className="text-xs uppercase tracking-[0.2em] font-semibold text-primary-foreground/50 mb-3">Explore</p>
              <ul className="space-y-2 text-xs md:text-sm font-semibold">
                <li>
                  <Link to="/" className="text-primary-foreground/85 hover:text-white transition-colors">
                    Home
                  </Link>
                </li>
                <li>
                  <Link to="/shop" className="text-primary-foreground/85 hover:text-white transition-colors">
                    Shop
                  </Link>
                </li>
                <li>
                  <Link to="/shop" search={{ category: "plants" }} className="text-primary-foreground/85 hover:text-white transition-colors">
                    Plants
                  </Link>
                </li>
                <li>
                  <Link to="/shop" search={{ category: "vases" }} className="text-primary-foreground/85 hover:text-white transition-colors">
                    Vases
                  </Link>
                </li>
                <li>
                  <a href="#" className="text-primary-foreground/85 hover:text-white transition-colors">
                    FAQs & Support
                  </a>
                </li>
              </ul>
            </div>

            {/* Follow Us (social pills) */}
            <div className="col-span-1">
              <p className="text-xs uppercase tracking-[0.2em] font-semibold text-primary-foreground/50 mb-3">Follow us</p>
              <div className="flex flex-col gap-2 w-fit">
                <a
                  href="#"
                  className="inline-flex items-center gap-1.5 bg-secondary/10 hover:bg-secondary/20 px-3 py-1 rounded-full text-[11px] font-semibold transition duration-200 text-primary-foreground/90 border border-primary-foreground/10"
                >
                  <Instagram className="h-3 w-3" /> @vassiopots
                </a>
                <a
                  href="#"
                  className="inline-flex items-center gap-1.5 bg-secondary/10 hover:bg-secondary/20 px-3 py-1 rounded-full text-[11px] font-semibold transition duration-200 text-primary-foreground/90 border border-primary-foreground/10"
                >
                  <Facebook className="h-3 w-3" /> @vassio
                </a>
                <a
                  href="#"
                  className="inline-flex items-center gap-1.5 bg-secondary/10 hover:bg-secondary/20 px-3 py-1 rounded-full text-[11px] font-semibold transition duration-200 text-primary-foreground/90 border border-primary-foreground/10"
                >
                  <Youtube className="h-3 w-3" /> @vassio_decor
                </a>
              </div>
            </div>

            {/* Quick Actions (Call/Newsletter) */}
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-4 col-span-2 lg:col-span-1 w-full">
              <div>
                <a
                  href="tel:+9100000000"
                  className="group inline-flex items-center justify-between w-full border-b border-primary-foreground/20 pb-2 hover:border-primary-foreground transition duration-300"
                >
                  <div>
                    <p className="text-xs md:text-sm font-semibold group-hover:text-white transition-colors">Call Vassio</p>
                    <p className="text-[10px] text-primary-foreground/60 mt-0.5 hidden xs:block">Let's decorate</p>
                  </div>
                  <div className="h-6 w-6 rounded-full bg-secondary text-foreground grid place-items-center group-hover:scale-110 transition duration-300 shadow-sm">
                    <ArrowUpRight className="h-3 w-3 text-primary" />
                  </div>
                </a>
              </div>

              <div>
                <Link
                  to="/shop"
                  className="group inline-flex items-center justify-between w-full border-b border-primary-foreground/20 pb-2 hover:border-primary-foreground transition duration-300"
                >
                  <div>
                    <p className="text-xs md:text-sm font-semibold group-hover:text-white transition-colors">Shop Collections</p>
                    <p className="text-[10px] text-primary-foreground/60 mt-0.5 hidden xs:block">Minimalist designs</p>
                  </div>
                  <div className="h-6 w-6 rounded-full bg-secondary text-foreground grid place-items-center group-hover:scale-110 transition duration-300 shadow-sm">
                    <ArrowUpRight className="h-3 w-3 text-primary" />
                  </div>
                </Link>
              </div>
            </div>
          </div>

          {/* Giant Cutout Logo */}
          <div className="mt-6 select-none pointer-events-none w-full text-center">
            <span className="font-sans font-black tracking-tighter text-[14vw] lg:text-[13vw] leading-none uppercase opacity-10 text-primary-foreground block">
              vassio
            </span>
          </div>

          {/* Bottom Footer Info */}
          <div className="mt-6 pt-4 border-t border-primary-foreground/10 flex flex-col sm:flex-row justify-between items-center gap-2.5 text-[10px] md:text-xs text-primary-foreground/50">
            <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
              <span>© {new Date().getFullYear()} Vassio. All rights reserved.</span>
              <span className="hidden sm:inline">•</span>
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            </div>
            <div className="flex items-center gap-1">
              <span>India</span>
              <span>•</span>
              <FooterTime />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
