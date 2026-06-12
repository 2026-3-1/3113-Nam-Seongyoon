# P1 아키텍처

## 컴포넌트 다이어그램

```
[Browser]
    │
    ▼
[React + Vite :5173]
    │  /api/* → proxy
    ▼
[NestJS :3001]
    │
    ├── AuthModule   (JWT 인증/인가)
    ├── CourseModule (강의 CRUD)
    ├── CartModule   (장바구니)
    ├── OrderModule  (주문)
    ├── ReviewModule (리뷰)
    ├── ProgressModule (수강 진도)
    ├── BookmarkModule (북마크)
    └── UserModule   (마이페이지)
         │
         ▼
    [SQLite / certificatedu.sqlite]
```

## 요청 흐름

```
Client → Vite Proxy (/api/*) → NestJS
                                  │
                              ValidationPipe (DTO 검증)
                                  │
                              JwtAuthGuard (토큰 검증)
                                  │
                              RolesGuard (역할 확인)
                                  │
                              Controller → Service → Repository → SQLite
```

## 디렉터리 구조 (백엔드)

```
src/
├── auth/            # JWT Guard, Strategy, Decorator
├── entities/        # TypeORM 엔티티 (DB 테이블)
├── dto/             # 요청/응답 데이터 전송 객체
├── *.module.ts      # 기능별 NestJS 모듈
├── *.controller.ts  # HTTP 라우팅
├── *.service.ts     # 비즈니스 로직
└── main.ts          # 앱 진입점
```

## 환경별 설정

| 환경 | DB | 동기화 | 로그 |
|------|------|--------|------|
| development | certificatedu.sqlite | true | true |
| test | :memory: | true | false |
| production | certificatedu.sqlite (볼륨 마운트) | false | false |
