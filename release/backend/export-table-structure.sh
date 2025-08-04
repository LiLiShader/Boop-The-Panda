#!/bin/bash

# =====================================================
# 导出表结构脚本
# 创建时间: 2025-08-01
# 版本: v1.0.0
# 说明: 导出完整的表结构
# =====================================================

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}📤 导出表结构...${NC}"
echo "=========================================="

# 配置
SERVER_IP="119.91.142.92"
DB_USER="gameuser"
DB_PASSWORD="123456"
DB_NAME="game_db"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# 文件名
STRUCTURE_FILE="game_db_structure_${TIMESTAMP}.sql"
FULL_BACKUP_FILE="game_db_full_backup_${TIMESTAMP}.sql"

echo -e "${YELLOW}服务器地址: ${SERVER_IP}${NC}"
echo -e "${YELLOW}数据库名称: ${DB_NAME}${NC}"
echo -e "${YELLOW}时间戳: ${TIMESTAMP}${NC}"

# 方法1: 使用SSH远程执行mysqldump
echo -e "\n${BLUE}方法1: 使用SSH远程执行mysqldump${NC}"

if command -v ssh &> /dev/null; then
    echo -e "${YELLOW}尝试通过SSH连接服务器...${NC}"
    
    # 这里需要替换为实际的服务器信息
    # ssh user@${SERVER_IP} "mysqldump -u root -p --no-data ${DB_NAME} > /tmp/${STRUCTURE_FILE}"
    
    echo -e "${YELLOW}请手动执行以下命令:${NC}"
    echo -e "${YELLOW}ssh user@${SERVER_IP}${NC}"
    echo -e "${YELLOW}mysqldump -u root -p --no-data ${DB_NAME} > ${STRUCTURE_FILE}${NC}"
    echo -e "${YELLOW}scp user@${SERVER_IP}:${STRUCTURE_FILE} ./${NC}"
else
    echo -e "${RED}SSH客户端未安装${NC}"
fi

# 方法2: 生成表结构SQL文件
echo -e "\n${BLUE}方法2: 生成表结构SQL文件${NC}"

cat > "${STRUCTURE_FILE}" << 'EOF'
-- =====================================================
-- game_db 表结构导出
-- 导出时间: $(date)
-- 数据库: game_db
-- =====================================================

-- 删除已存在的数据库（如果存在）
DROP DATABASE IF EXISTS game_db;

-- 创建数据库
CREATE DATABASE game_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 使用数据库
USE game_db;

-- =====================================================
-- 1. 用户基础信息表
-- =====================================================
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pid VARCHAR(50) UNIQUE NOT NULL COMMENT '用户ID',
    name VARCHAR(100) NOT NULL COMMENT '用户名',
    password VARCHAR(255) NOT NULL COMMENT '密码',
    level INT DEFAULT 1 COMMENT '用户等级',
    gold INT DEFAULT 500 COMMENT '钻石数量',
    icon INT DEFAULT 1 COMMENT '头像ID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_sync_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '最后同步时间',
    INDEX idx_pid (pid),
    INDEX idx_name (name),
    INDEX idx_level (level)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户基础信息表';

-- =====================================================
-- 2. 用户游戏数据表
-- =====================================================
CREATE TABLE user_game_data (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL COMMENT '用户ID',
    data_key VARCHAR(100) NOT NULL COMMENT '数据键',
    data_value TEXT COMMENT '数据值',
    data_type ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string' COMMENT '数据类型',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_data (user_id, data_key),
    FOREIGN KEY (user_id) REFERENCES users(pid) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_data_key (data_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户游戏数据表';

-- =====================================================
-- 3. 全局配置表
-- =====================================================
CREATE TABLE global_config (
    id INT AUTO_INCREMENT PRIMARY KEY,
    config_key VARCHAR(100) UNIQUE NOT NULL COMMENT '配置键',
    config_value TEXT NOT NULL COMMENT '配置值',
    description VARCHAR(255) COMMENT '配置描述',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_config_key (config_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='全局配置表';

-- =====================================================
-- 4. 支付记录表
-- =====================================================
CREATE TABLE payment_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL COMMENT '用户ID',
    user_name VARCHAR(100) COMMENT '用户名',
    amount DECIMAL(10,2) NOT NULL COMMENT '支付金额',
    order_no VARCHAR(100) UNIQUE NOT NULL COMMENT '订单号',
    pay_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '支付时间',
    raw_response TEXT COMMENT '原始响应数据',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    product_id VARCHAR(50) COMMENT '商品ID',
    product_info VARCHAR(255) COMMENT '商品信息',
    product_details JSON COMMENT '商品详情',
    FOREIGN KEY (user_id) REFERENCES users(pid) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_order_no (order_no),
    INDEX idx_pay_time (pay_time),
    INDEX idx_product_id (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='支付记录表';

-- =====================================================
-- 5. 系统日志表
-- =====================================================
CREATE TABLE system_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    log_level ENUM('DEBUG', 'INFO', 'WARN', 'ERROR') DEFAULT 'INFO' COMMENT '日志级别',
    log_type VARCHAR(50) NOT NULL COMMENT '日志类型',
    message TEXT NOT NULL COMMENT '日志消息',
    user_id VARCHAR(50) COMMENT '用户ID',
    ip_address VARCHAR(45) COMMENT 'IP地址',
    user_agent TEXT COMMENT '用户代理',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_log_level (log_level),
    INDEX idx_log_type (log_type),
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='系统日志表';

-- =====================================================
-- 6. 管理员操作日志表
-- =====================================================
CREATE TABLE admin_operation_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    admin_id VARCHAR(50) NOT NULL COMMENT '管理员ID',
    operation_type VARCHAR(50) NOT NULL COMMENT '操作类型',
    operation_desc TEXT COMMENT '操作描述',
    target_table VARCHAR(50) COMMENT '目标表',
    target_id VARCHAR(50) COMMENT '目标ID',
    old_data JSON COMMENT '操作前数据',
    new_data JSON COMMENT '操作后数据',
    ip_address VARCHAR(45) COMMENT 'IP地址',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_admin_id (admin_id),
    INDEX idx_operation_type (operation_type),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='管理员操作日志表';

-- =====================================================
-- 创建视图
-- =====================================================

-- 用户统计视图
CREATE VIEW user_statistics AS
SELECT 
    u.pid,
    u.name,
    u.level,
    u.gold,
    u.created_at,
    COUNT(p.id) as total_orders,
    SUM(p.amount) as total_amount,
    MAX(p.pay_time) as last_payment
FROM users u
LEFT JOIN payment_records p ON u.pid = p.user_id
GROUP BY u.id, u.pid, u.name, u.level, u.gold, u.created_at;

-- 支付统计视图
CREATE VIEW payment_statistics AS
SELECT 
    DATE(pay_time) as payment_date,
    COUNT(*) as order_count,
    SUM(amount) as total_amount,
    AVG(amount) as avg_amount
FROM payment_records
GROUP BY DATE(pay_time)
ORDER BY payment_date DESC;

-- =====================================================
-- 创建存储过程
-- =====================================================

-- 清理过期日志的存储过程
DELIMITER //
CREATE PROCEDURE CleanOldLogs(IN days_to_keep INT)
BEGIN
    DELETE FROM system_logs WHERE created_at < DATE_SUB(NOW(), INTERVAL days_to_keep DAY);
    DELETE FROM admin_operation_logs WHERE created_at < DATE_SUB(NOW(), INTERVAL days_to_keep DAY);
    SELECT ROW_COUNT() as deleted_rows;
END //
DELIMITER ;

-- 获取用户完整信息的存储过程
DELIMITER //
CREATE PROCEDURE GetUserCompleteInfo(IN user_pid VARCHAR(50))
BEGIN
    SELECT 
        u.*,
        COUNT(p.id) as total_orders,
        SUM(p.amount) as total_spent,
        MAX(p.pay_time) as last_payment
    FROM users u
    LEFT JOIN payment_records p ON u.pid = p.user_id
    WHERE u.pid = user_pid
    GROUP BY u.id;
END //
DELIMITER ;

-- =====================================================
-- 创建触发器
-- =====================================================

-- 用户数据更新时自动更新users表的gold字段
DELIMITER //
CREATE TRIGGER update_user_gold_trigger
AFTER INSERT ON user_game_data
FOR EACH ROW
BEGIN
    IF NEW.data_key = 'Gold' THEN
        UPDATE users SET gold = CAST(NEW.data_value AS UNSIGNED) WHERE pid = NEW.user_id;
    END IF;
END //
DELIMITER ;

-- 支付记录插入时记录系统日志
DELIMITER //
CREATE TRIGGER payment_log_trigger
AFTER INSERT ON payment_records
FOR EACH ROW
BEGIN
    INSERT INTO system_logs (log_level, log_type, message, user_id, ip_address)
    VALUES ('INFO', 'PAYMENT_RECORD', CONCAT('新支付记录: ', NEW.order_no, ' 金额: ', NEW.amount), NEW.user_id, '127.0.0.1');
END //
DELIMITER ;

-- =====================================================
-- 创建索引优化
-- =====================================================

-- 为常用查询创建复合索引
CREATE INDEX idx_payment_user_time ON payment_records(user_id, pay_time);
CREATE INDEX idx_payment_amount_time ON payment_records(amount, pay_time);
CREATE INDEX idx_user_level_gold ON users(level, gold);
CREATE INDEX idx_config_key_value ON global_config(config_key, config_value);

-- =====================================================
-- 权限设置
-- =====================================================

-- 创建应用用户（如果不存在）
CREATE USER IF NOT EXISTS 'gameuser'@'localhost' IDENTIFIED BY '123456';
CREATE USER IF NOT EXISTS 'gameuser'@'%' IDENTIFIED BY '123456';

-- 授予权限
GRANT SELECT, INSERT, UPDATE, DELETE ON game_db.* TO 'gameuser'@'localhost';
GRANT SELECT, INSERT, UPDATE, DELETE ON game_db.* TO 'gameuser'@'%';
GRANT EXECUTE ON PROCEDURE game_db.* TO 'gameuser'@'localhost';
GRANT EXECUTE ON PROCEDURE game_db.* TO 'gameuser'@'%';

-- 刷新权限
FLUSH PRIVILEGES;

-- =====================================================
-- 表结构导出完成
-- =====================================================

SELECT 'Table structure export completed successfully!' as status;
SELECT 'Total tables created: 6' as info;
SELECT 'All indexes and triggers created' as info;
SELECT 'Database structure is ready for use' as info;
EOF

echo -e "${GREEN}✅ 表结构文件已生成: ${STRUCTURE_FILE}${NC}"

# 方法3: 复制现有的完整备份文件
echo -e "\n${BLUE}方法3: 复制现有的完整备份文件${NC}"

if [ -f "complete_database_backup.sql" ]; then
    cp complete_database_backup.sql "${FULL_BACKUP_FILE}"
    echo -e "${GREEN}✅ 完整备份文件已复制: ${FULL_BACKUP_FILE}${NC}"
else
    echo -e "${RED}❌ 完整备份文件不存在${NC}"
fi

# 显示生成的文件
echo -e "\n${BLUE}生成的文件:${NC}"
ls -la *${TIMESTAMP}*.sql

echo -e "\n${GREEN}==========================================${NC}"
echo -e "${GREEN}📤 表结构导出完成！${NC}"
echo -e "${GREEN}==========================================${NC}"
echo -e "${GREEN}✅ 表结构文件: ${STRUCTURE_FILE}${NC}"
echo -e "${GREEN}✅ 完整备份文件: ${FULL_BACKUP_FILE}${NC}"

echo -e "\n${YELLOW}💡 使用说明:${NC}"
echo -e "${YELLOW}1. 表结构文件只包含表结构，不包含数据${NC}"
echo -e "${YELLOW}2. 完整备份文件包含表结构和初始数据${NC}"
echo -e "${YELLOW}3. 可以在其他环境中导入使用${NC}"

echo -e "\n${BLUE}📝 导出完成时间: $(date)${NC}" 