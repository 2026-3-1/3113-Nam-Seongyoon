# Runbook — P1 배포·롤백·장애 대응

## 배포 절차

1. `main` 브랜치에 PR Merge
2. GitHub Actions CD 자동 실행 (이미지 빌드 → Docker Hub Push → SSH Deploy)
3. 배포 확인: `curl http://<서버IP>/health`

## 수동 배포

```bash
ssh <user>@<server>
cd ~/certificatedu
docker compose pull
docker compose up -d --remove-orphans
docker image prune -f
```

## 롤백 절차

```bash
# 이전 이미지 태그 확인
docker images | grep certificatedu-backend

# 특정 태그로 롤백
docker compose down
docker tag <이전태그> certificatedu-backend:latest
docker compose up -d
```

## 헬스체크

- 엔드포인트: `GET /health`
- 응답 예시: `{"status":"ok","info":{"database":{"status":"up"}}}`
- 비정상: status ≠ "ok" → 즉시 롤백

## 장애 대응 시나리오

### 백엔드 다운
```bash
docker compose logs backend --tail=50
docker compose restart backend
```

### DB 연결 실패
```bash
docker compose logs db --tail=30
docker compose restart db
# 데이터 확인: docker compose exec db mysql -u certificatedu -p certificatedu
```

### 긴급 서버 재시작
```bash
docker compose down && docker compose up -d
```
