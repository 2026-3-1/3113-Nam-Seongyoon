# CertificatEdu — 포트폴리오

> 2026년 3학년 1학기 프로젝트 실습 — 인강 플랫폼 풀스택 구현

## 프로젝트 요약

| 항목 | 내용 |
|------|------|
| 기간 | 2026.03 ~ 2026.06 (16주) |
| 기술 | NestJS · React 19 · MySQL · Docker · GitHub Actions |
| 역할 | 풀스택 (백엔드 70% / 프론트 30%) |
| 단계 | P1 기초 → P2 인증+권한 → P3 운영+외부연동 |

---

## 주요 기능

- **강의 플랫폼**: 강의 목록·상세·검색·카테고리 필터·정렬
- **인증**: JWT 로그인·회원가입·토큰 자동 갱신·로그아웃
- **역할 기반 접근 제어**: STUDENT / TEACHER / ADMIN
- **장바구니 & 주문**: 강의 담기·결제(테스트)·주문 내역
- **마이페이지**: 수강 목록·진도율·북마크·리뷰 관리
- **강사 페이지**: 강의 등록·수정·삭제
- **이메일 알림**: Nodemailer SMTP 연동
- **Cron 스케줄러**: 만료 토큰 정리, job_logs 기록
- **운영**: Sentry 에러 수집, 헬스체크, Rate Limiting

---

## 기술 스택

### 백엔드
- **NestJS 11** — 모듈형 아키텍처, Dependency Injection
- **TypeORM 0.3** — MySQL 연동, 엔티티 관리
- **Passport-JWT** — 인증 전략
- **@nestjs/schedule** — Cron 잡
- **Nodemailer** — 이메일 발송
- **Sentry** — 에러 모니터링
- **Swagger** — API 문서 자동 생성 (`/api/docs`)

### 프론트엔드
- **React 19** + **TypeScript**
- **Vite** — 빌드 도구
- **React Router v7** — 클라이언트 라우팅
- **Tailwind CSS** — 스타일링

### 인프라
- **MySQL 8.0** — 운영 DB (SQLite 로컬 개발 병행)
- **Docker + Docker Compose** — 컨테이너화
- **GitHub Actions** — CI (lint·test·build) / CD (자동 배포)

---

## 프로젝트 구조

```
P1-P2-P3/
├── backend/          NestJS 백엔드
├── frontend/         React 프론트엔드
├── e2e/              Playwright e2e 테스트
├── docs/             설계·운영 문서
│   ├── p1/           P1 산출물
│   ├── p2/           P2 산출물
│   ├── p3/           P3 산출물
│   └── adr/          기술 의사결정 기록 (ADR)
├── docker-compose.yml        운영 환경
└── docker-compose.dev.yml    개발 환경
```

---

## 로컬 실행

```bash
# 시드 데이터 입력
cd backend && npm run seed

# 백엔드 실행
npm run start:dev    # localhost:3000

# 프론트엔드 실행
cd ../frontend && npm run dev    # localhost:5173

# Docker로 전체 실행
docker compose up -d
```

---

## API 문서

서버 실행 후: http://localhost:3000/api/docs

---

## 테스트

```bash
# 백엔드 유닛 테스트
cd backend && npm test

# 프론트엔드 유닛 테스트
cd frontend && npm test

# e2e 테스트 (서버 실행 중)
npx playwright test
```

---

## 기술 의사결정 (ADR)

- [ADR-001: 데이터베이스 선택 (MySQL)](docs/adr/ADR-001-database.md)
- [ADR-002: 인증 전략 (JWT)](docs/adr/ADR-002-auth-strategy.md)
- [ADR-003: 프론트엔드 스택 (React+Vite)](docs/adr/ADR-003-frontend-stack.md)
