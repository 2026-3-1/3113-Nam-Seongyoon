import "./index.css";
import type { ReactNode } from "react";
import { BrowserRouter, Navigate, Routes, Route, useLocation } from "react-router-dom";
import { Layout } from "./components/Layout";
import MainPage from "./pages/MainPage";
import CoursesPage from "./pages/CoursesPage";
import CourseDetailPage from "./pages/CourseDetailPage";
import LearnPage from "./pages/LearnPage";
import { LoginPage, RegisterPage } from "./pages/AuthPages";
import CartPage from "./pages/CartPage";
import PaymentSuccessPage from "./pages/PaymentSuccessPage";
import PaymentFailPage from "./pages/PaymentFailPage";
import MyPage from "./pages/MyPage";
import InstructorPage from "./pages/InstructorPage";
import { getAuth } from "./lib/api";
import type { Role } from "./types";

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
    </BrowserRouter>
  );
}
