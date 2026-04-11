import "./index.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { Layout } from "./components/Layout";
import MainPage from "./pages/MainPage";
import CoursesPage from "./pages/CoursesPage";
import CourseDetailPage from "./pages/CourseDetailPage";
import LearnPage from "./pages/LearnPage";
import CartPage from "./pages/CartPage";
import MyPage from "./pages/MyPage";
import InstructorPage from "./pages/InstructorPage";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/"                  element={<Layout><MainPage /></Layout>} />
          <Route path="/courses"           element={<Layout><CoursesPage /></Layout>} />
          <Route path="/courses/:id"       element={<Layout><CourseDetailPage /></Layout>} />
          <Route path="/cart"              element={<Layout><CartPage /></Layout>} />
          <Route path="/mypage"            element={<Layout><MyPage /></Layout>} />
          <Route path="/instructor"        element={<Layout><InstructorPage /></Layout>} />
          <Route path="/courses/:id/learn" element={<LearnPage />} />
          <Route path="/login"             element={<Navigate to="/" replace />} />
          <Route path="/register"          element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
