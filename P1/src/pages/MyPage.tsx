import { useState } from "react";
import { Link } from "react-router-dom";
import { COURSES } from "../data/courses";

const MY_COURSES = COURSES.slice(0, 4).map((c, i) => ({
  ...c,
  progress: [100, 62, 30, 5][i],
  lastWatched: ["2026.03.18", "2026.03.17", "2026.03.15", "2026.03.10"][i],
}));

const TABS = ["수강 중인 강의", "완료한 강의", "찜한 강의"];

export default function MyPage() {
  const [activeTab, setActiveTab] = useState(0);

  const completed = MY_COURSES.filter((c) => c.progress === 100);
  const inProgress = MY_COURSES.filter((c) => c.progress < 100);
  const tabCourses = [inProgress, completed, []];

  const totalProgress = Math.round(
    MY_COURSES.reduce((sum, c) => sum + c.progress, 0) / MY_COURSES.length
  );

  return (
    <div className="max-w-screen-xl mx-auto px-6 md:px-10 py-12">

      {/* ── Profile Header ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-10 pb-10 border-b border-white/[0.07]">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#4F8EF7] to-[#A78BFA] flex items-center justify-center text-2xl font-bold shrink-0">
          우
        </div>
        <div className="flex-1">
          <h1 className="font-['Syne'] text-xl font-extrabold mb-1">WooHyo 님</h1>
          <p className="text-[#7A7D85] text-sm">woohyo@email.com</p>
        </div>
        <button className="px-4 py-2 rounded-lg border border-white/10 text-sm text-white/70 hover:border-white/30 transition-colors">
          프로필 수정
        </button>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {[
          { label: "수강 중", value: String(inProgress.length), unit: "개", color: "text-[#4F8EF7]" },
          { label: "완료한 강의", value: String(completed.length), unit: "개", color: "text-[#2ED573]" },
          { label: "평균 진도율", value: String(totalProgress), unit: "%", color: "text-[#A78BFA]" },
          { label: "총 수강 시간", value: "48", unit: "시간", color: "text-[#F5C518]" },
        ].map(({ label, value, unit, color }) => (
          <div key={label} className="bg-[#141517] border border-white/[0.07] rounded-2xl p-5">
            <p className="text-[#7A7D85] text-xs mb-2">{label}</p>
            <p className={`font-['Syne'] text-2xl font-extrabold ${color}`}>
              {value}<span className="text-sm font-normal text-[#7A7D85] ml-1">{unit}</span>
            </p>
          </div>
        ))}
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-1 border-b border-white/[0.07] mb-8">
        {TABS.map((tab, i) => (
          <button
            key={tab}
            onClick={() => setActiveTab(i)}
            className={`px-5 py-2.5 text-sm font-semibold border-b-2 transition-all -mb-px ${
              activeTab === i
                ? "border-[#4F8EF7] text-[#4F8EF7]"
                : "border-transparent text-[#7A7D85] hover:text-white"
            }`}
          >
            {tab}
            <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
              activeTab === i ? "bg-[#4F8EF7]/20 text-[#4F8EF7]" : "bg-white/10 text-[#7A7D85]"
            }`}>
              {tabCourses[i].length}
            </span>
          </button>
        ))}
      </div>

      {/* ── Course List ── */}
      {tabCourses[activeTab].length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="text-5xl mb-4">📚</div>
          <p className="text-white font-semibold mb-2">
            {activeTab === 2 ? "찜한 강의가 없습니다" : "강의가 없습니다"}
          </p>
          <Link to="/courses" className="mt-4 px-5 py-2.5 rounded-xl bg-[#4F8EF7] text-sm font-bold text-white hover:opacity-85 transition-opacity">
            강의 둘러보기
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {tabCourses[activeTab].map((course) => (
            <div key={course.id} className="flex gap-5 p-5 bg-[#141517] border border-white/[0.07] rounded-2xl hover:border-white/20 transition-colors">
              {/* Thumbnail */}
              <div className="w-24 h-20 bg-[#1c1e22] rounded-xl flex items-center justify-center text-3xl shrink-0">
                {course.thumbnail}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm mb-1 truncate">{course.title}</h3>
                <p className="text-[#7A7D85] text-xs mb-3">{course.instructor} 강사 · 마지막 수강 {course.lastWatched}</p>

                {/* Progress Bar */}
                <div className="mb-1.5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-[#7A7D85]">진도율</span>
                    <span className={`text-xs font-semibold ${
                      course.progress === 100 ? "text-[#2ED573]" : "text-[#4F8EF7]"
                    }`}>
                      {course.progress}%
                    </span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full transition-all ${
                        course.progress === 100 ? "bg-[#2ED573]" : "bg-[#4F8EF7]"
                      }`}
                      style={{ width: `${course.progress}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Action */}
              <div className="flex flex-col justify-center shrink-0">
                {course.progress === 100 ? (
                  <button className="px-4 py-2 rounded-lg bg-[#2ED573]/15 border border-[#2ED573]/30 text-[#2ED573] text-xs font-bold">
                    수료증 발급
                  </button>
                ) : (
                  <Link
                    to={`/courses/${course.id}/learn`}
                    className="px-4 py-2 rounded-lg bg-[#4F8EF7] text-white text-xs font-bold hover:opacity-85 transition-opacity text-center"
                  >
                    이어 수강
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
