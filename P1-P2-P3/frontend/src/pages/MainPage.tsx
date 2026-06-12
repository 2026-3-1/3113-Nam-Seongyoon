import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { api, getAuth } from "../lib/api";
import { isImageSource } from "../lib/media";
import type { Course } from "../types";
import s from "../styles/pages.module.css";

export default function MainPage() {
  const auth = getAuth();
  const isInstructor = auth?.user.role === "TEACHER";
  const [courses, setCourses] = useState<Course[]>([]);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (isInstructor) return;
    api.courses(1, 6).then((res) => setCourses(res.data)).catch(() => setCourses([]));
  }, [isInstructor]);

  if (isInstructor) {
    return <Navigate to="/instructor" replace />;
  }

  const addToCart = async (courseId: number) => {
    if (!getAuth()) {
      setNotice("장바구니에 담으려면 로그인이 필요합니다.");
      return;
    }

    try {
      await api.addCartItem(courseId);
      setNotice("장바구니에 담았습니다.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "장바구니에 담지 못했습니다.");
    }
  };

  return (
    <div className={s.container}>
      <section style={{ padding: "4rem 0" }}>
        <span className={s.badge}>CertificatEdu</span>
        <h1 className={s.pageTitle} style={{ fontSize: "3rem", maxWidth: 680 }}>
          자격증 강의를 찾아보고 바로 학습을 시작하세요
        </h1>
        <p className={s.pageSub} style={{ maxWidth: 620 }}>
          학생 계정에서는 강의 탐색, 장바구니, 수강 진도 확인 흐름만 제공합니다.
        </p>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <Link to="/courses" className={s.btnPrimary}>강의 보러가기</Link>
          <Link to="/mypage" className={s.btnOutline}>내 진도 보기</Link>
        </div>
      </section>

      <section>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
          <h2 className={s.instrFormTitle}>최근 등록 강의</h2>
          <Link to="/courses" className={s.authFooterLink}>전체 보기</Link>
        </div>
        {notice && <p className={s.formError} style={{ marginBottom: "1rem" }}>{notice}</p>}
        {courses.length === 0 ? (
          <div className={s.emptyState}>
            <div className={s.emptyTitle}>아직 등록된 강의가 없습니다.</div>
            <p className={s.emptyDesc}>강사가 강의를 등록하면 여기에 표시됩니다.</p>
          </div>
        ) : (
          <div className={s.grid}>
            {courses.map((course) => (
              <article key={course.id} className={s.courseCard}>
                <Link to={`/courses/${course.id}`} className={s.cardThumb}>
                  {isImageSource(course.thumbnail) ? (
                    <img src={course.thumbnail} alt="" className={s.thumbImage} />
                  ) : (
                    "No image"
                  )}
                </Link>
                <div className={s.cardBody}>
                  <span className={s.cardBadge}>{course.badge}</span>
                  <Link to={`/courses/${course.id}`} className={s.cardTitle}>{course.title}</Link>
                  <div className={s.cardMeta}>{course.teacher?.name ?? "인증 강사"} · {course.duration}</div>
                  <div className={s.cardFooter}>
                    <div className={s.cardPrice}>{course.price.toLocaleString()}원</div>
                    <button type="button" className={s.cardCartBtn} onClick={() => addToCart(course.id)}>담기</button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
