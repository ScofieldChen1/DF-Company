#!/bin/bash
cd "$(dirname "$0")"

PORT=8765
echo "正在启动 DF 官网（含询盘通知 API）..."
echo ""

if ! command -v node >/dev/null 2>&1; then
  echo "未检测到 Node.js，请先安装：https://nodejs.org"
  exit 1
fi

if [ ! -d "node_modules" ]; then
  echo "首次运行，正在安装依赖…"
  npm install || exit 1
fi

if [ ! -f "server/.env" ]; then
  echo "提示：尚未配置 server/.env，询盘邮件/短信通知不会发送。"
  echo "      请复制 .env.example 为 server/.env 并填入参数。"
  echo ""
fi

echo "浏览器将自动打开: http://localhost:$PORT/contact.html"
echo "关闭此窗口即可停止服务"
echo ""

open "http://localhost:$PORT/contact.html"
PORT=$PORT npm start
