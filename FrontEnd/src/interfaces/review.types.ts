export interface ReviewImage {
  id: number;
  url: string;
}

export interface Review {
  id: number;
  productId: number;
  userId: number;
  authorName: string;
  authorAvatar?: string;
  rating: number;
  title?: string;
  content: string;
  images: ReviewImage[];
  helpfulCount: number;
  isVerifiedPurchase: boolean;
  createdAt: string;
}

export interface RatingBreakdown {
  average: number;
  total: number;
  distribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}
