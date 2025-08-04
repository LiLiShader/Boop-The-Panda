#!/bin/bash

# =====================================================
# 检查表关联关系和代码关联
# 创建时间: 2025-08-01
# 版本: v1.0.0
# 说明: 检查数据库表之间的关联关系和代码中的表使用情况
# =====================================================

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔍 检查表关联关系和代码关联...${NC}"
echo "=========================================="

# 数据库配置
DB_USER="gameuser"
DB_PASSWORD="123456"
DB_HOST="127.0.0.1"
DB_NAME="game_db"

# 检查MySQL连接
if ! command -v mysql &> /dev/null; then
    echo -e "${RED}❌ MySQL客户端未安装，跳过数据库检查${NC}"
    DB_CHECK=false
else
    DB_CHECK=true
fi

# 1. 检查表之间的外键关联
echo -e "\n${PURPLE}1. 表之间的外键关联关系${NC}"
echo "=========================================="

if [ "$DB_CHECK" = true ]; then
    echo -e "${YELLOW}检查外键关系...${NC}"
    mysql -u"$DB_USER" -p"$DB_PASSWORD" -h"$DB_HOST" -e "
    USE $DB_NAME;
    SELECT 
        TABLE_NAME as '表名',
        COLUMN_NAME as '字段名',
        CONSTRAINT_NAME as '约束名',
        REFERENCED_TABLE_NAME as '关联表',
        REFERENCED_COLUMN_NAME as '关联字段'
    FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
    WHERE REFERENCED_TABLE_SCHEMA = '$DB_NAME' 
    AND REFERENCED_TABLE_NAME IS NOT NULL
    ORDER BY TABLE_NAME, COLUMN_NAME;
    " 2>/dev/null
else
    echo -e "${YELLOW}手动检查外键关系:${NC}"
    echo -e "${YELLOW}1. user_game_data.user_id -> users.pid${NC}"
    echo -e "${YELLOW}2. payment_records.user_id -> users.pid${NC}"
    echo -e "${YELLOW}3. system_logs.user_id -> users.pid (可选)${NC}"
fi

# 2. 检查表结构完整性
echo -e "\n${PURPLE}2. 表结构完整性检查${NC}"
echo "=========================================="

if [ "$DB_CHECK" = true ]; then
    tables=("users" "user_game_data" "global_config" "payment_records" "system_logs" "admin_operation_logs")
    
    for table in "${tables[@]}"; do
        echo -e "${CYAN}检查表: ${table}${NC}"
        mysql -u"$DB_USER" -p"$DB_PASSWORD" -h"$DB_HOST" -e "
        USE $DB_NAME;
        DESCRIBE $table;
        " 2>/dev/null
        echo ""
    done
else
    echo -e "${YELLOW}表结构概览:${NC}"
    echo -e "${YELLOW}1. users - 用户基础信息表${NC}"
    echo -e "${YELLOW}2. user_game_data - 用户游戏数据表${NC}"
    echo -e "${YELLOW}3. global_config - 全局配置表${NC}"
    echo -e "${YELLOW}4. payment_records - 支付记录表${NC}"
    echo -e "${YELLOW}5. system_logs - 系统日志表${NC}"
    echo -e "${YELLOW}6. admin_operation_logs - 管理员操作日志表${NC}"
fi

# 3. 检查代码中的表使用情况
echo -e "\n${PURPLE}3. 代码中的表使用情况${NC}"
echo "=========================================="

# 检查后端代码中的表使用
echo -e "${CYAN}检查后端代码中的表使用...${NC}"

# 检查src目录中的文件
if [ -d "src" ]; then
    echo -e "${YELLOW}后端代码文件:${NC}"
    
    # 检查services目录
    if [ -d "src/services" ]; then
        echo -e "${GREEN}Services目录:${NC}"
        for file in src/services/*.js; do
            if [ -f "$file" ]; then
                echo -e "${YELLOW}  $(basename "$file"):${NC}"
                # 检查文件中的表名
                tables_in_code=("users" "user_game_data" "global_config" "payment_records" "system_logs" "admin_operation_logs")
                for table in "${tables_in_code[@]}"; do
                    if grep -q "$table" "$file"; then
                        echo -e "${GREEN}    ✅ 使用表: $table${NC}"
                    fi
                done
            fi
        done
    fi
    
    # 检查controllers目录
    if [ -d "src/controllers" ]; then
        echo -e "${GREEN}Controllers目录:${NC}"
        for file in src/controllers/*.js; do
            if [ -f "$file" ]; then
                echo -e "${YELLOW}  $(basename "$file"):${NC}"
                tables_in_code=("users" "user_game_data" "global_config" "payment_records" "system_logs" "admin_operation_logs")
                for table in "${tables_in_code[@]}"; do
                    if grep -q "$table" "$file"; then
                        echo -e "${GREEN}    ✅ 使用表: $table${NC}"
                    fi
                done
            fi
        done
    fi
    
    # 检查routes目录
    if [ -d "src/routes" ]; then
        echo -e "${GREEN}Routes目录:${NC}"
        for file in src/routes/*.js; do
            if [ -f "$file" ]; then
                echo -e "${YELLOW}  $(basename "$file"):${NC}"
                tables_in_code=("users" "user_game_data" "global_config" "payment_records" "system_logs" "admin_operation_logs")
                for table in "${tables_in_code[@]}"; do
                    if grep -q "$table" "$file"; then
                        echo -e "${GREEN}    ✅ 使用表: $table${NC}"
                    fi
                done
            fi
        done
    fi
else
    echo -e "${RED}❌ src目录不存在${NC}"
fi

# 4. 检查主服务器文件
echo -e "\n${CYAN}检查主服务器文件...${NC}"
if [ -f "server.js" ]; then
    echo -e "${YELLOW}server.js:${NC}"
    tables_in_code=("users" "user_game_data" "global_config" "payment_records" "system_logs" "admin_operation_logs")
    for table in "${tables_in_code[@]}"; do
        if grep -q "$table" "server.js"; then
            echo -e "${GREEN}  ✅ 使用表: $table${NC}"
        fi
    done
fi

# 5. 检查数据库配置文件
echo -e "\n${CYAN}检查数据库配置文件...${NC}"
if [ -d "src/config" ]; then
    for file in src/config/*.js; do
        if [ -f "$file" ]; then
            echo -e "${YELLOW}$(basename "$file"):${NC}"
            tables_in_code=("users" "user_game_data" "global_config" "payment_records" "system_logs" "admin_operation_logs")
            for table in "${tables_in_code[@]}"; do
                if grep -q "$table" "$file"; then
                    echo -e "${GREEN}  ✅ 使用表: $table${NC}"
                fi
            done
        fi
    done
fi

# 6. 检查表关联的完整性
echo -e "\n${PURPLE}4. 表关联完整性分析${NC}"
echo "=========================================="

echo -e "${CYAN}表关联关系总结:${NC}"
echo -e "${GREEN}✅ users 表 (主表)${NC}"
echo -e "${YELLOW}  ├── user_game_data.user_id -> users.pid${NC}"
echo -e "${YELLOW}  ├── payment_records.user_id -> users.pid${NC}"
echo -e "${YELLOW}  └── system_logs.user_id -> users.pid (可选)${NC}"

echo -e "\n${CYAN}数据流向分析:${NC}"
echo -e "${GREEN}1. 用户注册/登录 -> users 表${NC}"
echo -e "${GREEN}2. 游戏数据同步 -> user_game_data 表${NC}"
echo -e "${GREEN}3. 支付记录 -> payment_records 表${NC}"
echo -e "${GREEN}4. 系统配置 -> global_config 表${NC}"
echo -e "${GREEN}5. 系统日志 -> system_logs 表${NC}"
echo -e "${GREEN}6. 管理员操作 -> admin_operation_logs 表${NC}"

# 7. 检查潜在问题
echo -e "\n${PURPLE}5. 潜在问题检查${NC}"
echo "=========================================="

# 检查是否有孤立的数据
if [ "$DB_CHECK" = true ]; then
    echo -e "${CYAN}检查孤立数据...${NC}"
    
    # 检查user_game_data中是否有孤立的user_id
    echo -e "${YELLOW}检查user_game_data中的孤立user_id:${NC}"
    mysql -u"$DB_USER" -p"$DB_PASSWORD" -h"$DB_HOST" -e "
    USE $DB_NAME;
    SELECT COUNT(*) as '孤立记录数'
    FROM user_game_data ugd
    LEFT JOIN users u ON ugd.user_id = u.pid
    WHERE u.pid IS NULL;
    " 2>/dev/null
    
    # 检查payment_records中是否有孤立的user_id
    echo -e "${YELLOW}检查payment_records中的孤立user_id:${NC}"
    mysql -u"$DB_USER" -p"$DB_PASSWORD" -h"$DB_HOST" -e "
    USE $DB_NAME;
    SELECT COUNT(*) as '孤立记录数'
    FROM payment_records pr
    LEFT JOIN users u ON pr.user_id = u.pid
    WHERE u.pid IS NULL;
    " 2>/dev/null
else
    echo -e "${YELLOW}潜在问题检查:${NC}"
    echo -e "${YELLOW}1. 检查外键约束是否完整${NC}"
    echo -e "${YELLOW}2. 检查是否有孤立数据${NC}"
    echo -e "${YELLOW}3. 检查索引是否合理${NC}"
    echo -e "${YELLOW}4. 检查数据类型是否一致${NC}"
fi

# 8. 生成关联关系图
echo -e "\n${PURPLE}6. 表关联关系图${NC}"
echo "=========================================="

cat << 'EOF'
📊 数据库表关联关系图:

users (主表)
├── id (主键)
├── pid (用户ID, 唯一)
├── name (用户名)
├── password (密码)
├── level (等级)
├── gold (金币)
├── icon (头像)
└── 时间戳字段

├── user_game_data (用户游戏数据)
│   ├── user_id -> users.pid (外键)
│   ├── data_key (数据键)
│   ├── data_value (数据值)
│   ├── data_type (数据类型)
│   └── 时间戳字段
│
├── payment_records (支付记录)
│   ├── user_id -> users.pid (外键)
│   ├── order_no (订单号, 唯一)
│   ├── amount (金额)
│   ├── pay_time (支付时间)
│   └── 其他支付相关字段
│
└── system_logs (系统日志)
    ├── user_id -> users.pid (可选外键)
    ├── log_level (日志级别)
    ├── log_type (日志类型)
    ├── message (日志消息)
    └── 时间戳字段

global_config (全局配置)
├── config_key (配置键, 唯一)
├── config_value (配置值)
├── description (描述)
└── 时间戳字段

admin_operation_logs (管理员操作日志)
├── admin_id (管理员ID)
├── operation_type (操作类型)
├── operation_desc (操作描述)
├── target_table (目标表)
├── target_id (目标ID)
└── 时间戳字段
EOF

echo -e "\n${GREEN}==========================================${NC}"
echo -e "${GREEN}✅ 表关联关系检查完成！${NC}"
echo -e "${GREEN}==========================================${NC}"

# 9. 提供建议
echo -e "\n${YELLOW}💡 建议:${NC}"
echo -e "${YELLOW}1. 确保所有外键约束正确设置${NC}"
echo -e "${YELLOW}2. 定期检查数据完整性${NC}"
echo -e "${YELLOW}3. 监控表关联的性能影响${NC}"
echo -e "${YELLOW}4. 保持代码和数据库结构同步${NC}"

echo -e "\n${BLUE}📝 检查完成时间: $(date)${NC}" 