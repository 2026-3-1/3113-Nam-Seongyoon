# P3 요구사항 — 운영형/외부연동+관측성

## 유저 스토리

| ID | 역할 | 스토리 | 수용 기준 (AC) |
|----|------|--------|---------------|
| US-301 | 학생 | 수강 신청 완료 시 이메일 수신 | Nodemailer로 발송, 실패 시 재시도 |
| US-302 | 시스템 | 매일 자정 만료된 쿠폰 정리 | @Cron 스케줄러 동작, job_logs 기록 |
| US-303 | 관리자 | 결제 상태 조회 | Payment 엔티티 상태 관리 |
| US-304 | 시스템 | 외부 API 실패 시 재시도 | Exponential Backoff 3회 |
| US-305 | 개발자 | 장애 발생 시 Sentry 알림 | SENTRY_DSN 설정 시 자동 수집 |

## 외부 서비스

| 서비스 | 구현 방식 |
|--------|----------|
| 이메일 | Nodemailer (SMTP) |
| 에러 모니터링 | Sentry (`@sentry/nestjs`) |
| 스케줄러 | `@nestjs/schedule` Cron |

## MVP 범위

**포함**
- 이메일 알림 (Nodemailer)
- Cron 스케줄러 + job_logs 테이블
- Sentry 연동
- Idempotency Key (결제 중복 방지)
- 결제 엔티티 상태 관리

**제외**
- 실 PG사 결제 연동 (테스트 모드 구현)
- Push 알림
