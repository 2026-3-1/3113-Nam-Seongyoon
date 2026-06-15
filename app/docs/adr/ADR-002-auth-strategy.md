# ADR-002: 인증 전략 선택

**날짜**: 2026-04-01  
**상태**: 확정

## 배경

P2에서 인증 시스템을 추가해야 함. 세션 기반 vs JWT 기반 중 선택 필요.

## 결정

**JWT (Access Token 15분 + Refresh Token 7일)** 채택

## 근거

| 항목 | 세션 기반 | JWT |
|------|----------|-----|
| 서버 상태 | Stateful (Redis 필요) | Stateless |
| 수평 확장 | 복잡 | 간단 |
| 토큰 무효화 | 즉시 | Refresh Token 해시로 처리 |
| 구현 복잡도 | 보통 | 보통 |

- SPA(React) + REST API 구조에 JWT가 적합
- `@nestjs/passport` + `passport-jwt` 생태계 활용
- Refresh Token은 DB에 해시 저장하여 로그아웃 시 무효화

## 결과

- Access Token: 15분 만료, Authorization 헤더
- Refresh Token: 7일 만료, DB 해시 저장
- 로그아웃: DB의 refreshTokenHash를 null로 변경
