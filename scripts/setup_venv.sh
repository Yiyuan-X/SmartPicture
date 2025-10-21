#!/bin/bash
# ============================================================
# 🚀 SmartPicture 环境初始化脚本
# 自动创建 / 修复 Python 虚拟环境 (.venv)
# 安装所有依赖，并验证 Vertex AI 模块是否可用
# ============================================================

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
VENV_DIR="$PROJECT_DIR/smartpicture-backend/.venv"

echo "📁 项目路径: $PROJECT_DIR"
cd "$PROJECT_DIR/smartpicture-backend" || exit 1

# 1️⃣ 删除旧环境
if [ -d "$VENV_DIR" ]; then
  echo "🧹 删除旧虚拟环境..."
  rm -rf "$VENV_DIR"
fi

# 2️⃣ 创建新虚拟环境
echo "🐍 创建新的 Python 虚拟环境..."
python3 -m venv .venv || { echo "❌ 无法创建虚拟环境，请确认已安装 Python3"; exit 1; }

# 3️⃣ 激活环境
echo "🔌 激活虚拟环境..."
source .venv/bin/activate

# 4️⃣ 安装依赖
echo "📦 安装依赖中..."
python3 -m pip install --upgrade pip setuptools wheel
if [ -f "requirements.txt" ]; then
  python3 -m pip install -r requirements.txt
else
  echo "⚠️ 未找到 requirements.txt，将手动安装必要包..."
  python3 -m pip install flask google-generativeai google-cloud-aiplatform firebase-admin gunicorn
fi

# 5️⃣ 验证安装结果
echo "🧠 验证 google-cloud-aiplatform 模块..."
python3 -c "from google.cloud import aiplatform; print('✅ 模块导入成功:', aiplatform.__name__)" || {
  echo "⚠️ 模块导入失败，请检查依赖或权限配置"
}

echo "🎉 虚拟环境初始化完成！"
echo "👉 现在可以运行以下命令启动项目："
echo ""
echo "cd smartpicture-backend"
echo "source .venv/bin/activate"
echo "python3 app.py"
echo ""
echo "✅ 一切准备就绪。"
