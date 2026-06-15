# CI/CD 가이드 — P1

## CI 파이프라인 (`.github/workflows/ci.yml`)

| 단계 | 설명 |
|------|------|
| checkout | 소스 체크아웃 |
| setup-node | Node 22 설치 |
| install | `npm ci` |
| lint | ESLint 정적 분석 |
| test | Jest / Vitest 단위·통합 테스트 |
| build | TypeScript 컴파일 및 번들 |

트리거: `main`, `develop` 브랜치 push/PR

## CD 파이프라인 (`.github/workflows/cd.yml`)

| 단계 | 설명 |
|------|------|
| Docker Build & Push | Docker Hub에 이미지 업로드 |
| SSH Deploy | 서버에서 `docker compose pull && up -d` |

트리거: `main` 브랜치 push

## 브랜치 전략 (GitHub Flow)

```
main          ← 항상 배포 가능한 상태
  └─ feature/xxx   ← 기능 개발
  └─ fix/xxx       ← 버그 수정
```

PR은 최소 1명 리뷰 후 Squash Merge.

## 커밋 규칙 (Conventional Commits)

```
feat: 강의 목록 페이지 추가
fix: 장바구니 수량 버그 수정
docs: README 업데이트
chore: 의존성 업그레이드
```

## GitHub Secrets 목록

| 시크릿 | 용도 |
|--------|------|
| `DOCKERHUB_USERNAME` | Docker Hub 로그인 |
| `DOCKERHUB_TOKEN` | Docker Hub 토큰 |
| `DEPLOY_HOST` | 배포 서버 IP |
| `DEPLOY_USER` | SSH 사용자명 |
| `DEPLOY_SSH_KEY` | SSH 개인키 |
