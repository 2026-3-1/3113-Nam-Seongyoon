import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { COURSES } from "../data/courses";

const CHAPTERS = [
  { id: 1, title: "오리엔테이션 및 시험 안내", duration: "12:30", completed: true },
  { id: 2, title: "1과목 핵심 개념 정리", duration: "45:20", completed: true },
  { id: 3, title: "2과목 출제 포인트", duration: "38:15", completed: false },
  { id: 4, title: "3과목 실전 문제 풀이", duration: "52:40", completed: false },
  { id: 5, title: "4과목 단기 암기법", duration: "29:50", completed: false },
  { id: 6, title: "5과목 마무리 정리", duration: "41:05", completed: false },
  { id: 7, title: "실전 모의고사 1회", duration: "60:00", completed: false },
  { id: 8, title: "실전 모의고사 2회 + 해설", duration: "65:30", completed: false },
];

export default function LearnPage() {
  const { id } = useParams<{ id: string }>();
  const course = COURSES.find((c) => c.id === Number(id)) ?? COURSES[0];
  const [activeChapter, setActiveChapter] = useState(3);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const current = CHAPTERS.find((c) => c.id === activeChapter) ?? CHAPTERS[2];
  const completedCount = CHAPTERS.filter((c) => c.completed).length;
  const progress = Math.round((completedCount / CHAPTERS.length) * 100);

  return (
    <div className="min-h-screen bg-[#0c0d0f] text-white font-['Pretendard'] flex flex-col">

      {/* ── Top Bar ── */}
      <header className="h-14 bg-[#0c0d0f] border-b border-white/[0.07] flex items-center justify-between px-4 shrink-0 z-40">
        <div className="flex items-center gap-4">
          <Link to={`/courses/${id}`} className="text-[#7A7D85] hover:text-white transition-colors text-sm flex items-center gap-1.5">
            ← 강의 소개
          </Link>
          <span className="text-white/20">|</span>
          <span className="font-['Syne'] text-sm font-bold bg-gradient-to-r from-[#4F8EF7] to-[#A78BFA] bg-clip-text text-transparent hidden sm:block">
            CertificatEdu
          </span>
        </div>

        <h1 className="text-sm font-semibold text-white/80 truncate max-w-xs hidden md:block">{course.title}</h1>

        <div className="flex items-center gap-3">
          {/* Progress */}
          <div className="hidden sm:flex items-center gap-2">
            <div className="w-24 bg-white/10 rounded-full h-1.5">
              <div className="bg-[#4F8EF7] h-1.5 rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
            <span className="text-xs text-[#7A7D85]">{progress}%</span>
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="px-3 py-1.5 rounded-lg border border-white/10 text-xs font-medium text-white/70 hover:border-white/30 transition-colors"
          >
            {sidebarOpen ? "목록 닫기" : "목록 열기"}
          </button>
        </div>
      </header>

      {/* ── Main Area ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Video Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Video Player */}
          <div className="bg-black flex items-center justify-center" style={{ aspectRatio: "16/9", maxHeight: "calc(100vh - 14rem)" }}>
            <div className="flex flex-col items-center gap-4 text-center px-6">
              <div className="w-20 h-20 rounded-full bg-[#4F8EF7]/20 border border-[#4F8EF7]/30 flex items-center justify-center text-3xl">
                ▶
              </div>
              <div>
                <p className="text-white font-semibold mb-1">{current.title}</p>
                <p className="text-[#7A7D85] text-sm">{current.duration}</p>
              </div>
              <p className="text-[#7A7D85] text-xs">실제 영상 URL 연동 후 표시됩니다</p>
            </div>
          </div>

          {/* Chapter Info */}
          <div className="px-6 py-5 border-t border-white/[0.07]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[#7A7D85] text-xs mb-1">
                  {CHAPTERS.findIndex((c) => c.id === activeChapter) + 1} / {CHAPTERS.length} 강
                </p>
                <h2 className="font-['Syne'] text-lg font-extrabold">{current.title}</h2>
              </div>
              <button
                onClick={() => {
                  const idx = CHAPTERS.findIndex((c) => c.id === activeChapter);
                  if (idx < CHAPTERS.length - 1) setActiveChapter(CHAPTERS[idx + 1].id);
                }}
                className="shrink-0 px-5 py-2.5 rounded-xl bg-[#4F8EF7] text-sm font-bold text-white hover:opacity-85 transition-opacity"
              >
                다음 강의 →
              </button>
            </div>

            {/* Progress bar (mobile) */}
            <div className="mt-4 sm:hidden">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-[#7A7D85]">수강 진도</span>
                <span className="text-xs text-[#4F8EF7] font-semibold">{progress}%</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-1.5">
                <div className="bg-[#4F8EF7] h-1.5 rounded-full" style={{ width: `${progress}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* ── Sidebar ── */}
        {sidebarOpen && (
          <div className="w-80 shrink-0 border-l border-white/[0.07] flex flex-col bg-[#0e0f11] hidden md:flex">
            <div className="px-5 py-4 border-b border-white/[0.07]">
              <h3 className="font-semibold text-sm mb-2">커리큘럼</h3>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-white/10 rounded-full h-1">
                  <div className="bg-[#4F8EF7] h-1 rounded-full" style={{ width: `${progress}%` }} />
                </div>
                <span className="text-[#4F8EF7] text-xs font-semibold">{progress}%</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {CHAPTERS.map((ch, i) => (
                <button
                  key={ch.id}
                  onClick={() => setActiveChapter(ch.id)}
                  className={`w-full flex items-start gap-3 px-5 py-4 text-left border-b border-white/[0.04] transition-colors ${
                    activeChapter === ch.id
                      ? "bg-[#4F8EF7]/10 border-l-2 border-l-[#4F8EF7]"
                      : "hover:bg-white/[0.03]"
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[0.6rem] font-bold shrink-0 mt-0.5 ${
                    ch.completed
                      ? "bg-[#2ED573] text-white"
                      : activeChapter === ch.id
                        ? "bg-[#4F8EF7] text-white"
                        : "bg-white/10 text-[#7A7D85]"
                  }`}>
                    {ch.completed ? "✓" : i + 1}
                  </div>
                  <div className="min-w-0">
                    <p className={`text-sm font-medium leading-snug truncate ${
                      activeChapter === ch.id ? "text-[#4F8EF7]" : ch.completed ? "text-white/60" : "text-white/80"
                    }`}>
                      {ch.title}
                    </p>
                    <p className="text-[#7A7D85] text-xs mt-0.5">{ch.duration}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
