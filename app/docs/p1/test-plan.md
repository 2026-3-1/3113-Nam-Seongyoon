# 테스트 계획

## 테스트 레벨

### 유닛 테스트 (Jest)
| 대상 | 파일 | 주요 케이스 |
|------|------|-----------|
| AuthService | auth.service.spec.ts | 회원가입, 로그인, Refresh, Logout |
| CourseService | course.service.spec.ts | 페이지네이션, 단건 조회, 404 |

### 통합 테스트 (Jest + Supertest)
- 실제 SQLite 인메모리 DB 사용
- API 엔드포인트 전체 흐름 검증

### e2e 테스트 (Playwright — P2 목표)
- 회원가입 → 로그인 → 강의 조회 흐름
- 강사 로그인 → 강의 등록 흐름

## 실행 방법

```bash
# 유닛 테스트
cd backend && npm test

# 감시 모드
npm run test:watch

# 커버리지
npm run test:cov
```

## CI 테스트 환경 변수

```
NODE_ENV=test
JWT_SECRET=ci-test-secret
JWT_REFRESH_SECRET=ci-refresh-secret
DB_DATABASE=:memory:
```
