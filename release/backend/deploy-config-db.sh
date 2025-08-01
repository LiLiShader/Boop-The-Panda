#!/bin/bash

# 数据库配置部署脚本
echo "开始部署全局配置表..."

# 检查config.env文件是否存在
if [ ! -f "config.env" ]; then
    echo "❌ 错误：config.env文件不存在"
    echo "请确保config.env文件在当前目录中"
    exit 1
fi

# 加载环境变量
source config.env

# 检查必要的环境变量
if [ -z "$DB_HOST" ] || [ -z "$DB_USER" ] || [ -z "$DB_PASSWORD" ] || [ -z "$DB_NAME" ]; then
    echo "❌ 错误：数据库配置不完整"
    echo "请检查config.env文件中的以下变量："
    echo "  DB_HOST, DB_USER, DB_PASSWORD, DB_NAME"
    exit 1
fi

echo "数据库配置："
echo "  主机: $DB_HOST"
echo "  端口: ${DB_PORT:-3306}"
echo "  用户: $DB_USER"
echo "  数据库: $DB_NAME"
echo ""

# 检查MySQL是否运行
echo "检查MySQL连接..."
if ! mysqladmin ping -h"$DB_HOST" -P"${DB_PORT:-3306}" -u"$DB_USER" -p"$DB_PASSWORD" --silent 2>/dev/null; then
    echo "❌ 错误：无法连接到MySQL数据库"
    echo ""
    echo "可能的原因："
    echo "  1. MySQL服务未运行"
    echo "  2. 数据库配置错误"
    echo "  3. 网络连接问题"
    echo ""
    echo "请运行以下命令检查MySQL状态："
    echo "  ./check-mysql-status.sh"
    exit 1
fi

echo "✅ MySQL连接成功"

# 执行SQL脚本
echo "执行全局配置表创建脚本..."
mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" < database/global_config.sql

if [ $? -eq 0 ]; then
    echo "✅ 全局配置表部署成功！"
    echo "已创建的表："
    echo "  - global_config (全局配置表)"
    echo ""
    echo "已插入的配置："
    echo "  - payment_mode: 2D (支付模式)"
    echo "  - maintenance_mode: false (维护模式)"
    echo "  - game_version: 1.0.0 (游戏版本)"
    echo "  - max_retry_count: 3 (最大重试次数)"
else
    echo "❌ 全局配置表部署失败！"
    exit 1
fi

echo ""
echo "数据库设计完成！" 