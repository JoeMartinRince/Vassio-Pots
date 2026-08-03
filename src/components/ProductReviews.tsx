import { useState, useMemo } from "react";
import { Review, ReviewStats } from "@/types/reviews";
import { reviewStore } from "@/services/reviewStore";
import { Star, CheckCircle, ThumbsUp, MessageSquare, Image, Video, ShieldCheck, Plus, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface ProductReviewsProps {
  productId: string;
  productName: string;
}

export default function ProductReviews({ productId, productName }: ProductReviewsProps) {
  const [reviewsList, setReviewsList] = useState<Review[]>(() =>
    reviewStore.getApprovedReviews(productId)
  );
  const [stats, setStats] = useState<ReviewStats>(() =>
    reviewStore.getProductStats(productId)
  );

  const [sortBy, setSortBy] = useState<"recent" | "highest" | "lowest" | "helpful">("recent");
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  // Form State
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [customerName, setCustomerName] = useState("");
  const [orderId, setOrderId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Refresh reviews & stats
  const refreshReviews = () => {
    setReviewsList(reviewStore.getApprovedReviews(productId));
    setStats(reviewStore.getProductStats(productId));
  };

  // Sort reviews
  const sortedReviews = useMemo(() => {
    const list = [...reviewsList];
    if (sortBy === "highest") {
      list.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === "lowest") {
      list.sort((a, b) => a.rating - b.rating);
    } else if (sortBy === "helpful") {
      list.sort((a, b) => b.helpfulCount - a.helpfulCount);
    } else {
      // Recent
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return list;
  }, [reviewsList, sortBy]);

  // Handle Mark Helpful
  const handleHelpful = (reviewId: string) => {
    const success = reviewStore.markHelpful(reviewId);
    if (success) {
      toast.success("Thank you for your feedback!");
      refreshReviews();
    } else {
      toast.info("You have already voted this review as helpful.");
    }
  };

  // Submit Review Form
  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !title.trim() || !description.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }
    if (!orderId.trim()) {
      toast.error("Please provide your Order ID for purchase verification.");
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      reviewStore.addReview({
        productId,
        orderId: orderId.trim().toUpperCase(),
        customerName: customerName.trim(),
        rating,
        title: title.trim(),
        description: description.trim(),
        isVerified: true,
      });

      setSubmitting(false);
      setShowReviewForm(false);
      toast.success("Thank you! Your verified review has been published.");
      // Reset form
      setTitle("");
      setDescription("");
      setRating(5);
      refreshReviews();
    }, 500);
  };

  return (
    <section className="mt-16 md:mt-24 pt-12 border-t border-border/30">
      <div className="max-w-[1400px] mx-auto">
        {/* Section Heading */}
        <div className="mb-10 text-center md:text-left flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-primary font-bold mb-2">
              Empirical Feedback
            </p>
            <h2 className="serif text-3xl md:text-5xl text-foreground">Customer Reviews</h2>
          </div>

          <button
            onClick={() => setShowReviewForm((prev) => !prev)}
            className="inline-flex items-center justify-center gap-2 bg-primary text-white px-6 py-3 rounded-full text-xs font-bold uppercase tracking-[0.2em] shadow-xs hover:bg-primary/90 transition-all cursor-pointer self-center md:self-auto"
          >
            <Plus className="h-4 w-4" /> Write A Review
          </button>
        </div>

        {/* Overall Rating & Breakdown Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 bg-card border border-border/40 rounded-3xl p-6 md:p-10 mb-12 shadow-xs">
          {/* Rating Big Badge (4 cols) */}
          <div className="md:col-span-4 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-border/30 pb-6 md:pb-0 md:pr-8 text-center">
            <span className="serif text-5xl md:text-6xl font-bold text-foreground">
              {stats.averageRating.toFixed(1)}
            </span>
            <div className="flex items-center gap-1 my-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-5 w-5 ${
                    star <= Math.round(stats.averageRating)
                      ? "fill-[#739D30] text-[#739D30]"
                      : "text-muted-foreground/30"
                  }`}
                />
              ))}
            </div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
              Based on {stats.totalReviews} {stats.totalReviews === 1 ? "Review" : "Reviews"}
            </p>
            <div className="mt-4 flex items-center gap-1.5 text-[11px] text-primary font-bold bg-primary/10 px-3 py-1 rounded-full">
              <ShieldCheck className="h-3.5 w-3.5" /> 100% Verified Buyers
            </div>
          </div>

          {/* Rating Distribution Bars (8 cols) */}
          <div className="md:col-span-8 flex flex-col justify-center space-y-2.5">
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = stats.distribution[stars as keyof typeof stats.distribution] || 0;
              const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
              return (
                <div key={stars} className="flex items-center gap-3 text-xs">
                  <span className="w-12 text-right font-semibold text-foreground/80 shrink-0">
                    {stars} Star
                  </span>
                  <div className="flex-1 bg-secondary rounded-full h-2.5 overflow-hidden border border-border/30">
                    <div
                      className="bg-primary h-full rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="w-8 text-xs font-semibold text-muted-foreground text-right shrink-0">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ─── REVIEW FORM (Shown when toggled) ────────────────────────── */}
        {showReviewForm && (
          <div className="bg-background border border-primary/30 rounded-3xl p-6 md:p-8 mb-12 shadow-md animate-in fade-in duration-300">
            <div className="flex items-center justify-between pb-4 border-b border-border/30 mb-6">
              <div>
                <h3 className="serif text-2xl font-bold text-foreground">Write a Verified Review</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Share your experience with <span className="font-semibold text-foreground">{productName}</span>
                </p>
              </div>
              <button
                onClick={() => setShowReviewForm(false)}
                className="text-xs font-bold text-muted-foreground hover:text-foreground uppercase tracking-wider"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-5">
              {/* Rating Selector */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-foreground block mb-2">
                  Your Overall Rating *
                </label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 cursor-pointer transition-transform hover:scale-110"
                    >
                      <Star
                        className={`h-7 w-7 ${
                          star <= (hoverRating || rating)
                            ? "fill-[#739D30] text-[#739D30]"
                            : "text-muted-foreground/30"
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-3 text-xs font-bold text-primary">
                    {rating} out of 5 Stars
                  </span>
                </div>
              </div>

              {/* Form Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-foreground block mb-1.5">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Rahul Nair"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-4 py-3 border border-border/50 rounded-xl text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-foreground block mb-1.5">
                    Order ID (for Verification) *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. VAS-8901"
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    className="w-full px-4 py-3 border border-border/50 rounded-xl text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-foreground block mb-1.5">
                  Review Headline / Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Beautiful Premium Finish"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 border border-border/50 rounded-xl text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-foreground block mb-1.5">
                  Detailed Review *
                </label>
                <textarea
                  rows={4}
                  placeholder="What did you love about the quality, color, packaging, or durability?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 border border-border/50 rounded-xl text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 resize-y"
                />
              </div>

              {/* Future Ready Media Upload Placeholders */}
              <div className="border border-dashed border-border/60 rounded-xl p-4 bg-secondary/30 text-center">
                <div className="flex justify-center items-center gap-3 text-muted-foreground mb-1">
                  <Image className="h-5 w-5" />
                  <Video className="h-5 w-5" />
                </div>
                <p className="text-xs font-semibold text-foreground">Add Photos or Video (Optional)</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Drag &amp; drop images or click to upload customer photos.
                </p>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-primary hover:bg-primary/90 text-white py-4 text-xs font-bold uppercase tracking-[0.2em] rounded-xl shadow-xs transition cursor-pointer"
              >
                {submitting ? "Publishing Review..." : "Submit Verified Review"}
              </button>
            </form>
          </div>
        )}

        {/* Verification Policy Banner */}
        <div className="bg-secondary/40 border border-border/40 rounded-2xl p-4 mb-8 flex items-center gap-3 text-xs text-muted-foreground">
          <ShieldCheck className="h-5 w-5 text-primary shrink-0" />
          <p>
            <span className="font-bold text-foreground">Verification Policy:</span> Only verified customers who have completed a purchase of this product are eligible to publish reviews.
          </p>
        </div>

        {/* ─── REVIEW CONTROLS & SORTING ───────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border/30 mb-8">
          <span className="text-xs font-bold uppercase tracking-wider text-foreground">
            {sortedReviews.length} Verified Customer Reviews
          </span>

          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground font-medium">Sort Reviews:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-background border border-border/40 rounded-xl px-3 py-1.5 text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
            >
              <option value="recent">Most Recent</option>
              <option value="highest">Highest Rating</option>
              <option value="lowest">Lowest Rating</option>
              <option value="helpful">Most Helpful</option>
            </select>
          </div>
        </div>

        {/* ─── REVIEWS CARDS LIST ─────────────────────────────────────── */}
        {sortedReviews.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-border/40 rounded-2xl bg-card">
            <p className="serif text-xl text-foreground">No reviews yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Be the first verified customer to leave a review for {productName}!
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {sortedReviews.map((rev) => (
              <div
                key={rev.id}
                className="bg-card border border-border/40 rounded-2xl p-6 md:p-8 space-y-4 shadow-xs transition-shadow hover:shadow-md"
              >
                {/* Header Row */}
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`h-4 w-4 ${
                              s <= rev.rating
                                ? "fill-[#739D30] text-[#739D30]"
                                : "text-muted-foreground/30"
                            }`}
                          />
                        ))}
                      </div>
                      <h4 className="font-bold text-sm text-foreground">{rev.title}</h4>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-bold text-foreground">{rev.customerName}</span>
                      {rev.isVerified && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                          <CheckCircle className="h-3 w-3" /> Verified Buyer
                        </span>
                      )}
                    </div>
                  </div>

                  <span className="text-xs text-muted-foreground font-medium">
                    {new Date(rev.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>

                {/* Body Text */}
                <p className="text-sm text-muted-foreground leading-relaxed font-sans">
                  "{rev.description}"
                </p>

                {/* Admin Official Reply */}
                {rev.adminReply && (
                  <div className="bg-primary/10 border-l-2 border-primary rounded-r-xl p-4 mt-3">
                    <p className="text-xs font-bold text-foreground flex items-center gap-1.5 mb-1">
                      <Sparkles className="h-3.5 w-3.5 text-primary" /> Response from Vassio Studio:
                    </p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{rev.adminReply}</p>
                  </div>
                )}

                {/* Footer Helpful Button */}
                <div className="pt-3 border-t border-border/20 flex items-center justify-between text-xs">
                  <button
                    onClick={() => handleHelpful(rev.id)}
                    className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors font-medium cursor-pointer"
                  >
                    <ThumbsUp className="h-3.5 w-3.5" />
                    <span>Helpful ({rev.helpfulCount})</span>
                  </button>

                  {rev.orderId && (
                    <span className="text-[10px] text-muted-foreground font-mono">
                      Order: {rev.orderId}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
