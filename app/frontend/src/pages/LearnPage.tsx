import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api, getAuth } from "../lib/api";
import type { Course, CourseProgress, CurriculumItem } from "../types";
import s from "../styles/pages.module.css";

const emptyProgress: CourseProgress = {
  completedCount: 0,
  totalCount: 0,
  progressPercent: 0,
  lastChapterIndex: 0,
};

export default function LearnPage() {
  const { id } = useParams();
  const courseId = Number(id);
  const [course, setCourse] = useState<Course | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [progress, setProgress] = useState<CourseProgress>(emptyProgress);
  const [message, setMessage] = useState("");
  const auth = getAuth();
  const markedRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    api.course(courseId).then(setCourse).catch(() => setCourse(null));
    if (!auth) return;

    api
      .courseProgress(courseId)
      .then((data) => {
        setProgress(data);
        if (data.totalCount > 0) {
          setActiveIndex(Math.min(data.lastChapterIndex, data.totalCount - 1));
        }
      })
      .catch(() => undefined);
  }, [auth?.accessToken, courseId]);

  const curriculum = useMemo(() => course?.curriculum ?? [], [course]);
  const hasPurchased = course?.hasPurchased ?? false;
  const isAccessible = (chapter: CurriculumItem) => hasPurchased || (chapter.isPreview ?? false);

  const markComplete = useCallback(async (chapterIndex: number) => {
    if (!auth || !course) return;
    if (markedRef.current.has(chapterIndex)) return;
    markedRef.current.add(chapterIndex);
    try {
      const updated = await api.updateCourseProgress(course.id, chapterIndex + 1);
      setProgress(updated);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "진행률을 저장하지 못했습니다.");
    }
  }, [auth, course]);

  const handleTimeUpdate = useCallback((e: React.SyntheticEvent<HTMLVideoElement>) => {
    const v = e.currentTarget;
    if (v.duration && v.currentTime / v.duration >= 0.8) {
      void markComplete(activeIndex);
    }
  }, [activeIndex, markComplete]);

  const handleEnded = useCallback(async () => {
    await markComplete(activeIndex);
    if (activeIndex < curriculum.length - 1) {
      setTimeout(() => setActiveIndex((i) => i + 1), 1200);
    }
  }, [activeIndex, curriculum.length, markComplete]);

  if (!course) {
    return (
      <div className={s.learnWrap}>
        <div className={s.emptyState}>
          <div className={s.emptyTitle}>강의를 찾을 수 없습니다.</div>
          <Link to="/courses" className={s.btnPrimary}>강의 목록으로</Link>
        </div>
      </div>
    );
  }

  if (!course.hasPurchased && curriculum.every((c) => !c.isPreview)) {
    return (
      <div className={s.learnWrap}>
        <div className={s.emptyState}>
          <div className={s.emptyTitle}>구매 후 수강할 수 있습니다.</div>
          <Link to={`/courses/${course.id}`} className={s.btnPrimary}>강의 소개 보기</Link>
        </div>
      </div>
    );
  }

  const activeChapter = curriculum[activeIndex];

  return (
    <div className={s.learnWrap}>
      <header className={s.learnHeader}>
        <div className={s.learnHeaderLeft}>
          <Link to={`/courses/${course.id}`} className={s.learnBackLink}>강의 소개</Link>
          <span className={s.learnLogo}>CertificatEdu</span>
        </div>
        <span className={s.learnTitle}>{course.title}</span>
        <div className={s.learnHeaderRight}>
          <div className={s.progressWrap}>
            <div className={s.progressTrack}>
              <div className={s.progressFill} style={{ width: `${progress.progressPercent}%` }} />
            </div>
            <span className={s.progressPct}>{progress.progressPercent}%</span>
          </div>
        </div>
      </header>

      <div className={s.learnBody}>
        <div className={s.videoArea}>
          <div className={s.videoPlayer}>
            {activeChapter && !isAccessible(activeChapter) ? (
              <div className={s.videoPlaceholder}>
                <div className={s.playBtn}>🔒</div>
                <p style={{ fontWeight: 700 }}>구매 후 수강할 수 있습니다.</p>
                <Link to={`/courses/${course.id}`} className={s.btnPrimary} style={{ marginTop: "1rem" }}>강의 구매하기</Link>
              </div>
            ) : activeChapter?.videoUrl ? (
              <video
                key={activeChapter.videoUrl}
                className={s.videoFrame}
                controls
                src={activeChapter.videoUrl}
                onTimeUpdate={handleTimeUpdate}
                onEnded={() => { void handleEnded(); }}
              />
            ) : (
              <div className={s.videoPlaceholder}>
                <div className={s.playBtn}>Play</div>
                <p style={{ fontWeight: 700 }}>재생할 영상이 없습니다.</p>
                <p style={{ color: "var(--muted)" }}>선생님 관리 페이지에서 커리큘럼별 MP4를 업로드해 주세요.</p>
              </div>
            )}
          </div>

          <div className={s.videoInfo}>
            <div className={s.videoInfoTop}>
              <div>
                <p className={s.chapterIndexLabel}>Chapter {activeIndex + 1}</p>
                <h1 className={s.videoTitle}>{activeChapter?.title ?? "커리큘럼 없음"}</h1>
                {message && <p className={s.formError}>{message}</p>}
                {!auth && <p className={s.formError}>로그인하면 학습 진행률이 저장되고 70% 이상 수강 후 리뷰를 작성할 수 있습니다.</p>}
              </div>
              {curriculum.length > 1 && (
                <button
                  className={s.btnNext}
                  onClick={() => setActiveIndex((index) => Math.min(index + 1, curriculum.length - 1))}
                  disabled={activeIndex >= curriculum.length - 1}
                >
                  다음 강의
                </button>
              )}
            </div>
          </div>
        </div>

        <aside className={s.sidebar}>
          <div className={s.sidebarHead}>
            <p className={s.sidebarTitle}>커리큘럼</p>
            <div className={s.sidebarProgress}>
              <div className={s.progressTrack}>
                <div className={s.progressFill} style={{ width: `${progress.progressPercent}%` }} />
              </div>
              <span className={s.progressPct}>{progress.completedCount} / {curriculum.length}</span>
            </div>
          </div>
          <div className={s.sidebarScroll}>
            {curriculum.length === 0 ? (
              <div className={s.reviewItem}>등록된 커리큘럼이 없습니다.</div>
            ) : (
              curriculum.map((chapter, index) => {
                const isCompleted = index < progress.completedCount;
                const accessible = isAccessible(chapter);
                return (
                  <button
                    key={`${chapter.title}-${index}`}
                    onClick={() => setActiveIndex(index)}
                    className={`${s.sidebarItem} ${index === activeIndex ? s.sidebarItemActive : ""}`}
                  >
                    <span className={`${s.sidebarBullet} ${isCompleted ? s.bulletCompleted : index === activeIndex ? s.bulletActive : s.bulletDefault}`}>
                      {isCompleted ? "OK" : index + 1}
                    </span>
                    <span className={s.sidebarChapterText}>
                      <span className={s.sidebarChapterTitleWrap}>
                        <span className={`${s.sidebarChapterTitle} ${index === activeIndex ? s.sidebarChapterTitleActive : ""}`}>{chapter.title}</span>
                        {chapter.isPreview && <span style={{ fontSize: "0.68rem", background: "var(--accent)", color: "#fff", padding: "0.1em 0.35em", borderRadius: "0.2em", marginLeft: "0.3rem" }}>미리보기</span>}
                      </span>
                      <span className={s.sidebarChapterDur}>{accessible ? "MP4" : "🔒"}</span>
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
