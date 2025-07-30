#!/bin/bash

# Boop-The-Panda 后端服务停止脚本

echo "===== 停止 Boop-The-Panda 后端服务 ====="

# 使用PM2停止服务（如果已安装）
if command -v pm2 &> /dev/null; then
    echo "使用PM2停止服务..."
    pm2 stop boop-backend 2>/dev/null || echo "服务未运行"
    echo "服务已停止"
else
    # 如果没有PM2，使用进程ID停止
    echo "使用进程ID停止服务..."
    
    # 检查是否存在PID文件
    if [ -f ".pid" ]; then
        PID=$(cat .pid)
        if ps -p $PID > /dev/null; then
            echo "正在停止进程 $PID..."
            kill -15 $PID
            sleep 2
            
            # 检查进程是否仍然存在，如果存在则强制终止
            if ps -p $PID > /dev/null; then
                echo "进程未响应，强制终止..."
                kill -9 $PID
            fi
            
            echo "进程已停止"
            rm .pid
        else
            echo "PID文件中的进程不存在"
            rm .pid
        fi
    else
        # 尝试找到可能运行的node进程
        OLD_PID=$(ps aux | grep "node server.js" | grep -v grep | awk '{print $2}')
        if [ ! -z "$OLD_PID" ]; then
            echo "发现服务进程(PID: $OLD_PID)，正在终止..."
            kill -9 $OLD_PID
            echo "进程已停止"
        else
            echo "没有找到运行中的服务进程"
        fi
    fi
fi

echo "===== Boop-The-Panda 后端服务停止完成 =====" 