import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { COURSES } from "../data/courses";
import s from "../styles/pages.module.css";

const CHAPTERS = [
  { id:1, title:"오리엔테이션 및 시험 안내", duration:"12:30", completed:true },
  { id:2, title:"1과목 핵심 개념 정리", duration:"45:20", completed:true },
  { id:3, title:"2과목 출제 포인트", duration:"38:15", completed:false },
  { id:4, title:"3과목 실전 문제 풀이", duration:"52:40", completed:false },
  { id:5, title:"4과목 단기 암기법", duration:"29:50", completed:false },
  { id:6, title:"5과목 마무리 정리", duration:"41:05", completed:false },
  { id:7, title:"실전 모의고사 1회", duration:"60:00", completed:false },
  { id:8, title:"실전 모의고사 2회 + 해설", duration:"65:30", completed:false },
];

export default function LearnPage() {
  const { id } = useParams();
  const course = COURSES.find(c => c.id === Number(id)) ?? COURSES[0];
  const [activeChapter, setActiveChapter] = useState(3);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const current = CHAPTERS.find(c => c.id === activeChapter) ?? CHAPTERS[2];
  const completed = CHAPTERS.filter(c => c.completed).length;
  const progress = Math.round((completed / CHAPTERS.length) * 100);

  return (
    <div className={s.learnWrap}>
      <header className={s.learnHeader}>
        <div className={s.learnHeaderLeft}>
          <Link to={`/courses/${id}`} className={s.learnBackLink}>← 강의 소개</Link>
          <span style={{ color:"rgba(255,255,255,0.15)" }}>|</span>
          <span className={s.learnLogo}>CertificatEdu</span>
        </div>
        <span className={s.learnTitle}>{course.title}</span>
        <div className={s.learnHeaderRight}>
          <div className={s.progressWrap}>
            <div className={s.progressTrack}><div className={s.progressFill} style={{ width:`${progress}%` }} /></div>
            <span className={s.progressPct}>{progress}%</span>
          </div>
          <button className={s.btnToggleSidebar} onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? "목록 닫기" : "목록 열기"}
          </button>
        </div>
      </header>
      <div className={s.learnBody}>
        <div className={s.videoArea}>
          <div className={s.videoPlayer}>
            <div className={s.videoPlaceholder}>
              <div className={s.playBtn}>▶</div>
              <div>
                <p style={{ fontWeight:600, marginBottom:"0.25rem" }}>{current.title}</p>
                <p style={{ color:"var(--muted)", fontSize:"0.875rem" }}>{current.duration}</p>
              </div>
              <p style={{ color:"var(--muted)", fontSize:"0.78rem" }}>실제 영상 URL 연동 후 표시됩니다</p>
            </div>
          </div>
          <div className={s.videoInfo}>
            <div className={s.videoInfoTop}>
              <div>
                <p className={s.chapterIndexLabel}>{CHAPTERS.findIndex(c=>c.id===activeChapter)+1} / {CHAPTERS.length} 강</p>
                <h2 className={s.videoTitle}>{current.title}</h2>
              </div>
              <button className={s.btnNext} onClick={() => {
                const idx = CHAPTERS.findIndex(c=>c.id===activeChapter);
                if (idx < CHAPTERS.length-1) setActiveChapter(CHAPTERS[idx+1].id);
              }}>다음 강의 →</button>
            </div>
          </div>
        </div>
        {sidebarOpen && (
          <div className={s.sidebar}>
            <div className={s.sidebarHead}>
              <p className={s.sidebarTitle}>커리큘럼</p>
              <div className={s.sidebarProgress}>
                <div className={s.progressTrack} style={{ flex:1 }}><div className={s.progressFill} style={{ width:`${progress}%` }} /></div>
                <span className={s.progressPct}>{progress}%</span>
              </div>
            </div>
            <div className={s.sidebarScroll}>
              {CHAPTERS.map((ch, i) => (
                <button key={ch.id} className={`${s.sidebarItem} ${activeChapter===ch.id?s.sidebarItemActive:""}`} onClick={() => setActiveChapter(ch.id)}>
                  <div className={`${s.sidebarBullet} ${ch.completed?s.bulletCompleted:activeChapter===ch.id?s.bulletActive:s.bulletDefault}`}>
                    {ch.completed ? "✓" : i+1}
                  </div>
                  <div style={{ minWidth:0 }}>
                    <p className={`${s.sidebarChapterTitle} ${activeChapter===ch.id?s.sidebarChapterTitleActive:ch.completed?s.sidebarChapterTitleDone:""}`}>
                      {ch.title}
                    </p>
                    <p className={s.sidebarChapterDur}>{ch.duration}</p>
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
