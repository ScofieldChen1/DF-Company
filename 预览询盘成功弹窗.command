#!/bin/bash
cd "$(dirname "$0")"

PORT=8765
URL="http://127.0.0.1:${PORT}/contact.html?preview=inquiry-success"

if ! lsof -i :"$PORT" >/dev/null 2>&1; then
  echo "正在启动本地预览服务器…"
  python3 -m http.server "$PORT" >/dev/null 2>&1 &
  sleep 1
fi

echo "打开审核页面："
echo "$URL"
open "$URL"

echo ""
echo "若页面仍是旧版，请在浏览器按 Cmd+Shift+R 强制刷新。"
echo "关闭此窗口不影响已打开的浏览器页面。"
