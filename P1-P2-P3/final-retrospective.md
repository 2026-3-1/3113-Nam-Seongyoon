# 최종 회고 — P1~P3 프로젝트

## 프로젝트 개요

인강 플랫폼(CertificatEdu) 구축 — 16주, 3단계(P1 기초 → P2 인증 → P3 운영)

---

## P1 회고 (1~4주차)

### 잘한 점
- NestJS 모듈 구조를 처음부터 역할별로 분리하여 P2·P3 확장에 용이했음
- Docker Compose를 초기부터 적용해 환경 일관성 확보

### 개선점
- SQLite로 시작해 P3에서 MySQL 전환 비용 발생 → **처음부터 MySQL로 했어야 함**
- ERD 설계 없이 코딩 시작 → 중간에 스키마 변경 多

---

## P2 회고 (5~10주차)

### 잘한 점
- JWT Guard + Roles Decorator 패턴을 재사용 가능하게 설계
- Refresh Token을 DB 해시로 저장해 보안성 확보

### 개선점
- e2e 테스트를 나중에 추가하다 보니 테스트 환경 설정에 시간 소요
- OWASP 체크리스트를 작성만 하고 실제 점검이 부족했음

---

## P3 회고 (11~16주차)

### 잘한 점
- @nestjs/schedule로 Cron 잡 구현 및 job_logs 테이블로 운영 추적 가능
- Sentry 연동으로 운영 중 에러 즉시 파악 가능

### 개선점
- 실 PG사 결제 연동 미완성 (테스트 모드만 구현)
- 성능 최적화를 마지막에 몰아서 → 처음부터 인덱스 설계했어야 함

---

## 전체 학습 성과

| 항목 | 내용 |
|------|------|
| 백엔드 | NestJS, TypeORM, JWT, RBAC, Cron |
| 프론트 | React 19, TypeScript, Vite, React Router |
| DB | MySQL 8, 인덱스 설계, 페이지네이션 |
| 운영 | Docker, GitHub Actions CI/CD, Sentry, Healthcheck |
| 품질 | Jest, Vitest, Playwright e2e |

## 다음 단계

- Redis 캐시 레이어 추가
- 실 결제 연동 (토스페이먼츠)
- 쿠버네티스 배포 학습
- 코드 커버리지 80% 이상 달성
