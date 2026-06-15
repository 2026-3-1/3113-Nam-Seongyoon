# P1 ERD

## 엔티티 관계도

```
users
  id (PK)
  email (UNIQUE)
  name
  passwordHash
  refreshTokenHash
  role: STUDENT | TEACHER | ADMIN
  isActive
  createdAt / updatedAt

courses
  id (PK)
  title
  category
  description
  thumbnail
  price
  originalPrice
  badge
  duration
  tag
  curriculum (JSON)
  isPublished
  teacher_id (FK → users.id)
  createdAt / updatedAt

reviews
  id (PK)
  rating (1~5)
  content
  user_id (FK → users.id)
  course_id (FK → courses.id)
  createdAt / updatedAt

cart_items
  id (PK)
  selected (bool)
  user_id (FK → users.id)
  course_id (FK → courses.id)
  createdAt / updatedAt

orders
  id (PK)
  totalPrice
  status: PENDING | PAID | CANCELLED
  user_id (FK → users.id)
  createdAt / updatedAt

order_items
  id (PK)
  price
  order_id (FK → orders.id)
  course_id (FK → courses.id)

course_progress
  id (PK)
  completedCount
  totalCount
  progressPercent
  lastChapterIndex
  user_id (FK → users.id)
  course_id (FK → courses.id)
  updatedAt

bookmarks
  id (PK)
  user_id (FK → users.id)
  course_id (FK → courses.id)
  createdAt

user_profiles
  id (PK)
  bio
  avatarUrl
  progressPercent
  completedCount
  user_id (FK → users.id, UNIQUE)
```

## 관계 요약

- users 1 ←→ N courses (강사가 여러 강의 등록)
- users 1 ←→ N reviews
- users 1 ←→ N cart_items
- users 1 ←→ N orders
- orders 1 ←→ N order_items
- users 1 ←→ N course_progress
- users 1 ←→ N bookmarks
- users 1 ←→ 1 user_profiles
