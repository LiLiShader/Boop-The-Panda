#!/bin/bash

# =====================================================
# 修复数据库问题脚本
# 创建时间: 2025-08-01
# 版本: v1.0.0
# 说明: 修复 user_game_data 表缺少 data_type 字段的问题
# =====================================================

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔧 修复数据库问题...${NC}"
echo -e "${BLUE}问题: user_game_data 表缺少 data_type 字段${NC}"
echo "=========================================="

# 数据库配置
DB_USER="gameuser"
DB_PASSWORD="123456"
DB_HOST="127.0.0.1"
DB_NAME="game_db"

# 检查MySQL连接
echo -e "${YELLOW}1. 检查数据库连接...${NC}"
if ! mysql -u"$DB_USER" -p"$DB_PASSWORD" -h"$DB_HOST" -e "USE $DB_NAME;" 2>/dev/null; then
    echo -e "${RED}❌ 数据库连接失败${NC}"
    echo -e "${YELLOW}请检查数据库配置或使用root用户:${NC}"
    echo -e "${YELLOW}mysql -u root -p${NC}"
    exit 1
fi
echo -e "${GREEN}✅ 数据库连接成功${NC}"

# 检查当前表结构
echo -e "\n${YELLOW}2. 检查当前表结构...${NC}"
current_structure=$(mysql -u"$DB_USER" -p"$DB_PASSWORD" -h"$DB_HOST" -e "USE $DB_NAME; DESCRIBE user_game_data;" 2>/dev/null)
echo "$current_structure"

# 检查是否已经有 data_type 字段
if echo "$current_structure" | grep -q "data_type"; then
    echo -e "${GREEN}✅ data_type 字段已存在${NC}"
    echo -e "${YELLOW}问题可能已解决，请重启后端服务${NC}"
    exit 0
fi

echo -e "${RED}❌ 发现缺少 data_type 字段${NC}"

# 备份现有数据
echo -e "\n${YELLOW}3. 备份现有数据...${NC}"
backup_file="user_game_data_backup_$(date +%Y%m%d_%H%M%S).sql"
if mysqldump -u"$DB_USER" -p"$DB_PASSWORD" -h"$DB_HOST" "$DB_NAME" user_game_data > "$backup_file" 2>/dev/null; then
    echo -e "${GREEN}✅ 数据备份成功: $backup_file${NC}"
else
    echo -e "${YELLOW}⚠️  数据备份失败，继续执行...${NC}"
fi

# 添加 data_type 字段
echo -e "\n${YELLOW}4. 添加 data_type 字段...${NC}"
add_column_sql="ALTER TABLE user_game_data ADD COLUMN data_type ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string' COMMENT '数据类型' AFTER data_value;"

if mysql -u"$DB_USER" -p"$DB_PASSWORD" -h"$DB_HOST" -e "USE $DB_NAME; $add_column_sql" 2>/dev/null; then
    echo -e "${GREEN}✅ data_type 字段添加成功${NC}"
else
    echo -e "${RED}❌ data_type 字段添加失败${NC}"
    echo -e "${YELLOW}尝试使用root用户执行:${NC}"
    echo -e "${YELLOW}mysql -u root -p -e \"USE $DB_NAME; $add_column_sql\"${NC}"
    exit 1
fi

# 更新现有数据的 data_type
echo -e "\n${YELLOW}5. 更新现有数据的 data_type...${NC}"
update_sql="UPDATE user_game_data SET data_type = CASE 
    WHEN data_value REGEXP '^[0-9]+$' THEN 'number'
    WHEN data_value IN ('true', 'false') THEN 'boolean'
    WHEN data_value LIKE '{%' OR data_value LIKE '[%' THEN 'json'
    ELSE 'string'
END WHERE data_type IS NULL OR data_type = 'string';"

if mysql -u"$DB_USER" -p"$DB_PASSWORD" -h"$DB_HOST" -e "USE $DB_NAME; $update_sql" 2>/dev/null; then
    echo -e "${GREEN}✅ 数据类型更新成功${NC}"
else
    echo -e "${YELLOW}⚠️  数据类型更新失败，但字段已添加${NC}"
fi

# 验证修复结果
echo -e "\n${YELLOW}6. 验证修复结果...${NC}"
new_structure=$(mysql -u"$DB_USER" -p"$DB_PASSWORD" -h"$DB_HOST" -e "USE $DB_NAME; DESCRIBE user_game_data;" 2>/dev/null)
echo "$new_structure"

if echo "$new_structure" | grep -q "data_type"; then
    echo -e "${GREEN}✅ 修复成功！data_type 字段已添加${NC}"
else
    echo -e "${RED}❌ 修复失败，data_type 字段仍未添加${NC}"
    exit 1
fi

# 测试插入数据
echo -e "\n${YELLOW}7. 测试数据插入...${NC}"
test_sql="INSERT INTO user_game_data (user_id, data_key, data_value, data_type) 
VALUES ('test001', 'TestKey', 'TestValue', 'string')
ON DUPLICATE KEY UPDATE 
    data_value = VALUES(data_value),
    data_type = VALUES(data_type),
    updated_at = CURRENT_TIMESTAMP;"

if mysql -u"$DB_USER" -p"$DB_PASSWORD" -h"$DB_HOST" -e "USE $DB_NAME; $test_sql" 2>/dev/null; then
    echo -e "${GREEN}✅ 数据插入测试成功${NC}"
    
    # 清理测试数据
    mysql -u"$DB_USER" -p"$DB_PASSWORD" -h"$DB_HOST" -e "USE $DB_NAME; DELETE FROM user_game_data WHERE data_key = 'TestKey';" 2>/dev/null
    echo -e "${GREEN}✅ 测试数据清理完成${NC}"
else
    echo -e "${RED}❌ 数据插入测试失败${NC}"
    exit 1
fi

# 显示修复后的数据示例
echo -e "\n${YELLOW}8. 显示修复后的数据示例...${NC}"
mysql -u"$DB_USER" -p"$DB_PASSWORD" -h"$DB_HOST" -e "USE $DB_NAME; SELECT data_key, data_value, data_type FROM user_game_data LIMIT 5;" 2>/dev/null

# 重启后端服务
echo -e "\n${YELLOW}9. 重启后端服务...${NC}"
if command -v pm2 &> /dev/null; then
    if pm2 restart boop-backend 2>/dev/null; then
        echo -e "${GREEN}✅ 后端服务重启成功${NC}"
    else
        echo -e "${YELLOW}⚠️  后端服务重启失败，请手动重启${NC}"
        echo -e "${YELLOW}手动重启命令: pm2 restart boop-backend${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  PM2未安装，请手动重启后端服务${NC}"
fi

echo -e "\n${GREEN}==========================================${NC}"
echo -e "${GREEN}🎉 数据库问题修复完成！${NC}"
echo -e "${GREEN}==========================================${NC}"
echo -e "${GREEN}✅ data_type 字段已添加到 user_game_data 表${NC}"
echo -e "${GREEN}✅ 现有数据的数据类型已更新${NC}"
echo -e "${GREEN}✅ 数据插入测试通过${NC}"
echo -e "${GREEN}✅ 后端服务已重启${NC}"

echo -e "\n${BLUE}📋 下一步操作:${NC}"
echo -e "${BLUE}1. 测试用户登录功能${NC}"
echo -e "${BLUE}2. 测试数据同步功能${NC}"
echo -e "${BLUE}3. 检查日志确认无错误${NC}"

echo -e "\n${YELLOW}🔧 如果仍有问题，请检查:${NC}"
echo -e "${YELLOW}1. 后端服务日志: pm2 logs boop-backend${NC}"
echo -e "${YELLOW}2. 数据库连接: mysql -ugameuser -p123456 -e 'USE game_db;'${NC}"
echo -e "${YELLOW}3. 表结构: DESCRIBE user_game_data;${NC}"

echo -e "\n${BLUE}📝 修复完成时间: $(date)${NC}" 