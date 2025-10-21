# === 基础镜像 ===
FROM python:3.9-slim AS base

# 设置非交互式模式（避免 tzdata 等提示）
ENV DEBIAN_FRONTEND=noninteractive

# === 设置工作目录 ===
WORKDIR /app

# === 安装依赖 ===
# 先复制 requirements.txt（单独COPY可以利用Docker缓存）
COPY requirements.txt .

# 建议使用官方源加速（可选）
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt gunicorn

# === 复制项目源代码 ===
COPY . /app

# === 确保 Python 能找到项目路径 ===
ENV PYTHONPATH=/app

# === Cloud Run 默认端口 ===
EXPOSE 8080

# === 运行命令（Gunicorn生产服务器）===
CMD ["gunicorn", "--bind", "0.0.0.0:8080", "app:app"]
