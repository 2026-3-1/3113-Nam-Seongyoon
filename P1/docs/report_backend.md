# 업무 보고서 — 백엔드 개발
**프로젝트:** CertificatEdu P1 | **작성자:** Luna | **기간:** 2026. 04. 01 ~ 2026. 04. 06

---

## 1일차 | 2026년 4월 1일 (수)

### 작업 개요
NestJS 프로젝트 초기 설정, MySQL 데이터베이스 연결, 핵심 엔티티 설계

### 상세 작업 내용

#### 1. NestJS 프로젝트 구성

프론트엔드와 분리된 독립 백엔드 서버 구성
- 패키지 설치: `@nestjs/common`, `@nestjs/core`, `@nestjs/typeorm`, `typeorm`, `mysql2`, `class-validator`, `class-transformer`
- 설정 파일 작성: `tsconfig.json`, `tsconfig.build.json`, `nest-cli.json`
- TypeScript 컴파일 옵션: `experimentalDecorators`, `emitDecoratorMetadata` 활성화 (NestJS 데코레이터 필수)
- `rootDir: "./src"` 명시로 컴파일 경로 명확화

**프로젝트 폴더 구조 설계**
```
src/
├── main.ts               # 서버 진입점
├── app.module.ts         # 루트 모듈
├── category/             # 카테고리 모듈
├── course/               # 강좌 모듈
├── chapter/              # 챕터 모듈
├── review/               # 리뷰 모듈
├── user/                 # 유저 모듈
├── cart/                 # 장바구니 모듈
├── order/                # 주문 모듈
├── enrollment/           # 수강 등록 모듈
├── instructor/           # 강사 신청 모듈
└── seed/                 # 초기 데이터 삽입 모듈
```

#### 2. MySQL 데이터베이스 연결 설정

`.env` 환경변수 파일로 DB 접속 정보 분리 관리
```env
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=
DB_DATABASE=certificatedu
```

`@nestjs/config`의 `ConfigModule`로 환경변수 전역 주입, `TypeOrmModule.forRootAsync`로 비동기 DB 연결 설정

**TypeORM 옵션**
- `type: 'mysql'` — MySQL 드라이버
- `synchronize: true` — 엔티티 변경 시 DB 스키마 자동 동기화 (개발 환경)
- `charset: 'utf8mb4'` — 한글 및 이모지 지원

#### 3. 서버 진입점 설정 (`src/main.ts`)

```typescript
app.setGlobalPrefix('api');         // 전체 라우트에 /api 접두사
app.useGlobalPipes(ValidationPipe); // DTO 유효성 검사 전역 적용
app.enableCors({ origin: ['http://localhost:5173', 'http://localhost:5174'] });
await app.listen(3000);
```

#### 4. 전체 DB 테이블 설계 확정

ERD 기반 9개 테이블 관계 설계
- `categories` 1:N `courses` 1:N `chapters`
- `courses` 1:N `reviews` N:1 `users`
- `users` 1:N `cart_items` N:1 `courses`
- `users` 1:N `orders` 1:N `order_items` N:1 `courses`
- `users` 1:N `enrollments` N:1 `courses`
- `instructor_applications` (독립 테이블)

### 결과물

📸 **[화면 캡쳐 1-1: MySQL Workbench — certificatedu 데이터베이스 생성 화면]**

📸 **[화면 캡쳐 1-2: 서버 최초 실행 성공 터미널 화면 (🚀 running on localhost:3000/api)]**

📸 **[화면 캡쳐 1-3: 백엔드 src 폴더 구조 (VSCode 파일 탐색기)]**

---

## 2일차 | 2026년 4월 2일 (목)

### 작업 개요
Category, Course, Chapter 모듈 CRUD 구현

### 상세 작업 내용

#### 1. Category 모듈

**엔티티 (`category.entity.ts`)**
```typescript
@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn() id: number;
  @Column() label: string;   // IT/개발, 경영/회계 등
  @Column() icon: string;    // 이모지 아이콘
  @OneToMany(() => Course, course => course.category) courses: Course[];
}
```

**API 엔드포인트**
| Method | Path | 기능 |
|--------|------|------|
| GET | /api/categories | 전체 카테고리 조회 |
| GET | /api/categories/:id | 단일 카테고리 조회 |
| POST | /api/categories | 카테고리 생성 |
| PUT | /api/categories/:id | 카테고리 수정 |
| DELETE | /api/categories/:id | 카테고리 삭제 |

#### 2. Course 모듈

**엔티티 주요 컬럼**
- `title`, `instructorName`, `price`, `originalPrice`, `tag`(BEST/NEW/HOT)
- `rating`(소수점 1자리), `reviewCount` — 리뷰 등록 시 자동 재계산
- `thumbnail`, `badge`, `duration`, `description`
- `category` — Category와 ManyToOne 관계 (eager 로딩)

**고급 기능: 필터링 + 정렬 쿼리**
```
GET /api/courses?category=1&search=정보처리&sort=rating
```
- `category`: 카테고리 ID로 필터
- `search`: 강좌명 / 강사명 LIKE 검색
- `sort`: rating(평점순) / price_asc / price_desc / newest / 기본(인기순)
- QueryBuilder로 동적 조건 조합

**강좌 상세 조회 시 relations 포함**
```typescript
findOne(id): 
  relations: ['category', 'chapters', 'reviews', 'reviews.user']
```

**평점 자동 재계산 메서드**
```typescript
recalculateRating(courseId):
  모든 리뷰 평균 계산 → rating, reviewCount 업데이트
```

#### 3. Chapter 모듈

**엔티티 주요 컬럼**
- `title`, `duration`(재생 시간: "12:30"), `sortOrder`(정렬 순서), `isFree`(무료 미리보기 여부)
- `course` — Course와 ManyToOne (CASCADE 삭제)

**라우트 설계: 중첩 경로 방식**
```
GET    /api/courses/:courseId/chapters   강좌 챕터 목록
POST   /api/courses/:courseId/chapters   챕터 추가
PUT    /api/chapters/:id                 챕터 수정
DELETE /api/chapters/:id                 챕터 삭제
```

### 결과물

📸 **[화면 캡쳐 2-1: Postman — GET /api/categories 응답 화면]**

📸 **[화면 캡쳐 2-2: Postman — GET /api/courses?sort=rating 응답 화면]**

📸 **[화면 캡쳐 2-3: Postman — GET /api/courses/:id (챕터, 리뷰 포함) 응답 화면]**

📸 **[화면 캡쳐 2-4: MySQL Workbench — courses, chapters 테이블 데이터 확인]**

---

## 3일차 | 2026년 4월 3일 (금)

### 작업 개요
User, Review, Cart, Order, Enrollment 모듈 구현

### 상세 작업 내용

#### 1. User 모듈

**엔티티 주요 컬럼**
- `name`, `email`(unique), `role`(LEARNER/INSTRUCTOR), `phone`
- 이메일 중복 등록 시 `ConflictException(409)` 반환

**API 엔드포인트**
```
GET    /api/users          전체 유저 목록
GET    /api/users/:id      유저 단건 조회
POST   /api/users          유저 생성
PUT    /api/users/:id      유저 정보 수정
DELETE /api/users/:id      유저 삭제
```

#### 2. Review 모듈

**엔티티 주요 컬럼**
- `rating`(1~5 정수), `content`(텍스트)
- `course` — Course와 ManyToOne (CASCADE)
- `user` — User와 ManyToOne (eager 로딩 → 리뷰 조회 시 유저명 자동 포함)

**리뷰 등록/삭제 시 평점 자동 재계산 흐름**
```
POST /api/courses/:courseId/reviews
  → reviewService.create(courseId, dto)
  → courseService.recalculateRating(courseId)  ← 평균 평점 업데이트
```
- `findOne` 시 `relations: ['course']` 포함 → 삭제 시 courseId 추적 가능

#### 3. Cart 모듈

**엔티티 주요 컬럼**
- `user` (ManyToOne), `course` (ManyToOne, eager)
- 동일한 user+course 조합 중복 추가 시 `ConflictException(409)` 반환

**API 설계 (userId를 query/body로 전달 — P1 인증 없음)**
```
GET    /api/cart?userId=1              장바구니 조회
POST   /api/cart  { userId, courseId } 강좌 추가
DELETE /api/cart/:courseId?userId=1   강좌 제거
```

#### 4. Order 모듈 (핵심 비즈니스 로직)

주문 생성 시 자동으로 수강 등록과 장바구니 정리까지 처리하는 통합 로직 구현

**주문 생성 흐름 (`OrderService.create`)**
```
1. 요청: { userId, courseIds: [1, 2, 3] }
2. 장바구니에서 선택 강좌 조회
3. 총 금액 계산 (선택 강좌 price 합산)
4. Order 레코드 생성 (status: COMPLETED)
5. OrderItem 레코드 생성 (강좌별 결제 가격 기록)
6. EnrollmentService.enroll() 호출 → 수강 자동 등록
7. CartService.removeItem() 호출 → 결제 항목 장바구니에서 제거
```

**의존성 주입 구조**
```
OrderModule
  imports: CartModule, EnrollmentModule
OrderService
  injects: CartService, EnrollmentService
```

#### 5. Enrollment 모듈

**엔티티 주요 컬럼**
- `progress`(0~100 정수), `lastWatchedChapterId`(마지막 시청 챕터 ID)
- `enrolledAt` (수강 등록일 자동 기록)
- 중복 수강 등록 시 기존 레코드 반환 (에러 없이 처리)

**API 엔드포인트**
```
GET  /api/users/:userId/courses                        수강 목록 조회
PUT  /api/users/:userId/courses/:courseId/progress     진도 업데이트
     body: { progress: 75, lastWatchedChapterId: 3 }
```

### 결과물

📸 **[화면 캡쳐 3-1: Postman — POST /api/cart (장바구니 추가) 응답]**

📸 **[화면 캡쳐 3-2: Postman — POST /api/orders (주문 생성) 요청/응답]**

📸 **[화면 캡쳐 3-3: MySQL Workbench — orders, order_items, enrollments 테이블 데이터 확인 (주문 후)]**

📸 **[화면 캡쳐 3-4: Postman — GET /api/users/:id/courses (수강 목록 조회) 응답]**

---

## 4일차 | 2026년 4월 6일 (일)

### 작업 개요
Instructor 모듈, Seed 데이터, 전체 통합 테스트 및 오류 수정

### 상세 작업 내용

#### 1. Instructor 모듈

**엔티티 주요 컬럼**
- `name`, `email`, `phone`, `category`(분야), `careerYears`(경력), `passCount`(합격 배출)
- `intro`(자기소개, text 타입)
- `status`: PENDING / APPROVED / REJECTED (기본값 PENDING)

**API 엔드포인트**
```
GET    /api/instructor/applications            전체 신청 목록 (관리용)
GET    /api/instructor/applications/:id        단건 조회
POST   /api/instructor/apply                   강사 신청 제출
PUT    /api/instructor/applications/:id/status 상태 변경 (APPROVED/REJECTED)
DELETE /api/instructor/applications/:id        신청 삭제
```

프론트 강사 신청 폼 제출 시 `status: PENDING`으로 DB 저장됨

#### 2. Seed 데이터 자동 삽입 (`src/seed/seed.service.ts`)

앱 최초 실행 시 기본 데이터 자동 삽입 (`OnApplicationBootstrap` 인터페이스 활용)
- `categories` 테이블이 비어있을 때만 실행 (중복 삽입 방지)

**삽입 데이터**
- 카테고리 5개: IT/개발(💻), 경영/회계(📊), 언어(🗣), 전기/전자(⚡), 안전/환경(🛡)
- 강좌 6개 (각 카테고리별 대표 강좌 + 가격/평점/태그 포함)
- 강좌당 챕터 5~6개 (첫 2개는 무료 미리보기, 나머지 유료)
- 기본 유저 2명 (테스트용)

**시드 완료 로그**
```
✅ Seed data initialized
```

#### 3. tsconfig 오류 수정

VSCode에서 발견된 tsconfig.json 경고 2건 수정
- `baseUrl` 제거 (TypeScript 7.0에서 deprecated)
- `rootDir: "./src"` 명시 추가 (컴파일 루트 경로 명확화)

#### 4. 전체 통합 테스트

프론트엔드와 백엔드 연동 시나리오 전체 흐름 검증

**테스트 시나리오 1: 강좌 탐색 흐름**
```
GET /api/categories
→ GET /api/courses?category=1&sort=rating
→ GET /api/courses/1 (챕터 + 리뷰 포함)
→ GET /api/courses/1/chapters
```

**테스트 시나리오 2: 장바구니 → 결제 → 수강 등록 흐름**
```
POST /api/cart { userId:1, courseId:1 }
POST /api/cart { userId:1, courseId:2 }
GET  /api/cart?userId=1          → 2개 항목 확인
POST /api/orders { userId:1, courseIds:[1,2] }
                                 → order 생성 + enrollment 2개 자동 생성
                                 → cart 자동 비워짐
GET  /api/cart?userId=1          → 빈 장바구니 확인
GET  /api/users/1/courses        → 수강 목록 2개 확인
```

**테스트 시나리오 3: 리뷰 등록 → 평점 재계산 흐름**
```
GET  /api/courses/1              → rating: 4.9 (seed 기본값)
POST /api/courses/1/reviews { userId:1, rating:5, content:"완강했습니다!" }
GET  /api/courses/1              → rating: 실제 평균으로 업데이트 확인
```

#### 5. .gitignore 설정 및 Git 커밋

불필요한 파일이 이전 커밋에 포함되어 있어 정리 작업 수행
- `dist/`, `node_modules/` git 인덱스에서 제거 (`git rm --cached`)
- `.gitignore` 추가: `node_modules/`, `dist/`, `.env`, `*.sqlite`
- 전체 소스 코드 커밋 완료

### 결과물

📸 **[화면 캡쳐 4-1: 서버 시작 시 Seed 데이터 삽입 완료 터미널 화면]**

📸 **[화면 캡쳐 4-2: MySQL Workbench — 전체 테이블 목록 (9개) 확인]**

📸 **[화면 캡쳐 4-3: Postman — 장바구니→결제 시나리오 전체 흐름 화면]**

📸 **[화면 캡쳐 4-4: MySQL Workbench — enrollments 테이블 (주문 후 자동 등록 확인)]**

📸 **[화면 캡쳐 4-5: Postman — 강사 신청 POST 및 목록 GET 응답 화면]**

---

## 백엔드 개발 완료 요약

| 구분 | 내용 |
|------|------|
| 구현 모듈 | 9개 (category, course, chapter, review, user, cart, order, enrollment, instructor) |
| API 엔드포인트 | 총 30개 이상 |
| DB 테이블 | 9개 (MySQL 영구 저장) |
| 핵심 로직 | 주문 시 수강 자동 등록, 리뷰 기반 평점 재계산 |
| Seed 데이터 | 앱 시작 시 자동 삽입 (카테고리 5, 강좌 6, 챕터 32, 유저 2) |
| 기술 스택 | NestJS 10, TypeORM 0.3, MySQL, class-validator |
| 미구현 | JWT 인증, 결제 모듈, 이메일 알림 (P2 예정) |
