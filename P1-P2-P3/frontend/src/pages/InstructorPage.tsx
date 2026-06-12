import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CATEGORIES } from "../lib/categories";
import { api, getAuth } from "../lib/api";
import { isImageSource } from "../lib/media";
import type { Course, CurriculumItem } from "../types";
import s from "../styles/pages.module.css";

const blankCurriculumItem: CurriculumItem = {
  title: "",
  youtubeUrl: "",
};

const THUMBNAIL_MAX_SIZE = 1280;
const THUMBNAIL_QUALITY = 0.78;

const emptyForm = {
  title: "",
  category: "IT/개발",
  description: "",
  thumbnail: "",
  price: 0,
  originalPrice: 0,
  badge: "인증 강사",
  duration: "총 20강",
  tag: "",
  isPublished: true,
  curriculum: [{ ...blankCurriculumItem }],
};

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

async function resizeThumbnail(file: File) {
  const objectUrl = URL.createObjectURL(file);
  try {
    const image = await loadImage(objectUrl);
    const scale = Math.min(1, THUMBNAIL_MAX_SIZE / Math.max(image.width, image.height));
    const width = Math.max(1, Math.round(image.width * scale));
    const height = Math.max(1, Math.round(image.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");
    if (!context) throw new Error("이미지를 처리할 수 없습니다.");
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, width, height);
    context.drawImage(image, 0, 0, width, height);

    return canvas.toDataURL("image/jpeg", THUMBNAIL_QUALITY);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export default function InstructorPage() {
  const auth = getAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const isTeacher = auth?.user.role === "TEACHER" || auth?.user.role === "ADMIN";

  useEffect(() => {
    api.courses().then((res) => setCourses(res.data)).catch(() => setCourses([]));
  }, []);

  const manageableCourses = useMemo(() => {
    if (auth?.user.role === "ADMIN") return courses;
    return courses.filter((course) => course.teacher?.id === auth?.user.id);
  }, [auth?.user.id, auth?.user.role, courses]);

  const set = (key: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const value = key === "price" || key === "originalPrice" ? Number(event.target.value) : event.target.value;
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const setCurriculum = (index: number, key: keyof CurriculumItem, value: string) => {
    setForm((prev) => ({
      ...prev,
      curriculum: prev.curriculum.map((item, itemIndex) => (
        itemIndex === index ? { ...item, [key]: value } : item
      )),
    }));
  };

  const addCurriculum = () => {
    setForm((prev) => ({
      ...prev,
      curriculum: [...prev.curriculum, { ...blankCurriculumItem }],
    }));
  };

  const removeCurriculum = (index: number) => {
    setForm((prev) => ({
      ...prev,
      curriculum: prev.curriculum.filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const readThumbnail = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setMessage("이미지 파일만 업로드할 수 있습니다.");
      return;
    }
    try {
      setMessage("썸네일 이미지를 최적화하는 중입니다.");
      const thumbnail = await resizeThumbnail(file);
      setForm((prev) => ({ ...prev, thumbnail }));
      setMessage("");
    } catch {
      setMessage("이미지를 불러오지 못했습니다. 다른 파일을 선택해 주세요.");
    }
  };

  const reset = () => {
    setForm({ ...emptyForm, curriculum: [{ ...blankCurriculumItem }] });
    setEditingId(null);
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!isTeacher) {
      setMessage("선생님 또는 관리자 계정으로 로그인해야 강의를 등록할 수 있습니다.");
      return;
    }
    if (!form.title || !form.description || form.price < 0) {
      setMessage("강의명, 소개, 가격을 확인해 주세요.");
      return;
    }
    if (form.originalPrice > 0 && form.price > form.originalPrice) {
      setMessage("판매가는 정가보다 클 수 없습니다.");
      return;
    }
    if (!form.thumbnail) {
      setMessage("강의 썸네일 사진을 업로드해 주세요.");
      return;
    }

    const curriculum = form.curriculum
      .map((item) => ({ title: item.title.trim(), youtubeUrl: item.youtubeUrl.trim() }))
      .filter((item) => item.title && item.youtubeUrl);

    const payload = {
      ...form,
      originalPrice: form.originalPrice || undefined,
      tag: form.tag || undefined,
      duration: `총 ${curriculum.length}강`,
      curriculum,
    };

    try {
      const saved = editingId
        ? await api.updateCourse(editingId, payload)
        : await api.createCourse(payload);
      setCourses((items) => editingId ? items.map((item) => item.id === saved.id ? saved : item) : [saved, ...items]);
      setMessage(editingId ? "강의가 수정되었습니다." : "강의가 등록되었습니다.");
      reset();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "요청 처리에 실패했습니다.");
    }
  };

  const edit = (course: Course) => {
    setEditingId(course.id);
    setForm({
      title: course.title,
      category: course.category,
      description: course.description,
      thumbnail: course.thumbnail,
      price: course.price,
      originalPrice: course.originalPrice ?? 0,
      badge: course.badge,
      duration: course.duration,
      tag: course.tag ?? "",
      isPublished: course.isPublished ?? true,
      curriculum: course.curriculum?.length ? course.curriculum : [{ ...blankCurriculumItem }],
    });
  };

  const remove = async (id: number) => {
    try {
      await api.deleteCourse(id);
      setCourses((items) => items.filter((item) => item.id !== id));
      setMessage("강의가 삭제되었습니다.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "삭제에 실패했습니다.");
    }
  };

  if (!auth) {
    return (
      <div className={s.instrSuccessWrap}>
        <div className={s.instrSuccessBox}>
          <h2 className={s.instrSuccessTitle}>선생님 전용 서비스</h2>
          <p className={s.instrSuccessDesc}>강의를 등록하려면 선생님 계정으로 로그인해 주세요.</p>
          <Link to="/login" className={s.btnPrimary}>로그인하기</Link>
        </div>
      </div>
    );
  }

  return (
    <div className={s.container}>
      <span className={s.instrBadge}>강의 관리</span>
      <h1 className={s.instrTitle}>선생님 <span className={s.accentBlue}>강의 관리</span></h1>
      <p className={s.instrSub}>
        현재 계정: {auth.user.name} ({auth.user.role}) · 강의 썸네일, 커리큘럼, 유튜브 링크를 등록할 수 있습니다.
      </p>

      <div className={s.instrLayout}>
        <div>
          <h3 className={s.instrFormTitle}>{editingId ? "강의 수정" : "새 강의 등록"}</h3>
          <form className={s.instrForm} onSubmit={submit}>
            <div className={s.instrFormGrid}>
              <div className={s.formGroup}>
                <label className={s.formLabel}>강의명</label>
                <input className={s.formInput} value={form.title} onChange={set("title")} placeholder="정보처리기사 실전반" />
              </div>
              <div className={s.formGroup}>
                <label className={s.formLabel}>카테고리</label>
                <select className={s.instrSelect} value={form.category} onChange={set("category")}>
                  {CATEGORIES.filter((cat) => cat.id !== "all").map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className={s.instrFormGrid}>
              <div className={s.formGroup}>
                <label className={s.formLabel}>가격</label>
                <input className={s.formInput} type="number" value={form.price} onChange={set("price")} />
              </div>
              <div className={s.formGroup}>
                <label className={s.formLabel}>정가</label>
                <input className={s.formInput} type="number" value={form.originalPrice} onChange={set("originalPrice")} />
              </div>
            </div>

            <div className={s.instrFormGrid}>
              <div className={s.formGroup}>
                <label className={s.formLabel}>썸네일 사진</label>
                <input className={s.formInput} type="file" accept="image/*" onChange={readThumbnail} />
              </div>
              <div className={s.thumbPreview}>
                {isImageSource(form.thumbnail) ? (
                  <img src={form.thumbnail} alt="" className={s.thumbImage} />
                ) : (
                  "이미지를 업로드해 주세요"
                )}
              </div>
            </div>

            <div className={s.instrFormGrid}>
              <div className={s.formGroup}>
                <label className={s.formLabel}>배지</label>
                <input className={s.formInput} value={form.badge} onChange={set("badge")} />
              </div>
              <div className={s.formGroup}>
                <label className={s.formLabel}>태그</label>
                <input className={s.formInput} value={form.tag} onChange={set("tag")} placeholder="BEST, NEW, HOT" />
              </div>
            </div>

            <div className={s.formGroup}>
              <label className={s.formLabel}>강의 소개</label>
              <textarea className={s.instrTextarea} rows={4} value={form.description} onChange={set("description")} />
            </div>

            <div className={s.formGroup}>
              <label className={s.formLabel}>커리큘럼</label>
              <div className={s.curriculumEditor}>
                {form.curriculum.map((item, index) => (
                  <div key={index} className={s.curriculumRow}>
                    <input
                      className={s.formInput}
                      value={item.title}
                      onChange={(event) => setCurriculum(index, "title", event.target.value)}
                      placeholder="커리큘럼 제목"
                    />
                    <input
                      className={s.formInput}
                      value={item.youtubeUrl}
                      onChange={(event) => setCurriculum(index, "youtubeUrl", event.target.value)}
                      placeholder="YouTube URL"
                    />
                    <button type="button" className={s.smallDangerBtn} onClick={() => removeCurriculum(index)}>삭제</button>
                  </div>
                ))}
                <button type="button" className={s.btnOutline} onClick={addCurriculum}>커리큘럼 추가</button>
              </div>
            </div>

            {message && <p className={s.formError}>{message}</p>}
            <button type="submit" className={s.instrSubmit}>{editingId ? "수정 저장" : "강의 등록"}</button>
            {editingId && <button type="button" className={s.btnOutline} onClick={reset}>취소</button>}
          </form>
        </div>

        <div>
          <div className={s.instrSideCard}>
            <h3 className={s.instrSideTitle}>내 등록 강의</h3>
            <div className={s.reviewList}>
              {manageableCourses.length === 0 ? (
                <p className={s.reviewContent}>아직 등록한 강의가 없습니다.</p>
              ) : (
                manageableCourses.map((course) => (
                  <div key={course.id} className={s.reviewItem}>
                    <div className={s.reviewHeader}>
                      <strong>{course.title}</strong>
                      <span className={s.reviewDate}>{course.price.toLocaleString()}원</span>
                    </div>
                    <p className={s.reviewContent}>{course.description}</p>
                    <div className={s.filterRow}>
                      <button className={s.catBtn} onClick={() => edit(course)}>수정</button>
                      <button className={s.catBtn} onClick={() => remove(course.id)}>삭제</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
