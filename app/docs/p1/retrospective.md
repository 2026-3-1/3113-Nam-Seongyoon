# P1 회고

## 잘한 점

- TypeORM + SQLite로 빠른 프로토타이핑
- NestJS 모듈 구조로 관심사 분리 명확
- Vite Proxy로 프론트-백 CORS 문제 해결
- DTO + ValidationPipe로 입력 유효성 통일

## 개선점

- DB: 초기에 `synchronize: true` 사용 → 프로덕션에서 마이그레이션 스크립트 필요
- 테스트: 기능 구현 우선으로 테스트 후행 → P2부터 TDD 도입
- 에러 처리: 일부 에러 메시지 불일치 → error-codes.md로 통일
- 환경 변수: `.env.example` 초기부터 관리 필요

## P2에서 개선할 사항

- [x] Refresh Token 도입
- [x] 로그아웃 백엔드 처리
- [x] Helmet 보안 헤더
- [x] Rate Limiting
- [x] 페이지네이션
- [ ] e2e 테스트 (Playwright)
- [ ] 슬로우 쿼리 인덱스 최적화
