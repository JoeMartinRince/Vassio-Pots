export type ReviewStatus = "pending" | "approved" | "rejected";

export interface Review {
  id: string;
  productId: string;
  orderId?: string;
  customerId?: string;
  customerName: string;
  rating: number; // 1 to 5
  title: string;
  description: string;
  isVerified: boolean;
  status: ReviewStatus;
  helpfulCount: number;
  createdAt: string;
  images?: string[];
  videos?: string[];
  adminReply?: string;
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  distribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

export interface VerifiedPurchaseCheck {
  canReview: boolean;
  reason?: string;
  orderId?: string;
}
