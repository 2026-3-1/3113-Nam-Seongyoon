import { useState } from "react";
import { Link } from "react-router-dom";
import type { Course } from "../types";
import { CATEGORIES, COURSES } from "../data/courses";
import s from "../styles/MainPage.module.css";

/* ── TAG 스타일 ── */
const TAG_CLASS: Record<string, string> = {
  BEST: s.tagBest, NEW: s.tagNew, HOT: s.tagHot,
};

/* ── Hero ── */
function Hero() {
  return (
    <section className={s.hero}>
      <div className={s.heroBg} />
      <div className={s.heroGrid} />
      <div className={s.heroContent}>
        <div className={s.heroInner}>
          <div className={s.heroBadge}><span>✦</span> 검증된 강사, 검증된 합격</div>
          <h1 className={s.heroTitle}>
            자격증 합격의<br />
            <span className={s.heroTitleAccent}>최단 경로</span>를<br />
            찾았습니다
          </h1>
          <p className={s.heroSub}>
            인증 강사의 커리큘럼으로 체계적으로 학습하세요.<br />
            분산된 강의는 그만, 하나의 플랫폼에서 완성하는 합격 루트.
          </p>
          <div className={s.heroActions}>
            <Link to="/courses" className={s.btnHero}>강의 둘러보기 →</Link>
            <Link to="/instructor" className={s.btnHeroOutline}>강사 신청하기</Link>
          </div>
          <div className={s.heroStats}>
            {[
              { num: "12K+", label: "수강생" },
              { num: "98%",  label: "수강생 만족도" },
              { num: "200+", label: "인증 강사" },
            ].map(({ num, label }) => (
              <div key={label}>
                <span className={s.statNum}>{num}</span>
                <span className={s.statLabel}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Course Card (IntersectionObserver 제거 — 항상 표시) ── */
function CourseCard({ course, index }: { course: Course; index: number }) {
  const discount = course.originalPrice
    ? Math.round((1 - course.price / course.originalPrice) * 100)
    : null;

  return (
    <Link
      to={`/courses/${course.id}`}
      className={s.courseCard}
      style={{ animationDelay: `${index * 0.06}s` }}
    >
      <div className={s.cardThumb}>
        {course.thumbnail}
        {course.tag && (
          <span className={`${s.cardTag} ${TAG_CLASS[course.tag]}`}>{course.tag}</span>
        )}
        {discount && <span className={s.cardDiscount}>{discount}% OFF</span>}
      </div>
      <div className={s.cardBody}>
        <span className={s.cardBadge}>✓ {course.badge}</span>
        <div className={s.cardTitle}>{course.title}</div>
        <div className={s.cardInstructor}>{course.instructor} 강사</div>
        <div className={s.cardDuration}>{course.duration}</div>
        <div className={s.cardRating}>
          <span className={s.cardStar}>★</span>
          <span className={s.cardRatingNum}>{course.rating}</span>
          <span className={s.cardReviews}>({course.reviewCount.toLocaleString()})</span>
        </div>
        <div className={s.cardFooter}>
          <div>
            {course.originalPrice && (
              <span className={s.cardOrigPrice}>{course.originalPrice.toLocaleString()}원</span>
            )}
            <span className={s.cardPrice}>{course.price.toLocaleString()}원</span>
          </div>
          <button className={s.btnCart}>담기</button>
        </div>
      </div>
    </Link>
  );
}

/* ── Courses Section ── */
function CoursesSection() {
  const [activeCategory, setActiveCategory] = useState(0);
  const filtered =
    activeCategory === 0
      ? COURSES
      : COURSES.filter((c) => c.categoryId === activeCategory);

  return (
    <section className={s.section}>
      <div className={s.sectionInner}>
        <div className={s.sectionHead}>
          <h2 className={s.sectionTitle}>
            <span className={s.sectionTitleAccent}>인기</span> 강의
          </h2>
          <Link to="/courses" className={s.sectionLink}>전체 보기 →</Link>
        </div>
        <div className={s.catFilter}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`${s.catBtn} ${activeCategory === cat.id ? s.catBtnActive : ""}`}
            >
              {cat.icon} {cat.label}
            </button>
          ))}
        </div>
        <div className={s.courseGrid}>
          {filtered.map((course, i) => (
            <CourseCard key={course.id} course={course} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── CTA Banner ── */
function CTABanner() {
  return (
    <section className={s.ctaSection}>
      <div className={s.ctaBanner}>
        <div className={s.ctaInner}>
          <div className={s.ctaBlob1} />
          <div className={s.ctaBlob2} />
          <div className={s.ctaText}>
            <p className={s.ctaEyebrow}>강사 모집 중</p>
            <h2 className={s.ctaTitle}>
              당신의 합격 노하우를<br />수익으로 만드세요
            </h2>
            <p className={s.ctaSub}>
              5년 이상 경력 + 수강생 합격 실적이 있다면<br />
              지금 바로 인증 강사에 도전하세요.
            </p>
          </div>
          <div className={s.ctaAction}>
            <Link to="/instructor" className={s.btnCta}>강사 신청하기 →</Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function MainPage() {
  return (
    <>
      <Hero />
      <CoursesSection />
      <CTABanner />
    </>
  );
}
