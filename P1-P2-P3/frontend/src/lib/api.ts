import type { AuthUser, Bookmark, CartItem, Course, CourseProgress, MyPageProfile, Order, Review, Role } from "../types";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "/api";
const AUTH_KEY = "certificatedu_auth";

export type AuthState = {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
};

export function getAuth(): AuthState | null {
  const raw = localStorage.getItem(AUTH_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthState;
  } catch {
    clearAuth();
    return null;
  }
}

export function setAuth(auth: AuthState) {
  localStorage.setItem(AUTH_KEY, JSON.stringify(auth));
  window.dispatchEvent(new Event("auth-changed"));
}

export function clearAuth() {
  localStorage.removeItem(AUTH_KEY);
  window.dispatchEvent(new Event("auth-changed"));
}

let refreshingPromise: Promise<AuthState | null> | null = null;

async function tryRefresh(): Promise<AuthState | null> {
  const auth = getAuth();
  if (!auth?.refreshToken) return null;
  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: auth.refreshToken }),
    });
    if (!res.ok) { clearAuth(); return null; }
    const newAuth = await res.json() as AuthState;
    setAuth(newAuth);
    return newAuth;
  } catch {
    clearAuth();
    return null;
  }
}

async function request<T>(path: string, options: RequestInit = {}, retry = true): Promise<T> {
  const auth = getAuth();
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  if (auth?.accessToken) headers.set("Authorization", `Bearer ${auth.accessToken}`);

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (res.status === 401 && path !== "/auth/login" && path !== "/auth/refresh" && retry) {
    if (!refreshingPromise) refreshingPromise = tryRefresh().finally(() => { refreshingPromise = null; });
    const newAuth = await refreshingPromise;
    if (!newAuth) throw new Error("로그인이 만료되었습니다. 다시 로그인해 주세요.");
    return request<T>(path, options, false);
  }

  if (!res.ok) {
    if (res.status === 413) {
      throw new Error("업로드한 이미지가 너무 큽니다. 더 작은 이미지를 선택해 주세요.");
    }
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message ?? "요청을 처리하지 못했습니다.");
  }
  return res.json();
}

export const api = {
  login(email: string, password: string) {
    return request<AuthState>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },
  register(payload: { name: string; email: string; password: string; role: Role }) {
    return request<AuthUser>("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  logout() {
    return request<{ ok: boolean }>("/auth/logout", { method: "POST" }).finally(clearAuth);
  },
  myPage() {
    return request<MyPageProfile>("/users/me/mypage");
  },
  courses(page?: number, limit?: number) {
    const params = new URLSearchParams();
    if (page !== undefined) params.set("page", String(page));
    if (limit !== undefined) params.set("limit", String(limit));
    const qs = params.toString();
    return request<{ data: Course[]; total: number; page: number; limit: number; totalPages: number }>(`/courses${qs ? `?${qs}` : ""}`);
  },
  course(id: number) {
    return request<Course>(`/courses/${id}`);
  },
  createCourse(payload: Partial<Course>) {
    return request<Course>("/courses", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  updateCourse(id: number, payload: Partial<Course>) {
    return request<Course>(`/courses/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },
  deleteCourse(id: number) {
    return request<{ ok: boolean }>(`/courses/${id}`, { method: "DELETE" });
  },
  cart() {
    return request<CartItem[]>("/cart");
  },
  addCartItem(courseId: number) {
    return request<CartItem>("/cart", {
      method: "POST",
      body: JSON.stringify({ courseId }),
    });
  },
  updateCartItem(id: number, payload: { selected?: boolean }) {
    return request<CartItem>(`/cart/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },
  removeCartItem(id: number) {
    return request<{ ok: boolean }>(`/cart/${id}`, { method: "DELETE" });
  },
  clearCart() {
    return request<{ ok: boolean }>("/cart", { method: "DELETE" });
  },
  initiateCheckout() {
    return request<{
      ok: boolean;
      tossOrderId: string;
      orderName: string;
      amount: number;
      customerEmail: string;
      customerName: string;
      message?: string;
    }>("/cart/checkout/initiate", { method: "POST" });
  },
  confirmCheckout(paymentKey: string, orderId: string, amount: number) {
    return request<{ ok: boolean; orderId: number; receiptUrl: string | null; message: string }>(
      "/cart/checkout/confirm",
      { method: "POST", body: JSON.stringify({ paymentKey, orderId, amount }) },
    );
  },
  courseProgress(courseId: number) {
    return request<CourseProgress>(`/courses/${courseId}/progress`);
  },
  updateCourseProgress(courseId: number, completedCount: number) {
    return request<CourseProgress>(`/courses/${courseId}/progress`, {
      method: "PATCH",
      body: JSON.stringify({ completedCount }),
    });
  },
  bookmarks() {
    return request<Bookmark[]>("/bookmarks");
  },
  bookmarkStatus(courseId: number) {
    return request<{ bookmarked: boolean }>(`/bookmarks/${courseId}`);
  },
  addBookmark(courseId: number) {
    return request<Bookmark>(`/bookmarks/${courseId}`, { method: "POST" });
  },
  removeBookmark(courseId: number) {
    return request<{ ok: boolean }>(`/bookmarks/${courseId}`, { method: "DELETE" });
  },
  orders() {
    return request<Order[]>("/orders");
  },
  config() {
    return request<{ tossClientKey: string }>("/config");
  },
  reviews(courseId: number) {
    return request<Review[]>(`/courses/${courseId}/reviews`);
  },
  createReview(courseId: number, payload: { rating: number; content: string }) {
    return request<Review>(`/courses/${courseId}/reviews`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  updateReview(id: number, payload: { rating: number; content: string }) {
    return request<Review>(`/reviews/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },
  deleteReview(id: number) {
    return request<{ ok: boolean }>(`/reviews/${id}`, { method: "DELETE" });
  },
};
