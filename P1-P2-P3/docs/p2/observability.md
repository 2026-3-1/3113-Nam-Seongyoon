# 모니터링·관측성 — P2

## 에러 수집 (Sentry)

`SENTRY_DSN` 환경변수 설정 시 자동 활성화 (`main.ts`).

```env
SENTRY_DSN=https://xxxxx@sentry.io/yyyy
```

- 프로덕션: `tracesSampleRate: 0.2`
- 개발: `tracesSampleRate: 1.0`

## 헬스체크

```
GET /health
```

응답 예시:
```json
{
  "status": "ok",
  "info": {
    "database": { "status": "up" }
  }
}
```

## 구조화 로그

NestJS 기본 Logger 사용. 출력 레벨: `log | warn | error`.

운영 환경에서는 JSON 포맷 로그 파이프라인 추가 권장 (winston + CloudWatch 등).

## 페이지네이션

`GET /api/courses?page=1&limit=20` — 모든 목록 API에 공통 적용.

응답 구조:
```json
{ "data": [...], "total": 100, "page": 1, "limit": 20, "totalPages": 5 }
```

## Rate Limiting (Throttler)

- TTL: 60초
- 최대 요청: 100회/IP
- `ThrottlerModule` 전역 적용

## 슬로우 쿼리 분석 (개선 예정)

현재는 `logging: true` (development 환경)로 쿼리 출력.
P3에서 MySQL slow query log 설정 예정.
