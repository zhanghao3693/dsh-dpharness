#!/bin/bash
# install.sh — 把 dsh-dpharness 安装到 dsh 的 web profile。
#
# ⚠️ 这是**开发用**脚本（从本地目录装，便于改完立刻看效果）。
#    普通安装请用官方命令：
#
#        dsh plugin --profile web add dsh-dpharness
#
# 🔴 两者不能同时用：官方安装会把它并入 profile 的 bundle 层（也会 insert 同一个
#    `id: dpharness`），而本脚本往 profile 的 cordis.patch.yml 里也插一段 insert ——
#    **同一个 id 被插入两次会让 dsh 启动硬失败**（依据：dshmarket lib/hot.js 注释）。
#    所以：
#      · 已用官方命令装过 → 不要再跑本脚本；要跑就先
#          `dsh plugin --profile web remove dsh-dpharness`
#      · 已用本脚本装过 → 跑官方命令前，必须先删掉 cordis.patch.yml 里
#          `id: dpharness` 那段 insert（2026-09-17 已为使用者做过一次迁移）
#
# 用法：bash ~/Documents/dsh-dpharness/install.sh
# 装完必须重启 dsh web（侧边栏「重启」按钮，或 pkill -9 -f "bin/dsh web" 让 launchd 拉起）。
set -euo pipefail

PLUGIN_SRC="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROFILE_DIR="$HOME/.dsh/profiles/web"
NM="$PROFILE_DIR/node_modules"
PATCH="$PROFILE_DIR/cordis.patch.yml"

echo "==> 1/3 备份 profile 配置 ..."
STAMP="$(date +%Y%m%d-%H%M%S)"
[ -f "$PATCH" ] && cp "$PATCH" "$PATCH.dpharness-bak-$STAMP" && echo "     已备份 $PATCH.dpharness-bak-$STAMP"

echo "==> 2/3 复制插件到 profile node_modules ..."
mkdir -p "$NM"
rm -rf "$NM/dsh-dpharness"
cp -r "$PLUGIN_SRC" "$NM/dsh-dpharness"
rm -rf "$NM/dsh-dpharness/.git"
echo "     已复制到 $NM/dsh-dpharness"

echo "==> 3/3 注册插件到 cordis.patch.yml ..."
ENTRY="- insert:
    - id: dpharness
      name: dsh-dpharness"
if grep -q "id: dpharness" "$PATCH" 2>/dev/null; then
    echo "     已存在，跳过"
else
    printf '\n# dpharness 插件库（host: /api/dpharness/* + 客户端 conversation.view 页签）\n%s\n' "$ENTRY" >> "$PATCH"
    echo "     已追加"
fi

echo
echo "完成。重启 dsh web 后生效："
echo "  - 侧边栏底部「重启」按钮，或"
echo "  - pkill -9 -f 'bin/dsh web'（launchd 会自动拉起）"
echo
echo "卸载：从 $PATCH 删掉「dpharness」那个 insert 块，再 rm -rf $NM/dsh-dpharness"
