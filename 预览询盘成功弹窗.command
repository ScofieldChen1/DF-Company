#!/bin/bash
cd "$(dirname "$0")"

PORT=8765
URL="http://127.0.0.1:${PORT}/contact.html?preview=inquiry-success"

if ! lsof -i :"$PORT" >/dev/null 2>&1; then
  echo "正在启动本地预览服务器…"
  nohup python3 -m http.server "$PORT" >/dev/null 2>&1 &
  sleep 2
fi

if ! curl -s -m 3 -o /dev/null "$URL"; then
  echo "本地服务器未能启动，请手动运行："
  echo "  cd \"$(pwd)\" && python3 -m http.server $PORT"
  exit 1
fi

echo "打开预览页面（仅展示成功弹窗，不会真实发送）："
echo "$URL"
open "$URL"

echo ""
echo "若页面打不开，请检查终端是否有 python3 -m http.server $PORT 在运行。"
echo "若样式是旧版，请按 Cmd+Shift+R 强制刷新。"
