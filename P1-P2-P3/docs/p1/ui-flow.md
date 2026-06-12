# 프론트엔드 UI 흐름 — P1

## 페이지 구조

```
/ (MainPage)          ← 메인 (추천 강의 · 배너)
/courses              ← 강의 목록 (카테고리·검색·정렬)
/courses/:id          ← 강의 상세 (커리큘럼·리뷰)
/courses/:id/learn    ← 강의 수강 (영상 플레이어)
/login                ← 로그인
/register             ← 회원가입
/cart                 ← 장바구니
/mypage               ← 마이페이지 (수강 목록·북마크·주문)
/instructor           ← 강사 페이지 (강의 등록·수정)
```

## 주요 흐름

### 수강 등록 흐름
```
강의 목록 → 강의 상세 → [로그인 체크] → 장바구니 담기 → 결제 → 마이페이지
```

### 강사 강의 등록 흐름
```
로그인(TEACHER) → 강사 페이지 → 강의 등록 폼 → 저장 → 강의 목록 노출
```

## 라우팅 설정 (`App.tsx`)

- `react-router-dom v7` 사용
- 보호 라우트: 로그인 필요 페이지는 미인증 시 `/login` 리다이렉트

## 상태 관리

- 인증 상태: `localStorage` + `auth-changed` 커스텀 이벤트
- 서버 상태: 각 페이지별 `useEffect` + `useState`

## API 클라이언트 (`lib/api.ts`)

- Fetch wrapper: `request<T>()` 함수
- 401 응답 시 자동 토큰 갱신 후 재시도
- `VITE_API_BASE_URL` 환경변수로 백엔드 URL 설정 (기본: `/api`)
