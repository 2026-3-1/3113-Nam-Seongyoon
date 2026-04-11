import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getEnrollments } from "../api";
import s from "../styles/pages.module.css";

interface Enrollment {
  id: number;
  progress: number;
  enrolledAt: string;
  course: {
    id: number;
    title: string;
    instructorName: string;
    thumbnail?: string;
    duration?: string;
    badge?: string;
  };
}

const TABS = ["수강 중인 강의", "완료한 강의"];

export default function MyPage() {
  const user = useAuth();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    getEnrollments(user.id)
      .then(setEnrollments)
      .finally(() => setLoading(false));
  }, [user.id]);

  const inProgress = enrollments.filter(e => e.progress < 100);
  const completed  = enrollments.filter(e => e.progress === 100);
  const tabData    = [inProgress, completed];
  const avgProgress = enrollments.length > 0
    ? Math.round(enrollments.reduce((sum, e) => sum + e.progress, 0) / enrollments.length)
    : 0;

  if (loading) return <div className={s.container}>로딩 중...</div>;

  return (
    <div className={s.container}>
      <div className={s.profileHead}>
        <div className={s.avatar}>{user.name[0]}</div>
        <div className={s.profileInfo}>
          <div className={s.profileName}>{user.name} 님</div>
          <div className={s.profileEmail}>{user.email}</div>
        </div>
        <button className={s.btnEditProfile}>프로필 수정</button>
      </div>

      <div className={s.statsGrid}>
        {[
          { label:"수강 중",    value:inProgress.length, unit:"개", cls:s.colorBlue   },
          { label:"완료한 강의", value:completed.length,  unit:"개", cls:s.colorGreen  },
          { label:"평균 진도율", value:avgProgress,        unit:"%",  cls:s.colorPurple },
          { label:"총 수강 강의", value:enrollments.length, unit:"개", cls:s.colorGold  },
        ].map(({ label, value, unit, cls }) => (
          <div key={label} className={s.statCard}>
            <div className={s.statCardLabel}>{label}</div>
            <div className={`${s.statCardNum} ${cls}`}>{value}<span className={s.statCardUnit}>{unit}</span></div>
          </div>
        ))}
      </div>

      <div className={s.myTabs}>
        {TABS.map((tab, i) => (
          <button key={tab} onClick={() => setActiveTab(i)}
            className={`${s.myTab} ${activeTab === i ? s.myTabActive : ""}`}>
            {tab}
            <span className={`${s.tabCount} ${activeTab === i ? s.tabCountActive : s.tabCountDefault}`}>
              {tabData[i].length}
            </span>
          </button>
        ))}
      </div>

      {tabData[activeTab].length === 0 ? (
        <div className={s.myEmpty}>
          <div className={s.myEmptyIcon}>📚</div>
          <div className={s.myEmptyTitle}>
            {activeTab === 0 ? "수강 중인 강의가 없습니다" : "완료한 강의가 없습니다"}
          </div>
          <Link to="/courses" style={{ marginTop:"1rem" }} className={s.btnPrimary}>강의 둘러보기</Link>
        </div>
      ) : (
        <div className={s.myCourseList}>
          {tabData[activeTab].map(enrollment => (
            <div key={enrollment.id} className={s.myCourseItem}>
              <div className={s.myCourseThumb}>{enrollment.course.thumbnail || "💻"}</div>
              <div className={s.myCourseInfo}>
                <div className={s.myCourseTitle}>{enrollment.course.title}</div>
                <div className={s.myCourseMeta}>
                  {enrollment.course.instructorName} 강사 · 수강 시작 {enrollment.enrolledAt?.slice(0, 10)}
                </div>
                <div className={s.progressLabel}>
                  <span className={s.progressLabelKey}>진도율</span>
                  <span className={enrollment.progress === 100 ? s.progressLabelGreen : s.progressLabelBlue}>
                    {enrollment.progress}%
                  </span>
                </div>
                <div className={s.progressTrack2}>
                  <div
                    className={enrollment.progress === 100 ? s.progressFillGreen : s.progressFillBlue}
                    style={{ width:`${enrollment.progress}%` }}
                  />
                </div>
              </div>
              <div className={s.myCourseAction}>
                {enrollment.progress === 100
                  ? <button className={s.btnCertificate}>수료증 발급</button>
                  : <Link to={`/courses/${enrollment.course.id}/learn`} className={s.btnContinue}>이어 수강</Link>
                }
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
