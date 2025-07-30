#!/bin/bash

echo "=== 数据库连接问题修复脚本 ==="

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查MySQL服务状态
echo -e "${YELLOW}1. 检查MySQL服务状态...${NC}"
if systemctl is-active --quiet mysql; then
    echo -e "${GREEN}✓ MySQL服务正在运行${NC}"
else
    echo -e "${RED}✗ MySQL服务未运行，正在启动...${NC}"
    sudo systemctl start mysql
    if systemctl is-active --quiet mysql; then
        echo -e "${GREEN}✓ MySQL服务已启动${NC}"
    else
        echo -e "${RED}✗ MySQL服务启动失败${NC}"
        exit 1
    fi
fi

# 检查配置文件
echo -e "${YELLOW}2. 检查配置文件...${NC}"
if [ -f "config.env" ]; then
    echo -e "${GREEN}✓ 配置文件存在${NC}"
    
    # 检查密码是否还是占位符
    if grep -q "your_password_here" config.env; then
        echo -e "${RED}✗ 数据库密码还是占位符，需要设置实际密码${NC}"
        echo -e "${YELLOW}请按照以下步骤设置密码：${NC}"
        echo "1. 运行: sudo mysql_secure_installation"
        echo "2. 或者运行: sudo mysql"
        echo "3. 然后执行: ALTER USER 'root'@'localhost' IDENTIFIED BY 'your_new_password';"
        echo "4. 修改 config.env 文件中的 DB_PASSWORD"
        echo ""
        read -p "是否现在设置密码？(y/n): " set_password
        if [ "$set_password" = "y" ]; then
            sudo mysql_secure_installation
        fi
    else
        echo -e "${GREEN}✓ 数据库密码已配置${NC}"
    fi
else
    echo -e "${RED}✗ 配置文件不存在${NC}"
    exit 1
fi

# 测试数据库连接
echo -e "${YELLOW}3. 测试数据库连接...${NC}"
if mysql -u root -p -e "SELECT 1;" 2>/dev/null; then
    echo -e "${GREEN}✓ 数据库连接成功${NC}"
else
    echo -e "${RED}✗ 数据库连接失败${NC}"
    echo -e "${YELLOW}请检查：${NC}"
    echo "1. 数据库密码是否正确"
    echo "2. 数据库服务是否正常运行"
    echo "3. 用户权限是否足够"
    exit 1
fi

# 检查数据库是否存在
echo -e "${YELLOW}4. 检查数据库是否存在...${NC}"
if mysql -u root -p -e "USE game_db;" 2>/dev/null; then
    echo -e "${GREEN}✓ game_db 数据库存在${NC}"
else
    echo -e "${YELLOW}✗ game_db 数据库不存在，正在创建...${NC}"
    mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS game_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
    if mysql -u root -p -e "USE game_db;" 2>/dev/null; then
        echo -e "${GREEN}✓ game_db 数据库已创建${NC}"
    else
        echo -e "${RED}✗ 数据库创建失败${NC}"
        exit 1
    fi
fi

# 检查表是否存在
echo -e "${YELLOW}5. 检查表结构...${NC}"
table_count=$(mysql -u root -p -e "USE game_db; SHOW TABLES;" 2>/dev/null | wc -l)
if [ "$table_count" -gt 1 ]; then
    echo -e "${GREEN}✓ 数据库表已存在${NC}"
else
    echo -e "${YELLOW}✗ 数据库表不存在，正在导入...${NC}"
    if [ -f "setup-db.sql" ]; then
        mysql -u root -p game_db < setup-db.sql
        echo -e "${GREEN}✓ 数据库表已导入${NC}"
    else
        echo -e "${RED}✗ setup-db.sql 文件不存在${NC}"
        exit 1
    fi
fi

# 重启后端服务
echo -e "${YELLOW}6. 重启后端服务...${NC}"
if command -v pm2 &> /dev/null; then
    pm2 restart game-account-server
    echo -e "${GREEN}✓ 后端服务已重启${NC}"
else
    echo -e "${YELLOW}⚠ PM2 未安装，请手动重启服务${NC}"
fi

# 测试API接口
echo -e "${YELLOW}7. 测试API接口...${NC}"
sleep 3
if curl -s http://localhost:3001/api/health > /dev/null; then
    echo -e "${GREEN}✓ API接口正常${NC}"
else
    echo -e "${RED}✗ API接口无响应${NC}"
    echo -e "${YELLOW}请检查：${NC}"
    echo "1. 后端服务是否正常启动"
    echo "2. 端口3001是否被占用"
    echo "3. 防火墙设置"
fi

echo ""
echo -e "${GREEN}=== 修复完成 ===${NC}"
echo -e "${YELLOW}如果仍有问题，请检查：${NC}"
echo "1. 查看服务日志: pm2 logs game-account-server"
echo "2. 检查配置文件: cat config.env"
echo "3. 测试数据库: mysql -u root -p -e 'USE game_db; SHOW TABLES;'" 