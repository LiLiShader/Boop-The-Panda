#!/bin/bash

echo "🔍 服务器端MySQL诊断脚本"
echo "=========================="
echo ""

# 1. 检查系统信息
echo "1. 系统信息："
echo "   操作系统: $(uname -a)"
echo "   当前用户: $(whoami)"
echo "   当前目录: $(pwd)"
echo ""

# 2. 检查MySQL服务状态
echo "2. MySQL服务状态："
if command -v systemctl >/dev/null 2>&1; then
    echo "   使用systemctl检查..."
    if systemctl is-active --quiet mysql; then
        echo "   ✅ MySQL服务正在运行"
    elif systemctl is-active --quiet mysqld; then
        echo "   ✅ MySQL服务正在运行 (mysqld)"
    else
        echo "   ❌ MySQL服务未运行"
        echo "   尝试启动MySQL..."
        systemctl start mysql 2>/dev/null || systemctl start mysqld 2>/dev/null
        if [ $? -eq 0 ]; then
            echo "   ✅ MySQL启动成功"
        else
            echo "   ❌ MySQL启动失败"
        fi
    fi
else
    echo "   systemctl不可用，尝试其他方法..."
    if pgrep mysql >/dev/null 2>&1; then
        echo "   ✅ MySQL进程正在运行"
    else
        echo "   ❌ MySQL进程未运行"
    fi
fi
echo ""

# 3. 检查MySQL端口
echo "3. MySQL端口检查："
if command -v netstat >/dev/null 2>&1; then
    if netstat -tlnp 2>/dev/null | grep -q ":3306"; then
        echo "   ✅ MySQL端口3306正在监听"
        netstat -tlnp 2>/dev/null | grep ":3306"
    else
        echo "   ❌ MySQL端口3306未监听"
    fi
elif command -v ss >/dev/null 2>&1; then
    if ss -tlnp 2>/dev/null | grep -q ":3306"; then
        echo "   ✅ MySQL端口3306正在监听"
        ss -tlnp 2>/dev/null | grep ":3306"
    else
        echo "   ❌ MySQL端口3306未监听"
    fi
else
    echo "   ⚠️  无法检查端口状态（netstat和ss都不可用）"
fi
echo ""

# 4. 检查MySQL客户端
echo "4. MySQL客户端检查："
if command -v mysql >/dev/null 2>&1; then
    echo "   ✅ mysql客户端已安装"
    mysql --version
else
    echo "   ❌ mysql客户端未安装"
fi

if command -v mysqladmin >/dev/null 2>&1; then
    echo "   ✅ mysqladmin已安装"
else
    echo "   ❌ mysqladmin未安装"
fi
echo ""

# 5. 检查配置文件
echo "5. 配置文件检查："
if [ -f "config.env" ]; then
    echo "   ✅ config.env文件存在"
    echo "   文件内容："
    cat config.env | grep -E "^(DB_HOST|DB_PORT|DB_USER|DB_NAME)=" | while read line; do
        echo "     $line"
    done
else
    echo "   ❌ config.env文件不存在"
fi
echo ""

# 6. 尝试连接数据库
echo "6. 数据库连接测试："
if [ -f "config.env" ]; then
    source config.env
    
    # 检查环境变量
    if [ -z "$DB_HOST" ] || [ -z "$DB_USER" ] || [ -z "$DB_PASSWORD" ] || [ -z "$DB_NAME" ]; then
        echo "   ❌ 数据库配置不完整"
        echo "   缺少的变量："
        [ -z "$DB_HOST" ] && echo "     - DB_HOST"
        [ -z "$DB_USER" ] && echo "     - DB_USER"
        [ -z "$DB_PASSWORD" ] && echo "     - DB_PASSWORD"
        [ -z "$DB_NAME" ] && echo "     - DB_NAME"
    else
        echo "   尝试连接数据库..."
        if mysqladmin ping -h"$DB_HOST" -P"${DB_PORT:-3306}" -u"$DB_USER" -p"$DB_PASSWORD" --silent 2>/dev/null; then
            echo "   ✅ 数据库连接成功"
        else
            echo "   ❌ 数据库连接失败"
            echo "   可能的原因："
            echo "     - 数据库用户名或密码错误"
            echo "     - 数据库主机或端口错误"
            echo "     - 数据库不存在"
            echo "     - 用户权限不足"
        fi
    fi
else
    echo "   ❌ 无法读取配置文件"
fi
echo ""

# 7. 检查数据库文件
echo "7. 数据库文件检查："
if [ -d "database" ]; then
    echo "   ✅ database目录存在"
    if [ -f "database/global_config.sql" ]; then
        echo "   ✅ global_config.sql文件存在"
        echo "   文件大小: $(ls -lh database/global_config.sql | awk '{print $5}')"
    else
        echo "   ❌ global_config.sql文件不存在"
    fi
else
    echo "   ❌ database目录不存在"
fi
echo ""

echo "诊断完成！"
echo "==========================" 