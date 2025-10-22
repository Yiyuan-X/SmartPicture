#!/bin/bash
# SmartPicture Cloud Run Optimizer (Full Auto Edition)
# 自动识别项目类型（Python / Node.js / Next.js）
# 自动检测 gcloud / docker 登录状态
# 自动构建 + 推送 + 部署 + 健康检查
# Author: Yiyuan (AI Growth Tools Matrix)
# Version: 2.1.0

set -euo pipefail

PROJECT_ID="alert-autumn-467806-j3"
SERVICE_NAME="smartpicture-backend"
REGION="us-central1"
REPO="$REGION-docker.pkg.dev/$PROJECT_ID/$SERVICE_NAME"
IMAGE_TAG="auto-pro"

echo "==> 🚀 开始优化与部署: $SERVICE_NAME ($REGION)"

# 0️⃣ 检查 gcloud 是否登录
echo "==> 🔐 检查 Google Cloud 登录状态..."
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q "@"; then
  echo "⚠️ 未检测到 gcloud 登录账户，正在启动登录..."
  gcloud auth login
fi

# 0.1️⃣ 检查是否启用 Artifact Registry
if ! gcloud services list --enabled | grep -q "artifactregistry.googleapis.com"; then
  echo "⚙️ 启用 Artifact Registry API..."
  gcloud services enable artifactregistry.googleapis.com
fi

# 0.2️⃣ 配置 Docker 登录凭证
echo "==> 🔧 检查 Docker 授权..."
if ! grep -q "us-central1-docker.pkg.dev" ~/.docker/config.json 2>/dev/null; then
  echo "⚙️ 正在配置 Docker 访问 GCP Artifact Registry..."
  gcloud auth configure-docker us-central1-docker.pkg.dev --quiet
fi

# 1️⃣ 进入后端目录
cd smartpicture-backend || { echo "❌ smartpicture-backend 目录不存在"; exit 1; }

# 2️⃣ 清理缓存
echo "==> 🧹 清理依赖与缓存"
rm -rf node_modules dist .next __pycache__ .cache *.log
[ -f "package-lock.json" ] && rm -f package-lock.json

# 3️⃣ 检测项目类型
if [ -f "requirements.txt" ]; then
  LANGUAGE="python"
elif grep -q '"next"' package.json 2>/dev/null; then
  LANGUAGE="nextjs"
elif [ -f "package.json" ]; then
  LANGUAGE="nodejs"
else
  echo "❌ 无法检测项目类型（未找到 package.json 或 requirements.txt）"
  exit 1
fi

echo "==> 🔍 检测到项目类型: $LANGUAGE"

# 4️⃣ 生成 Dockerfile
if [ "$LANGUAGE" = "python" ]; then
  echo "==> 🐍 生成 Python Dockerfile"
  cat > Dockerfile <<'EOF'
FROM python:3.11-slim AS builder
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
ENV PORT=8080
ENV PYTHONUNBUFFERED=1
EXPOSE 8080
CMD ["python", "app.py"]
EOF

elif [ "$LANGUAGE" = "nextjs" ]; then
  echo "==> ⚛️ 生成 Next.js Dockerfile"
  cat > Dockerfile <<'EOF'
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY . .
RUN npm install --legacy-peer-deps && npm run build
FROM gcr.io/distroless/nodejs20
WORKDIR /app
COPY --from=builder /app ./
ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080
CMD ["node", "node_modules/next/dist/bin/next", "start", "-p", "8080"]
EOF

else
  echo "==> 🟩 生成 Node.js Dockerfile"
  cat > Dockerfile <<'EOF'
FROM gcr.io/distroless/nodejs20
WORKDIR /app
COPY . .
ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080
CMD ["server.js"]
EOF
fi

# 5️⃣ 构建镜像并推送（带缓存）
echo "==> 🧱 构建镜像（带缓存）"
CACHE_TO="type=registry,mode=max,ref=$REPO/cache:buildcache"
CACHE_FROM="type=registry,ref=$REPO/cache:buildcache"

docker buildx build . \
  -t $REPO/core:$IMAGE_TAG \
  --platform linux/amd64 \
  --cache-to=$CACHE_TO \
  --cache-from=$CACHE_FROM \
  --push

# 6️⃣ 部署 Cloud Run
echo "==> ☁️ 部署到 Cloud Run"
gcloud run deploy $SERVICE_NAME \
  --image $REPO/core:$IMAGE_TAG \
  --region=$REGION \
  --allow-unauthenticated \
  --cpu=1 \
  --memory=512Mi \
  --concurrency=80 \
  --min-instances=1 \
  --max-instances=20 \
  --timeout=600s \
  --set-env-vars LANG=zh_CN.UTF-8,NODE_ENV=production

# 7️⃣ 健康检查
echo "==> 🩺 检查服务健康状态"
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region=$REGION --format="value(status.url)")
echo "🌐 服务 URL: $SERVICE_URL"

sleep 5
if curl --silent --fail "$SERVICE_URL/healthz"; then
  echo "✅ 健康检查成功：/healthz 响应正常"
else
  echo "⚠️ /healthz 不存在，尝试访问首页..."
  if curl --silent --fail "$SERVICE_URL"; then
    echo "✅ 服务主页可访问"
  else
    echo "❌ 服务启动失败，请检查 Cloud Run 日志: $SERVICE_URL"
    exit 1
  fi
fi

# 8️⃣ 清理旧修订
echo "==> 🧽 清理旧修订版本"
gcloud run revisions list --service=$SERVICE_NAME --region=$REGION --format="value(metadata.name)" | head -n -1 | xargs -I {} gcloud run revisions delete {} --region=$REGION --quiet || true

echo "🎉 部署完成：$SERVICE_NAME 已在 Cloud Run 上成功运行！"
