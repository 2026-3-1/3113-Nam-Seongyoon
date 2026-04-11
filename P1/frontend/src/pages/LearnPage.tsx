import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { COURSES } from "../data/courses";
import { getChapters } from "../api";
import type { Chapter } from "../types";
import s from "../styles/pages.module.css";

export default function LearnPage() {
  const { id } = useParams();
  const course = COURSES.find(c => c.id === Number(id)) ?? COURSES[0];
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeChapter, setActiveChapter] = useState<number | undefined>(undefined);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (id) {
      setLoading(true);
      getChapters(Number(id))
        .then((data: Chapter[]) => {
          setChapters(data.map((ch) => ({
            ...ch,
            completed: false,
            videoUrl: ch.videoUrl ?? 'https://www.youtube.com/embed/M4pBG8O5uro',
          })));
          setError(null);
          if (data.length > 0) {
            setActiveChapter(data[0].id);
          }
        })
        .catch(err => {
          console.error('Failed to load chapters:', err);
          setError('챕터를 불러오는 데 실패했습니다.');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [id]);

  const current = chapters.find(c => c.id === activeChapter) ?? chapters[0];
  const completed = chapters.filter(c => c.completed).length;
  const progress = chapters.length > 0 ? Math.round((completed / chapters.length) * 100) : 0;

  if (loading) {
    return <div>로딩 중...</div>;
  }

  if (error) {
    return <div>오류: {error}</div>;
  }

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
            {current?.videoUrl ? (
              <iframe
                width="100%"
                height="100%"
                src={current.videoUrl}
                title={current.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            ) : (
              <div className={s.videoPlaceholder}>
                <div className={s.playBtn}>▶</div>
                <div>
                  <p style={{ fontWeight:600, marginBottom:"0.25rem" }}>{current?.title}</p>
                  <p style={{ color:"var(--muted)", fontSize:"0.875rem" }}>{current?.duration}</p>
                </div>
                <p style={{ color:"var(--muted)", fontSize:"0.78rem" }}>실제 영상 URL 연동 후 표시됩니다</p>
              </div>
            )}
          </div>
          <div className={s.videoInfo}>
            <div className={s.videoInfoTop}>
              <div>
                <p className={s.chapterIndexLabel}>{(chapters.findIndex(c=>c.id===activeChapter)+1) || 1} / {chapters.length} 강</p>
                <h2 className={s.videoTitle}>{current?.title}</h2>
              </div>
              <button className={s.btnNext} onClick={() => {
                const idx = chapters.findIndex(c=>c.id===activeChapter);
                if (idx >= 0 && idx < chapters.length-1) setActiveChapter(chapters[idx+1].id);
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
              {chapters.map((ch, i) => (
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
