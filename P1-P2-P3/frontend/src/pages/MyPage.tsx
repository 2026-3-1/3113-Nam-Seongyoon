import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, getAuth } from "../lib/api";
import { isImageSource } from "../lib/media";
import type { MyPageProfile } from "../types";
import s from "../styles/pages.module.css";

type Tab = "learning" | "bookmarks" | "orders";

export default function MyPage() {
  const auth = getAuth();
  const [profile, setProfile] = useState<MyPageProfile | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("learning");
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .myPage()
      .then(setProfile)
      .catch((err) => setError(err instanceof Error ? err.message : "마이페이지 정보를 불러오지 못했습니다."));
  }, []);

  const user = profile?.user ?? auth?.user;
  const isInstructor = user?.role === "TEACHER";
  const stats = profile?.stats ?? {
    enrolledCount: 0,
    completedCount: 0,
    progressPercent: 0,
    reviewCount: 0,
    bookmarkCount: 0,
    orderCount: 0,
    courseCount: 0,
  };
  const courses = profile?.courses ?? [];
  const bookmarks = profile?.bookmarks ?? [];
  const orders = profile?.orders ?? [];
  const instructorStudents = profile?.instructorStudents ?? [];

  return (
    <div className={s.container}>
      <div className={s.profileHead}>
        <div className={s.avatar}>{user?.name[0] ?? "U"}</div>
        <div className={s.profileInfo}>
          <div className={s.profileName}>{user?.name ?? "사용자"}</div>
          <div className={s.profileEmail}>{user?.email ?? ""}</div>
        </div>
      </div>

      <div className={s.statsGrid}>
        <div className={s.statCard}>
          <div className={s.statCardLabel}>{isInstructor ? "등록 강의" : "수강 강의"}</div>
          <div className={s.statCardNum}>{isInstructor ? stats.courseCount ?? courses.length : stats.enrolledCount}<span className={s.statCardUnit}>개</span></div>
        </div>
        <div className={s.statCard}>
          <div className={s.statCardLabel}>{isInstructor ? "수강 학생" : "완료"}</div>
          <div className={s.statCardNum}>{isInstructor ? instructorStudents.length : stats.completedCount}<span className={s.statCardUnit}>{isInstructor ? "명" : "개"}</span></div>
        </div>
        <div className={s.statCard}>
          <div className={s.statCardLabel}>평균 진도</div>
          <div className={s.statCardNum}>{stats.progressPercent}<span className={s.statCardUnit}>%</span></div>
        </div>
        <div className={s.statCard}>
          <div className={s.statCardLabel}>{isInstructor ? "완료 학생" : "북마크"}</div>
          <div className={s.statCardNum}>{isInstructor ? stats.completedCount : stats.bookmarkCount ?? bookmarks.length}<span className={s.statCardUnit}>{isInstructor ? "명" : "개"}</span></div>
        </div>
      </div>

      {error && <p className={s.formError}>{error}</p>}

      {isInstructor ? (
        <>
          <div className={s.myTabs}>
            <button className={`${s.myTab} ${s.myTabActive}`}>
              수강 학생 진도 <span className={s.tabCount}>{instructorStudents.length}</span>
            </button>
          </div>

          <div className={s.myCourseList}>
            {instructorStudents.length === 0 ? (
              <div className={s.reviewItem}>
                <strong>아직 수강 진도가 있는 학생이 없습니다.</strong>
                <p className={s.reviewContent}>학생이 강의를 학습하면 이곳에 학생명, 강의명, 진도율이 표시됩니다.</p>
              </div>
            ) : (
              instructorStudents.map((item) => (
                <div key={item.id} className={s.myCourseItem}>
                  <div className={s.myCourseThumb}>
                    {isImageSource(item.course.thumbnail) ? <img src={item.course.thumbnail} alt="" className={s.thumbImage} /> : "No image"}
                  </div>
                  <div className={s.myCourseInfo}>
                    <div className={s.myCourseTitle}>{item.course.title}</div>
                    <div className={s.myCourseMeta}>
                      {item.student.name} · {item.student.email} · {item.progress.completedCount} / {item.progress.totalCount}강
                    </div>
                    <div className={s.progressLabel}>
                      <span className={s.progressLabelKey}>최근 학습 {new Date(item.updatedAt).toLocaleDateString("ko-KR")}</span>
                      <span className={s.progressLabelBlue}>{item.progress.progressPercent}%</span>
                    </div>
                    <div className={s.progressTrack2}>
                      <div className={s.progressFillBlue} style={{ width: `${item.progress.progressPercent}%` }} />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      ) : (
        <>
          <div className={s.myTabs}>
            <button className={`${s.myTab} ${activeTab === "learning" ? s.myTabActive : ""}`} onClick={() => setActiveTab("learning")}>
              이어 학습 <span className={s.tabCount}>{courses.length}</span>
            </button>
            <button className={`${s.myTab} ${activeTab === "bookmarks" ? s.myTabActive : ""}`} onClick={() => setActiveTab("bookmarks")}>
              북마크 <span className={s.tabCount}>{bookmarks.length}</span>
            </button>
            <button className={`${s.myTab} ${activeTab === "orders" ? s.myTabActive : ""}`} onClick={() => setActiveTab("orders")}>
              주문내역 <span className={s.tabCount}>{orders.length}</span>
            </button>
          </div>

          {activeTab === "learning" && (
            <div className={s.myCourseList}>
              {courses.length === 0 ? (
                <div className={s.reviewItem}>
                  <strong>아직 수강 강의가 없습니다.</strong>
                  <p className={s.reviewContent}>강의를 결제하거나 학습을 시작하면 진도가 이곳에 표시됩니다.</p>
                </div>
              ) : (
                courses.map((course) => {
                  const progress = course.progress?.progressPercent ?? 0;
                  const totalCount = course.progress?.totalCount ?? course.curriculum?.length ?? 0;
                  const completedCount = course.progress?.completedCount ?? 0;
                  const chapter = completedCount > 0 ? (course.progress?.lastChapterIndex ?? 0) + 1 : 1;
                  return (
                    <div key={course.id} className={s.myCourseItem}>
                      <div className={s.myCourseThumb}>
                        {isImageSource(course.thumbnail) ? <img src={course.thumbnail} alt="" className={s.thumbImage} /> : "No image"}
                      </div>
                      <div className={s.myCourseInfo}>
                        <div className={s.myCourseTitle}>{course.title}</div>
                        <div className={s.myCourseMeta}>{course.teacher?.name ?? "인증 강사"} · 최근 학습 챕터 {chapter}</div>
                        <div className={s.progressLabel}>
                          <span className={s.progressLabelKey}>{completedCount} / {totalCount}강 완료</span>
                          <span className={s.progressLabelBlue}>{progress}%</span>
                        </div>
                        <div className={s.progressTrack2}>
                          <div className={s.progressFillBlue} style={{ width: `${progress}%` }} />
                        </div>
                      </div>
                      <div className={s.myCourseAction}>
                        <Link to={`/courses/${course.id}/learn`} className={s.btnContinue}>이어 학습</Link>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {activeTab === "bookmarks" && (
            <div className={s.myCourseList}>
              {bookmarks.length === 0 ? (
                <div className={s.reviewItem}>북마크한 강의가 없습니다.</div>
              ) : (
                bookmarks.map((bookmark) => (
                  <div key={bookmark.id} className={s.myCourseItem}>
                    <div className={s.myCourseThumb}>
                      {isImageSource(bookmark.course.thumbnail) ? <img src={bookmark.course.thumbnail} alt="" className={s.thumbImage} /> : "No image"}
                    </div>
                    <div className={s.myCourseInfo}>
                      <div className={s.myCourseTitle}>{bookmark.course.title}</div>
                      <div className={s.myCourseMeta}>{bookmark.course.teacher?.name ?? "인증 강사"} · {new Date(bookmark.createdAt).toLocaleDateString("ko-KR")}</div>
                    </div>
                    <div className={s.myCourseAction}>
                      <Link to={`/courses/${bookmark.course.id}`} className={s.btnContinue}>상세 보기</Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === "orders" && (
            <div className={s.myCourseList}>
              {orders.length === 0 ? (
                <div className={s.reviewItem}>주문내역이 없습니다.</div>
              ) : (
                orders.map((order) => (
                  <div key={order.id} className={s.reviewItem}>
                    <div className={s.reviewHeader}>
                      <strong>주문 #{order.id}</strong>
                      <span className={s.reviewDate}>{new Date(order.createdAt).toLocaleString("ko-KR")}</span>
                    </div>
                    <p className={s.reviewContent}>
                      {order.items.length}개 강의 · {order.totalPrice.toLocaleString()}원 · {order.status}
                    </p>
                    <div className={s.myCourseList} style={{ marginTop: "1rem" }}>
                      {order.items.map((item) => (
                        <div key={item.id} className={s.myCourseItem}>
                          <div className={s.myCourseThumb}>
                            {isImageSource(item.course.thumbnail) ? <img src={item.course.thumbnail} alt="" className={s.thumbImage} /> : "No image"}
                          </div>
                          <div className={s.myCourseInfo}>
                            <div className={s.myCourseTitle}>{item.course.title}</div>
                            <div className={s.myCourseMeta}>{item.price.toLocaleString()}원</div>
                          </div>
                          <div className={s.myCourseAction}>
                            <Link to={`/courses/${item.course.id}/learn`} className={s.btnContinue}>수강하기</Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
