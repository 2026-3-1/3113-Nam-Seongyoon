import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getCourse, addToCart, getEnrollments } from "../api";
import { useAuth } from "../context/AuthContext";
import s from "../styles/pages.module.css";

interface Chapter {
  id: number;
  title: string;
  duration?: string;
  sortOrder: number;
  isFree: boolean;
}

interface Review {
  id: number;
  rating: number;
  content: string;
  createdAt: string;
  user?: { name: string };
}

interface Course {
  id: number;
  title: string;
  instructorName: string;
  rating: number;
  reviewCount: number;
  price: number;
  originalPrice?: number;
  thumbnail?: string;
  badge?: string;
  duration?: string;
  chapters?: Chapter[];
  reviews?: Review[];
}

export default function CourseDetailPage() {
  const { id } = useParams();
  const { id: userId } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [activeTab, setActiveTab] = useState<"curriculum"|"review">("curriculum");
  const [inCart, setInCart] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);
  const [toast, setToast] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const courseId = Number(id);
    Promise.all([
      getCourse(courseId),
      getEnrollments(userId),
    ]).then(([c, enrollments]) => {
      setCourse(c);
      setIsEnrolled(enrollments.some((e: any) => e.course?.id === courseId));
    }).finally(() => setLoading(false));
  }, [id, userId]);

  const handleAddToCart = async () => {
    if (inCart || isEnrolled || cartLoading) return;
    setCartLoading(true);
    try {
      await addToCart(userId, Number(id));
      setInCart(true);
      setToast("장바구니에 담겼습니다!");
    } catch (e: any) {
      if (e?.response?.status === 409) {
        setInCart(true);
        setToast("이미 장바구니에 있습니다.");
      } else {
        setToast("오류가 발생했습니다.");
      }
    } finally {
      setCartLoading(false);
      setTimeout(() => setToast(""), 2500);
    }
  };

  if (loading) return <div className={s.container}>로딩 중...</div>;
  if (!course) return <div className={s.container}>강의를 찾을 수 없습니다.</div>;


  const discount = course.originalPrice ? Math.round((1 - course.price / course.originalPrice) * 100) : null;
  const chapters = course.chapters ?? [];
  const reviews = course.reviews ?? [];

  const ratingDist = [5, 4, 3, 2, 1].map(star => {
    const count = reviews.filter(r => Math.round(r.rating) === star).length;
    return reviews.length > 0 ? Math.round((count / reviews.length) * 100) : 0;
  });

  return (
    <div className={s.container}>
      {toast && (
        <div style={{
          position:"fixed", top:80, left:"50%", transform:"translateX(-50%)",
          background:"var(--surface)", border:"1px solid var(--border)",
          borderRadius:"var(--radius-sm)", padding:"0.75rem 1.5rem",
          color:"var(--text)", fontSize:"0.875rem", zIndex:999,
          boxShadow:"0 8px 24px rgba(0,0,0,0.4)",
        }}>{toast}</div>
      )}
      <div className={s.detailLayout}>
        <div className={s.detailLeft}>
          <div className={s.breadcrumb}>
            <Link to="/">홈</Link><span>›</span>
            <Link to="/courses">강의</Link><span>›</span>
            <span style={{ color: "var(--text)" }}>{course.title}</span>
          </div>
          <div className={s.detailThumb}>{course.thumbnail || "💻"}</div>
          <span className={s.badge}>✓ {course.badge || "인증강사"}</span>
          <h1 className={s.pageTitle}>{course.title}</h1>
          <p style={{ color:"var(--muted)", fontSize:"0.875rem", marginBottom:"1rem" }}>
            {course.instructorName} 강사 · {course.duration} · {course.reviewCount.toLocaleString()}명 수강
          </p>
          <div className={s.detailRating}>
            <div className={s.stars}>
              {[1,2,3,4,5].map(st => (
                <span key={st} className={st <= Math.round(course.rating) ? s.starFilled : s.starEmpty}>★</span>
              ))}
            </div>
            <span className={s.ratingNum}>{course.rating}</span>
            <span className={s.ratingCount}>({course.reviewCount.toLocaleString()}개 리뷰)</span>
          </div>
          <div className={s.tabs}>
            {(["curriculum","review"] as const).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`${s.tab} ${activeTab === tab ? s.tabActive : ""}`}>
                {tab === "curriculum" ? "커리큘럼" : `리뷰 (${reviews.length})`}
              </button>
            ))}
          </div>
          {activeTab === "curriculum" && (
            <div className={s.chapterList}>
              {chapters.map((ch, i) => (
                <div key={ch.id} className={s.chapterItem}>
                  <div className={s.chapterLeft}>
                    <span className={s.chapterNum}>{String(i+1).padStart(2,"0")}</span>
                    <span className={ch.isFree ? s.chapterPlay : s.chapterLock}>{ch.isFree ? "▶" : "🔒"}</span>
                    <span className={s.chapterTitle}>{ch.title}</span>
                    {ch.isFree && <span className={s.chapterFree}>무료</span>}
                  </div>
                  <span className={s.chapterDur}>{ch.duration}</span>
                </div>
              ))}
            </div>
          )}
          {activeTab === "review" && (
            <>
              <div className={s.reviewSummary}>
                <div className={s.bigRating}>{course.rating}</div>
                <div className={s.ratingBars}>
                  {[5,4,3,2,1].map((star, i) => (
                    <div key={star} className={s.ratingBarRow}>
                      <span className={s.ratingBarLabel}>{star}</span>
                      <div className={s.ratingBarTrack}>
                        <div className={s.ratingBarFill} style={{ width:`${ratingDist[i]}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className={s.reviewList}>
                {reviews.map(r => (
                  <div key={r.id} className={s.reviewItem}>
                    <div className={s.reviewHeader}>
                      <div className={s.reviewUser}>
                        <div className={s.reviewAvatar}>{r.user?.name?.[0] ?? "?"}</div>
                        <span className={s.reviewName}>{r.user?.name ?? "익명"}</span>
                      </div>
                      <span className={s.reviewDate}>{r.createdAt?.slice(0, 10)}</span>
                    </div>
                    <div className={s.reviewStars}>
                      {[1,2,3,4,5].map(st => <span key={st} className={st<=r.rating?s.starFilled:s.starEmpty}>★</span>)}
                    </div>
                    <p className={s.reviewContent}>{r.content}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
        <div className={s.detailRight}>
          <div className={s.stickyCard}>
            <div className={s.priceBlock}>
              {course.originalPrice && (
                <div className={s.origPrice}>
                  {course.originalPrice.toLocaleString()}원
                  {discount && <span className={s.discountBadge}>{discount}% 할인</span>}
                </div>
              )}
              <div className={s.mainPrice}>{course.price.toLocaleString()}원</div>
            </div>
            {isEnrolled ? (
              <Link to={`/courses/${course.id}/learn`} className={s.btnEnroll}>이어 수강하기</Link>
            ) : (
              <Link to={`/courses/${course.id}/learn`} className={s.btnEnroll}>지금 수강하기</Link>
            )}
            {isEnrolled ? (
              <div className={`${s.btnCartAdd} ${s.btnCartAdded}`} style={{ textAlign:"center", cursor:"default" }}>
                ✓ 수강 중인 강의
              </div>
            ) : (
              <button onClick={handleAddToCart} disabled={cartLoading}
                className={`${s.btnCartAdd} ${inCart ? s.btnCartAdded : ""}`}>
                {cartLoading ? "담는 중..." : inCart ? "✓ 장바구니 담김" : "장바구니 담기"}
              </button>
            )}
            <div className={s.courseInfo}>
              {[
                ["📚","총 강의",course.duration],
                ["⭐","평점",`${course.rating} / 5.0`],
                ["👤","수강생",`${course.reviewCount.toLocaleString()}명`],
                ["🏅","강사 인증",course.badge],
              ].map(([icon,label,value]) => (
                <div key={label} className={s.infoRow}>
                  <span className={s.infoLabel}>{icon} {label}</span>
                  <span className={s.infoValue}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
