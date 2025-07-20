#!/bin/bash

# 游戏账号系统停止脚本

echo "=== 游戏账号系统停止脚本 ==="

# 检查 PM2 是否安装
if ! command -v pm2 &> /dev/null; then
    echo "错误: PM2 未安装"
    exit 1
fi

# 停止应用
echo "停止账号系统服务器..."
pm2 stop game-account-server

# 删除应用
echo "删除应用进程..."
pm2 delete game-account-server

# 保存 PM2 配置
pm2 save

echo ""
echo "=== 停止完成 ==="
echo "应用已停止"
echo ""
echo "重新启动: ./start.sh" 