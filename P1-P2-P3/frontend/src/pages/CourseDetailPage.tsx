import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api, getAuth } from "../lib/api";
import { isImageSource } from "../lib/media";
import type { Course, CourseProgress, Review } from "../types";
import s from "../styles/pages.module.css";

export default function CourseDetailPage() {
  const { id } = useParams();
  const courseId = Number(id);
  const [course, setCourse] = useState<Course | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [progress, setProgress] = useState<CourseProgress | null>(null);
  const [activeTab, setActiveTab] = useState<"curriculum" | "review">("curriculum");
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState("");
  const [message, setMessage] = useState("");
  const [cartMessage, setCartMessage] = useState("");
  const [bookmarked, setBookmarked] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState<number | null>(null);
  const [editRating, setEditRating] = useState(5);
  const [editContent, setEditContent] = useState("");
  const auth = getAuth();

  useEffect(() => {
    api.course(courseId).then(setCourse).catch(() => setCourse(null));
    api.reviews(courseId).then(setReviews).catch(() => setReviews([]));
    if (auth) {
      api.courseProgress(courseId).then(setProgress).catch(() => setProgress(null));
      api.bookmarkStatus(courseId).then((data) => setBookmarked(data.bookmarked)).catch(() => setBookmarked(false));
    } else {
      setProgress(null);
      setBookmarked(false);
    }
  }, [auth?.accessToken, courseId]);

  if (!course) {
    return (
      <div className={s.container}>
        <div className={s.emptyState}>
          <div className={s.emptyTitle}>강의를 찾을 수 없습니다.</div>
          <p className={s.emptyDesc}>선생님이 등록한 강의만 상세 페이지에서 확인할 수 있습니다.</p>
          <Link to="/courses" className={s.btnPrimary}>강의 목록으로</Link>
        </div>
      </div>
    );
  }

  const curriculum = course.curriculum ?? [];
  const averageRating = reviews.length
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : Number(course.rating);
  const originalPrice = course.originalPrice && course.originalPrice > course.price ? course.originalPrice : null;
  const discount = originalPrice ? Math.round((1 - course.price / originalPrice) * 100) : null;
  const canWriteReview = Boolean(auth && (progress?.progressPercent ?? 0) >= 70);

  const addToCart = async () => {
    if (!auth) {
      setCartMessage("장바구니에 담으려면 로그인이 필요합니다.");
      return;
    }
    try {
      await api.addCartItem(course.id);
      setCartMessage("장바구니에 담았습니다.");
    } catch (error) {
      setCartMessage(error instanceof Error ? error.message : "장바구니에 담지 못했습니다.");
    }
  };

  const toggleBookmark = async () => {
    if (!auth) {
      setCartMessage("북마크하려면 로그인이 필요합니다.");
      return;
    }
    try {
      if (bookmarked) {
        await api.removeBookmark(course.id);
        setBookmarked(false);
        setCartMessage("북마크를 해제했습니다.");
      } else {
        await api.addBookmark(course.id);
        setBookmarked(true);
        setCartMessage("북마크에 추가했습니다.");
      }
    } catch (error) {
      setCartMessage(error instanceof Error ? error.message : "북마크를 변경하지 못했습니다.");
    }
  };

  const submitReview = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!auth) {
      setMessage("리뷰를 작성하려면 로그인이 필요합니다.");
      return;
    }
    if (!canWriteReview) {
      setMessage("강의를 70% 이상 수강한 후 리뷰를 작성할 수 있습니다.");
      return;
    }
    if (content.trim().length < 5) {
      setMessage("리뷰 내용은 5자 이상 입력해 주세요.");
      return;
    }

    try {
      const created = await api.createReview(course.id, { rating, content });
      setReviews((items) => [created, ...items]);
      setContent("");
      setMessage("리뷰가 등록되었습니다.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "리뷰 등록에 실패했습니다.");
    }
  };

  const startEditReview = (review: Review) => {
    setEditingReviewId(review.id);
    setEditRating(review.rating);
    setEditContent(review.content);
    setMessage("");
  };

  const cancelEditReview = () => {
    setEditingReviewId(null);
    setEditRating(5);
    setEditContent("");
  };

  const submitEditReview = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editingReviewId) return;
    if (editContent.trim().length < 5) {
      setMessage("리뷰 내용은 5자 이상 입력해 주세요.");
      return;
    }

    try {
      const updated = await api.updateReview(editingReviewId, {
        rating: editRating,
        content: editContent,
      });
      setReviews((items) => items.map((item) => (item.id === updated.id ? updated : item)));
      cancelEditReview();
      setMessage("리뷰가 수정되었습니다.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "리뷰 수정에 실패했습니다.");
    }
  };

  const removeReview = async (reviewId: number) => {
    try {
      await api.deleteReview(reviewId);
      setReviews((items) => items.filter((item) => item.id !== reviewId));
      if (editingReviewId === reviewId) cancelEditReview();
      setMessage("리뷰가 삭제되었습니다.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "리뷰 삭제에 실패했습니다.");
    }
  };

  return (
    <div className={s.container}>
      <div className={s.detailLayout}>
        <div className={s.detailLeft}>
          <div className={s.breadcrumb}>
            <Link to="/">홈</Link><span>/</span>
            <Link to="/courses">강의</Link><span>/</span>
            <span style={{ color: "var(--text)" }}>{course.title}</span>
          </div>
          <div className={s.detailThumb}>
            {isImageSource(course.thumbnail) ? (
              <img src={course.thumbnail} alt="" className={s.thumbImage} />
            ) : (
              "No image"
            )}
          </div>
          <span className={s.badge}>{course.badge}</span>
          <h1 className={s.pageTitle}>{course.title}</h1>
          <p className={s.pageSub}>{course.description}</p>
          <div className={s.detailRating}>
            <div className={s.stars}>
              {[1, 2, 3, 4, 5].map((star) => (
                <span key={star} className={star <= Math.round(averageRating) ? s.starFilled : s.starEmpty}>★</span>
              ))}
            </div>
            <span className={s.ratingNum}>{averageRating.toFixed(1)}</span>
            <span className={s.ratingCount}>({reviews.length.toLocaleString()}개 리뷰)</span>
          </div>

          <div className={s.tabs}>
            <button onClick={() => setActiveTab("curriculum")} className={`${s.tab} ${activeTab === "curriculum" ? s.tabActive : ""}`}>
              커리큘럼
            </button>
            <button onClick={() => setActiveTab("review")} className={`${s.tab} ${activeTab === "review" ? s.tabActive : ""}`}>
              리뷰 ({reviews.length})
            </button>
          </div>

          {activeTab === "curriculum" && (
            <div className={s.chapterList}>
              {curriculum.length === 0 ? (
                <div className={s.reviewItem}>등록된 커리큘럼이 없습니다.</div>
              ) : (
                curriculum.map((chapter, index) => (
                  <div key={`${chapter.title}-${index}`} className={s.chapterItem}>
                    <div className={s.chapterLeft}>
                      <span className={s.chapterNum}>{String(index + 1).padStart(2, "0")}</span>
                      <span className={s.chapterPlay}>Play</span>
                      <span className={s.chapterTitle}>{chapter.title}</span>
                      {chapter.isPreview && (
                        <span style={{ fontSize: "0.7rem", background: "var(--accent)", color: "#fff", padding: "0.1em 0.4em", borderRadius: "0.25em", marginLeft: "0.4rem" }}>
                          무료 미리보기
                        </span>
                      )}
                    </div>
                    <span className={s.chapterDur}>{chapter.isPreview ? "미리보기" : "MP4"}</span>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === "review" && (
            <>
              <form className={s.reviewItem} onSubmit={submitReview}>
                <div className={s.reviewHeader}>
                  <strong>수강 후기 작성</strong>
                  <select className={s.sortSelect} value={rating} onChange={(event) => setRating(Number(event.target.value))} disabled={!canWriteReview}>
                    {[5, 4, 3, 2, 1].map((value) => <option key={value} value={value}>{value}점</option>)}
                  </select>
                </div>
                <p className={s.reviewContent}>
                  현재 진행률: {progress?.progressPercent ?? 0}% · 리뷰 작성 조건: 70% 이상 수강
                </p>
                <textarea
                  className={s.instrTextarea}
                  rows={4}
                  placeholder={canWriteReview ? "강의에 대한 후기를 남겨주세요." : "70% 이상 수강 후 리뷰를 작성할 수 있습니다."}
                  value={content}
                  onChange={(event) => setContent(event.target.value)}
                  disabled={!canWriteReview}
                />
                {message && <p className={s.formError}>{message}</p>}
                <button className={s.authSubmit} type="submit" disabled={!canWriteReview}>리뷰 등록</button>
              </form>

              <div className={s.reviewList}>
                {reviews.map((review) => {
                  const canManageReview = auth?.user.id === review.user.id || auth?.user.role === "ADMIN";
                  const isEditing = editingReviewId === review.id;

                  return (
                    <div key={review.id} className={s.reviewItem}>
                      <div className={s.reviewHeader}>
                        <div className={s.reviewUser}>
                          <div className={s.reviewAvatar}>{review.user.name[0]}</div>
                          <span className={s.reviewName}>{review.user.name}</span>
                        </div>
                        <span className={s.reviewDate}>{new Date(review.createdAt).toLocaleDateString("ko-KR")}</span>
                      </div>

                      {isEditing ? (
                        <form onSubmit={submitEditReview}>
                          <div className={s.reviewHeader}>
                            <strong>리뷰 수정</strong>
                            <select className={s.sortSelect} value={editRating} onChange={(event) => setEditRating(Number(event.target.value))}>
                              {[5, 4, 3, 2, 1].map((value) => <option key={value} value={value}>{value}점</option>)}
                            </select>
                          </div>
                          <textarea
                            className={s.instrTextarea}
                            rows={4}
                            value={editContent}
                            onChange={(event) => setEditContent(event.target.value)}
                          />
                          <div className={s.filterRow}>
                            <button className={s.catBtn} type="submit">저장</button>
                            <button className={s.catBtn} type="button" onClick={cancelEditReview}>취소</button>
                          </div>
                        </form>
                      ) : (
                        <>
                          <div className={s.reviewStars}>
                            {[1, 2, 3, 4, 5].map((star) => <span key={star} className={star <= review.rating ? s.starFilled : s.starEmpty}>★</span>)}
                          </div>
                          <p className={s.reviewContent}>{review.content}</p>
                          {canManageReview && (
                            <div className={s.filterRow}>
                              <button className={s.catBtn} type="button" onClick={() => startEditReview(review)}>수정</button>
                              <button className={s.catBtn} type="button" onClick={() => removeReview(review.id)}>삭제</button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        <div className={s.detailRight}>
          <div className={s.stickyCard}>
            <div className={s.priceBlock}>
              {originalPrice && (
                <div className={s.origPrice}>
                  {originalPrice.toLocaleString()}원
                  {discount && <span className={s.discountBadge}>{discount}% 할인</span>}
                </div>
              )}
              <div className={s.mainPrice}>{course.price.toLocaleString()}원</div>
            </div>
            <Link to={`/courses/${course.id}/learn`} className={s.btnEnroll}>지금 수강하기</Link>
            <button type="button" onClick={addToCart} className={s.btnCartAdd}>장바구니 담기</button>
            <button type="button" onClick={toggleBookmark} className={`${s.btnCartAdd} ${bookmarked ? s.btnCartAdded : ""}`} style={{ marginTop: "0.75rem" }}>
              {bookmarked ? "북마크 해제" : "북마크"}
            </button>
            <Link to="/cart" className={s.summaryMoreLink}>장바구니 보기</Link>
            {cartMessage && <p className={s.formError}>{cartMessage}</p>}
            <div className={s.courseInfo}>
              <div className={s.infoRow}><span className={s.infoLabel}>강사</span><span className={s.infoValue}>{course.teacher?.name ?? "인증 강사"}</span></div>
              <div className={s.infoRow}><span className={s.infoLabel}>강의 분량</span><span className={s.infoValue}>{course.duration}</span></div>
              <div className={s.infoRow}><span className={s.infoLabel}>내 진행률</span><span className={s.infoValue}>{progress?.progressPercent ?? 0}%</span></div>
              <div className={s.infoRow}><span className={s.infoLabel}>평점</span><span className={s.infoValue}>{averageRating.toFixed(1)} / 5.0</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
