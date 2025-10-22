# 🌟 SmartPicture 中文版 SEO / AEO 检查清单（Lite PRO）

## 基础
- [ ] 每页唯一 Title / Description
- [ ] 仅 zh-CN 主语言（无 i18n 切换）
- [ ] 语义化 URL + Canonical
- [ ] 自动 sitemap.xml + robots.txt

## 性能
- [ ] Cloud CDN 启用
- [ ] 图片 WebP/AVIF
- [ ] GZIP/Brotli 压缩
- [ ] Lighthouse Performance ≥ 90
- [ ] LCP < 2.5s, CLS < 0.1

## AEO（答案引擎优化）
- [ ] FAQ/Q&A 区块（Schema.org FAQPage/Article）
- [ ] 段首给出简明答案
- [ ] 使用自然语言关键词

## 持续检查
- [ ] 每周运行：
  ```bash
  lighthouse https://smartpicture.ai --preset=desktop --output=json --output-path=./seo-lite-report.json
  ```
- [ ] 分数下降 >10% 触发提醒
