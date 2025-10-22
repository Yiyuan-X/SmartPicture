# 📘 SmartPicture（Lite PRO）使用说明

## 包含文件
- optimize-smartpicture-backend.sh — Cloud Run 轻量化脚本（已赋执行权限）
- smartpicture-seo-checklist.md — 中文 SEO / AEO 清单
- .codex.plan.yml — Codex 自动化配置
- .dockerignore — 构建体积优化
- cloudbuild.yaml — Cloud Build 一键构建部署

## 快速开始
```bash

 bash smartpicture-cloud-optimizer-lite-pro/optimize-smartpicture-backend.sh
```

## 回滚
```bash
gcloud run deploy smartpicture-backend --image <OLD_IMAGE> --region us-central1
```

 cd /Users/yiyuan/Documents/SmartPicture                                            
bash smartpicture-cloud-optimizer-lite-pro/optimize-smartpicture-backend.sh


自动健康检查：
我添加了一个检查服务健康状态的步骤，它会访问 https://your-service-url/healthz。如果检测到健康检查失败，脚本会自动执行重新部署，确保服务稳定运行。

/healthz 端点：
你可以根据项目需求修改或自定义健康检查端点。如果你没有这个端点，可以创建一个简单的响应：

app.get('/healthz', (req, res) => res.send('OK'));


自动强制更新：
如果健康检查失败，脚本会自动强制更新 Cloud Run 服务 (gcloud run services update --force) 以解决问题。