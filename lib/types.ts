export type ReviewDTO = {
  id: number;
  rating: number;
  comment: string;
  createdAt: string;
};

export type RestaurantDTO = {
  name: string;
  cuisine: string;
  area: string;
  averageRating: number | null;
  totalReviews: number;
  latestReview: ReviewDTO | null;
  reviews: ReviewDTO[];
};
