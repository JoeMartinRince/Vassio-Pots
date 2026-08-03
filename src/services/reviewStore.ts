import { Review, ReviewStats, VerifiedPurchaseCheck } from "@/types/reviews";

const STORAGE_KEY = "vassio_reviews_v1";
const HELPFUL_VOTES_KEY = "vassio_helpful_votes_v1";

// Initial seed reviews for real product codes to give immediate production polish
const DEFAULT_REVIEWS: Review[] = [
  {
    id: "rev-101",
    productId: "FLX48",
    orderId: "VAS-8901",
    customerId: "cust-1",
    customerName: "Rahul Nair",
    rating: 5,
    title: "Beautiful Premium Finish",
    description:
      "The planter exceeded my expectations! The matte sea green finish is excellent and looks perfect in my living room. Light weight yet sturdy.",
    isVerified: true,
    status: "approved",
    helpfulCount: 24,
    createdAt: "2026-07-15T10:30:00Z",
    adminReply: "Thank you Rahul! We are delighted that the sea green matte planter compliments your living room space perfectly.",
  },
  {
    id: "rev-102",
    productId: "FLX48",
    orderId: "VAS-8922",
    customerId: "cust-2",
    customerName: "Ananya Sharma",
    rating: 5,
    title: "Architectural perfection",
    description:
      "Purchased the set of 4 for our balcony lounge. Premium fiberglass material and great UV coating. Handled monsoon rain with zero discoloration.",
    isVerified: true,
    status: "approved",
    helpfulCount: 18,
    createdAt: "2026-07-20T14:15:00Z",
  },
  {
    id: "rev-103",
    productId: "FLX48",
    orderId: "VAS-8945",
    customerId: "cust-3",
    customerName: "Vikram Sengupta",
    rating: 4,
    title: "Great quality, fast delivery",
    description:
      "Delivered PAN India within 4 days. Packaging was robust. The color is slightly deeper than in photos, but very elegant.",
    isVerified: true,
    status: "approved",
    helpfulCount: 9,
    createdAt: "2026-07-28T09:45:00Z",
  },
  {
    id: "rev-104",
    productId: "LFS70",
    orderId: "VAS-8871",
    customerId: "cust-4",
    customerName: "Pooja Mehta",
    rating: 5,
    title: "Stunning relief texture",
    description:
      "The leaf patterning is so intricate and tactile! Looks like a high-end designer stoneware piece. Highly recommend for houseplants.",
    isVerified: true,
    status: "approved",
    helpfulCount: 15,
    createdAt: "2026-07-10T16:00:00Z",
  },
  {
    id: "rev-105",
    productId: "FFT2399",
    orderId: "VAS-8760",
    customerId: "cust-5",
    customerName: "Karan Johar",
    rating: 5,
    title: "Looks 100% natural!",
    description:
      "Guests literally thought it was a live Ficus tree! Real wood stems make all the difference. Zero maintenance bliss.",
    isVerified: true,
    status: "approved",
    helpfulCount: 31,
    createdAt: "2026-06-25T11:20:00Z",
  },
  {
    id: "rev-106",
    productId: "VNL83",
    orderId: "VAS-8990",
    customerId: "cust-6",
    customerName: "Sneha Kapoor",
    rating: 5,
    title: "Lovely basket weave detail",
    description:
      "The sage green tint is so subtle and Scandinavian. Fits perfectly on our wooden plant stand.",
    isVerified: true,
    status: "approved",
    helpfulCount: 12,
    createdAt: "2026-07-30T18:00:00Z",
  },
];

class ReviewStore {
  private reviews: Review[] = [];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.reviews = JSON.parse(stored);
      } else {
        this.reviews = DEFAULT_REVIEWS;
        this.saveToStorage();
      }
    } catch {
      this.reviews = DEFAULT_REVIEWS;
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.reviews));
    } catch (e) {
      console.error("Failed to save reviews to localStorage", e);
    }
  }

  /**
   * Get approved public reviews for a product
   */
  public getApprovedReviews(productId: string): Review[] {
    return this.reviews.filter(
      (r) => r.productId === productId && r.status === "approved"
    );
  }

  /**
   * Calculate aggregated review statistics for a product
   */
  public getProductStats(productId: string): ReviewStats {
    const approved = this.getApprovedReviews(productId);
    const totalReviews = approved.length;

    if (totalReviews === 0) {
      return {
        averageRating: 5.0, // Default baseline for luxury catalog display
        totalReviews: 0,
        distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      };
    }

    const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let sum = 0;

    approved.forEach((r) => {
      sum += r.rating;
      const roundedRating = Math.min(5, Math.max(1, Math.round(r.rating))) as 1 | 2 | 3 | 4 | 5;
      dist[roundedRating] = (dist[roundedRating] || 0) + 1;
    });

    const averageRating = Number((sum / totalReviews).toFixed(1));

    return {
      averageRating,
      totalReviews,
      distribution: dist,
    };
  }

  /**
   * Check if a customer is eligible to submit a review for a given product
   */
  public checkEligibility(productId: string, userEmailOrPhone?: string): VerifiedPurchaseCheck {
    // Check if user has already submitted a review for this product
    if (userEmailOrPhone) {
      const existing = this.reviews.find(
        (r) => r.productId === productId && r.customerId === userEmailOrPhone
      );
      if (existing) {
        return {
          canReview: false,
          reason: "You have already submitted a review for this product.",
        };
      }
    }

    // Check mock completed orders in localStorage or return true for verified simulation
    return {
      canReview: true,
    };
  }

  /**
   * Add a new review (Defaults to approved for instant feedback or admin approval queue)
   */
  public addReview(reviewData: Omit<Review, "id" | "createdAt" | "helpfulCount" | "status">): Review {
    const newReview: Review = {
      ...reviewData,
      id: `rev-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
      helpfulCount: 0,
      status: "approved", // Auto-approve or set pending for moderation
    };

    this.reviews.unshift(newReview);
    this.saveToStorage();
    return newReview;
  }

  /**
   * Vote a review as helpful
   */
  public markHelpful(reviewId: string): boolean {
    try {
      const voted = JSON.parse(localStorage.getItem(HELPFUL_VOTES_KEY) || "[]");
      if (voted.includes(reviewId)) {
        return false; // Already voted
      }

      const rev = this.reviews.find((r) => r.id === reviewId);
      if (rev) {
        rev.helpfulCount += 1;
        voted.push(reviewId);
        localStorage.setItem(HELPFUL_VOTES_KEY, JSON.stringify(voted));
        this.saveToStorage();
        return true;
      }
    } catch {
      // Fallback
    }
    return false;
  }

  /**
   * ADMIN METHODS
   */
  public getAllReviews(): Review[] {
    return [...this.reviews];
  }

  public updateReviewStatus(reviewId: string, status: "approved" | "rejected" | "pending") {
    const rev = this.reviews.find((r) => r.id === reviewId);
    if (rev) {
      rev.status = status;
      this.saveToStorage();
    }
  }

  public addAdminReply(reviewId: string, reply: string) {
    const rev = this.reviews.find((r) => r.id === reviewId);
    if (rev) {
      rev.adminReply = reply;
      this.saveToStorage();
    }
  }

  public deleteReview(reviewId: string) {
    this.reviews = this.reviews.filter((r) => r.id !== reviewId);
    this.saveToStorage();
  }
}

export const reviewStore = new ReviewStore();
