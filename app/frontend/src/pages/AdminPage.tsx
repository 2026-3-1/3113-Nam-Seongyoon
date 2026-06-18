import { useEffect, useState } from "react";
import { api } from "../lib/api";
import type { AdminCourse, AdminReview, AdminUser } from "../types";
import s from "../styles/pages.module.css";

type Tab = "users" | "courses" | "reviews";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>("users");
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [courses, setCourses] = useState<AdminCourse[]>([]);
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    setError("");
    if (activeTab === "users") {
      api.adminUsers().then(setUsers).catch((e) => setError(e.message));
    } else if (activeTab === "courses") {
      api.adminCourses().then(setCourses).catch((e) => setError(e.message));
    } else {
      api.adminReviews().then(setReviews).catch((e) => setError(e.message));
    }
  }, [activeTab]);

  const deleteUser = async (id: number, name: string) => {
    if (!window.confirm(`"${name}" 계정을 삭제하시겠습니까?\n해당 사용자의 모든 데이터가 삭제됩니다.`)) return;
    try {
      await api.adminDeleteUser(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "삭제에 실패했습니다.");
    }
  };

  const deleteCourse = async (id: number, title: string) => {
    if (!window.confirm(`"${title}" 강의를 삭제하시겠습니까?`)) return;
    try {
      await api.adminDeleteCourse(id);
      setCourses((prev) => prev.filter((c) => c.id !== id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "삭제에 실패했습니다.");
    }
  };

  const deleteReview = async (id: number) => {
    if (!window.confirm("이 리뷰를 삭제하시겠습니까?")) return;
    try {
      await api.adminDeleteReview(id);
      setReviews((prev) => prev.filter((r) => r.id !== id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "삭제에 실패했습니다.");
    }
  };

  const roleLabel = (role: string) => ({ STUDENT: "학생", TEACHER: "강사", ADMIN: "관리자" })[role] ?? role;

  return (
    <div className={s.container}>
      <div className={s.profileHead} style={{ marginBottom: "1.5rem" }}>
        <div className={s.profileInfo}>
          <div className={s.profileName}>관리자 대시보드</div>
          <div className={s.profileEmail}>회원 · 강의 · 리뷰를 관리합니다</div>
        </div>
      </div>

      <div className={s.myTabs}>
        <button className={`${s.myTab} ${activeTab === "users" ? s.myTabActive : ""}`} onClick={() => setActiveTab("users")}>
          회원 관리 <span className={s.tabCount}>{users.length}</span>
        </button>
        <button className={`${s.myTab} ${activeTab === "courses" ? s.myTabActive : ""}`} onClick={() => setActiveTab("courses")}>
          강의 관리 <span className={s.tabCount}>{courses.length}</span>
        </button>
        <button className={`${s.myTab} ${activeTab === "reviews" ? s.myTabActive : ""}`} onClick={() => setActiveTab("reviews")}>
          리뷰 관리 <span className={s.tabCount}>{reviews.length}</span>
        </button>
      </div>

      {error && <p className={s.formError}>{error}</p>}

      {activeTab === "users" && (
        <div className={s.myCourseList}>
          {users.length === 0 ? (
            <div className={s.reviewItem}>회원이 없습니다.</div>
          ) : (
            users.map((u) => (
              <div key={u.id} className={s.myCourseItem}>
                <div className={s.myCourseInfo}>
                  <div className={s.myCourseTitle}>{u.name}</div>
                  <div className={s.myCourseMeta}>
                    {u.email} · {roleLabel(u.role)} · 가입 {new Date(u.createdAt).toLocaleDateString("ko-KR")}
                  </div>
                </div>
                <div className={s.myCourseAction}>
                  <button
                    type="button"
                    className={s.btnContinue}
                    style={{ background: "var(--danger, #ef4444)", borderColor: "var(--danger, #ef4444)", color: "#fff" }}
                    onClick={() => deleteUser(u.id, u.name)}
                  >
                    삭제
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === "courses" && (
        <div className={s.myCourseList}>
          {courses.length === 0 ? (
            <div className={s.reviewItem}>강의가 없습니다.</div>
          ) : (
            courses.map((c) => (
              <div key={c.id} className={s.myCourseItem}>
                <div className={s.myCourseInfo}>
                  <div className={s.myCourseTitle}>{c.title}</div>
                  <div className={s.myCourseMeta}>
                    {c.teacher?.name ?? "강사 없음"} · {c.price.toLocaleString()}원 · {c.isPublished ? "공개" : "비공개"} · {new Date(c.createdAt).toLocaleDateString("ko-KR")}
                  </div>
                </div>
                <div className={s.myCourseAction}>
                  <button
                    type="button"
                    className={s.btnContinue}
                    style={{ background: "var(--danger, #ef4444)", borderColor: "var(--danger, #ef4444)", color: "#fff" }}
                    onClick={() => deleteCourse(c.id, c.title)}
                  >
                    삭제
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === "reviews" && (
        <div className={s.myCourseList}>
          {reviews.length === 0 ? (
            <div className={s.reviewItem}>리뷰가 없습니다.</div>
          ) : (
            reviews.map((r) => (
              <div key={r.id} className={s.reviewItem}>
                <div className={s.reviewHeader}>
                  <div className={s.reviewUser}>
                    <div className={s.reviewAvatar}>{r.user.name[0]}</div>
                    <span className={s.reviewName}>{r.user.name}</span>
                    <span className={s.myCourseMeta} style={{ marginLeft: "0.5rem" }}>· {r.course.title}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <span className={s.reviewDate}>{new Date(r.createdAt).toLocaleDateString("ko-KR")}</span>
                    <button
                      type="button"
                      className={s.btnContinue}
                      style={{ background: "var(--danger, #ef4444)", borderColor: "var(--danger, #ef4444)", color: "#fff" }}
                      onClick={() => deleteReview(r.id)}
                    >
                      삭제
                    </button>
                  </div>
                </div>
                <div className={s.reviewStars}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star} className={star <= r.rating ? s.starFilled : s.starEmpty}>★</span>
                  ))}
                </div>
                <p className={s.reviewContent}>{r.content}</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
