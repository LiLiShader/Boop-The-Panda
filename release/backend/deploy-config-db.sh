#!/bin/bash

# 数据库配置部署脚本
echo "开始部署全局配置表..."

# 检查MySQL是否运行
if ! mysqladmin ping -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" --silent; then
    echo "错误：无法连接到MySQL数据库"
    exit 1
fi

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