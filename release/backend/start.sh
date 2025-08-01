#!/bin/bash

# Boop-The-Panda 后端服务启动脚本

echo "===== 启动 Boop-The-Panda 后端服务 ====="

# 确保已经安装了依赖
echo "检查依赖..."
npm install

# 检查配置文件是否存在
if [ ! -f "config.env" ]; then
    echo "错误: 配置文件 config.env 不存在!"
    echo "请从 config.env.example 复制并创建 config.env 文件，然后设置正确的配置"
    echo "cp config.env.example config.env"
    exit 1
fi

# 检查日志目录和上传目录是否存在
mkdir -p logs
mkdir -p uploads

# 使用PM2启动服务（如果已安装）
if command -v pm2 &> /dev/null; then
    echo "使用PM2启动服务..."
    pm2 delete boop-backend 2>/dev/null || true
    pm2 start server.js --name boop-backend
    echo "服务已启动，可以通过以下命令查看日志："
    echo "pm2 logs boop-backend"
    echo "可以通过以下命令停止服务："
    echo "pm2 stop boop-backend"
else
    # 如果没有PM2，使用nohup后台运行
    echo "PM2未安装，使用nohup后台启动服务..."
    # 杀死可能存在的旧进程
    OLD_PID=$(ps aux | grep "node server.js" | grep -v grep | awk '{print $2}')
    if [ ! -z "$OLD_PID" ]; then
        echo "发现旧进程(PID: $OLD_PID)，正在终止..."
        kill -9 $OLD_PID
    fi
    
    # 使用nohup启动新进程
    nohup node server.js > logs/server.log 2>&1 &
    NEW_PID=$!
    echo "服务已在后台启动，进程ID: $NEW_PID"
    echo "可以通过以下命令查看日志："
    echo "tail -f logs/server.log"
    
    # 保存进程ID用于停止脚本
    echo $NEW_PID > .pid
fi

echo "===== Boop-The-Panda 后端服务启动完成 =====" 