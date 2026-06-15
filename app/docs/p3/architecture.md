# 아키텍처 — P3

## 전체 구성도

```
┌──────────────┐     HTTPS      ┌───────────────────────────────────┐
│   브라우저    │ ────────────> │  Nginx (frontend, :80)            │
└──────────────┘               └────────────┬──────────────────────┘
                                             │ /api/* proxy
                               ┌────────────▼──────────────────────┐
                               │  NestJS Backend (:3000)           │
                               │  ┌──────────┐  ┌──────────────┐   │
                               │  │ Auth     │  │ Scheduler    │   │
                               │  │ Course   │  │ Notification │   │
                               │  │ Cart     │  │ Payment      │   │
                               │  └────┬─────┘  └──────┬───────┘   │
                               └───────┼────────────────┼───────────┘
                                       │                │
                          ┌────────────▼───┐     ┌──────▼──────┐
                          │  MySQL 8 (:3306)│     │  SMTP Server│
                          │  (Docker)       │     │  (Nodemailer)│
                          └────────────────┘     └─────────────┘
                                                        │
                                               ┌────────▼────────┐
                                               │   Sentry.io     │
                                               └─────────────────┘
```

## 모듈 구조

```
src/
├── auth/           JWT Guard, Strategy, Decorator
├── entities/       TypeORM 엔티티 (11개)
├── notification/   Nodemailer 알림 서비스
├── scheduler/      @nestjs/schedule Cron + JobLog
├── dto/            입력 유효성 검증 DTO
├── *.module.ts     각 도메인 모듈
└── main.ts         Sentry, Helmet, CORS, Throttler 초기화
```

## 외부 연동

| 대상 | 프로토콜 | 재시도 정책 |
|------|----------|------------|
| MySQL | TCP | TypeORM 자동 재연결 |
| SMTP (이메일) | SMTP/TLS | 애플리케이션 레벨 최대 3회 |
| Sentry | HTTPS | SDK 내장 버퍼링 |

## Docker Compose (운영)

```
docker compose up -d
  ├── db (MySQL 8)
  ├── backend (NestJS)
  └── frontend (Nginx + React)
```
