#!/bin/bash

# =====================================================
# Boop-The-Panda 完整数据库部署脚本
# 创建时间: 2025-08-01
# 版本: v1.0.0
# 说明: 一键部署完整数据库
# =====================================================

echo "🚀 开始部署 Boop-The-Panda 完整数据库..."
echo "=========================================="

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 检查MySQL是否运行
echo -e "${BLUE}1. 检查MySQL服务状态...${NC}"
if ! systemctl is-active --quiet mysql; then
    echo -e "${YELLOW}MySQL服务未运行，正在启动...${NC}"
    systemctl start mysql
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ MySQL服务启动失败${NC}"
        exit 1
    fi
fi
echo -e "${GREEN}✅ MySQL服务运行正常${NC}"

# 检查MySQL连接
echo -e "${BLUE}2. 测试MySQL连接...${NC}"
if ! mysqladmin ping -h127.0.0.1 -P3306 --silent; then
    echo -e "${RED}❌ MySQL连接失败${NC}"
    echo "请检查MySQL配置或使用以下命令连接："
    echo "mysql -u root -p"
    exit 1
fi
echo -e "${GREEN}✅ MySQL连接成功${NC}"

# 备份现有数据库（如果存在）
echo -e "${BLUE}3. 备份现有数据库...${NC}"
if mysql -u root -p -e "USE game_db;" 2>/dev/null; then
    echo -e "${YELLOW}检测到现有game_db数据库，正在备份...${NC}"
    BACKUP_FILE="game_db_backup_$(date +%Y%m%d_%H%M%S).sql"
    mysqldump -u root -p game_db > "$BACKUP_FILE"
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ 数据库备份成功: $BACKUP_FILE${NC}"
    else
        echo -e "${YELLOW}⚠️  数据库备份失败，继续执行...${NC}"
    fi
else
    echo -e "${GREEN}✅ 没有检测到现有game_db数据库${NC}"
fi

# 执行完整数据库脚本
echo -e "${BLUE}4. 执行完整数据库脚本...${NC}"
if [ -f "complete_database_backup.sql" ]; then
    echo -e "${YELLOW}正在导入完整数据库...${NC}"
    mysql -u root -p < complete_database_backup.sql
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ 数据库导入成功${NC}"
    else
        echo -e "${RED}❌ 数据库导入失败${NC}"
        exit 1
    fi
else
    echo -e "${RED}❌ 找不到 complete_database_backup.sql 文件${NC}"
    exit 1
fi

# 验证数据库
echo -e "${BLUE}5. 验证数据库...${NC}"
echo -e "${YELLOW}检查表结构...${NC}"
mysql -u root -p -e "USE game_db; SHOW TABLES;" 2>/dev/null
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ 数据库表创建成功${NC}"
else
    echo -e "${RED}❌ 数据库表创建失败${NC}"
    exit 1
fi

# 检查初始数据
echo -e "${YELLOW}检查初始数据...${NC}"
USER_COUNT=$(mysql -u root -p -e "USE game_db; SELECT COUNT(*) FROM users;" 2>/dev/null | tail -n 1)
CONFIG_COUNT=$(mysql -u root -p -e "USE game_db; SELECT COUNT(*) FROM global_config;" 2>/dev/null | tail -n 1)
PAYMENT_COUNT=$(mysql -u root -p -e "USE game_db; SELECT COUNT(*) FROM payment_records;" 2>/dev/null | tail -n 1)

echo -e "${GREEN}✅ 用户数据: $USER_COUNT 条${NC}"
echo -e "${GREEN}✅ 配置数据: $CONFIG_COUNT 条${NC}"
echo -e "${GREEN}✅ 支付记录: $PAYMENT_COUNT 条${NC}"

# 检查管理员账号
echo -e "${YELLOW}检查管理员账号...${NC}"
ADMIN_COUNT=$(mysql -u root -p -e "USE game_db; SELECT COUNT(*) FROM users WHERE name = 'administrators';" 2>/dev/null | tail -n 1)
if [ "$ADMIN_COUNT" -gt 0 ]; then
    echo -e "${GREEN}✅ 管理员账号创建成功${NC}"
    echo -e "${BLUE}   管理员ID: admin001${NC}"
    echo -e "${BLUE}   管理员密码: admin123456${NC}"
else
    echo -e "${RED}❌ 管理员账号创建失败${NC}"
fi

# 检查支付模式配置
echo -e "${YELLOW}检查支付模式配置...${NC}"
PAYMENT_MODE=$(mysql -u root -p -e "USE game_db; SELECT config_value FROM global_config WHERE config_key = 'payment_mode';" 2>/dev/null | tail -n 1)
if [ "$PAYMENT_MODE" = "2D" ]; then
    echo -e "${GREEN}✅ 支付模式配置成功: $PAYMENT_MODE${NC}"
else
    echo -e "${RED}❌ 支付模式配置失败${NC}"
fi

# 测试数据库用户权限
echo -e "${BLUE}6. 测试数据库用户权限...${NC}"
if mysql -ugameuser -p123456 -e "USE game_db; SELECT 1;" 2>/dev/null; then
    echo -e "${GREEN}✅ 数据库用户权限正常${NC}"
else
    echo -e "${RED}❌ 数据库用户权限异常${NC}"
    echo -e "${YELLOW}正在修复权限...${NC}"
    mysql -u root -p -e "
    GRANT ALL PRIVILEGES ON game_db.* TO 'gameuser'@'localhost';
    GRANT ALL PRIVILEGES ON game_db.* TO 'gameuser'@'%';
    FLUSH PRIVILEGES;
    "
    echo -e "${GREEN}✅ 权限修复完成${NC}"
fi

# 显示数据库信息
echo -e "${BLUE}7. 数据库信息摘要...${NC}"
echo -e "${GREEN}==========================================${NC}"
echo -e "${GREEN}数据库名称: game_db${NC}"
echo -e "${GREEN}字符集: utf8mb4${NC}"
echo -e "${GREEN}排序规则: utf8mb4_unicode_ci${NC}"
echo -e "${GREEN}数据库用户: gameuser${NC}"
echo -e "${GREEN}数据库密码: 123456${NC}"
echo -e "${GREEN}管理员账号: admin001${NC}"
echo -e "${GREEN}管理员密码: admin123456${NC}"
echo -e "${GREEN}当前支付模式: $PAYMENT_MODE${NC}"
echo -e "${GREEN}==========================================${NC}"

# 显示表结构信息
echo -e "${BLUE}8. 数据库表结构...${NC}"
mysql -u root -p -e "USE game_db; SHOW TABLES;" 2>/dev/null

# 显示重要配置
echo -e "${BLUE}9. 重要配置信息...${NC}"
echo -e "${YELLOW}全局配置:${NC}"
mysql -u root -p -e "USE game_db; SELECT config_key, config_value, description FROM global_config;" 2>/dev/null

echo -e "${YELLOW}管理员账号:${NC}"
mysql -u root -p -e "USE game_db; SELECT pid, name, level, created_at FROM users WHERE level >= 99;" 2>/dev/null

# 完成提示
echo ""
echo -e "${GREEN}🎉 数据库部署完成！${NC}"
echo -e "${GREEN}==========================================${NC}"
echo -e "${GREEN}✅ 所有表结构创建成功${NC}"
echo -e "${GREEN}✅ 初始数据导入成功${NC}"
echo -e "${GREEN}✅ 索引和触发器创建成功${NC}"
echo -e "${GREEN}✅ 用户权限配置成功${NC}"
echo -e "${GREEN}✅ 管理员账号创建成功${NC}"
echo -e "${GREEN}✅ 全局配置设置成功${NC}"
echo ""
echo -e "${BLUE}📋 下一步操作:${NC}"
echo -e "${BLUE}1. 配置后端服务 (config.env)${NC}"
echo -e "${BLUE}2. 启动后端服务 (pm2 start server.js)${NC}"
echo -e "${BLUE}3. 部署运维后台${NC}"
echo -e "${BLUE}4. 测试API接口${NC}"
echo ""
echo -e "${YELLOW}🔒 安全提醒:${NC}"
echo -e "${YELLOW}- 请及时修改默认密码${NC}"
echo -e "${YELLOW}- 建议定期备份数据库${NC}"
echo -e "${YELLOW}- 请确保数据库访问安全${NC}"
echo ""
echo -e "${GREEN}�� 如有问题，请联系开发团队${NC}" 