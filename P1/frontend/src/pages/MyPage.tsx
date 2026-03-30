import { useState } from "react";
import { Link } from "react-router-dom";
import { COURSES } from "../data/courses";
import s from "../styles/pages.module.css";

const MY_COURSES = COURSES.slice(0,4).map((c,i)=>({
  ...c,
  progress:[100,62,30,5][i],
  lastWatched:["2026.03.21","2026.03.20","2026.03.18","2026.03.10"][i],
}));

const TABS = ["수강 중인 강의","완료한 강의","찜한 강의"];

export default function MyPage() {
  const [activeTab, setActiveTab] = useState(0);
  const completed = MY_COURSES.filter(c=>c.progress===100);
  const inProgress = MY_COURSES.filter(c=>c.progress<100);
  const tabCourses = [inProgress, completed, []];
  const avgProgress = Math.round(MY_COURSES.reduce((s,c)=>s+c.progress,0)/MY_COURSES.length);

  return (
    <div className={s.container}>
      <div className={s.profileHead}>
        <div className={s.avatar}>우</div>
        <div className={s.profileInfo}>
          <div className={s.profileName}>WooHyo 님</div>
          <div className={s.profileEmail}>woohyo@email.com</div>
        </div>
        <button className={s.btnEditProfile}>프로필 수정</button>
      </div>

      <div className={s.statsGrid}>
        {[
          {label:"수강 중",value:inProgress.length,unit:"개",cls:s.colorBlue},
          {label:"완료한 강의",value:completed.length,unit:"개",cls:s.colorGreen},
          {label:"평균 진도율",value:avgProgress,unit:"%",cls:s.colorPurple},
          {label:"총 수강 시간",value:48,unit:"시간",cls:s.colorGold},
        ].map(({label,value,unit,cls})=>(
          <div key={label} className={s.statCard}>
            <div className={s.statCardLabel}>{label}</div>
            <div className={`${s.statCardNum} ${cls}`}>{value}<span className={s.statCardUnit}>{unit}</span></div>
          </div>
        ))}
      </div>

      <div className={s.myTabs}>
        {TABS.map((tab,i)=>(
          <button key={tab} onClick={()=>setActiveTab(i)}
            className={`${s.myTab} ${activeTab===i?s.myTabActive:""}`}>
            {tab}
            <span className={`${s.tabCount} ${activeTab===i?s.tabCountActive:s.tabCountDefault}`}>{tabCourses[i].length}</span>
          </button>
        ))}
      </div>

      {tabCourses[activeTab].length===0?(
        <div className={s.myEmpty}>
          <div className={s.myEmptyIcon}>📚</div>
          <div className={s.myEmptyTitle}>{activeTab===2?"찜한 강의가 없습니다":"강의가 없습니다"}</div>
          <Link to="/courses" style={{marginTop:"1rem"}} className={s.btnPrimary}>강의 둘러보기</Link>
        </div>
      ):(
        <div className={s.myCourseList}>
          {tabCourses[activeTab].map(course=>(
            <div key={course.id} className={s.myCourseItem}>
              <div className={s.myCourseThumb}>{course.thumbnail}</div>
              <div className={s.myCourseInfo}>
                <div className={s.myCourseTitle}>{course.title}</div>
                <div className={s.myCourseMeta}>{course.instructor} 강사 · 마지막 수강 {course.lastWatched}</div>
                <div className={s.progressLabel}>
                  <span className={s.progressLabelKey}>진도율</span>
                  <span className={course.progress===100?s.progressLabelGreen:s.progressLabelBlue}>{course.progress}%</span>
                </div>
                <div className={s.progressTrack2}>
                  <div className={course.progress===100?s.progressFillGreen:s.progressFillBlue} style={{ width:`${course.progress}%` }} />
                </div>
              </div>
              <div className={s.myCourseAction}>
                {course.progress===100
                  ? <button className={s.btnCertificate}>수료증 발급</button>
                  : <Link to={`/courses/${course.id}/learn`} className={s.btnContinue}>이어 수강</Link>
                }
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
