import { createFileRoute, Link } from "@tanstack/react-router";
import Layout from "@/components/Layout";
import { Package, Search, Truck, CheckCircle2, Clock } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/track-order")({
  head: () => ({
    meta: [
      { title: "Track My Order — Vassio" },
      {
        name: "description",
        content: "Track your Vassio planter and home decor order in real time.",
      },
    ],
  }),
  component: TrackOrderPage,
});

function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState("");
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [trackingResult, setTrackingResult] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber.trim()) {
      toast.error("Please enter your Order ID or AWB Tracking Number.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setTrackingResult({
        orderId: orderNumber.trim().toUpperCase(),
        status: "In Transit",
        estimatedDelivery: "3-5 Working Days",
        carrier: "Express Courier PAN India",
        items: "FRP Planters Set",
        steps: [
          { title: "Order Confirmed", date: "Yesterday, 2:30 PM", completed: true },
          { title: "Packed & Quality Checked", date: "Today, 10:15 AM", completed: true },
          { title: "Dispatched & In Transit", date: "Today, 1:45 PM", completed: true },
          { title: "Out for Delivery", date: "Expected Soon", completed: false },
          { title: "Delivered", date: "Pending", completed: false },
        ],
      });
      toast.success("Order status retrieved!");
    }, 600);
  };

  return (
    <Layout>
      <div className="mx-auto max-w-[1000px] px-6 py-12 md:py-16">
        {/* Breadcrumbs */}
        <nav className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground font-semibold mb-8 flex items-center gap-1.5">
          <Link to="/" className="hover:text-foreground transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-foreground">Track Order</span>
        </nav>

        {/* Heading */}
        <div className="text-center max-w-xl mx-auto mb-12">
          <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
            <Package className="h-6 w-6" />
          </div>
          <p className="text-xs uppercase tracking-[0.4em] text-primary font-bold mb-2">Real-Time Updates</p>
          <h1 className="serif text-4xl md:text-5xl text-foreground">Track Your Order</h1>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
            Enter your Order ID (e.g. <span className="font-mono font-semibold">VAS-9082</span>) or Tracking Number to check shipment progress.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-card border border-border/40 rounded-3xl p-6 md:p-10 shadow-sm mb-12 max-w-2xl mx-auto">
          <form onSubmit={handleTrack} className="space-y-5">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-foreground block mb-2">
                Order ID / AWB Tracking Number *
              </label>
              <input
                type="text"
                placeholder="e.g. VAS-9082"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                className="w-full px-4 py-3 border border-border/50 rounded-xl text-sm font-medium bg-background focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-foreground block mb-2">
                Email Address or Phone Number (Optional)
              </label>
              <input
                type="text"
                placeholder="registered@email.com"
                value={emailOrPhone}
                onChange={(e) => setEmailOrPhone(e.target.value)}
                className="w-full px-4 py-3 border border-border/50 rounded-xl text-sm font-medium bg-background focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/95 text-white py-4 text-xs uppercase tracking-[0.2em] font-bold rounded-xl shadow-sm transition cursor-pointer flex items-center justify-center gap-2"
            >
              {loading ? (
                "Retrieving Details..."
              ) : (
                <>
                  <Search className="h-4 w-4" /> Track Order Status
                </>
              )}
            </button>
          </form>
        </div>

        {/* Tracking Results View */}
        {trackingResult && (
          <div className="bg-background border border-primary/20 rounded-3xl p-6 md:p-8 shadow-md animate-in fade-in duration-300 max-w-2xl mx-auto">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-border/30">
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Order ID</p>
                <p className="serif text-2xl font-bold text-foreground">{trackingResult.orderId}</p>
              </div>
              <div className="text-right">
                <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5">
                  <Truck className="h-3.5 w-3.5" /> {trackingResult.status}
                </span>
                <p className="text-[11px] text-muted-foreground mt-1">Est. Delivery: {trackingResult.estimatedDelivery}</p>
              </div>
            </div>

            <div className="mt-8 space-y-6">
              {trackingResult.steps.map((step: any, idx: number) => (
                <div key={idx} className="flex items-start gap-4">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                        step.completed
                          ? "bg-primary text-white"
                          : "bg-muted text-muted-foreground border border-border"
                      }`}
                    >
                      {step.completed ? <CheckCircle2 className="h-4 w-4" /> : <Clock className="h-3.5 w-3.5" />}
                    </div>
                    {idx < trackingResult.steps.length - 1 && (
                      <div className={`w-0.5 h-10 ${step.completed ? "bg-primary" : "bg-border"}`} />
                    )}
                  </div>
                  <div>
                    <p className={`text-sm font-bold ${step.completed ? "text-foreground" : "text-muted-foreground"}`}>
                      {step.title}
                    </p>
                    <p className="text-xs text-muted-foreground">{step.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
