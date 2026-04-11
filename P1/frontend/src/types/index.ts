export interface Category {
  id: number;
  label: string;
  icon: string;
}

export interface Course {
  id: number;
  categoryId: number;
  title: string;
  instructor: string;
  rating: number;
  reviewCount: number;
  price: number;
  originalPrice?: number;
  tag?: "BEST" | "NEW" | "HOT";
  thumbnail: string;
  badge: string;
  duration: string;
}

export interface Chapter {
  id: number;
  title: string;
  duration: string;
  completed?: boolean;
  videoUrl?: string;
}
