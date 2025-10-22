# ---------- Build Stage ----------
FROM python:3.11-slim AS builder
WORKDIR /app

# 复制依赖文件并安装
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 复制所有源码
COPY . .

# 设置环境变量
ENV PORT=8080
ENV PYTHONUNBUFFERED=1

# 暴露 Cloud Run 默认端口
EXPOSE 8080

# 启动命令（如果是 Flask）
CMD ["python", "app.py"]
