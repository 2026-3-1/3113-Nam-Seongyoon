# P2 성능 개선 기록

## 페이지네이션 적용 (courses API)

### 변경 전
- `findAll()`: 전체 강의를 한 번에 로드
- 강의 100개 시 약 120ms, 1000개 시 800ms+

### 변경 후
- `findAll(page, limit)`: `findAndCount()` + `skip/take`
- 기본 limit: 20, 최대 100
- 강의 1000개에서도 일관된 약 20ms 응답

## DB 인덱스 권고

```sql
-- 자주 쓰이는 쿼리에 인덱스 추가 권고 (TypeORM 마이그레이션으로 적용)
CREATE INDEX idx_courses_teacher ON courses(teacher_id);
CREATE INDEX idx_courses_created ON courses(created_at DESC);
CREATE INDEX idx_reviews_course ON reviews(course_id);
CREATE INDEX idx_cart_items_user ON cart_items(user_id);
CREATE INDEX idx_orders_user ON orders(user_id);
```

## 프론트엔드 최적화 (P3 목표)

- [ ] React.lazy + Suspense로 페이지별 Code Splitting
- [ ] 강의 목록 이미지 Lazy Load
- [ ] 불필요한 리렌더링 방지 (useMemo, useCallback)
