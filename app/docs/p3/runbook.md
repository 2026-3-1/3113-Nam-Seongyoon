# Runbook — P3 운영·장애 대응

## 일상 운영

### 헬스체크
```bash
curl http://<서버IP>/health
# 정상: {"status":"ok","info":{"database":{"status":"up"}}}
```

### 로그 확인
```bash
docker compose logs backend --tail=100 -f
docker compose logs db --tail=50
```

### 스케줄러 실행 기록
```sql
SELECT * FROM job_logs ORDER BY createdAt DESC LIMIT 20;
```

## 장애 시나리오별 대응

### A. 백엔드 응답 없음

1. 헬스체크 실패 확인: `curl /health`
2. 컨테이너 상태: `docker compose ps`
3. 재시작: `docker compose restart backend`
4. 로그 확인 후 원인 파악

### B. DB 연결 실패

```bash
docker compose restart db
# 복구 후 backend 재시작
docker compose restart backend
```

데이터 백업:
```bash
docker compose exec db mysqldump -u certificatedu -p certificatedu > backup_$(date +%Y%m%d).sql
```

### C. 외부 API (이메일) 실패

1. Sentry에서 에러 확인
2. SMTP 설정 재확인: `MAIL_HOST`, `MAIL_PORT`, `MAIL_USER`
3. 임시 조치: 이메일 발송 비활성화 (`MAIL_HOST=` 빈값)

### D. 긴급 롤백

```bash
# 이전 이미지로 롤백
docker compose down
# docker-compose.yml에서 이미지 태그를 이전 버전으로 수정
docker compose up -d
```

## 사고 대응 체계

| 등급 | 정의 | 응답 시간 | 담당 |
|------|------|----------|------|
| P1 | 서비스 완전 중단 | 즉시 | 전원 |
| P2 | 주요 기능 장애 | 30분 내 | 개발팀 |
| P3 | 성능 저하 / 일부 기능 오류 | 2시간 내 | 담당자 |
