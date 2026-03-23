import "./index.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import MainPage from "./pages/MainPage";
import CoursesPage from "./pages/CoursesPage";
import CourseDetailPage from "./pages/CourseDetailPage";
import LearnPage from "./pages/LearnPage";
import { LoginPage, RegisterPage } from "./pages/AuthPages";
import CartPage from "./pages/CartPage";
import MyPage from "./pages/MyPage";
import InstructorPage from "./pages/InstructorPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"                  element={<Layout><MainPage /></Layout>} />
        <Route path="/courses"           element={<Layout><CoursesPage /></Layout>} />
        <Route path="/courses/:id"       element={<Layout><CourseDetailPage /></Layout>} />
        <Route path="/cart"              element={<Layout><CartPage /></Layout>} />
        <Route path="/mypage"            element={<Layout><MyPage /></Layout>} />
        <Route path="/instructor"        element={<Layout><InstructorPage /></Layout>} />
        <Route path="/login"             element={<LoginPage />} />
        <Route path="/register"          element={<RegisterPage />} />
        <Route path="/courses/:id/learn" element={<LearnPage />} />
      </Routes>
    </BrowserRouter>
  );
}
