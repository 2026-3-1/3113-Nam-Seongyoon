#!/bin/bash
# EC2 최초 서버 환경 설정 스크립트
# 실행: bash server-setup.sh
set -e

echo "=== Docker 설치 ==="
if ! command -v docker &> /dev/null; then
  curl -fsSL https://get.docker.com | sh
  sudo usermod -aG docker $USER
  echo "Docker 설치 완료 (재로그인 필요)"
else
  echo "Docker 이미 설치됨: $(docker --version)"
fi

echo "=== 프로젝트 클론 ==="
if [ ! -d ~/certificatedu ]; then
  git clone https://github.com/2026-3-1/3113-Nam-Seongyoon.git ~/certificatedu
  echo "클론 완료"
else
  cd ~/certificatedu && git pull
  echo "업데이트 완료"
fi

echo "=== .env.production 생성 ==="
if [ ! -f ~/certificatedu/app/backend/.env.production ]; then
  cat > ~/certificatedu/app/backend/.env.production << 'ENVEOF'
NODE_ENV=production
PORT=3000
DB_TYPE=mysql
DB_HOST=db
DB_PORT=3306
DB_USER=certificatedu
DB_PASSWORD=certificatedu_pass
DB_DATABASE=certificatedu
DB_SYNC=true
JWT_SECRET=CHANGE_ME_STRONG_SECRET
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=CHANGE_ME_REFRESH_SECRET
JWT_REFRESH_EXPIRES_IN=7d
TOSS_SECRET_KEY=test_sk_YOUR_TOSS_KEY
CORS_ORIGINS=http://3.34.42.16,http://localhost
ENVEOF
  echo "⚠️  ~/certificatedu/backend/.env.production 생성됨 — 값을 반드시 수정하세요!"
fi

echo "=== 방화벽 설정 (포트 80, 3000 열기) ==="
sudo ufw allow 80/tcp 2>/dev/null || true
sudo ufw allow 3000/tcp 2>/dev/null || true

echo "=== 컨테이너 실행 ==="
cd ~/certificatedu/app
docker compose up -d --build
docker compose ps

echo "✅ 설정 완료!"
echo "   프론트: http://3.34.42.16"
echo "   백엔드: http://3.34.42.16:3000/health"
echo "   Swagger: http://3.34.42.16:3000/api/docs"
