import { useState } from "react";
import { Link } from "react-router-dom";
import { CATEGORIES, COURSES } from "../data/courses";

const TAG_STYLE: Record<string, string> = {
  BEST: "bg-[#FF4757] text-white",
  NEW: "bg-[#2ED573] text-white",
  HOT: "bg-[#FF6348] text-white",
};

const SORT_OPTIONS = [
  { value: "popular", label: "인기순" },
  { value: "latest", label: "최신순" },
  { value: "price_asc", label: "가격 낮은순" },
  { value: "price_desc", label: "가격 높은순" },
  { value: "rating", label: "평점순" },
];

export default function CoursesPage() {
  const [activeCategory, setActiveCategory] = useState(0);
  const [sort, setSort] = useState("popular");
  const [search, setSearch] = useState("");

  const filtered = COURSES
    .filter((c) => activeCategory === 0 || c.categoryId === activeCategory)
    .filter((c) => c.title.includes(search) || c.instructor.includes(search))
    .sort((a, b) => {
      if (sort === "price_asc") return a.price - b.price;
      if (sort === "price_desc") return b.price - a.price;
      if (sort === "rating") return b.rating - a.rating;
      if (sort === "latest") return b.id - a.id;
      return b.reviewCount - a.reviewCount;
    });

  return (
    <div className="max-w-screen-xl mx-auto px-6 md:px-10 py-12">
      {/* Header */}
      <div className="mb-10">
        <h1 className="font-['Syne'] text-3xl font-extrabold tracking-tight mb-2">
          전체 <span className="text-[#4F8EF7]">강의</span>
        </h1>
        <p className="text-[#7A7D85] text-sm">인증 강사의 검증된 커리큘럼으로 합격을 준비하세요</p>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7A7D85] text-base">🔍</span>
        <input
          type="text"
          placeholder="강의명, 강사명으로 검색..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-[#141517] border border-white/[0.07] rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-[#7A7D85] focus:outline-none focus:border-[#4F8EF7]/50 transition-colors"
        />
      </div>

      {/* Filter + Sort Row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold border transition-all duration-200 ${
                activeCategory === cat.id
                  ? "bg-[#4F8EF7] border-[#4F8EF7] text-white shadow-[0_4px_16px_rgba(79,142,247,0.3)]"
                  : "bg-[#141517] border-white/[0.07] text-[#7A7D85] hover:border-[#4F8EF7] hover:text-[#4F8EF7]"
              }`}
            >
              {cat.icon} {cat.label}
            </button>
          ))}
        </div>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="bg-[#141517] border border-white/[0.07] text-sm text-white rounded-lg px-3 py-2 focus:outline-none focus:border-[#4F8EF7]/50 shrink-0"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Result Count */}
      <p className="text-[#7A7D85] text-sm mb-6">
        총 <span className="text-white font-semibold">{filtered.length}</span>개 강의
      </p>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map((course) => {
            const discount = course.originalPrice
              ? Math.round((1 - course.price / course.originalPrice) * 100)
              : null;
            return (
              <Link
                to={`/courses/${course.id}`}
                key={course.id}
                className="group bg-[#141517] border border-white/[0.07] rounded-2xl overflow-hidden hover:-translate-y-1 hover:border-[#4F8EF7]/35 hover:shadow-[0_16px_40px_rgba(0,0,0,0.4)] transition-all duration-300"
              >
                <div className="h-36 bg-[#1c1e22] flex items-center justify-center text-[3rem] relative border-b border-white/[0.07]">
                  {course.thumbnail}
                  {course.tag && (
                    <span className={`absolute top-3 left-3 text-[0.7rem] font-extrabold px-2 py-0.5 rounded-md ${TAG_STYLE[course.tag]}`}>
                      {course.tag}
                    </span>
                  )}
                  {discount && (
                    <span className="absolute top-3 right-3 text-[0.7rem] font-extrabold px-2 py-0.5 rounded-md bg-[#4F8EF7]/20 text-[#4F8EF7] border border-[#4F8EF7]/30">
                      {discount}% OFF
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <span className="inline-flex items-center gap-1 bg-[#A78BFA]/10 border border-[#A78BFA]/20 text-[#A78BFA] text-[0.68rem] font-bold px-2 py-0.5 rounded-md mb-2">
                    ✓ {course.badge}
                  </span>
                  <h3 className="text-[0.9rem] font-bold leading-snug mb-1 text-white group-hover:text-[#4F8EF7] transition-colors line-clamp-2">
                    {course.title}
                  </h3>
                  <p className="text-[#7A7D85] text-xs mb-1">{course.instructor} 강사 · {course.duration}</p>
                  <div className="flex items-center gap-1 mb-3">
                    <span className="text-[#F5C518] text-xs">★</span>
                    <span className="text-[#F5C518] font-bold text-xs">{course.rating}</span>
                    <span className="text-[#7A7D85] text-xs">({course.reviewCount.toLocaleString()})</span>
                  </div>
                  <div className="flex flex-col">
                    {course.originalPrice && (
                      <span className="text-[#7A7D85] text-[0.72rem] line-through">{course.originalPrice.toLocaleString()}원</span>
                    )}
                    <span className="font-['Syne'] text-base font-extrabold">{course.price.toLocaleString()}원</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="text-5xl mb-4">🔍</div>
          <p className="text-white font-semibold mb-2">검색 결과가 없습니다</p>
          <p className="text-[#7A7D85] text-sm">다른 검색어나 카테고리를 시도해보세요</p>
        </div>
      )}
    </div>
  );
}
