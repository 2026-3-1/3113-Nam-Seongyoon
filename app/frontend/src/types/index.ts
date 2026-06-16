export type Role = "STUDENT" | "TEACHER" | "ADMIN";

export interface AuthUser {
  id: number;
  email: string;
  name: string;
  role: Role;
}

export interface Category {
  id: string;
  label: string;
  icon: string;
}

export interface Course {
  id: number;
  title: string;
  category: string;
  description: string;
  thumbnail: string;
  price: number;
  originalPrice?: number | null;
  tag?: string | null;
  badge: string;
  duration: string;
  isPublished?: boolean;
  rating: number | string;
  reviewCount: number;
  teacher?: AuthUser | null;
  curriculum?: CurriculumItem[];
  progress?: CourseProgress;
  hasPurchased?: boolean;
}

export interface CartItem {
  id: number;
  selected: boolean;
  createdAt: string;
  updatedAt: string;
  course: Course;
}

export interface CourseProgress {
  completedCount: number;
  totalCount: number;
  progressPercent: number;
  lastChapterIndex: number;
}

export interface Bookmark {
  id: number;
  createdAt: string;
  course: Course;
}

export interface OrderItem {
  id: number;
  price: number;
  course: Course;
}

export interface Order {
  id: number;
  totalPrice: number;
  status: string;
  createdAt: string;
  items: OrderItem[];
}

export interface CurriculumItem {
  title: string;
  videoUrl: string;
  isPreview?: boolean;
}

export interface Review {
  id: number;
  rating: number;
  content: string;
  createdAt: string;
  user: AuthUser;
}

export interface MyPageProfile {
  user: AuthUser;
  stats: {
    enrolledCount: number;
    completedCount: number;
    progressPercent: number;
    reviewCount: number;
    bookmarkCount?: number;
    orderCount?: number;
    courseCount?: number;
  };
  courses: Course[];
  bookmarks?: Bookmark[];
  orders?: Order[];
  instructorStudents?: InstructorStudentProgress[];
}

export interface InstructorStudentProgress {
  id: number;
  student: AuthUser;
  course: Course;
  progress: CourseProgress;
  updatedAt: string;
}

export interface InstructorSubscription {
  id: number;
  createdAt: string;
  instructor: {
    id: number;
    name: string;
    email: string;
  };
}

export interface NotificationPreferences {
  emailNotifications: boolean;
}
