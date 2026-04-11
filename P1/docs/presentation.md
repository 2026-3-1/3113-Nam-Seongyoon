# CertificatEdu P1 발표자료
### 자격증 온라인 학습 플랫폼 개인 서비스 구현

---

## 슬라이드 1 — 프로젝트 개요

**프로젝트명:** CertificatEdu  
**개발 단계:** P1 (기초/개인 서비스)  
**개발 기간:** 2026년 3월 24일 ~ 4월 6일  
**개발자:** Luna

> 자격증 시험 준비생을 위한 온라인 강의 플랫폼.  
> 강좌 탐색부터 수강 신청, 학습 진도 관리까지 하나의 서비스로 제공.

---

## 슬라이드 2 — P1 구현 범위

| 항목 | 내용 |
|------|------|
| 인증 | 미구현 (P2에서 추가 예정) |
| 프론트엔드 | React 기반 모바일 대응 UI |
| 백엔드 | NestJS REST API 서버 |
| 데이터 | DBMS(MySQL) 기반 영구 저장 |
| CRUD | 전체 엔티티 Create / Read / Update / Delete |

**P1의 핵심 목표:**  
인증 없이도 동작하는 완전한 서비스 흐름 구현 (강좌 탐색 → 장바구니 → 결제 → 수강)

---

## 슬라이드 3 — 기술 스택

### Frontend
- **React 19** + TypeScript + Vite
- **React Router v7** — 클라이언트 사이드 라우팅
- **Axios** — HTTP 통신
- **Tailwind CSS** + CSS Modules — 스타일링

### Backend
- **NestJS 10** — Node.js 서버 프레임워크
- **TypeORM 0.3** — ORM (엔티티 기반 DB 관리)
- **MySQL** — DBMS (영구 파일 저장)
- **class-validator** — DTO 유효성 검사

### 공통
- **TypeScript** — 정적 타입
- **Git** — 버전 관리

---

## 슬라이드 4 — 시스템 아키텍처

```
[Browser / Mobile]
       |
       | HTTP (CORS 허용)
       ↓
[Frontend: localhost:5173]
  React + Axios
       |
       | REST API (/api/*)
       ↓
[Backend: localhost:3000]
  NestJS
  ├── CategoryModule
  ├── CourseModule
  ├── ChapterModule
  ├── ReviewModule
  ├── UserModule
  ├── CartModule
  ├── OrderModule
  ├── EnrollmentModule
  └── InstructorModule
       |
       | TypeORM
       ↓
[MySQL Database]
  certificatedu DB
  └── 9개 테이블
```

---

## 슬라이드 5 — 데이터베이스 설계

**9개 테이블 구성**

```
categories ──< courses ──< chapters
                  │
                  └──< reviews >── users
                  
users ──< cart_items >── courses
users ──< orders ──< order_items >── courses
users ──< enrollments >── courses
instructor_applications
```

| 테이블 | 주요 컬럼 |
|--------|-----------|
| categories | id, label, icon |
| courses | id, title, instructor_name, price, rating, tag |
| chapters | id, course_id, title, duration, sort_order, is_free |
| reviews | id, course_id, user_id, rating, content |
| users | id, name, email, role |
| cart_items | id, user_id, course_id |
| orders | id, user_id, total, status |
| order_items | id, order_id, course_id, price |
| enrollments | id, user_id, course_id, progress |

---

## 슬라이드 6 — 프론트엔드 주요 화면 ① 메인 / 강좌 목록

### 메인 페이지 (`/`)
- 히어로 배너 (서비스 소개 + CTA 버튼)
- 카테고리별 인기 강좌 목록
- 강사 인증 안내 섹션

📸 **[메인 페이지 화면 캡쳐]**

---

### 강좌 목록 페이지 (`/courses`)
- 카테고리 필터 탭 (IT/개발, 경영/회계, 언어, 전기/전자, 안전/환경)
- 검색 + 정렬 (평점순, 가격순, 최신순)
- 강좌 카드 그리드 (썸네일, 강사명, 평점, 가격, 태그)

📸 **[강좌 목록 페이지 화면 캡쳐]**

---

## 슬라이드 7 — 프론트엔드 주요 화면 ② 강좌 상세 / 학습

### 강좌 상세 페이지 (`/courses/:id`)
- 강좌 소개, 커리큘럼 목록 (무료 미리보기 표시)
- 수강생 리뷰 및 평점
- 가격 + 장바구니 담기 버튼

📸 **[강좌 상세 페이지 화면 캡쳐]**

---

### 학습 페이지 (`/courses/:id/learn`)
- 영상 플레이어 영역
- 커리큘럼 사이드바 (완료 체크, 현재 강의 표시)
- 진도율 표시

📸 **[학습 페이지 화면 캡쳐]**

---

## 슬라이드 8 — 프론트엔드 주요 화면 ③ 장바구니 / 마이페이지

### 장바구니 (`/cart`)
- 담긴 강좌 목록 (선택/해제 체크박스)
- 선택 항목 합계 금액 계산
- 결제하기 버튼

📸 **[장바구니 화면 캡쳐]**

---

### 마이페이지 (`/mypage`)
- 수강 중인 강좌 / 완료한 강좌 / 찜한 강좌 탭
- 강좌별 진도율 프로그레스 바
- 마지막 학습 날짜 표시

📸 **[마이페이지 화면 캡쳐]**

---

## 슬라이드 9 — 프론트엔드 주요 화면 ④ 강사 신청 / 인증

### 강사 신청 페이지 (`/instructor`)
- 강사 인증 프로세스 안내 (3단계)
- 신청 폼: 이름, 이메일, 전화번호, 분야, 경력, 합격생 수, 소개글
- 제출 시 PENDING 상태로 DB 저장

📸 **[강사 신청 페이지 화면 캡쳐]**

---

### 로그인 / 회원가입 (`/login`, `/register`)
- 이메일 + 비밀번호 로그인 폼
- 회원가입 시 역할 선택 (수강생 / 강사)
- ※ P1에서는 인증 로직 미구현, UI만 완성

📸 **[로그인 / 회원가입 화면 캡쳐]**

---

## 슬라이드 10 — 백엔드 API 구조

| 모듈 | 주요 엔드포인트 |
|------|----------------|
| categories | `GET/POST/PUT/DELETE /api/categories` |
| courses | `GET /api/courses?category&search&sort` |
| chapters | `GET/POST /api/courses/:id/chapters` |
| reviews | `GET/POST /api/courses/:id/reviews` |
| users | `GET/POST/PUT/DELETE /api/users` |
| cart | `GET/POST/DELETE /api/cart?userId=` |
| orders | `POST /api/orders` → 수강 등록 자동화 |
| enrollments | `GET /api/users/:id/courses` |
| instructor | `POST /api/instructor/apply` |

**공통 설계 원칙**
- P1은 인증 없음 → `userId`를 query/body로 전달
- `synchronize: true` → 엔티티 변경 시 DB 자동 반영
- 앱 시작 시 Seed 데이터 자동 삽입 (카테고리 5개, 강좌 6개)

---

## 슬라이드 11 — 핵심 기능 흐름

### 주문 → 수강 자동 등록 흐름

```
1. 사용자가 강좌를 장바구니에 추가
   POST /api/cart { userId, courseId }

2. 결제 요청
   POST /api/orders { userId, courseIds: [1, 2] }

3. 백엔드 자동 처리
   ① 장바구니에서 선택 강좌 확인
   ② Orders + OrderItems 생성
   ③ Enrollments 자동 생성 (수강 등록)
   ④ 장바구니에서 결제된 항목 자동 제거

4. GET /api/users/:id/courses → 수강 목록에 표시
```

### 리뷰 → 평점 자동 재계산
```
리뷰 등록/수정/삭제 시
→ 해당 강좌의 모든 리뷰 평균 자동 계산
→ courses.rating, courses.review_count 업데이트
```

---

## 슬라이드 12 — 구현 결과 요약 및 향후 계획

### P1 구현 완료 항목
- ✅ 프론트엔드 8개 페이지 (모바일 대응)
- ✅ 백엔드 9개 모듈 REST API
- ✅ MySQL 9개 테이블 CRUD
- ✅ 주문 시 수강 자동 등록 로직
- ✅ 리뷰 기반 평점 자동 재계산
- ✅ 앱 시작 시 시드 데이터 자동 삽입

### P2에서 추가 예정
- 🔜 JWT 기반 회원 인증/인가
- 🔜 강사 승인 관리자 대시보드
- 🔜 실제 결제 연동
- 🔜 수료증 발급 기능
- 🔜 다중 사용자 서비스로 확장
