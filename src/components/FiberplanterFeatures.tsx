import React from "react";
import { Award } from "lucide-react";

import uvProtectedImg from "@/assets/features/uv-protected.jpg";
import durableImg from "@/assets/features/durable.jpg";
import lightweightImg from "@/assets/features/lightweight.jpg";
import frostResistantImg from "@/assets/features/frost-resistant.jpg";
import indoorOutdoorImg from "@/assets/features/indoor-outdoor.jpg";
import handmadeImg from "@/assets/features/handmade.jpg";
import makeInIndiaImg from "@/assets/features/make-in-india.jpg";
import fadeResistantImg from "@/assets/features/fade-resistant.jpg";
import customizedDesignImg from "@/assets/features/customized-design.jpg";
import lowMaintenanceImg from "@/assets/features/low-maintenance.jpg";
import colorOptionsImg from "@/assets/features/color-options.jpg";
import waterResistantImg from "@/assets/features/water-resistant.jpg";

interface Feature {
  id: string;
  title: string;
  image: string;
  category: "durability" | "craft" | "convenience";
}

const features: Feature[] = [
  {
    id: "uv-protected",
    title: "UV Protected",
    image: uvProtectedImg,
    category: "durability",
  },
  {
    id: "durable",
    title: "Durable",
    image: durableImg,
    category: "durability",
  },
  {
    id: "light-weight",
    title: "Light Weight",
    image: lightweightImg,
    category: "convenience",
  },
  {
    id: "frost-resistant",
    title: "Frost Resistant",
    image: frostResistantImg,
    category: "durability",
  },
  {
    id: "indoor-outdoor",
    title: "Indoor & Outdoor",
    image: indoorOutdoorImg,
    category: "convenience",
  },
  {
    id: "handmade",
    title: "Handmade",
    image: handmadeImg,
    category: "craft",
  },
  {
    id: "make-in-india",
    title: "Made in India",
    image: makeInIndiaImg,
    category: "craft",
  },
  {
    id: "fade-resistant",
    title: "Fade Resistant",
    image: fadeResistantImg,
    category: "durability",
  },
  {
    id: "customized-design",
    title: "Customized Design",
    image: customizedDesignImg,
    category: "craft",
  },
  {
    id: "low-maintenance",
    title: "Low Maintenance",
    image: lowMaintenanceImg,
    category: "convenience",
  },
  {
    id: "color-options",
    title: "Color options",
    image: colorOptionsImg,
    category: "craft",
  },
  {
    id: "water-resistant",
    title: "Water Resistant",
    image: waterResistantImg,
    category: "durability",
  },
];

export function FiberplanterFeatures() {
  const [activeTab, setActiveTab] = React.useState<"all" | "durability" | "craft" | "convenience">("all");

  const filteredFeatures = features.filter(
    (f) => activeTab === "all" || f.category === activeTab
  );

  return (
    <section className="bg-gradient-to-b from-background via-card/40 to-background border-t border-b border-border/40 py-16 md:py-24 relative overflow-hidden">
      {/* Ambient background blur glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#739D30]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="mx-auto max-w-[1300px] px-4 sm:px-6 relative z-10">
        {/* Section Header */}
        <div className="mb-12 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#739D30]/10 border border-[#739D30]/25 text-[#739D30] text-[11px] font-bold uppercase tracking-[0.2em] mb-4 shadow-sm">
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
              { id: "all", label: "All Benefits (12)" },
              { id: "durability", label: "Durability & Weather" },
              { id: "craft", label: "Artisan Craftsmanship" },
              { id: "convenience", label: "Care & Convenience" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 text-[11px] uppercase tracking-wider font-bold rounded-full transition-all duration-300 cursor-pointer ${
                  activeTab === tab.id
                    ? "bg-[#739D30] text-white shadow-md shadow-[#739D30]/25 scale-105"
                    : "bg-white text-muted-foreground hover:bg-muted/80 hover:text-foreground border border-border/50 shadow-sm"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Feature Grid: 2-column on mobile, 3-column on tablet, 4-column on desktop */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8 max-w-5xl mx-auto">
          {filteredFeatures.map((item) => (
            <div
              key={item.id}
              className="flex flex-col items-center text-center group cursor-pointer"
            >
              {/* Image Container with 16px rounded corners, 1:1 square ratio, soft shadow */}
              <div className="w-full aspect-square rounded-[16px] overflow-hidden shadow-sm group-hover:shadow-md border border-border/30 bg-muted transition-all duration-500">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>

              {/* Title using Manrope Bold (700) and Brand Green #739D30 */}
              <h3 className="font-sans font-bold text-[#739D30] text-sm sm:text-base mt-3.5 tracking-wide leading-snug group-hover:opacity-90 transition-opacity">
                {item.title}
              </h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default FiberplanterFeatures;
