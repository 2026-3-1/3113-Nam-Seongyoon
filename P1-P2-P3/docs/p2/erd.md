# ERD — P2 (인증 추가)

## 테이블 목록

### users
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | INT PK | |
| email | VARCHAR(255) UNIQUE | 로그인 이메일 |
| name | VARCHAR(100) | 이름 |
| passwordHash | TEXT | bcrypt 해시 |
| role | ENUM(STUDENT,TEACHER,ADMIN) | 역할 |
| isActive | BOOLEAN | 활성 여부 |
| refreshTokenHash | TEXT NULL | Refresh Token 해시 |
| createdAt | DATETIME | |
| updatedAt | DATETIME | |

### user_profiles
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | INT PK | |
| userId | INT FK → users.id | |
| bio | TEXT NULL | 자기소개 |
| avatarUrl | TEXT NULL | 프로필 이미지 |

### courses
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | INT PK | |
| teacherId | INT FK → users.id NULL | 강사 |
| title | VARCHAR(255) | 강의명 |
| category | VARCHAR(50) | 카테고리 |
| description | TEXT | 설명 |
| thumbnail | TEXT | 썸네일 URL |
| price | INT | 가격 |
| originalPrice | INT NULL | 원가 |
| badge | VARCHAR(50) | 뱃지 |
| duration | VARCHAR(50) | 강의 시간 |
| tag | TEXT NULL | HOT/NEW/BEST 등 |
| curriculum | JSON | 커리큘럼 배열 |
| isPublished | BOOLEAN | 공개 여부 |

### bookmarks
| 컬럼 | 타입 |
|------|------|
| id | INT PK |
| userId | FK → users.id |
| courseId | FK → courses.id |

### cart_items
| 컬럼 | 타입 |
|------|------|
| id | INT PK |
| userId | FK → users.id |
| courseId | FK → courses.id |
| selected | BOOLEAN |

### orders / order_items
주문 마스터(orders) + 주문 상세(order_items) 구조.

### reviews
| 컬럼 | 타입 |
|------|------|
| id | INT PK |
| userId | FK → users.id |
| courseId | FK → courses.id |
| rating | INT (1~5) |
| content | TEXT |

## 관계도 (간략)

```
users ──< courses        (1:N, teacher)
users ──< bookmarks >── courses
users ──< cart_items >── courses
users ──< orders ──< order_items >── courses
users ──< reviews >── courses
users ──< course_progresses >── courses
```
