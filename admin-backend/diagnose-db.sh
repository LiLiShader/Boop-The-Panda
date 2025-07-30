#!/bin/bash

echo "=== 数据库连接诊断脚本 ==="

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}1. 检查MySQL服务状态${NC}"
if systemctl is-active --quiet mysql; then
    echo -e "${GREEN}✓ MySQL服务正在运行${NC}"
else
    echo -e "${RED}✗ MySQL服务未运行${NC}"
fi

echo -e "${BLUE}2. 检查配置文件${NC}"
if [ -f "config.env" ]; then
    echo -e "${GREEN}✓ config.env 文件存在${NC}"
    echo "数据库配置:"
    grep -E "DB_|PORT=" config.env
else
    echo -e "${RED}✗ config.env 文件不存在${NC}"
fi

echo -e "${BLUE}3. 测试数据库连接${NC}"
if mysql -u root -p -e "SELECT 1;" 2>/dev/null; then
    echo -e "${GREEN}✓ 数据库连接成功${NC}"
else
    echo -e "${RED}✗ 数据库连接失败${NC}"
fi

echo -e "${BLUE}4. 检查数据库是否存在${NC}"
if mysql -u root -p -e "USE game_db;" 2>/dev/null; then
    echo -e "${GREEN}✓ game_db 数据库存在${NC}"
    
    echo -e "${BLUE}5. 检查表结构${NC}"
    tables=$(mysql -u root -p -e "USE game_db; SHOW TABLES;" 2>/dev/null | tail -n +2)
    if [ -n "$tables" ]; then
        echo -e "${GREEN}✓ 数据库表存在${NC}"
        echo "现有表:"
        echo "$tables"
    else
        echo -e "${YELLOW}⚠ 数据库表不存在${NC}"
    fi
else
    echo -e "${RED}✗ game_db 数据库不存在${NC}"
fi

echo -e "${BLUE}6. 检查后端服务状态${NC}"
if command -v pm2 &> /dev/null; then
    pm2 status | grep game-account-server
else
    echo -e "${YELLOW}⚠ PM2 未安装${NC}"
fi

echo -e "${BLUE}7. 检查API接口${NC}"
if curl -s http://localhost:3001/api/health > /dev/null; then
    echo -e "${GREEN}✓ API接口正常${NC}"
else
    echo -e "${RED}✗ API接口无响应${NC}"
fi

echo ""
echo -e "${YELLOW}=== 诊断完成 ===${NC}"
echo "如果发现问题，请参考 database-setup-guide.md 进行修复" 