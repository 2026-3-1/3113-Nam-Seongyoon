# 배치·스케줄러 명세 — P3

## Cron Job 목록

### 1. `cleanExpiredSessions` — 만료 Refresh Token 정리

| 항목 | 내용 |
|------|------|
| 스케줄 | 매일 새벽 3시 (`0 3 * * *`) |
| 동작 | `refreshTokenHash IS NOT NULL AND updatedAt < now()-7d` 조건으로 토큰 null 처리 |
| 로그 | `job_logs` 테이블에 상태 기록 |

### 2. `sendDailyDigest` (예정) — 학생 학습 진도 주간 리포트

| 항목 | 내용 |
|------|------|
| 스케줄 | 매주 월요일 오전 9시 |
| 동작 | 수강 중 학생에게 진도 요약 이메일 발송 |

## job_logs 테이블

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | INT PK | |
| jobName | VARCHAR | 잡 이름 |
| status | ENUM(SUCCESS, FAILED) | 실행 결과 |
| message | TEXT NULL | 결과 메시지 또는 오류 내용 |
| duration | INT NULL | 실행 시간 (ms) |
| createdAt | DATETIME | 실행 시각 |

## Notification Service (Nodemailer)

```typescript
// 이메일 발송 예시
await notificationService.sendMail({
  to: 'user@example.com',
  subject: '수강 신청 완료',
  text: '강의 수강 신청이 완료되었습니다.',
});
```

SMTP 설정: `.env`의 `MAIL_HOST`, `MAIL_PORT`, `MAIL_USER`, `MAIL_PASS`

## 재시도 정책

외부 API 실패 시 최대 3회 Exponential Backoff 재시도:
- 1회: 1초 후
- 2회: 2초 후
- 3회: 4초 후
- 3회 모두 실패 → job_logs에 FAILED 기록 + Sentry 오류 보고
