import { useState } from "react";
import { Link } from "react-router-dom";
import { CATEGORIES, COURSES } from "../data/courses";
import s from "../styles/pages.module.css";

const SORT_OPTIONS = [
  { value: "popular", label: "인기순" },
  { value: "latest", label: "최신순" },
  { value: "price_asc", label: "가격 낮은순" },
  { value: "price_desc", label: "가격 높은순" },
  { value: "rating", label: "평점순" },
];

const TAG_CLASS: Record<string, string> = {
  BEST: s.cardTagBest, NEW: s.cardTagNew, HOT: s.cardTagHot,
};

export default function CoursesPage() {
  const [activeCat, setActiveCat] = useState(0);
  const [sort, setSort] = useState("popular");
  const [search, setSearch] = useState("");

  const filtered = COURSES
    .filter(c => activeCat === 0 || c.categoryId === activeCat)
    .filter(c => c.title.includes(search) || c.instructor.includes(search))
    .sort((a, b) => {
      if (sort === "price_asc") return a.price - b.price;
      if (sort === "price_desc") return b.price - a.price;
      if (sort === "rating") return b.rating - a.rating;
      if (sort === "latest") return b.id - a.id;
      return b.reviewCount - a.reviewCount;
    });

  return (
    <div className={s.container}>
      <div className={s.pageTitle} style={{ marginBottom: "0.5rem" }}>
        전체 <span className={s.accentBlue}>강의</span>
      </div>
      <p className={s.pageSub}>인증 강사의 검증된 커리큘럼으로 합격을 준비하세요</p>

      <div className={s.searchWrap}>
        <span className={s.searchIcon}>🔍</span>
        <input className={s.searchInput} placeholder="강의명, 강사명으로 검색..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className={s.filterRow}>
        <div className={s.catFilter}>
          {CATEGORIES.map(cat => (
            <button key={cat.id} onClick={() => setActiveCat(cat.id)}
              className={`${s.catBtn} ${activeCat === cat.id ? s.catBtnActive : ""}`}>
              {cat.icon} {cat.label}
            </button>
          ))}
        </div>
        <select className={s.sortSelect} value={sort} onChange={e => setSort(e.target.value)}>
          {SORT_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
      </div>

      <p className={s.resultCount}>총 <strong>{filtered.length}</strong>개 강의</p>

      {filtered.length > 0 ? (
        <div className={s.grid}>
          {filtered.map(course => {
            const discount = course.originalPrice ? Math.round((1 - course.price / course.originalPrice) * 100) : null;
            return (
              <Link to={`/courses/${course.id}`} key={course.id} className={s.courseCard}>
                <div className={s.cardThumb}>
                  {course.thumbnail}
                  {course.tag && <span className={TAG_CLASS[course.tag]}>{course.tag}</span>}
                  {discount && <span className={s.cardOff}>{discount}% OFF</span>}
                </div>
                <div className={s.cardBody}>
                  <span className={s.cardBadge}>✓ {course.badge}</span>
                  <div className={s.cardTitle}>{course.title}</div>
                  <div className={s.cardMeta}>{course.instructor} 강사 · {course.duration}</div>
                  <div className={s.cardRating}>
                    <span className={s.cardStar}>★</span>
                    <span className={s.cardRatingNum}>{course.rating}</span>
                    <span className={s.cardReviews}>({course.reviewCount.toLocaleString()})</span>
                  </div>
                  {course.originalPrice && <div className={s.cardOrigPrice}>{course.originalPrice.toLocaleString()}원</div>}
                  <div className={s.cardPrice}>{course.price.toLocaleString()}원</div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className={s.emptyState}>
          <div className={s.emptyIcon}>🔍</div>
          <p className={s.emptyTitle}>검색 결과가 없습니다</p>
          <p className={s.emptyDesc}>다른 검색어나 카테고리를 시도해보세요</p>
        </div>
      )}
    </div>
  );
}
