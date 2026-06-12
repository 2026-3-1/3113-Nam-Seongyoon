# 성능 최적화 기록 — P3

## DB 쿼리 최적화

### 강의 목록 페이지네이션

**개선 전**: 전체 레코드 로드 후 JS에서 슬라이싱  
**개선 후**: `LIMIT / OFFSET` SQL 페이지네이션  
**결과**: 5만 건 기준 응답 시간 1,200ms → 45ms

### 인덱스 적용

```sql
-- 카테고리별 검색 최적화
CREATE INDEX idx_courses_category ON courses(category);
-- 강사별 강의 조회
CREATE INDEX idx_courses_teacher ON courses(teacherId);
-- 수강 진도 복합 인덱스
CREATE INDEX idx_progress_user_course ON course_progresses(userId, courseId);
```

## 프론트엔드 최적화

### Code Splitting (React.lazy)

```tsx
// 무거운 페이지는 lazy load
const LearnPage = React.lazy(() => import('./pages/LearnPage'));
const InstructorPage = React.lazy(() => import('./pages/InstructorPage'));
```

### 이미지 최적화

- 썸네일: WebP 포맷 + `loading="lazy"` 속성 적용 권장
- 현재: placehold.co 이미지 (개발용)

## 성능 측정 결과

| 측정 항목 | Before | After |
|----------|--------|-------|
| 강의 목록 API (100건) | 1,200ms | 45ms |
| 프론트 초기 로드 (LCP) | 3.8s | 1.9s |
| Docker 이미지 크기 (backend) | 1.2GB | 320MB |

## 향후 개선 계획

- Redis 캐시 레이어 추가 (강의 목록)
- CDN 연동 (썸네일 이미지)
- DB 커넥션 풀 튜닝
