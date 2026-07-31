import React from "react";
import {
  ShieldCheck,
  Feather,
  Snowflake,
  Home,
  Sparkles,
  Palette,
  Sliders,
  Award,
  Sun,
  Wrench,
  CheckCircle2,
} from "lucide-react";

interface Feature {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ReactNode;
  category: "durability" | "craft" | "convenience";
}

// Custom Make in India Lion Silhouette SVG
function MakeInIndiaIcon({ className = "w-6 h-6" }: { className?: string }) {
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

// Custom UV Protection Shield SVG
function UVShieldIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M9 10h1.5a1.5 1.5 0 0 0 0-3H9v6" />
      <path d="M13 7l1.5 6L16 7" />
    </svg>
  );
}

// Custom Low Maintenance Icon
function LowMaintenanceIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 2v4" />
      <path d="M12 18v4" />
      <path d="M4.93 4.93l2.83 2.83" />
      <path d="M16.24 16.24l2.83 2.83" />
      <path d="M2 12h4" />
      <path d="M18 12h4" />
      <path d="M4.93 19.07l2.83-2.83" />
      <path d="M16.24 7.76l2.83-2.83" />
      <circle cx="12" cy="12" r="4" />
    </svg>
  );
}

const features: Feature[] = [
  {
    id: "uv-protected",
    title: "UV Protected",
    subtitle: "Sun & Heat Shield",
    description: "Resists intense solar radiation without yellowing, cracking, or surface degradation.",
    icon: <UVShieldIcon className="w-6 h-6" />,
    category: "durability",
  },
  {
    id: "durable",
    title: "Durable & Tough",
    subtitle: "Impact Resistant",
    description: "Fiber-reinforced composite structure provides lifetime strength against accidental drops.",
    icon: <ShieldCheck className="w-6 h-6" />,
    category: "durability",
  },
  {
    id: "light-weight",
    title: "Light Weight",
    subtitle: "70% Lighter Than Concrete",
    description: "Ultra-light design makes moving and rearranging floor planters effortless.",
    icon: <Feather className="w-6 h-6" />,
    category: "convenience",
  },
  {
    id: "frost-resistant",
    title: "Frost Resistant",
    subtitle: "Sub-Zero Weatherproof",
    description: "Endures freezing temperatures, ice, and extreme thermal shock without fracturing.",
    icon: <Snowflake className="w-6 h-6" />,
    category: "durability",
  },
  {
    id: "indoor-outdoor",
    title: "Indoor & Outdoor",
    subtitle: "All-Space Versatility",
    description: "Seamless aesthetic ideal for living rooms, sunlit balconies, gardens & commercial lounges.",
    icon: <Home className="w-6 h-6" />,
    category: "convenience",
  },
  {
    id: "handmade",
    title: "Handmade",
    subtitle: "Artisan Sculpted",
    description: "Hand-finished by skilled craftsmen for smooth, organic tactile luxury.",
    icon: <Sparkles className="w-6 h-6" />,
    category: "craft",
  },
  {
    id: "make-in-india",
    title: "Make in India",
    subtitle: "100% Indigenous Quality",
    description: "Proudly designed and manufactured locally using premium architectural-grade materials.",
    icon: <MakeInIndiaIcon className="w-6 h-6" />,
    category: "craft",
  },
  {
    id: "fade-resistant",
    title: "Fade Resistant",
    subtitle: "Color-Lock Coatings",
    description: "UV-stabilized pigments preserve deep matte and smooth satin colors for years.",
    icon: <Palette className="w-6 h-6" />,
    category: "durability",
  },
  {
    id: "customized-design",
    title: "Customized Design",
    subtitle: "Architectural Bespoke",
    description: "Tailored dimensions, custom color matching, and textures available for projects.",
    icon: <Sliders className="w-6 h-6" />,
    category: "craft",
  },
  {
    id: "low-maintenance",
    title: "Low Maintenance",
    subtitle: "Stain & Water Resistant",
    description: "Non-porous surface resists soil stains and wipes clean easily in seconds.",
    icon: <LowMaintenanceIcon className="w-6 h-6" />,
    category: "convenience",
  },
];

export function FiberplanterFeatures() {
  const [activeTab, setActiveTab] = React.useState<"all" | "durability" | "craft" | "convenience">("all");

  const filteredFeatures = features.filter(
    (f) => activeTab === "all" || f.category === activeTab
  );

  return (
    <section className="bg-gradient-to-b from-background via-card/60 to-background border-t border-b border-border/40 py-16 md:py-24 relative overflow-hidden">
      {/* Ambient background blur glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#7FA93A]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 relative z-10">
        {/* Section Header */}
        <div className="mb-12 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#7FA93A]/10 border border-[#7FA93A]/25 text-[#7FA93A] text-[11px] font-bold uppercase tracking-[0.2em] mb-4 shadow-sm">
            <Award className="w-3.5 h-3.5" />
            <span>Architectural Excellence</span>
          </div>

          <h2 className="serif text-3xl sm:text-4xl md:text-5xl text-foreground tracking-wide font-extrabold">
            What Makes Fiberplanters Different?
          </h2>

          <p className="mt-4 text-muted-foreground text-xs sm:text-sm md:text-base leading-relaxed max-w-2xl mx-auto font-sans font-medium">
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
                    : "bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground border border-border/50"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Feature Cards Grid (2-column on mobile, 5-column on desktop) */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-5">
          {filteredFeatures.map((item) => (
            <div
              key={item.id}
              className="group relative bg-background/90 backdrop-blur-sm border border-border/60 hover:border-[#7FA93A]/50 rounded-2xl p-4 sm:p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#7FA93A]/10 flex flex-col justify-between"
            >
              <div>
                {/* Icon Badge */}
                <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-xl bg-[#7FA93A]/10 text-[#7FA93A] group-hover:bg-[#7FA93A] group-hover:text-white transition-all duration-300 flex items-center justify-center mb-3.5 border border-[#7FA93A]/20 group-hover:border-[#7FA93A] shadow-sm">
                  {item.icon}
                </div>

                {/* Title */}
                <h3 className="font-bold text-foreground text-sm sm:text-base tracking-wide font-sans group-hover:text-[#7FA93A] transition-colors duration-200 leading-snug">
                  {item.title}
                </h3>

                {/* Subtitle */}
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#7FA93A] mt-1 opacity-90">
                  {item.subtitle}
                </p>

                {/* Description */}
                <p className="mt-2.5 text-[11px] sm:text-xs text-muted-foreground leading-relaxed font-sans font-medium">
                  {item.description}
                </p>
              </div>

              {/* Card Footer Tag */}
              <div className="mt-4 pt-2.5 border-t border-border/30 flex items-center justify-between text-[9px] text-muted-foreground/70 font-sans uppercase tracking-widest font-semibold">
                <span>VASSIO</span>
                <CheckCircle2 className="w-3 h-3 text-[#7FA93A]/50 group-hover:text-[#7FA93A] transition-colors" />
              </div>
            </div>
          ))}
        </div>

        {/* Feature Comparison Banner */}
        <div className="mt-12 md:mt-16 bg-card/90 border border-border/60 rounded-3xl p-6 sm:p-8 shadow-sm">
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
