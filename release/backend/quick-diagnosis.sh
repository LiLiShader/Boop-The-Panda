#!/bin/bash

# =====================================================
# 快速诊断脚本
# 创建时间: 2025-08-01
# 版本: v1.0.0
# 说明: 快速检查服务器基本状态
# =====================================================

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔍 快速诊断 Boop-The-Panda 服务器状态...${NC}"
echo "=========================================="

# 1. 检查PM2服务状态
echo -e "\n${BLUE}1. 检查PM2服务状态${NC}"
if command -v pm2 &> /dev/null; then
    pm2_status=$(pm2 list 2>/dev/null | grep "boop-backend")
    if [ -n "$pm2_status" ]; then
        echo -e "${GREEN}✅ PM2服务运行中${NC}"
        echo -e "${YELLOW}   状态: ${pm2_status}${NC}"
    else
        echo -e "${RED}❌ PM2服务未运行${NC}"
        echo -e "${YELLOW}   建议: pm2 start server.js --name boop-backend${NC}"
    fi
else
    echo -e "${RED}❌ PM2未安装${NC}"
fi

# 2. 检查端口监听
echo -e "\n${BLUE}2. 检查端口监听${NC}"
if command -v netstat &> /dev/null; then
    port_status=$(netstat -tlnp 2>/dev/null | grep ":3000 ")
    if [ -n "$port_status" ]; then
        echo -e "${GREEN}✅ 端口3000正在监听${NC}"
        echo -e "${YELLOW}   状态: ${port_status}${NC}"
    else
        echo -e "${RED}❌ 端口3000未监听${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  netstat未安装，使用ss命令检查${NC}"
    if command -v ss &> /dev/null; then
        port_status=$(ss -tlnp | grep ":3000")
        if [ -n "$port_status" ]; then
            echo -e "${GREEN}✅ 端口3000正在监听${NC}"
        else
            echo -e "${RED}❌ 端口3000未监听${NC}"
        fi
    fi
fi

# 3. 检查数据库连接
echo -e "\n${BLUE}3. 检查数据库连接${NC}"
if command -v mysql &> /dev/null; then
    db_test=$(mysql -ugameuser -p123456 -h127.0.0.1 -e "USE game_db; SELECT COUNT(*) FROM users;" 2>/dev/null | tail -n 1)
    if [ -n "$db_test" ] && [ "$db_test" -gt 0 ]; then
        echo -e "${GREEN}✅ 数据库连接正常${NC}"
        echo -e "${YELLOW}   用户数量: ${db_test}${NC}"
    else
        echo -e "${RED}❌ 数据库连接失败${NC}"
        echo -e "${YELLOW}   可能原因:${NC}"
        echo -e "${YELLOW}   - 数据库服务未启动${NC}"
        echo -e "${YELLOW}   - 用户名或密码错误${NC}"
        echo -e "${YELLOW}   - 数据库不存在${NC}"
    fi
else
    echo -e "${RED}❌ MySQL客户端未安装${NC}"
fi

# 4. 检查API连通性
echo -e "\n${BLUE}4. 检查API连通性${NC}"
if command -v curl &> /dev/null; then
    api_test=$(curl -s -o /dev/null -w "%{http_code}" "http://119.91.142.92:3000/")
    if [ "$api_test" = "200" ]; then
        echo -e "${GREEN}✅ API服务正常${NC}"
    else
        echo -e "${RED}❌ API服务异常 (状态码: ${api_test})${NC}"
    fi
else
    echo -e "${RED}❌ curl未安装${NC}"
fi

# 5. 检查关键文件
echo -e "\n${BLUE}5. 检查关键文件${NC}"
files=("server.js" "config.env" "package.json")
for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅ ${file} 存在${NC}"
    else
        echo -e "${RED}❌ ${file} 不存在${NC}"
    fi
done

# 6. 检查日志
echo -e "\n${BLUE}6. 检查最近日志${NC}"
if [ -d "logs" ]; then
    latest_log=$(ls -t logs/*.log 2>/dev/null | head -n1)
    if [ -n "$latest_log" ]; then
        echo -e "${GREEN}✅ 日志文件存在${NC}"
        echo -e "${YELLOW}   最新日志: ${latest_log}${NC}"
        echo -e "${YELLOW}   最后10行:${NC}"
        tail -n 10 "$latest_log" 2>/dev/null | sed 's/^/   /'
    else
        echo -e "${YELLOW}⚠️  日志目录为空${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  日志目录不存在${NC}"
fi

echo -e "\n${BLUE}==========================================${NC}"
echo -e "${BLUE}📊 诊断完成${NC}"
echo -e "${BLUE}==========================================${NC}"

# 提供修复建议
echo -e "\n${YELLOW}🔧 常见问题修复:${NC}"
echo -e "${YELLOW}1. 如果PM2服务未运行:${NC}"
echo -e "${YELLOW}   pm2 start server.js --name boop-backend${NC}"
echo -e "${YELLOW}2. 如果数据库连接失败:${NC}"
echo -e "${YELLOW}   mysql -u root -p -e 'CREATE DATABASE IF NOT EXISTS game_db;'${NC}"
echo -e "${YELLOW}3. 如果端口未监听:${NC}"
echo -e "${YELLOW}   检查防火墙: ufw status${NC}"
echo -e "${YELLOW}4. 查看详细日志:${NC}"
echo -e "${YELLOW}   pm2 logs boop-backend${NC}" 