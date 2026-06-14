import "./index.css";
import { lazy, Suspense, type ReactNode } from "react";
import { BrowserRouter, Navigate, Routes, Route, useLocation } from "react-router-dom";
import { Layout } from "./components/Layout";
import { getAuth } from "./lib/api";
import type { Role } from "./types";

// 코드 스플리팅: 각 페이지를 동적 임포트로 분리하여 초기 번들 크기 최소화
const MainPage           = lazy(() => import("./pages/MainPage"));
const CoursesPage        = lazy(() => import("./pages/CoursesPage"));
const CourseDetailPage   = lazy(() => import("./pages/CourseDetailPage"));
const LearnPage          = lazy(() => import("./pages/LearnPage"));
const CartPage           = lazy(() => import("./pages/CartPage"));
const PaymentSuccessPage = lazy(() => import("./pages/PaymentSuccessPage"));
const PaymentFailPage    = lazy(() => import("./pages/PaymentFailPage"));
const MyPage             = lazy(() => import("./pages/MyPage"));
const InstructorPage     = lazy(() => import("./pages/InstructorPage"));
// AuthPages는 named export이므로 default로 래핑
const LoginPage    = lazy(() => import("./pages/AuthPages").then((m) => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import("./pages/AuthPages").then((m) => ({ default: m.RegisterPage })));

function PageFallback() {
  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
      <div style={{ width: 32, height: 32, border: "3px solid #e2e8f0", borderTopColor: "#3b82f6", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
    </div>
  );
}

function RequireAuth({ children }: { children: ReactNode }) {
  const location = useLocation();
  const auth = getAuth();
  if (!auth) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return <>{children}</>;
}

function RequireRole({ roles, children }: { roles: Role[]; children: ReactNode }) {
  const auth = getAuth();
  if (!auth) return <Navigate to="/login" replace />;
  if (!roles.includes(auth.user.role)) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function RequireStudentArea({ children }: { children: ReactNode }) {
  const auth = getAuth();
  if (auth?.user.role === "TEACHER") return <Navigate to="/instructor" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route path="/"                  element={<Layout><MainPage /></Layout>} />
          <Route path="/courses"           element={<RequireStudentArea><Layout><CoursesPage /></Layout></RequireStudentArea>} />
          <Route path="/courses/:id"       element={<RequireStudentArea><Layout><CourseDetailPage /></Layout></RequireStudentArea>} />
          <Route path="/cart"              element={<RequireStudentArea><Layout><CartPage /></Layout></RequireStudentArea>} />
          <Route path="/payment/success"   element={<RequireAuth><Layout><PaymentSuccessPage /></Layout></RequireAuth>} />
          <Route path="/payment/fail"      element={<Layout><PaymentFailPage /></Layout>} />
          <Route path="/mypage"            element={<RequireAuth><Layout><MyPage /></Layout></RequireAuth>} />
          <Route path="/instructor"        element={<RequireRole roles={["TEACHER", "ADMIN"]}><Layout><InstructorPage /></Layout></RequireRole>} />
          <Route path="/login"             element={<LoginPage />} />
          <Route path="/register"          element={<RegisterPage />} />
          <Route path="/courses/:id/learn" element={<RequireStudentArea><LearnPage /></RequireStudentArea>} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
