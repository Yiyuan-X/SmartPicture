#!/bin/bash
set -e

PROJECT_ID="alert-autumn-467806-j3"
REGION="us-central1"
SERVICE_NAME="smartpicture-backend"
IMAGE_NAME="${REGION}-docker.pkg.dev/${PROJECT_ID}/smartpicture-backend/unified"

echo "🚀 构建 Docker 镜像..."
gcloud builds submit --tag ${IMAGE_NAME}

echo "🚀 部署 Cloud Run 服务..."
gcloud run deploy ${SERVICE_NAME} \
  --image ${IMAGE_NAME} \
  --region ${REGION} \
  --allow-unauthenticated \
  --set-env-vars GOOGLE_API_KEY="你的API密钥"

echo "✅ 部署完成！访问 Cloud Run 查看服务。"
