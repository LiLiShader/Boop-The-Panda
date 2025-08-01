#!/bin/bash

echo "🔍 检查MySQL服务状态..."

# 检查MySQL服务是否运行
if systemctl is-active --quiet mysql; then
    echo "✅ MySQL服务正在运行"
elif systemctl is-active --quiet mysqld; then
    echo "✅ MySQL服务正在运行 (mysqld)"
else
    echo "❌ MySQL服务未运行"
    echo "尝试启动MySQL服务..."
    systemctl start mysql 2>/dev/null || systemctl start mysqld 2>/dev/null
    if [ $? -eq 0 ]; then
        echo "✅ MySQL服务启动成功"
    else
        echo "❌ MySQL服务启动失败"
        echo "请手动启动MySQL服务:"
        echo "  systemctl start mysql"
        echo "  或"
        echo "  systemctl start mysqld"
    fi
fi

echo ""

# 检查MySQL端口是否监听
echo "🔍 检查MySQL端口监听状态..."
if netstat -tlnp | grep -q ":3306"; then
    echo "✅ MySQL端口3306正在监听"
    netstat -tlnp | grep ":3306"
else
    echo "❌ MySQL端口3306未监听"
fi

echo ""

# 检查环境变量
echo "🔍 检查数据库环境变量..."
if [ -f "config.env" ]; then
    echo "✅ config.env文件存在"
    echo "数据库配置:"
    grep -E "^(DB_HOST|DB_PORT|DB_USER|DB_NAME)=" config.env | while read line; do
        echo "  $line"
    done
else
    echo "❌ config.env文件不存在"
fi

echo ""

# 测试数据库连接
echo "🔍 测试数据库连接..."
if [ -f "config.env" ]; then
    source config.env
    if mysqladmin ping -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" --silent 2>/dev/null; then
        echo "✅ 数据库连接成功"
    else
        echo "❌ 数据库连接失败"
        echo "可能的原因:"
        echo "  1. 数据库用户名或密码错误"
        echo "  2. 数据库主机或端口错误"
        echo "  3. 数据库不存在"
        echo "  4. 用户权限不足"
    fi
else
    echo "❌ 无法读取数据库配置"
fi 