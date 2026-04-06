# CertificatEdu Backend (P1)

NestJS + TypeORM + MySQL

## 실행 전 준비

### 1. MySQL 데이터베이스 생성

MySQL에 접속하여 데이터베이스를 생성합니다:

```sql
CREATE DATABASE certificatedu CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. 환경변수 설정 (.env)

`.env` 파일을 본인 MySQL 설정에 맞게 수정합니다:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=여기에_비밀번호
DB_DATABASE=certificatedu
```

### 3. 패키지 설치

```bash
npm install
```

### 4. 실행

```bash
# 개발 모드 (코드 변경 시 자동 재시작)
npm run start:dev

# 일반 실행
npm run start
```

서버: http://localhost:3000/api

## API 엔드포인트

### 카테고리
- `GET    /api/categories`
- `POST   /api/categories`
- `PUT    /api/categories/:id`
- `DELETE /api/categories/:id`

### 강좌
- `GET    /api/courses` (query: `?category=1&search=정보&sort=rating`)
- `GET    /api/courses/:id` (챕터, 리뷰 포함)
- `POST   /api/courses`
- `PUT    /api/courses/:id`
- `DELETE /api/courses/:id`

### 챕터
- `GET    /api/courses/:courseId/chapters`
- `POST   /api/courses/:courseId/chapters`
- `PUT    /api/chapters/:id`
- `DELETE /api/chapters/:id`

### 리뷰
- `GET    /api/courses/:courseId/reviews`
- `POST   /api/courses/:courseId/reviews` (body: `{userId, rating, content}`)
- `PUT    /api/reviews/:id`
- `DELETE /api/reviews/:id`

### 유저
- `GET    /api/users`
- `GET    /api/users/:id`
- `POST   /api/users` (body: `{name, email, role?, phone?}`)
- `PUT    /api/users/:id`
- `DELETE /api/users/:id`

### 장바구니
- `GET    /api/cart?userId=1`
- `POST   /api/cart` (body: `{userId, courseId}`)
- `DELETE /api/cart/:courseId?userId=1`

### 주문 / 결제
- `GET    /api/orders?userId=1`
- `POST   /api/orders` (body: `{userId, courseIds: [1,2,3]}`)
  - 자동으로 수강 등록 + 장바구니에서 제거

### 수강 (내 강의)
- `GET    /api/users/:userId/courses`
- `PUT    /api/users/:userId/courses/:courseId/progress` (body: `{progress, lastWatchedChapterId?}`)

### 강사 신청
- `GET    /api/instructor/applications`
- `POST   /api/instructor/apply` (body: `{name, email, phone, category, careerYears, passCount, intro}`)
- `PUT    /api/instructor/applications/:id/status` (body: `{status: "APPROVED"|"REJECTED"}`)
- `DELETE /api/instructor/applications/:id`
