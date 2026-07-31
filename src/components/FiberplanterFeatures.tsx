import React from "react";
import {
  Sun,
  ShieldCheck,
  Feather,
  Snowflake,
  Home,
  Sparkles,
  Award,
  Palette,
  Sliders,
  CheckCircle2,
  Wrench,
} from "lucide-react";

interface Feature {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ReactNode;
  category: "durability" | "craft" | "convenience";
}

// Custom Make in India Lion Silhouette SVG (40px size, primary green)
function MakeInIndiaIcon({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 60"
      fill="currentColor"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Make in India Lion Logo"
    >
      <path d="M92 28c-1.2-1.5-2.8-2.6-4.5-3.1 1-1.8 1.4-3.9 1.1-6-.4-2.8-2.2-5.1-4.8-6.1-1.2-.5-2.5-.6-3.8-.5-.8-2.2-2.5-4-4.7-4.9-2.6-1.1-5.6-.8-8 .7-1.4-1.9-3.6-3.1-6-3.3-2.9-.2-5.7 1-7.5 3.2-1.5-.9-3.3-1.3-5.1-1.1-2.4.3-4.6 1.6-6 3.6-1.8-1.2-4.1-1.6-6.4-1.1-2.6.6-4.8 2.4-5.8 4.8-1.5-.6-3.2-.7-4.8-.2-2.3.7-4.1 2.4-5 4.7-1.7-.3-3.5 0-5 1-2 1.3-3.3 3.4-3.6 5.8-.3 2.1.3 4.2 1.5 5.9-1.5 1.5-2.3 3.6-2.2 5.7.1 2.5 1.4 4.7 3.4 6 0 1.2.4 2.4 1.1 3.4 1.4 2 3.6 3.2 6.1 3.3.8 1.8 2.3 3.2 4.2 3.9 2.3.9 4.9.7 7-.5 1.2 1.6 3.1 2.7 5.1 2.9 2.5.2 4.9-.7 6.6-2.4 1.5 1.2 3.4 1.7 5.3 1.5 2.5-.3 4.7-1.7 6-3.8 1.6 1.1 3.6 1.5 5.6 1.1 2.4-.5 4.4-2.1 5.4-4.3 1.6.8 3.5.9 5.2.3 2.3-.8 4-2.6 4.7-4.9 1.8.3 3.7-.2 5.1-1.3 2-1.5 3.1-3.8 3.1-6.3.1-2.2-.8-4.4-2.4-5.9zM22 26c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2 2zm48 18H30v-2h40v2zm6-6H24v-2h50v2zm4-6H20v-2h58v2zm-2-6H22v-2h54v2z" />
    </svg>
  );
}

const features: Feature[] = [
  {
    id: "uv-protected",
    title: "UV Protected",
    subtitle: "Sun & Heat Shield",
    description: "Resists intense solar radiation without yellowing, cracking, or surface degradation.",
    icon: <Sun className="w-10 h-10 stroke-[1.75]" />,
    category: "durability",
  },
  {
    id: "durable",
    title: "Durable & Tough",
    subtitle: "Impact Resistant",
    description: "Fiber-reinforced composite structure provides lifetime strength against accidental drops.",
    icon: <ShieldCheck className="w-10 h-10 stroke-[1.75]" />,
    category: "durability",
  },
  {
    id: "light-weight",
    title: "Light Weight",
    subtitle: "70% Lighter Than Concrete",
    description: "Ultra-light design makes moving and rearranging floor planters effortless.",
    icon: <Feather className="w-10 h-10 stroke-[1.75]" />,
    category: "convenience",
  },
  {
    id: "frost-resistant",
    title: "Frost Resistant",
    subtitle: "Sub-Zero Weatherproof",
    description: "Endures freezing temperatures, ice, and extreme thermal shock without fracturing.",
    icon: <Snowflake className="w-10 h-10 stroke-[1.75]" />,
    category: "durability",
  },
  {
    id: "indoor-outdoor",
    title: "Indoor & Outdoor",
    subtitle: "All-Space Versatility",
    description: "Seamless aesthetic ideal for living rooms, sunlit balconies, gardens & commercial lounges.",
    icon: <Home className="w-10 h-10 stroke-[1.75]" />,
    category: "convenience",
  },
  {
    id: "handmade",
    title: "Handmade",
    subtitle: "Artisan Sculpted",
    description: "Hand-finished by skilled craftsmen for smooth, organic tactile luxury.",
    icon: <Sparkles className="w-10 h-10 stroke-[1.75]" />,
    category: "craft",
  },
  {
    id: "make-in-india",
    title: "Make in India",
    subtitle: "100% Indigenous Quality",
    description: "Proudly designed and manufactured locally using premium architectural-grade materials.",
    icon: <MakeInIndiaIcon className="w-10 h-10" />,
    category: "craft",
  },
  {
    id: "fade-resistant",
    title: "Fade Resistant",
    subtitle: "Color-Lock Coatings",
    description: "UV-stabilized pigments preserve deep matte and smooth satin colors for years.",
    icon: <Palette className="w-10 h-10 stroke-[1.75]" />,
    category: "durability",
  },
  {
    id: "customized-design",
    title: "Customized Design",
    subtitle: "Architectural Bespoke",
    description: "Tailored dimensions, custom color matching, and textures available for projects.",
    icon: <Sliders className="w-10 h-10 stroke-[1.75]" />,
    category: "craft",
  },
  {
    id: "low-maintenance",
    title: "Low Maintenance",
    subtitle: "Stain & Water Resistant",
    description: "Non-porous surface resists soil stains and wipes clean easily in seconds.",
    icon: <Wrench className="w-10 h-10 stroke-[1.75]" />,
    category: "convenience",
  },
];

export function FiberplanterFeatures() {
  const [activeTab, setActiveTab] = React.useState<"all" | "durability" | "craft" | "convenience">("all");

  const filteredFeatures = features.filter(
    (f) => activeTab === "all" || f.category === activeTab
  );

  return (
    <section className="bg-gradient-to-b from-background via-card/50 to-background border-t border-b border-border/40 py-16 md:py-24 relative overflow-hidden">
      {/* Ambient background blur glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#7FA93A]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 relative z-10">
        {/* Section Header */}
        <div className="mb-12 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#7FA93A]/10 border border-[#7FA93A]/25 text-[#7FA93A] text-[11px] font-bold uppercase tracking-[0.2em] mb-4 shadow-sm">
            <Award className="w-3.5 h-3.5" />
            <span>Architectural Excellence</span>
          </div>

          <h2 className="serif text-3xl sm:text-4xl md:text-5xl text-foreground tracking-wide font-extrabold text-center">
            The Vassio Difference
          </h2>

          <p className="mt-4 text-muted-foreground text-xs sm:text-sm md:text-base leading-relaxed max-w-2xl mx-auto font-sans font-medium text-center">
            Engineered with high-tensile fiberglass composite and handcrafted by master artisans—delivering lightweight convenience, lifetime durability, and weather resilience.
          </p>

          {/* Category Filter Pills */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            {[
              { id: "all", label: "All Benefits (10)" },
              { id: "durability", label: "Durability & Weather" },
              { id: "craft", label: "Artisan Craftsmanship" },
              { id: "convenience", label: "Care & Convenience" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 text-[11px] uppercase tracking-wider font-bold rounded-full transition-all duration-300 cursor-pointer ${
                  activeTab === tab.id
                    ? "bg-[#7FA93A] text-white shadow-md shadow-[#7FA93A]/25 scale-105"
                    : "bg-white text-muted-foreground hover:bg-muted/80 hover:text-foreground border border-border/50 shadow-sm"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Mobile Layout: Clean 2-column icon + label grid (No Cards) */}
        <div className="grid lg:hidden grid-cols-2 gap-y-9 gap-x-4 max-w-lg mx-auto py-3">
          {filteredFeatures.map((item) => (
            <div key={item.id} className="flex flex-col items-center text-center px-2">
              <div className="text-[#7FA93A] flex items-center justify-center mb-3">
                {item.icon}
              </div>
              <h3 className="font-sans font-semibold text-foreground text-xs sm:text-sm tracking-wide leading-snug">
                {item.title}
              </h3>
              <p className="text-[10px] text-muted-foreground mt-1 font-sans font-medium opacity-90 leading-tight">
                {item.subtitle}
              </p>
            </div>
          ))}
        </div>

        {/* Desktop Layout: 5-column white card grid (Unchanged) */}
        <div className="hidden lg:grid grid-cols-5 gap-5">
          {filteredFeatures.map((item) => (
            <div
              key={item.id}
              className="group relative bg-white border border-border/50 hover:border-[#7FA93A]/40 rounded-2xl p-5 sm:p-6 transition-all duration-300 hover:-translate-y-1 shadow-sm hover:shadow-md flex flex-col justify-between"
            >
              <div>
                {/* Feature Icon - Primary Brand Green #7FA93A, 40px */}
                <div className="text-[#7FA93A] mb-4 sm:mb-5 transition-transform duration-300 group-hover:scale-105 flex items-center justify-start">
                  {item.icon}
                </div>

                {/* Title - Manrope SemiBold */}
                <h3 className="font-sans font-semibold text-foreground text-base sm:text-lg tracking-wide group-hover:text-[#7FA93A] transition-colors duration-200 leading-snug">
                  {item.title}
                </h3>

                {/* Subtitle */}
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#7FA93A] mt-1 opacity-90 font-sans">
                  {item.subtitle}
                </p>

                {/* Description */}
                <p className="mt-2.5 text-[11px] sm:text-xs text-muted-foreground leading-relaxed font-sans font-medium">
                  {item.description}
                </p>
              </div>

              {/* Card Footer Tag */}
              <div className="mt-5 pt-3 border-t border-border/30 flex items-center justify-between text-[9px] text-muted-foreground/70 font-sans uppercase tracking-widest font-semibold">
                <span>VASSIO</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-[#7FA93A]/50 group-hover:text-[#7FA93A] transition-colors" />
              </div>
            </div>
          ))}
        </div>

        {/* Feature Comparison Banner */}
        <div className="mt-12 md:mt-16 bg-white border border-border/50 rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center divide-y md:divide-y-0 md:divide-x divide-border/40">
            <div className="pt-3 md:pt-0 md:px-4">
              <span className="serif text-2xl sm:text-3xl font-extrabold text-[#7FA93A] block">70% Lighter</span>
              <p className="text-xs text-muted-foreground mt-1 font-sans font-medium">Compared to heavy concrete & terracotta</p>
            </div>
            <div className="pt-4 md:pt-0 md:px-4">
              <span className="serif text-2xl sm:text-3xl font-extrabold text-[#7FA93A] block">10x Tougher</span>
              <p className="text-xs text-muted-foreground mt-1 font-sans font-medium">Shatterproof & high impact resistance</p>
            </div>
            <div className="pt-4 md:pt-0 md:px-4">
              <span className="serif text-2xl sm:text-3xl font-extrabold text-[#7FA93A] block">100% Weatherproof</span>
              <p className="text-xs text-muted-foreground mt-1 font-sans font-medium">UV protected & sub-zero frost resistant</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default FiberplanterFeatures;
