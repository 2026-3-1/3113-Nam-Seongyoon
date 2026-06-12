# P2 인증 명세

## 엔드포인트

### POST /api/auth/register

**요청**
```json
{
  "email": "user@example.com",
  "name": "홍길동",
  "password": "password123",
  "role": "STUDENT"  // STUDENT | TEACHER (ADMIN은 차단)
}
```

**응답 (201)**
```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "홍길동",
  "role": "STUDENT"
}
```

---

### POST /api/auth/login

**요청**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**응답 (200)**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "홍길동",
    "role": "STUDENT"
  }
}
```

---

### POST /api/auth/refresh

**요청**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**응답 (200)** — login과 동일한 구조

---

### POST /api/auth/logout

**헤더**: `Authorization: Bearer <accessToken>`

**응답 (200)**
```json
{ "ok": true }
```

## JWT 페이로드

```json
{
  "sub": 1,
  "email": "user@example.com",
  "role": "STUDENT",
  "iat": 1718000000,
  "exp": 1718003600
}
```

## 토큰 저장 (프론트엔드)

- `localStorage.certificatedu_auth` → `{ accessToken, refreshToken, user }`
- 401 수신 → 자동 refresh 시도 (한 번만)
- refresh 실패 → clearAuth() + 로그인 페이지 이동
