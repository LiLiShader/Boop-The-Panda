#!/bin/bash

echo "🔧 手动部署全局配置表"
echo "======================"
echo ""

# 检查必要文件
if [ ! -f "database/global_config.sql" ]; then
    echo "❌ 错误：database/global_config.sql 文件不存在"
    exit 1
fi

echo "✅ 找到SQL文件: database/global_config.sql"
echo ""

# 提示用户输入数据库信息
echo "请输入数据库连接信息："
read -p "数据库主机 (默认: localhost): " DB_HOST
DB_HOST=${DB_HOST:-localhost}

read -p "数据库端口 (默认: 3306): " DB_PORT
DB_PORT=${DB_PORT:-3306}

read -p "数据库用户名: " DB_USER
if [ -z "$DB_USER" ]; then
    echo "❌ 错误：数据库用户名不能为空"
    exit 1
fi

read -s -p "数据库密码: " DB_PASSWORD
echo ""
if [ -z "$DB_PASSWORD" ]; then
    echo "❌ 错误：数据库密码不能为空"
    exit 1
fi

read -p "数据库名称: " DB_NAME
if [ -z "$DB_NAME" ]; then
    echo "❌ 错误：数据库名称不能为空"
    exit 1
fi

echo ""
echo "数据库配置："
echo "  主机: $DB_HOST"
echo "  端口: $DB_PORT"
echo "  用户: $DB_USER"
echo "  数据库: $DB_NAME"
echo ""

# 测试数据库连接
echo "测试数据库连接..."
if mysqladmin ping -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" --silent 2>/dev/null; then
    echo "✅ 数据库连接成功"
else
    echo "❌ 数据库连接失败"
    echo "请检查："
    echo "  1. MySQL服务是否运行"
    echo "  2. 数据库连接信息是否正确"
    echo "  3. 用户权限是否足够"
    exit 1
fi

echo ""

# 执行SQL脚本
echo "执行SQL脚本..."
if mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" < database/global_config.sql; then
    echo "✅ SQL脚本执行成功"
else
    echo "❌ SQL脚本执行失败"
    exit 1
fi

echo ""

# 验证部署结果
echo "验证部署结果..."
mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" -e "
SELECT 
    config_key as '配置键',
    config_value as '配置值',
    description as '描述',
    updated_at as '更新时间'
FROM global_config 
ORDER BY config_key;
" 2>/dev/null

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 全局配置表部署成功！"
    echo "✅ 表创建成功"
    echo "✅ 初始数据插入成功"
    echo "✅ 索引创建成功"
else
    echo "❌ 验证失败，请检查部署结果"
    exit 1
fi

echo ""
echo "部署完成！" 