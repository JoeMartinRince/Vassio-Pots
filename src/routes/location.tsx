import { createFileRoute, Link } from "@tanstack/react-router";
import Layout from "@/components/Layout";
import { MapPin, Clock, Phone, Mail, Navigation } from "lucide-react";

export const Route = createFileRoute("/location")({
  head: () => ({
    meta: [
      { title: "Store Locations & Showrooms — Vassio" },
      {
        name: "description",
        content: "Visit Vassio experience stores and planter showrooms across major cities in India.",
      },
    ],
  }),
  component: LocationPage,
});

export function LocationPage() {
  const stores = [
    {
      city: "New Delhi — Flagship Experience Center",
      address: "Studio 402, Design Quarter, M.G. Road, Sultanpur, New Delhi 110030",
      phone: "+91 98765 43210",
      hours: "10:00 AM – 8:00 PM (Open 7 Days)",
      type: "Flagship Showroom & Garden Studio",
    },
    {
      city: "Mumbai — Design Gallery",
      address: "Unit 12, Raghuvanshi Mills Complex, Lower Parel, Mumbai 400013",
      phone: "+91 98765 43211",
      hours: "10:30 AM – 7:30 PM (Mon – Sat)",
      type: "Boutique Experience Gallery",
    },
    {
      city: "Bengaluru — Indiranagar Studio",
      address: "100 Feet Road, 12th Main Corner, Indiranagar, Bengaluru 560038",
      phone: "+91 98765 43212",
      hours: "10:00 AM – 8:00 PM (Open 7 Days)",
      type: "Planter Experience Lounge",
    },
  ];

  return (
    <Layout>
      <div className="mx-auto max-w-[1400px] px-6 py-12 md:py-16">
        {/* Breadcrumbs */}
        <nav className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground font-semibold mb-8 flex items-center gap-1.5">
          <Link to="/" className="hover:text-foreground transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-foreground">Store Locations</span>
        </nav>

        {/* Heading */}
        <div className="mb-12 border-b border-border/30 pb-8">
          <p className="text-xs uppercase tracking-[0.4em] text-primary font-bold mb-2">Experience Vassio In Person</p>
          <h1 className="serif text-4xl md:text-6xl text-foreground">Showrooms & Store Locations</h1>
          <p className="mt-4 text-sm text-muted-foreground max-w-2xl leading-relaxed">
            Step into our experience centers to feel the textures, inspect the craftsmanship, and consult with our botanical styling specialists.
          </p>
        </div>

        {/* Store Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {stores.map((store, idx) => (
            <div key={idx} className="bg-card border border-border/40 rounded-3xl p-6 md:p-8 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
              <div>
                <span className="text-[10px] text-primary font-bold uppercase tracking-wider block mb-2">{store.type}</span>
                <h3 className="serif text-2xl font-bold text-foreground mb-4">{store.city}</h3>

                <div className="space-y-3.5 text-xs text-muted-foreground">
                  <p className="flex items-start gap-2.5">
                    <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <span>{store.address}</span>
                  </p>
                  <p className="flex items-center gap-2.5">
                    <Clock className="h-4 w-4 text-primary shrink-0" />
                    <span>{store.hours}</span>
                  </p>
                  <p className="flex items-center gap-2.5">
                    <Phone className="h-4 w-4 text-primary shrink-0" />
                    <span>{store.phone}</span>
                  </p>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-border/30">
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(store.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary hover:text-primary/80 transition-colors"
                >
                  <Navigation className="h-3.5 w-3.5" /> Get Directions
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Assistance Card */}
        <div className="bg-secondary/30 border border-border/30 rounded-3xl p-8 text-center max-w-2xl mx-auto">
          <h4 className="serif text-2xl text-foreground mb-2">Can't Visit A Store?</h4>
          <p className="text-xs text-muted-foreground mb-6">
            Our online design consultants are available for video tours and custom size consultations PAN India.
          </p>
          <Link
            to="/contact"
            className="inline-block bg-primary text-white px-8 py-3.5 text-xs font-bold uppercase tracking-[0.2em] rounded-xl shadow-xs hover:bg-primary/95 transition-colors"
          >
            Book Virtual Consultation
          </Link>
        </div>
      </div>
    </Layout>
  );
}
