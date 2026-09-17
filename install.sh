#!/bin/bash
# install.sh — 把 dsh-dpharness 安装到 dsh 的 web profile。
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
