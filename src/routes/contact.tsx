import { createFileRoute, Link } from "@tanstack/react-router";
import Layout from "@/components/Layout";
import { Mail, Phone, MapPin, Send, MessageSquare, Clock } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Us & Support — Vassio" },
      {
        name: "description",
        content: "Get in touch with Vassio for product inquiries, custom size orders, and order assistance.",
      },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "General Inquiry",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      toast.success("Thank you for reaching out! Our team will respond within 24 hours.");
      setFormData({ name: "", email: "", phone: "", subject: "General Inquiry", message: "" });
    }, 600);
  };

  return (
    <Layout>
      <div className="mx-auto max-w-[1400px] px-6 py-12 md:py-16">
        {/* Breadcrumbs */}
        <nav className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground font-semibold mb-8 flex items-center gap-1.5">
          <Link to="/" className="hover:text-foreground transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-foreground">Contact Us</span>
        </nav>

        {/* Heading */}
        <div className="mb-12 border-b border-border/30 pb-8">
          <p className="text-xs uppercase tracking-[0.4em] text-primary font-bold mb-2">We're Here To Help</p>
          <h1 className="serif text-4xl md:text-6xl text-foreground">Contact Vassio</h1>
          <p className="mt-4 text-sm text-muted-foreground max-w-2xl leading-relaxed">
            Have questions about planter dimensions, custom color options, trade orders, or delivery status? Send us a message and our design team will assist you.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Contact Details Column */}
          <div className="lg:col-span-5 space-y-8">
            <div className="bg-card border border-border/40 rounded-3xl p-6 md:p-8 space-y-6 shadow-xs">
              <h3 className="serif text-2xl font-bold text-foreground">Direct Support</h3>

              <div className="space-y-5 text-xs text-muted-foreground">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary/10 text-primary rounded-xl shrink-0">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-bold text-foreground text-xs uppercase tracking-wider mb-0.5">Phone Support</p>
                    <p>+91 98765 43210 / +91 98765 43211</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Mon – Sat, 9:30 AM – 7:00 PM IST</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary/10 text-primary rounded-xl shrink-0">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-bold text-foreground text-xs uppercase tracking-wider mb-0.5">Email Support</p>
                    <p>care@vassio.com / support@vassio.com</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">24/7 Response within 24 hours</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary/10 text-primary rounded-xl shrink-0">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-bold text-foreground text-xs uppercase tracking-wider mb-0.5">Studio Headquarters</p>
                    <p>Vassio Design Studio, M.G. Road, Sultanpur, New Delhi 110030</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick response promise */}
            <div className="bg-primary/10 border border-primary/20 rounded-3xl p-6 text-xs text-primary font-medium flex items-center gap-4">
              <MessageSquare className="h-8 w-8 text-primary shrink-0" />
              <div>
                <p className="font-bold text-sm text-foreground">Trade &amp; Custom Orders</p>
                <p className="text-muted-foreground text-[11px] mt-0.5">
                  Architects, interior designers, and bulk hotel projects — email us directly at <span className="font-semibold text-primary">trade@vassio.com</span> for trade catalog and discounts.
                </p>
              </div>
            </div>
          </div>

          {/* Form Column */}
          <div className="lg:col-span-7">
            <div className="bg-background border border-border/40 rounded-3xl p-6 md:p-10 shadow-sm">
              <h3 className="serif text-2xl font-bold text-foreground mb-6">Send Us A Message</h3>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-foreground block mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      placeholder="Your Name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 border border-border/50 rounded-xl text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-foreground block mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 border border-border/50 rounded-xl text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-foreground block mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 border border-border/50 rounded-xl text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-foreground block mb-2">
                      Inquiry Type
                    </label>
                    <select
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-4 py-3 border border-border/50 rounded-xl text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer"
                    >
                      <option value="General Inquiry">General Inquiry</option>
                      <option value="Custom Order">Custom Size / Color Order</option>
                      <option value="Order Support">Order &amp; Delivery Support</option>
                      <option value="Architect & Trade">Architect / Interior Trade</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-foreground block mb-2">
                    Message *
                  </label>
                  <textarea
                    rows={5}
                    placeholder="Tell us how we can help you..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-3 border border-border/50 rounded-xl text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 resize-y"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-primary hover:bg-primary/95 text-white py-4 text-xs uppercase tracking-[0.2em] font-bold rounded-xl shadow-xs transition cursor-pointer flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    "Sending Message..."
                  ) : (
                    <>
                      <Send className="h-4 w-4" /> Send Message
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
