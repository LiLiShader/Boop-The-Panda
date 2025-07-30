#!/bin/bash

# 游戏账号系统启动脚本

echo "=== 游戏账号系统启动脚本 ==="

# 检查 Node.js 是否安装
if ! command -v node &> /dev/null; then
    echo "错误: Node.js 未安装"
    echo "请先安装 Node.js: https://nodejs.org/"
    exit 1
fi

# 检查 npm 是否安装
if ! command -v npm &> /dev/null; then
    echo "错误: npm 未安装"
    exit 1
fi

# 检查是否在正确的目录
if [ ! -f "server.js" ]; then
    echo "错误: 请在项目根目录运行此脚本"
    exit 1
fi

# 检查 .env 文件是否存在
if [ ! -f ".env" ]; then
    echo "警告: .env 文件不存在，将使用默认配置"
    echo "请确保数据库配置正确"
fi

# 安装依赖
echo "正在安装依赖..."
npm install

# 检查 PM2 是否安装
if ! command -v pm2 &> /dev/null; then
    echo "正在安装 PM2..."
    sudo npm install -g pm2
fi

# 停止已存在的进程
echo "停止已存在的进程..."
pm2 stop game-account-server 2>/dev/null
pm2 delete game-account-server 2>/dev/null

# 启动应用
echo "启动账号系统服务器..."
pm2 start server.js --name "game-account-server"

# 保存 PM2 配置
pm2 save

# 显示状态
echo ""
echo "=== 启动完成 ==="
echo "应用状态:"
pm2 status

echo ""
echo "查看日志: pm2 logs game-account-server"
echo "重启应用: pm2 restart game-account-server"
echo "停止应用: pm2 stop game-account-server"
echo ""
echo "健康检查: http://localhost:3001/api/health" 