#!/bin/bash

# 3D支付回调服务器部署脚本
# 使用方法: ./deploy-3d-callback.sh

set -e

echo "开始部署3D支付回调服务器..."

# 检查是否以root权限运行
if [ "$EUID" -ne 0 ]; then
    echo "请使用root权限运行此脚本"
    exit 1
fi

# 创建目录
echo "创建目录..."
mkdir -p /opt/3d-callback-server
mkdir -p /var/log

# 进入目录
cd /opt/3d-callback-server

# 检查Node.js是否安装
if ! command -v node &> /dev/null; then
    echo "Node.js未安装，正在安装..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt-get install -y nodejs
fi

# 检查npm是否安装
if ! command -v npm &> /dev/null; then
    echo "npm未安装，正在安装..."
    apt-get install -y npm
fi

# 安装PM2
echo "安装PM2..."
npm install -g pm2

# 安装依赖
echo "安装项目依赖..."
npm install

# 设置文件权限
echo "设置文件权限..."
chmod +x start-3d-callback.sh

# 配置防火墙
echo "配置防火墙..."
ufw allow 5001/tcp

# 启动服务
echo "启动3D支付回调服务器..."
pm2 start ecosystem.config.js

# 保存PM2配置
pm2 save

# 设置PM2开机自启
pm2 startup

echo "部署完成！"
echo "服务器地址: http://$(curl -s ifconfig.me):5001"
echo "健康检查: http://$(curl -s ifconfig.me):5001/health"
echo ""
echo "PM2命令:"
echo "  查看状态: pm2 status"
echo "  查看日志: pm2 logs 3d-callback-server"
echo "  重启服务: pm2 restart 3d-callback-server"
echo "  停止服务: pm2 stop 3d-callback-server" 