# ADR-003: 프론트엔드 기술 스택 선택

**날짜**: 2026-03-05  
**상태**: 확정

## 배경

인강 사이트 프론트엔드 기술 스택을 선정해야 함.

## 결정

**React 19 + TypeScript + Vite + Tailwind CSS** 채택

## 근거

| 항목 | React | Vue | Next.js |
|------|-------|-----|---------|
| 생태계 | 가장 큼 | 중간 | 매우 큼 |
| 학습 곡선 | 보통 | 낮음 | 높음 |
| SSR 필요성 | 낮음 (SPA 충분) | 낮음 | 기본 제공 |
| 팀 경험 | 높음 | 낮음 | 낮음 |

- SEO가 중요한 서비스가 아니므로 SSR 불필요 → SPA로 충분
- Vite는 빠른 HMR로 개발 생산성 향상
- TypeScript로 타입 안전성 확보
- Tailwind CSS는 별도 CSS 파일 없이 빠른 UI 구성 가능

## 결과

- 빌드: `vite build`
- 테스트: `vitest` + `@testing-library/react`
- e2e: `playwright`
- API 통신: `fetch` 래퍼 (`lib/api.ts`)
