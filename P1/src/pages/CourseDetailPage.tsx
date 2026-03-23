import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { COURSES } from "../data/courses";

const DUMMY_CHAPTERS = [
  { id: 1, title: "오리엔테이션 및 시험 안내", duration: "12:30", free: true },
  { id: 2, title: "1과목 핵심 개념 정리", duration: "45:20", free: true },
  { id: 3, title: "2과목 출제 포인트", duration: "38:15", free: false },
  { id: 4, title: "3과목 실전 문제 풀이", duration: "52:40", free: false },
  { id: 5, title: "4과목 단기 암기법", duration: "29:50", free: false },
  { id: 6, title: "5과목 마무리 정리", duration: "41:05", free: false },
  { id: 7, title: "실전 모의고사 1회", duration: "60:00", free: false },
  { id: 8, title: "실전 모의고사 2회 + 해설", duration: "65:30", free: false },
];

const DUMMY_REVIEWS = [
  { id: 1, name: "김**", rating: 5, date: "2026.02.14", content: "덕분에 한 번에 합격했습니다! 커리큘럼이 정말 체계적이에요." },
  { id: 2, name: "이**", rating: 5, date: "2026.02.01", content: "강사님 설명이 너무 명쾌해요. 어려운 개념도 쉽게 이해됩니다." },
  { id: 3, name: "박**", rating: 4, date: "2026.01.20", content: "내용은 좋은데 조금 더 실습 위주였으면 좋겠어요." },
];

export default function CourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const course = COURSES.find((c) => c.id === Number(id)) ?? COURSES[0];
  const [activeTab, setActiveTab] = useState<"curriculum" | "review">("curriculum");
  const [inCart, setInCart] = useState(false);

  const discount = course.originalPrice
    ? Math.round((1 - course.price / course.originalPrice) * 100)
    : null;

  return (
    <div className="max-w-screen-xl mx-auto px-6 md:px-10 py-12">
      <div className="flex flex-col lg:flex-row gap-10">

        {/* ── Left Content ── */}
        <div className="flex-1 min-w-0">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-[#7A7D85] mb-6">
            <Link to="/" className="hover:text-white transition-colors">홈</Link>
            <span>›</span>
            <Link to="/courses" className="hover:text-white transition-colors">강의</Link>
            <span>›</span>
            <span className="text-white">{course.title}</span>
          </div>

          {/* Thumbnail */}
          <div className="w-full h-56 md:h-72 bg-[#1c1e22] rounded-2xl flex items-center justify-center text-[5rem] mb-8 border border-white/[0.07]">
            {course.thumbnail}
          </div>

          {/* Badge + Title */}
          <span className="inline-flex items-center gap-1 bg-[#A78BFA]/10 border border-[#A78BFA]/20 text-[#A78BFA] text-xs font-bold px-2.5 py-1 rounded-md mb-4">
            ✓ {course.badge}
          </span>
          <h1 className="font-['Syne'] text-2xl md:text-3xl font-extrabold tracking-tight mb-3">{course.title}</h1>
          <p className="text-[#7A7D85] text-sm mb-4">{course.instructor} 강사 · {course.duration} · 수강생 {course.reviewCount.toLocaleString()}명</p>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-8">
            <div className="flex gap-0.5">
              {[1,2,3,4,5].map((s) => (
                <span key={s} className={`text-base ${s <= Math.round(course.rating) ? "text-[#F5C518]" : "text-white/20"}`}>★</span>
              ))}
            </div>
            <span className="text-[#F5C518] font-bold">{course.rating}</span>
            <span className="text-[#7A7D85] text-sm">({course.reviewCount.toLocaleString()}개 리뷰)</span>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 border-b border-white/[0.07] mb-8">
            {(["curriculum", "review"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2.5 text-sm font-semibold border-b-2 transition-all -mb-px ${
                  activeTab === tab
                    ? "border-[#4F8EF7] text-[#4F8EF7]"
                    : "border-transparent text-[#7A7D85] hover:text-white"
                }`}
              >
                {tab === "curriculum" ? "커리큘럼" : `리뷰 (${DUMMY_REVIEWS.length})`}
              </button>
            ))}
          </div>

          {/* Curriculum Tab */}
          {activeTab === "curriculum" && (
            <div className="space-y-2">
              {DUMMY_CHAPTERS.map((ch, i) => (
                <div key={ch.id} className="flex items-center justify-between p-4 bg-[#141517] border border-white/[0.07] rounded-xl hover:border-white/20 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-[#7A7D85] text-xs font-mono w-5 shrink-0">{String(i+1).padStart(2,"0")}</span>
                    {ch.free
                      ? <span className="text-[#4F8EF7] text-lg shrink-0">▶</span>
                      : <span className="text-[#7A7D85] text-base shrink-0">🔒</span>
                    }
                    <span className="text-sm font-medium truncate">{ch.title}</span>
                    {ch.free && (
                      <span className="bg-[#4F8EF7]/15 text-[#4F8EF7] text-[0.65rem] font-bold px-2 py-0.5 rounded shrink-0">무료</span>
                    )}
                  </div>
                  <span className="text-[#7A7D85] text-xs shrink-0 ml-4">{ch.duration}</span>
                </div>
              ))}
            </div>
          )}

          {/* Review Tab */}
          {activeTab === "review" && (
            <div className="space-y-4">
              {/* Summary */}
              <div className="flex items-center gap-6 p-6 bg-[#141517] border border-white/[0.07] rounded-2xl mb-6">
                <div className="text-center">
                  <div className="font-['Syne'] text-5xl font-extrabold text-[#F5C518]">{course.rating}</div>
                  <div className="flex gap-0.5 justify-center mt-1">
                    {[1,2,3,4,5].map((s) => (
                      <span key={s} className="text-[#F5C518]">★</span>
                    ))}
                  </div>
                  <div className="text-[#7A7D85] text-xs mt-1">수강생 평점</div>
                </div>
                <div className="flex-1 space-y-1.5">
                  {[5,4,3,2,1].map((star) => (
                    <div key={star} className="flex items-center gap-2">
                      <span className="text-[#7A7D85] text-xs w-3">{star}</span>
                      <div className="flex-1 bg-white/10 rounded-full h-1.5">
                        <div
                          className="bg-[#F5C518] h-1.5 rounded-full"
                          style={{ width: `${star === 5 ? 70 : star === 4 ? 20 : star === 3 ? 8 : 2}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {DUMMY_REVIEWS.map((review) => (
                <div key={review.id} className="p-5 bg-[#141517] border border-white/[0.07] rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-[#4F8EF7]/20 flex items-center justify-center text-[#4F8EF7] text-xs font-bold">
                        {review.name[0]}
                      </div>
                      <span className="text-sm font-semibold">{review.name}</span>
                    </div>
                    <span className="text-[#7A7D85] text-xs">{review.date}</span>
                  </div>
                  <div className="flex gap-0.5 mb-2">
                    {[1,2,3,4,5].map((s) => (
                      <span key={s} className={`text-xs ${s <= review.rating ? "text-[#F5C518]" : "text-white/20"}`}>★</span>
                    ))}
                  </div>
                  <p className="text-sm text-white/80 leading-relaxed">{review.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Right Sticky Card ── */}
        <div className="lg:w-80 shrink-0">
          <div className="sticky top-24 bg-[#141517] border border-white/[0.07] rounded-2xl p-6">
            <div className="text-center mb-6">
              {course.originalPrice && (
                <div className="flex items-center justify-center gap-2 mb-1">
                  <span className="text-[#7A7D85] text-sm line-through">{course.originalPrice.toLocaleString()}원</span>
                  {discount && <span className="bg-[#FF4757] text-white text-xs font-bold px-2 py-0.5 rounded">{discount}% 할인</span>}
                </div>
              )}
              <div className="font-['Syne'] text-3xl font-extrabold">{course.price.toLocaleString()}원</div>
            </div>

            <Link
              to={`/courses/${course.id}/learn`}
              className="block w-full text-center py-3.5 rounded-xl font-bold text-base text-white bg-gradient-to-r from-[#4F8EF7] to-[#A78BFA] shadow-[0_6px_24px_rgba(79,142,247,0.3)] hover:opacity-90 transition-opacity mb-3"
            >
              지금 수강하기
            </Link>
            <button
              onClick={() => setInCart(!inCart)}
              className={`w-full py-3.5 rounded-xl font-bold text-base border transition-all ${
                inCart
                  ? "bg-[#4F8EF7]/15 border-[#4F8EF7] text-[#4F8EF7]"
                  : "border-white/10 text-white hover:border-white/30"
              }`}
            >
              {inCart ? "✓ 장바구니 담김" : "장바구니 담기"}
            </button>

            <div className="mt-6 space-y-3 text-sm">
              {[
                ["📚", "총 강의 수", course.duration],
                ["⭐", "평점", `${course.rating} / 5.0`],
                ["👤", "수강생", `${course.reviewCount.toLocaleString()}명`],
                ["🏅", "강사 인증", course.badge],
              ].map(([icon, label, value]) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-[#7A7D85] flex items-center gap-1.5">{icon} {label}</span>
                  <span className="text-white font-medium">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
