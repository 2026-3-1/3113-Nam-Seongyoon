# P2 보안 설계

## 인증 (Authentication) 흐름

```
1. POST /auth/login → { accessToken (1h), refreshToken (30d) }
2. 모든 보호 API → Authorization: Bearer <accessToken>
3. 401 응답 수신 → POST /auth/refresh → 새 accessToken 발급
4. POST /auth/logout → refreshTokenHash 무효화
```

## Refresh Token 전략

- Access Token: 1시간 만료, JWT, 서버 상태 없음
- Refresh Token: 30일 만료, bcrypt 해시 후 DB 저장
- 갱신 시 기존 Refresh Token 폐기 후 새로 발급 (Rotation)
- 로그아웃 시 DB의 refreshTokenHash 를 null로 설정

## RBAC (역할 기반 접근 제어)

| 엔드포인트 | STUDENT | TEACHER | ADMIN |
|-----------|---------|---------|-------|
| GET /courses | ✅ | ✅ | ✅ |
| POST /courses | ❌ | ✅ | ✅ |
| PATCH /courses/:id | ❌ | 본인만 | ✅ |
| DELETE /courses/:id | ❌ | 본인만 | ✅ |
| GET /cart | ✅ | ❌ | ✅ |
| POST /cart/checkout | ✅ | ❌ | ✅ |

## OWASP Top 10 대응

| 항목 | 대응 |
|------|------|
| A01 - 접근제어 취약점 | RolesGuard + JwtAuthGuard |
| A02 - 암호화 실패 | bcrypt(10 rounds), HTTPS 권고 |
| A03 - 인젝션 | TypeORM 파라미터 바인딩 |
| A04 - 안전하지 않은 설계 | DTO 유효성 검사 (class-validator) |
| A05 - 보안 설정 오류 | Helmet (보안 헤더), CORS 화이트리스트 |
| A06 - 취약한 컴포넌트 | npm audit 정기 실행 |
| A07 - 인증/식별 실패 | JWT + Refresh Token Rotation |
| A08 - 소프트웨어 무결성 | GitHub Actions CI |
| A09 - 로깅/모니터링 부족 | 구조화 로그 (NestJS Logger) |
| A10 - SSRF | 외부 URL 입력 제한 |

## 보안 헤더 (Helmet)

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security` (HTTPS 환경)
- `Content-Security-Policy`

## Rate Limiting

- 전역: 100 req / 60s per IP
- 인증 엔드포인트: 별도 강화 권고 (P3)

## 민감 정보 관리

- `.env` 파일: `.gitignore`에 등록
- `.env.example`: 실제 값 없이 키만 공개
- GitHub Secrets: CI/CD 파이프라인 시크릿
