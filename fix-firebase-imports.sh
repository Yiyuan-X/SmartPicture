#!/bin/bash
# ============================================================
# 🚀 SmartPicture Firebase v2 全自动修复终极版
# 版本: v3.0 (macOS + Linux 安全模式)
# Author: Yiyuan (AI Growth Tools Matrix)
# ============================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$SCRIPT_DIR"
while [[ "$PROJECT_DIR" != "/" && ! -f "$PROJECT_DIR/package.json" ]]; do
  PROJECT_DIR="$(dirname "$PROJECT_DIR")"
done

TSC_LOG="$PROJECT_DIR/tsc-errors.log"

echo "📍 项目根: $PROJECT_DIR"
echo "📝 日志:   $TSC_LOG"
cd "$PROJECT_DIR" || exit 1

fixed_files=0
legacy_hits=0
quick_fixed=0

# ============================================================
# 🧠 主函数定义
# ============================================================

fix_file() {
  local f="$1"
  echo "⚙️  修复中: $f"
  local original_checksum=$(md5 -q "$f" 2>/dev/null || md5sum "$f" | awk '{print $1}')

  # --- 删除旧导入 ---
  perl -i -0777 -pe 's|import\s+\*\s+as\s+functions\s+from\s+"firebase-functions";||g' "$f"
  perl -i -0777 -pe 's|import\s+\*\s+as\s+identity\s+from\s+"firebase-functions/v2/identity";||g' "$f"

  # --- 替换旧写法 ---
  perl -i -pe 's|functions\.https\.onRequest|onRequest|g' "$f"
  perl -i -pe 's|functions\.pubsub\.schedule|onSchedule|g' "$f"
  perl -i -pe 's|functions\.scheduler\.onSchedule|onSchedule|g' "$f"
  perl -i -pe 's|functions\.auth\.user\(\)\.onCreate|onUserCreated|g' "$f"
  perl -i -pe 's|functions\.identity\.onUserCreated|onUserCreated|g' "$f"

  # --- 插入导入 ---
  insert_import() {
    local keyword="$1"
    local module="$2"
    if grep -q "$keyword" "$f" && ! grep -q "$module" "$f"; then
      echo "💡 插入导入: import { $keyword } from \"$module\""
      sed -i '' -e "1i\\
import { $keyword } from \"$module\"\\
" "$f" 2>/dev/null || sed -i -e "1i import { $keyword } from \"$module\"" "$f"
    fi
  }

  insert_import "onRequest" "firebase-functions/v2/https"
  insert_import "onSchedule" "firebase-functions/v2/scheduler"
  insert_import "onUserCreated" "firebase-functions/v2/identity"

  # --- 插入 admin 初始化 ---
  if grep -qE "firestore|auth|admin\." "$f" && ! grep -q 'firebase-admin' "$f"; then
    echo "🧩 插入 admin 初始化"
    sed -i '' -e "1i\\
import * as admin from \"firebase-admin\"\\
if (!admin.apps.length) admin.initializeApp();\\
" "$f" 2>/dev/null || sed -i -e "1i import * as admin from \"firebase-admin\"; if (!admin.apps.length) admin.initializeApp();" "$f"
  fi

  # --- 检查修改 ---
  local new_checksum=$(md5 -q "$f" 2>/dev/null || md5sum "$f" | awk '{print $1}')
  if [[ "$original_checksum" != "$new_checksum" ]]; then
    ((fixed_files++))
    echo "✅ 已修复: $f"
  fi
}

# ============================================================
# 🧩 1. 扫描并批量修复所有函数文件
# ============================================================
echo "🔧 执行 Firebase v2 修复 (ts/js/tsx)..."

find "$PROJECT_DIR/functions" -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" \) -print0 | while IFS= read -r -d '' file; do
  fix_file "$file"
done

# ============================================================
# 🧹 2. 检测遗留 functions. 调用
# ============================================================
legacy_hits=$(grep -R "functions\." "$PROJECT_DIR/functions" | wc -l | tr -d ' ')
if (( legacy_hits > 0 )); then
  echo "⚠️ 检测到 $legacy_hits 处旧版调用："
  grep -R --color "functions\." "$PROJECT_DIR/functions" | head -n 20
else
  echo "✅ 未检测到旧版调用"
fi

# ============================================================
# 🧪 3. TypeScript 检查
# ============================================================
echo "🧪 运行 TypeScript 检查..."
pnpm exec tsc --noEmit > "$TSC_LOG" 2>&1 || true

ts_errors=$(grep -c "error TS" "$TSC_LOG" || true)
if (( ts_errors > 0 )); then
  echo "❌ 检测到 $ts_errors 个 TypeScript 错误，将尝试自动修复..."
  error_files=$(grep "error TS" "$TSC_LOG" | sed -E 's|.* (functions/[^:]+):.*|\1|' | sort -u)
  for f in $error_files; do
    if [[ -f "$f" ]]; then
      echo "🩹 二次修复: $f"
      fix_file "$f"
      ((quick_fixed++))
    fi
  done
else
  echo "✅ TypeScript 检查通过"
fi

# ============================================================
# 📊 4. 报告
# ============================================================
echo ""
echo "📊 修复报告"
echo "----------------------------------------"
echo "🧩 修改文件数:   $fixed_files"
echo "🩹 二次修复文件: $quick_fixed"
echo "⚠️  旧版调用数:   $legacy_hits"
echo "💥 TS 错误数:     $ts_errors"
echo "----------------------------------------"

if (( ts_errors > 0 )); then
  echo "📄 详细错误请查看: $TSC_LOG"
else
  echo "✅ 所有 TypeScript 检查通过"
fi

echo "🎉 Firebase v2 全自动修复完成 (v3.0)"
