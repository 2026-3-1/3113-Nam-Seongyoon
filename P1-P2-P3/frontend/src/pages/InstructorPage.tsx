import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CATEGORIES } from "../lib/categories";
import { api, getAuth } from "../lib/api";
import { isImageSource } from "../lib/media";
import type { Course, CurriculumItem } from "../types";
import s from "../styles/pages.module.css";

const blankCurriculumItem: CurriculumItem = {
  title: "",
  videoUrl: "",
};

const THUMBNAIL_MAX_SIZE = 1280;
const THUMBNAIL_QUALITY = 0.78;

const emptyForm = {
  title: "",
  category: "IT/정보",
  description: "",
  thumbnail: "",
  price: 0,
  originalPrice: 0,
  discountPct: 0,
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
  const [uploading, setUploading] = useState<Record<number, number>>({});
  const [errors, setErrors] = useState<Set<string>>(new Set());
  const isTeacher = auth?.user.role === "TEACHER" || auth?.user.role === "ADMIN";

  useEffect(() => {
    api.courses().then((res) => setCourses(res.data)).catch(() => setCourses([]));
  }, []);

  const manageableCourses = useMemo(() => {
    if (auth?.user.role === "ADMIN") return courses;
    return courses.filter((course) => course.teacher?.id === auth?.user.id);
  }, [auth?.user.id, auth?.user.role, courses]);

  const set = (key: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const numKeys = ["price", "originalPrice", "discountPct"] as const;
    const isNum = (numKeys as readonly string[]).includes(key);
    const raw = isNum ? (event.target.value === "" ? 0 : Number(event.target.value)) : event.target.value;
    setForm((prev) => {
      const next = { ...prev, [key]: raw };
      if (key === "originalPrice" || key === "discountPct") {
        const op = key === "originalPrice" ? Number(raw) : prev.originalPrice;
        const dp = key === "discountPct" ? Number(raw) : prev.discountPct;
        if (op > 0 && dp > 0) next.price = Math.max(0, Math.round(op * (1 - dp / 100)));
        else if (op > 0 && dp === 0) next.price = op;
      }
      return next;
    });
    setErrors((prev) => { const next = new Set(prev); next.delete(key); return next; });
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

  const uploadVideo = (index: number, file: File) => {
    if (!file.type.startsWith("video/")) {
      setMessage("동영상 파일만 업로드할 수 있습니다.");
      return;
    }
    setUploading((prev) => ({ ...prev, [index]: 0 }));

    const formData = new FormData();
    formData.append("file", file);
    const currentAuth = getAuth();

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/upload/video");
    if (currentAuth) xhr.setRequestHeader("Authorization", `Bearer ${currentAuth.accessToken}`);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        setUploading((prev) => ({ ...prev, [index]: Math.round((e.loaded / e.total) * 100) }));
      }
    };

    const finish = () => setUploading((prev) => { const next = { ...prev }; delete next[index]; return next; });

    xhr.onload = () => {
      setUploading((prev) => ({ ...prev, [index]: 100 }));
      if (xhr.status >= 200 && xhr.status < 300) {
        const data = JSON.parse(xhr.responseText) as { url: string };
        setCurriculum(index, "videoUrl", data.url);
      } else {
        setMessage("동영상 업로드에 실패했습니다. 다시 시도해 주세요.");
      }
      setTimeout(finish, 600);
    };

    xhr.onerror = () => {
      setMessage("동영상 업로드에 실패했습니다. 다시 시도해 주세요.");
      finish();
    };

    xhr.send(formData);
  };

  const uploadMultiple = (files: FileList) => {
    const fileArray = Array.from(files).filter((f) => f.type.startsWith("video/"));
    if (fileArray.length === 0) return;

    const curr = [...form.curriculum];
    const targets: number[] = [];

    for (const file of fileArray) {
      const taken = new Set(targets);
      const emptyIdx = curr.findIndex((item, i) => !item.videoUrl && !taken.has(i));
      if (emptyIdx !== -1) {
        targets.push(emptyIdx);
        if (!curr[emptyIdx].title) {
          curr[emptyIdx] = { ...curr[emptyIdx], title: file.name.replace(/\.[^/.]+$/, "") };
        }
      } else {
        targets.push(curr.length);
        curr.push({ title: file.name.replace(/\.[^/.]+$/, ""), videoUrl: "" });
      }
    }

    setForm((prev) => ({ ...prev, curriculum: curr }));
    fileArray.forEach((file, i) => uploadVideo(targets[i], file));
  };

  const reset = () => {
    setForm({ ...emptyForm, curriculum: [{ ...blankCurriculumItem }] });
    setEditingId(null);
    setErrors(new Set());
    setMessage("");
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!isTeacher) {
      setMessage("선생님 또는 관리자 계정으로 로그인해야 강의를 등록할 수 있습니다.");
      return;
    }

    const newErrors = new Set<string>();
    if (!form.title.trim()) newErrors.add("title");
    if (!form.description.trim()) newErrors.add("description");
    if (form.price < 0) newErrors.add("price");
    if (!form.thumbnail) newErrors.add("thumbnail");
    const validCurriculum = form.curriculum.filter((c) => c.title.trim() && c.videoUrl.trim());
    if (validCurriculum.length === 0) newErrors.add("curriculum");
    if (form.discountPct < 0 || form.discountPct > 99) newErrors.add("discountPct");

    if (newErrors.size > 0) {
      setErrors(newErrors);
      setMessage("필수 항목을 모두 입력해 주세요.");
      return;
    }
    setErrors(new Set());

    const curriculum = form.curriculum
      .map((item) => ({ title: item.title.trim(), videoUrl: item.videoUrl.trim() }))
      .filter((item) => item.title && item.videoUrl);

    const payload = {
      ...form,
      originalPrice: form.originalPrice || undefined,
      discountPct: undefined,
      tag: undefined,
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
      discountPct: course.originalPrice && course.originalPrice > course.price
        ? Math.round((1 - course.price / course.originalPrice) * 100)
        : 0,
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
                <input className={`${s.formInput} ${errors.has("title") ? s.inputError : ""}`} value={form.title} onChange={set("title")} placeholder="정보처리기사 실전반" />
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
                <label className={s.formLabel}>정가</label>
                <input
                  className={`${s.formInput} ${errors.has("price") ? s.inputError : ""}`}
                  type="number"
                  value={form.originalPrice || ""}
                  placeholder="100000"
                  onChange={set("originalPrice")}
                />
              </div>
              <div className={s.formGroup}>
                <label className={s.formLabel}>
                  할인율 <span style={{ color: "var(--muted)", fontWeight: 400 }}>(%)</span>
                  {form.discountPct > 0 && form.originalPrice > 0 && (
                    <span style={{ marginLeft: "0.5rem", color: "var(--accent)", fontWeight: 700 }}>
                      → 판매가 {form.price.toLocaleString()}원
                    </span>
                  )}
                </label>
                <input
                  className={`${s.formInput} ${errors.has("discountPct") ? s.inputError : ""}`}
                  type="number"
                  value={form.discountPct || ""}
                  placeholder="0 (할인 없음)"
                  onChange={set("discountPct")}
                />
              </div>
            </div>

            <div className={s.instrFormGrid}>
              <div className={s.formGroup}>
                <label className={s.formLabel}>썸네일 사진</label>
                <label className={s.uploadBtn}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                  {form.thumbnail ? "썸네일 변경" : "썸네일 업로드"}
                  <input type="file" accept="image/*" onChange={readThumbnail} style={{ display: "none" }} />
                </label>
              </div>
              <div className={`${s.thumbPreview} ${errors.has("thumbnail") ? s.inputError : ""}`}>
                {isImageSource(form.thumbnail) ? (
                  <img src={form.thumbnail} alt="" className={s.thumbImage} />
                ) : (
                  <div className={s.thumbPlaceholder}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                    <span>이미지를 업로드해 주세요</span>
                  </div>
                )}
              </div>
            </div>

            <div className={s.formGroup}>
              <label className={s.formLabel}>태그</label>
              <input className={s.formInput} value={form.badge} onChange={set("badge")} placeholder="인증 강사, 업계 전문가..." />
            </div>

            <div className={s.formGroup}>
              <label className={s.formLabel}>강의 소개</label>
              <textarea className={`${s.instrTextarea} ${errors.has("description") ? s.inputError : ""}`} rows={4} value={form.description} onChange={set("description")} />
            </div>

            <div className={s.formGroup}>
              <label className={s.formLabel}>커리큘럼 {errors.has("curriculum") && <span style={{ color: "#ef4444", fontWeight: 400 }}>— 제목과 영상이 모두 있는 강의가 1개 이상 필요합니다</span>}</label>
              <div className={`${s.curriculumEditor} ${errors.has("curriculum") ? s.inputError : ""}`} style={{ padding: errors.has("curriculum") ? "0.5rem" : undefined, borderRadius: errors.has("curriculum") ? "var(--radius-sm)" : undefined }}>
                {form.curriculum.map((item, index) => (
                  <div key={index} className={s.curriculumRow}>
                    <input
                      className={s.formInput}
                      value={item.title}
                      onChange={(event) => setCurriculum(index, "title", event.target.value)}
                      placeholder={`${index + 1}강 제목`}
                    />
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem", flex: 1, minWidth: 0 }}>
                      <label className={`${s.uploadBtn} ${s.uploadBtnSm}`}>
                        {index in uploading ? (
                          <span className={s.uploadSpinner} />
                        ) : (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                        )}
                        {index in uploading ? `업로드 중 ${uploading[index]}%` : item.videoUrl ? "영상 변경" : "MP4 업로드"}
                        <input
                          type="file"
                          accept="video/mp4,video/webm"
                          style={{ display: "none" }}
                          disabled={index in uploading}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) uploadVideo(index, file);
                          }}
                        />
                      </label>
                      {index in uploading && (
                        <>
                          <div className={s.uploadProgressWrap}>
                            <div className={s.uploadProgressBar} style={{ width: `${uploading[index]}%` }} />
                          </div>
                          <span className={s.uploadProgressLabel}>{uploading[index]}% 업로드됨</span>
                        </>
                      )}
                      {item.videoUrl && !(index in uploading) && (
                        <span className={s.videoFileName}>✓ {item.videoUrl.split("/").pop()}</span>
                      )}
                    </div>
                    <button type="button" className={s.smallDangerBtn} onClick={() => removeCurriculum(index)}>삭제</button>
                  </div>
                ))}
                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                  <button type="button" className={s.btnOutline} onClick={addCurriculum}>+ 강의 추가</button>
                  <label className={s.btnOutline} style={{ cursor: "pointer" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                    영상 여러 개 한 번에
                    <input
                      type="file"
                      accept="video/mp4,video/webm"
                      multiple
                      style={{ display: "none" }}
                      onChange={(e) => { if (e.target.files) uploadMultiple(e.target.files); e.target.value = ""; }}
                    />
                  </label>
                </div>
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
