import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import type { Course } from "../types";
import { CATEGORIES, COURSES } from "../data/courses";

const TAG_STYLE: Record<string, string> = {
  BEST: "bg-[#E8D5A3] text-[#0a0a0f]",
  NEW: "bg-[#4ade80] text-[#0a0a0f]",
  HOT: "bg-[#fb923c] text-[#0a0a0f]",
};

function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* 배경 노이즈 텍스처 느낌 */}
      <div className="absolute inset-0 z-0" style={{
        background: "radial-gradient(ellipse 100% 80% at 50% -10%, rgba(232,213,163,0.08) 0%, transparent 60%)",
      }} />
      {/* 대각선 그리드 */}
      <div className="absolute inset-0 z-0 opacity-[0.04]" style={{
        backgroundImage: "repeating-linear-gradient(45deg, #E8D5A3 0, #E8D5A3 1px, transparent 0, transparent 50%)",
        backgroundSize: "24px 24px",
      }} />

      <div className="relative z-10 w-full max-w-screen-xl mx-auto px-6 md:px-10 py-32">
        <div className="max-w-3xl">
          {/* 에디토리얼 레이블 */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-px bg-[#E8D5A3]" />
            <span className="text-[#E8D5A3] text-xs font-semibold tracking-[0.2em] uppercase">
              Certified Instructors Only
            </span>
          </div>

          <h1 className="font-['DM_Serif_Display'] text-[clamp(3rem,7vw,5.5rem)] font-normal leading-[1.05] tracking-[-1px] mb-8">
            합격으로 가는<br />
            <span className="italic text-[#E8D5A3]">가장 빠른 길</span>
          </h1>

          <p className="text-white/50 text-lg leading-relaxed max-w-xl mb-12">
            검증된 강사의 커리큘럼만 있습니다.<br />
            정보의 바다에서 길을 잃지 마세요.
          </p>

          <div className="flex flex-wrap gap-4 mb-20">
            <Link to="/courses"
              className="group flex items-center gap-3 px-7 py-4 bg-[#E8D5A3] text-[#0a0a0f] font-semibold text-sm tracking-wide rounded-full hover:bg-white transition-colors duration-200"
            >
              강의 시작하기
              <span className="w-5 h-5 rounded-full bg-[#0a0a0f] flex items-center justify-center text-[#E8D5A3] text-xs group-hover:translate-x-0.5 transition-transform">→</span>
            </Link>
            <Link to="/instructor"
              className="px-7 py-4 border border-white/15 text-white/70 font-medium text-sm tracking-wide rounded-full hover:border-white/40 hover:text-white transition-all duration-200"
            >
              강사 인증 신청
            </Link>
          </div>

          {/* Stats - 에디토리얼 방식 */}
          <div className="flex gap-12 pt-8 border-t border-white/[0.07]">
            {[
              { num: "12,000+", label: "수강생" },
              { num: "98%", label: "만족도" },
              { num: "200+", label: "인증 강사" },
            ].map(({ num, label }) => (
              <div key={label}>
                <div className="font-['DM_Serif_Display'] text-2xl text-[#E8D5A3] mb-0.5">{num}</div>
                <div className="text-white/30 text-xs tracking-widest uppercase">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function CourseCard({ course, index }: { course: Course; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const discount = course.originalPrice
    ? Math.round((1 - course.price / course.originalPrice) * 100)
    : null;

  return (
    <Link
      to={`/courses/${course.id}`}
      ref={ref}
      className={`group block bg-[#111118] border border-white/[0.06] rounded-2xl overflow-hidden hover:border-[#E8D5A3]/30 hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(0,0,0,0.5)] transition-all duration-300 ${
        visible ? "animate-cardIn" : "opacity-0 translate-y-4"
      }`}
      style={{ animationDelay: `${index * 0.06}s` }}
    >
      {/* 썸네일 */}
      <div className="h-40 bg-[#16161f] flex items-center justify-center text-5xl relative border-b border-white/[0.05]">
        {course.thumbnail}
        {course.tag && (
          <span className={`absolute top-3 left-3 text-[0.68rem] font-bold px-2.5 py-1 rounded-full ${TAG_STYLE[course.tag]}`}>
            {course.tag}
          </span>
        )}
        {discount && (
          <span className="absolute top-3 right-3 text-[0.68rem] font-bold px-2.5 py-1 rounded-full bg-white/10 text-white/70 border border-white/10">
            {discount}% ↓
          </span>
        )}
      </div>

      <div className="p-5">
        {/* 인증 뱃지 */}
        <div className="flex items-center gap-1.5 mb-3">
          <span className="w-1.5 h-1.5 rounded-full bg-[#E8D5A3]" />
          <span className="text-[#E8D5A3] text-[0.68rem] font-semibold tracking-wide uppercase">{course.badge}</span>
        </div>

        <h3 className="text-[0.95rem] font-semibold leading-snug mb-2 text-white/90 group-hover:text-white transition-colors line-clamp-2">
          {course.title}
        </h3>
        <p className="text-white/35 text-xs mb-4">{course.instructor} · {course.duration}</p>

        <div className="flex items-center gap-1.5 mb-4">
          <span className="text-[#E8D5A3] text-xs">★ {course.rating}</span>
          <span className="text-white/25 text-xs">({course.reviewCount.toLocaleString()})</span>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-white/[0.06]">
          <div>
            {course.originalPrice && (
              <span className="text-white/25 text-xs line-through block">{course.originalPrice.toLocaleString()}원</span>
            )}
            <span className="font-['DM_Serif_Display'] text-lg text-white">{course.price.toLocaleString()}원</span>
          </div>
          <span className="text-[0.75rem] font-semibold px-3 py-1.5 rounded-full border border-white/10 text-white/50 group-hover:border-[#E8D5A3]/50 group-hover:text-[#E8D5A3] transition-all">
            담기
          </span>
        </div>
      </div>
    </Link>
  );
}

function CoursesSection() {
  const [activeCategory, setActiveCategory] = useState(0);
  const filtered = activeCategory === 0 ? COURSES : COURSES.filter((c) => c.categoryId === activeCategory);

  return (
    <section className="py-28">
      <div className="max-w-screen-xl mx-auto px-6 md:px-10">
        <div className="flex items-end justify-between mb-12">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-px bg-[#E8D5A3]" />
              <span className="text-[#E8D5A3] text-xs font-semibold tracking-[0.2em] uppercase">Popular Courses</span>
            </div>
            <h2 className="font-['DM_Serif_Display'] text-4xl font-normal">인기 강의</h2>
          </div>
          <Link to="/courses" className="text-white/35 text-sm hover:text-[#E8D5A3] transition-colors">
            전체 보기 →
          </Link>
        </div>

        {/* 카테고리 필터 */}
        <div className="flex flex-wrap gap-2 mb-10">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wide border transition-all duration-200 ${
                activeCategory === cat.id
                  ? "bg-[#E8D5A3] border-[#E8D5A3] text-[#0a0a0f]"
                  : "bg-transparent border-white/10 text-white/40 hover:border-white/25 hover:text-white/70"
              }`}
            >
              {cat.icon} {cat.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((course, i) => <CourseCard key={course.id} course={course} index={i} />)}
        </div>
      </div>
    </section>
  );
}

function CTABanner() {
  return (
    <section className="pb-28">
      <div className="max-w-screen-xl mx-auto px-6 md:px-10">
        <div className="relative rounded-3xl overflow-hidden p-14 md:p-16"
          style={{ background: "linear-gradient(135deg, #1a1508 0%, #0f0d1a 60%, #0a0a0f 100%)" }}
        >
          {/* 장식 선 */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#E8D5A3]/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#E8D5A3]/10 to-transparent" />

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-10">
            <div className="max-w-xl">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-px bg-[#E8D5A3]" />
                <span className="text-[#E8D5A3] text-xs font-semibold tracking-[0.2em] uppercase">For Instructors</span>
              </div>
              <h2 className="font-['DM_Serif_Display'] text-4xl font-normal leading-snug mb-4">
                합격 경험을<br />
                <span className="italic">수익으로 바꾸세요</span>
              </h2>
              <p className="text-white/40 text-base leading-relaxed">
                5년 이상 경력과 수강생 합격 실적이 있다면<br />
                지금 바로 인증 강사에 도전할 수 있습니다.
              </p>
            </div>
            <div className="flex-shrink-0">
              <Link to="/instructor"
                className="group flex items-center gap-3 px-8 py-4 bg-[#E8D5A3] text-[#0a0a0f] font-semibold text-sm tracking-wide rounded-full hover:bg-white transition-colors"
              >
                강사 인증 신청하기
                <span className="w-5 h-5 rounded-full bg-[#0a0a0f] flex items-center justify-center text-[#E8D5A3] text-xs group-hover:translate-x-0.5 transition-transform">→</span>
              </Link>
            </div>
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
