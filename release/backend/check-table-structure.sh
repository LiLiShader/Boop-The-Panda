#!/bin/bash

# =====================================================
# 查看数据库表结构脚本
# 创建时间: 2025-08-01
# 版本: v1.0.0
# 说明: 查看game_db数据库中所有表的结构
# =====================================================

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔍 查看 game_db 数据库表结构...${NC}"
echo "=========================================="

# 检查MySQL连接
if ! command -v mysql &> /dev/null; then
    echo -e "${RED}❌ MySQL客户端未安装${NC}"
    exit 1
fi

# 数据库配置
DB_USER="gameuser"
DB_PASSWORD="123456"
DB_HOST="127.0.0.1"
DB_NAME="game_db"

# 测试数据库连接
echo -e "${YELLOW}测试数据库连接...${NC}"
if ! mysql -u"$DB_USER" -p"$DB_PASSWORD" -h"$DB_HOST" -e "USE $DB_NAME;" 2>/dev/null; then
    echo -e "${RED}❌ 数据库连接失败${NC}"
    echo -e "${YELLOW}请检查:${NC}"
    echo -e "${YELLOW}1. MySQL服务是否运行${NC}"
    echo -e "${YELLOW}2. 用户名密码是否正确${NC}"
    echo -e "${YELLOW}3. 数据库是否存在${NC}"
    exit 1
fi

echo -e "${GREEN}✅ 数据库连接成功${NC}"

# 查看所有表
echo -e "\n${PURPLE}📋 数据库中的表:${NC}"
mysql -u"$DB_USER" -p"$DB_PASSWORD" -h"$DB_HOST" -e "USE $DB_NAME; SHOW TABLES;"

# 查看每个表的结构
tables=("users" "user_game_data" "global_config" "payment_records")

for table in "${tables[@]}"; do
    echo -e "\n${BLUE}==========================================${NC}"
    echo -e "${BLUE}📊 表结构: ${table}${NC}"
    echo -e "${BLUE}==========================================${NC}"
    
    # 查看表结构
    echo -e "${CYAN}字段结构:${NC}"
    mysql -u"$DB_USER" -p"$DB_PASSWORD" -h"$DB_HOST" -e "USE $DB_NAME; DESCRIBE $table;"
    
    # 查看表信息
    echo -e "\n${CYAN}表信息:${NC}"
    mysql -u"$DB_USER" -p"$DB_PASSWORD" -h"$DB_HOST" -e "USE $DB_NAME; SHOW TABLE STATUS LIKE '$table';"
    
    # 查看索引
    echo -e "\n${CYAN}索引信息:${NC}"
    mysql -u"$DB_USER" -p"$DB_PASSWORD" -h"$DB_HOST" -e "USE $DB_NAME; SHOW INDEX FROM $table;"
    
    # 查看记录数量
    echo -e "\n${CYAN}记录数量:${NC}"
    mysql -u"$DB_USER" -p"$DB_PASSWORD" -h"$DB_HOST" -e "USE $DB_NAME; SELECT COUNT(*) as '记录数量' FROM $table;"
    
    # 显示前几条记录（如果有数据）
    echo -e "\n${CYAN}前5条记录:${NC}"
    mysql -u"$DB_USER" -p"$DB_PASSWORD" -h"$DB_HOST" -e "USE $DB_NAME; SELECT * FROM $table LIMIT 5;"
done

# 查看外键关系
echo -e "\n${BLUE}==========================================${NC}"
echo -e "${BLUE}🔗 外键关系${NC}"
echo -e "${BLUE}==========================================${NC}"
mysql -u"$DB_USER" -p"$DB_PASSWORD" -h"$DB_HOST" -e "
USE $DB_NAME;
SELECT 
    TABLE_NAME,
    COLUMN_NAME,
    CONSTRAINT_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM 
    INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
WHERE 
    REFERENCED_TABLE_SCHEMA = '$DB_NAME' 
    AND REFERENCED_TABLE_NAME IS NOT NULL;
"

# 查看触发器
echo -e "\n${BLUE}==========================================${NC}"
echo -e "${BLUE}⚡ 触发器${NC}"
echo -e "${BLUE}==========================================${NC}"
mysql -u"$DB_USER" -p"$DB_PASSWORD" -h"$DB_HOST" -e "
USE $DB_NAME;
SHOW TRIGGERS;
"

# 查看视图
echo -e "\n${BLUE}==========================================${NC}"
echo -e "${BLUE}👁️  视图${NC}"
echo -e "${BLUE}==========================================${NC}"
mysql -u"$DB_USER" -p"$DB_PASSWORD" -h"$DB_HOST" -e "
USE $DB_NAME;
SHOW FULL TABLES WHERE Table_type = 'VIEW';
"

# 查看存储过程
echo -e "\n${BLUE}==========================================${NC}"
echo -e "${BLUE}📦 存储过程${NC}"
echo -e "${BLUE}==========================================${NC}"
mysql -u"$DB_USER" -p"$DB_PASSWORD" -h"$DB_HOST" -e "
USE $DB_NAME;
SHOW PROCEDURE STATUS WHERE Db = '$DB_NAME';
"

echo -e "\n${GREEN}==========================================${NC}"
echo -e "${GREEN}✅ 表结构查看完成${NC}"
echo -e "${GREEN}==========================================${NC}"

# 提供手动查看命令
echo -e "\n${YELLOW}💡 手动查看命令:${NC}"
echo -e "${YELLOW}1. 查看所有表: SHOW TABLES;${NC}"
echo -e "${YELLOW}2. 查看表结构: DESCRIBE 表名;${NC}"
echo -e "${YELLOW}3. 查看表信息: SHOW TABLE STATUS LIKE '表名';${NC}"
echo -e "${YELLOW}4. 查看索引: SHOW INDEX FROM 表名;${NC}"
echo -e "${YELLOW}5. 查看记录: SELECT * FROM 表名 LIMIT 5;${NC}"
echo -e "${YELLOW}6. 查看外键: SELECT * FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE WHERE REFERENCED_TABLE_NAME IS NOT NULL;${NC}"
echo -e "${YELLOW}7. 查看触发器: SHOW TRIGGERS;${NC}"
echo -e "${YELLOW}8. 查看视图: SHOW FULL TABLES WHERE Table_type = 'VIEW';${NC}"
echo -e "${YELLOW}9. 查看存储过程: SHOW PROCEDURE STATUS;${NC}" 