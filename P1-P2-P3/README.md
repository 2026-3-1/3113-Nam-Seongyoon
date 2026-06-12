# CertificatEdu — P1-P2

자격증 학습 플랫폼 (인증 없이 CRUD → JWT 인증 + RBAC 완성)

## 기술 스택

| 영역 | 기술 |
|------|------|
| 백엔드 | NestJS 11, TypeORM, SQLite, Passport-JWT |
| 프론트엔드 | React 19, Vite 8, React Router 7, TypeScript |
| 보안 | Helmet, ThrottlerGuard, bcrypt, JWT |
| 인프라 | Docker, Docker Compose, GitHub Actions |

## 빠른 시작

```bash
# 백엔드
cp backend/.env.example backend/.env
cd backend && npm install && npm run start:dev

# 프론트엔드 (새 터미널)
cd frontend && npm install && npm run dev
```

- 프론트: http://localhost:5173  
- 백엔드 API: http://localhost:3001/api  
- Swagger: http://localhost:3001/api/docs  
- 헬스체크: http://localhost:3001/health  

## Docker로 실행

```bash
# 개발
docker compose -f docker-compose.dev.yml up

# 프로덕션
cp backend/.env.example backend/.env  # 실제 값으로 수정
docker compose up -d
```

## 역할(Role) 구분

| 역할 | 권한 |
|------|------|
| STUDENT | 강의 조회, 장바구니, 결제, 진도, 리뷰 |
| TEACHER | 강의 등록/수정/삭제, 수강생 진도 확인 |
| ADMIN | 전체 권한 |

## 주요 API

```
POST /api/auth/register    회원가입
POST /api/auth/login       로그인 (accessToken + refreshToken 반환)
POST /api/auth/refresh     Access Token 갱신
POST /api/auth/logout      로그아웃 (토큰 무효화)

GET  /api/courses?page=1&limit=20   강의 목록 (페이지네이션)
GET  /api/courses/:id               강의 상세
POST /api/courses                   강의 등록 (TEACHER/ADMIN)

GET  /api/cart              장바구니 조회
POST /api/cart/checkout     결제

GET  /api/health            헬스체크
```

## 프로젝트 구조

```
P1-P2/
├── backend/                # NestJS API 서버
│   ├── src/
│   │   ├── auth/           # JWT Guard, Strategy, Decorator
│   │   ├── entities/       # TypeORM 엔티티
│   │   ├── dto/            # 요청/응답 DTO
│   │   └── *.module.ts     # 기능별 모듈
│   ├── Dockerfile
│   └── .env.example
├── frontend/               # React + Vite
│   ├── src/
│   │   ├── pages/          # 페이지 컴포넌트
│   │   ├── components/     # 공통 컴포넌트
│   │   ├── lib/            # API 클라이언트, 유틸
│   │   └── types/          # TypeScript 타입 정의
│   ├── Dockerfile
│   └── nginx.conf
├── .github/
│   ├── workflows/          # CI/CD 파이프라인
│   └── ISSUE_TEMPLATE/     # 이슈 템플릿
├── docs/
│   ├── p1/                 # P1 설계 문서
│   └── p2/                 # P2 설계 문서
└── docker-compose.yml
```

## 환경 변수 (.env)

| 변수 | 설명 | 기본값 |
|------|------|--------|
| PORT | 서버 포트 | 3001 |
| JWT_SECRET | Access Token 서명 키 | — |
| JWT_EXPIRES_IN | Access Token 만료 | 1h |
| JWT_REFRESH_SECRET | Refresh Token 서명 키 | — |
| JWT_REFRESH_EXPIRES_IN | Refresh Token 만료 | 30d |
| DB_DATABASE | SQLite 파일 경로 | certificatedu.sqlite |

## 브랜치 전략 (GitHub Flow)

```
main ← develop ← feature/기능명
                ← fix/버그명
```

커밋 규칙: [Conventional Commits](https://www.conventionalcommits.org/)  
`feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`

## Definition of Done (DoD)

- [ ] 기능 구현 완료
- [ ] 유닛 테스트 작성 (신규 서비스 로직)
- [ ] lint/build 통과
- [ ] Swagger 문서 최신화
- [ ] PR 리뷰 1명 이상 승인
