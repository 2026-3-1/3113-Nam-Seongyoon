import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { COURSES } from "../data/courses";
import s from "../styles/pages.module.css";

const CHAPTERS = [
  { id:1, title:"오리엔테이션 및 시험 안내", duration:"12:30", free:true },
  { id:2, title:"1과목 핵심 개념 정리", duration:"45:20", free:true },
  { id:3, title:"2과목 출제 포인트", duration:"38:15", free:false },
  { id:4, title:"3과목 실전 문제 풀이", duration:"52:40", free:false },
  { id:5, title:"4과목 단기 암기법", duration:"29:50", free:false },
  { id:6, title:"5과목 마무리 정리", duration:"41:05", free:false },
  { id:7, title:"실전 모의고사 1회", duration:"60:00", free:false },
  { id:8, title:"실전 모의고사 2회 + 해설", duration:"65:30", free:false },
];
const REVIEWS = [
  { id:1, name:"김**", rating:5, date:"2026.02.14", content:"덕분에 한 번에 합격했습니다! 커리큘럼이 정말 체계적이에요." },
  { id:2, name:"이**", rating:5, date:"2026.02.01", content:"강사님 설명이 너무 명쾌해요. 어려운 개념도 쉽게 이해됩니다." },
  { id:3, name:"박**", rating:4, date:"2026.01.20", content:"내용은 좋은데 조금 더 실습 위주였으면 좋겠어요." },
];
const RATING_DIST = [70, 20, 8, 1, 1];

export default function CourseDetailPage() {
  const { id } = useParams();
  const course = COURSES.find(c => c.id === Number(id)) ?? COURSES[0];
  const [activeTab, setActiveTab] = useState<"curriculum"|"review">("curriculum");
  const [inCart, setInCart] = useState(false);
  const discount = course.originalPrice ? Math.round((1 - course.price / course.originalPrice) * 100) : null;

  return (
    <div className={s.container}>
      <div className={s.detailLayout}>
        <div className={s.detailLeft}>
          <div className={s.breadcrumb}>
            <Link to="/">홈</Link><span>›</span>
            <Link to="/courses">강의</Link><span>›</span>
            <span style={{ color: "var(--text)" }}>{course.title}</span>
          </div>
          <div className={s.detailThumb}>{course.thumbnail}</div>
          <span className={s.badge}>✓ {course.badge}</span>
          <h1 className={s.pageTitle}>{course.title}</h1>
          <p style={{ color:"var(--muted)", fontSize:"0.875rem", marginBottom:"1rem" }}>
            {course.instructor} 강사 · {course.duration} · {course.reviewCount.toLocaleString()}명 수강
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
                {tab === "curriculum" ? "커리큘럼" : `리뷰 (${REVIEWS.length})`}
              </button>
            ))}
          </div>
          {activeTab === "curriculum" && (
            <div className={s.chapterList}>
              {CHAPTERS.map((ch, i) => (
                <div key={ch.id} className={s.chapterItem}>
                  <div className={s.chapterLeft}>
                    <span className={s.chapterNum}>{String(i+1).padStart(2,"0")}</span>
                    <span className={ch.free ? s.chapterPlay : s.chapterLock}>{ch.free ? "▶" : "🔒"}</span>
                    <span className={s.chapterTitle}>{ch.title}</span>
                    {ch.free && <span className={s.chapterFree}>무료</span>}
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
                        <div className={s.ratingBarFill} style={{ width:`${RATING_DIST[i]}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className={s.reviewList}>
                {REVIEWS.map(r => (
                  <div key={r.id} className={s.reviewItem}>
                    <div className={s.reviewHeader}>
                      <div className={s.reviewUser}>
                        <div className={s.reviewAvatar}>{r.name[0]}</div>
                        <span className={s.reviewName}>{r.name}</span>
                      </div>
                      <span className={s.reviewDate}>{r.date}</span>
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
            <Link to={`/courses/${course.id}/learn`} className={s.btnEnroll}>지금 수강하기</Link>
            <button onClick={() => setInCart(!inCart)} className={`${s.btnCartAdd} ${inCart ? s.btnCartAdded : ""}`}>
              {inCart ? "✓ 장바구니 담김" : "장바구니 담기"}
            </button>
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
