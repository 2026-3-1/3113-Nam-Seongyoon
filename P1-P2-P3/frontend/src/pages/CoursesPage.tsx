import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CATEGORIES } from "../lib/categories";
import { isImageSource } from "../lib/media";
import { api, getAuth } from "../lib/api";
import type { Course } from "../types";
import s from "../styles/pages.module.css";

const SORT_OPTIONS = [
  { value: "popular", label: "인기순" },
  { value: "latest", label: "최신순" },
  { value: "price_asc", label: "낮은 가격순" },
  { value: "price_desc", label: "높은 가격순" },
  { value: "rating", label: "평점순" },
];

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [activeCat, setActiveCat] = useState("all");
  const [sort, setSort] = useState("popular");
  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const LIMIT = 20;

  useEffect(() => {
    api
      .courses(page, LIMIT)
      .then((res) => {
        setCourses(res.data);
        setTotalPages(res.totalPages);
        setNotice("");
      })
      .catch(() => setNotice("강의 목록을 불러오지 못했습니다."));
  }, [page]);

  const filtered = useMemo(() => {
    return [...courses]
      .filter((course) => activeCat === "all" || course.category === activeCat)
      .filter((course) => {
        const teacher = course.teacher?.name ?? "";
        return `${course.title} ${teacher}`.toLowerCase().includes(search.toLowerCase());
      })
      .sort((a, b) => {
        if (sort === "price_asc") return a.price - b.price;
        if (sort === "price_desc") return b.price - a.price;
        if (sort === "rating") return Number(b.rating) - Number(a.rating);
        if (sort === "latest") return b.id - a.id;
        return b.reviewCount - a.reviewCount;
      });
  }, [activeCat, courses, search, sort]);

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
      <div className={s.pageTitle}>
        전체 <span className={s.accentBlue}>강의</span>
      </div>
      <p className={s.pageSub}>선생님이 등록한 실제 강의만 표시됩니다.</p>
      {notice && <p className={s.formError} style={{ marginBottom: "1rem" }}>{notice}</p>}

      <div className={s.searchWrap}>
        <input
          className={s.searchInput}
          placeholder="강의명 또는 강사명으로 검색"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      <div className={s.filterRow}>
        <div className={s.catFilter}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCat(cat.id)}
              className={`${s.catBtn} ${activeCat === cat.id ? s.catBtnActive : ""}`}
            >
              {cat.label}
            </button>
          ))}
        </div>
        <select className={s.sortSelect} value={sort} onChange={(event) => setSort(event.target.value)}>
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      <p className={s.resultCount}>총 <strong>{filtered.length}</strong>개 강의</p>

      {filtered.length === 0 ? (
        <div className={s.emptyState}>
          <div className={s.emptyTitle}>등록된 강의가 없습니다.</div>
          <p className={s.emptyDesc}>선생님 계정으로 로그인해 강의를 등록하면 여기에 표시됩니다.</p>
        </div>
      ) : (
        <>
        <div className={s.grid}>
          {filtered.map((course) => {
            const originalPrice = course.originalPrice && course.originalPrice > course.price ? course.originalPrice : null;
            const discount = originalPrice ? Math.round((1 - course.price / originalPrice) * 100) : null;
            return (
              <article key={course.id} className={s.courseCard}>
                <Link to={`/courses/${course.id}`} className={s.cardThumb}>
                  {isImageSource(course.thumbnail) ? (
                    <img src={course.thumbnail} alt="" className={s.thumbImage} />
                  ) : (
                    "No image"
                  )}
                  {course.tag && <span className={s.cardTagBest}>{course.tag}</span>}
                  {discount && <span className={s.cardOff}>{discount}% OFF</span>}
                </Link>
                <div className={s.cardBody}>
                  <span className={s.cardBadge}>{course.badge}</span>
                  <Link to={`/courses/${course.id}`} className={s.cardTitle}>{course.title}</Link>
                  <div className={s.cardMeta}>{course.teacher?.name ?? "인증 강사"} · {course.duration}</div>
                  <div className={s.cardRating}>
                    <span className={s.cardStar}>★</span>
                    <span className={s.cardRatingNum}>{Number(course.rating).toFixed(1)}</span>
                    <span className={s.cardReviews}>({course.reviewCount.toLocaleString()})</span>
                  </div>
                  {originalPrice && <div className={s.cardOrigPrice}>{originalPrice.toLocaleString()}원</div>}
                  <div className={s.cardFooter}>
                    <div className={s.cardPrice}>{course.price.toLocaleString()}원</div>
                    <button type="button" className={s.cardCartBtn} onClick={() => addToCart(course.id)}>담기</button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
        {totalPages > 1 && (
          <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem", marginTop: "2rem" }}>
            <button className={s.catBtn} onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>이전</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button key={p} className={`${s.catBtn} ${p === page ? s.catBtnActive : ""}`} onClick={() => setPage(p)}>{p}</button>
            ))}
            <button className={s.catBtn} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>다음</button>
          </div>
        )}
        </>
      )}
    </div>
  );
}
