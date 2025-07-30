#!/bin/bash

# 部署脚本 - 用于更新数据库表结构和重启服务器

echo "开始部署更新..."

# 1. 停止当前运行的服务
echo "停止当前服务..."
pm2 stop game-acc

# 2. 更新数据库表结构
echo "更新数据库表结构..."
mysql -u root -p game_db < update-db.sql

# 3. 重启服务
echo "重启服务..."
pm2 start server.js --name "game-acc"

# 4. 保存PM2配置
echo "保存PM2配置..."
pm2 save

echo "部署完成！"
echo "可以使用以下命令查看服务状态："
echo "pm2 status"
echo "pm2 logs game-acc" 