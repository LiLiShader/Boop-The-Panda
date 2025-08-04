-- =====================================================
-- Boop-The-Panda 完整数据库备份文件
-- 创建时间: 2025-08-01
-- 版本: v1.0.0
-- 说明: 此文件包含完整的数据库结构和初始数据
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
-- 初始数据插入
-- =====================================================

-- 插入管理员账号
INSERT INTO users (pid, name, password, level, gold, icon, created_at, updated_at, last_sync_time) VALUES
('admin001', 'administrators', 'admin123456', 99, 0, 1, NOW(), NOW(), NOW()),
('test001', '测试用户1', '123456', 1, 500, 1, NOW(), NOW(), NOW()),
('test002', '测试用户2', '123456', 1, 500, 1, NOW(), NOW(), NOW()),
('CCCCCC', 'test17538785329844475', '123456', 1, 762, 1, NOW(), NOW(), NOW()),
('357753', 'test17539571145917840', '123456', 1, 500, 1, NOW(), NOW(), NOW()),
('ghjkl', 'test17537353169118058', '123456', 1, 500, 1, NOW(), NOW(), NOW()),
('iiiiii', 'test17539480174654304', '123456', 1, 500, 1, NOW(), NOW(), NOW()),
('123456', 'test17538499419531127', '123456', 1, 500, 1, NOW(), NOW(), NOW()),
('aaaaaa', 'test', '123456', 1, 500, 1, NOW(), NOW(), NOW()),
('ooooo', 'test', '123456', 1, 500, 1, NOW(), NOW(), NOW()),
('666666', 'test', '123456', 1, 500, 1, NOW(), NOW(), NOW()),
('qqq', 'www', '123456', 1, 500, 1, NOW(), NOW(), NOW()),
('niuyueren', 'test', '123456', 1, 500, 1, NOW(), NOW(), NOW()),
('19970211', '张璨', '123456', 1, 500, 1, NOW(), NOW(), NOW()),
('testid', '测试用户', '123456', 1, 500, 1, NOW(), NOW(), NOW());

-- 插入全局配置
INSERT INTO global_config (config_key, config_value, description) VALUES
('payment_mode', '2D', '支付模式：2D或3D'),
('game_version', '1.0.0', '游戏版本号'),
('maintenance_mode', 'false', '维护模式：true或false'),
('max_retry_count', '3', '最大重试次数'),
('sync_interval', '300', '数据同步间隔(秒)'),
('max_offline_days', '7', '最大离线天数'),
('diamond_exchange_rate', '1', '钻石兑换比例'),
('heart_recovery_time', '1800', '生命值恢复时间(秒)');

-- 插入示例用户游戏数据
INSERT INTO user_game_data (user_id, data_key, data_value) VALUES
('test001', 'Gold', '500'),
('test001', 'Level', '1'),
('test001', 'Heart', '5'),
('test001', 'MaxLevel', '1'),
('test001', 'TotalScore', '0'),
('test002', 'Gold', '500'),
('test002', 'Level', '1'),
('test002', 'Heart', '5'),
('CCCCCC', 'Gold', '762'),
('CCCCCC', 'Level', '1'),
('CCCCCC', 'Heart', '5');

-- 插入示例支付记录
INSERT INTO payment_records (user_id, user_name, amount, order_no, pay_time, raw_response, product_id, product_info, product_details) VALUES
('CCCCCC', 'test17538785329844475', 8.00, '1001407300003276', '2025-08-01 12:14:34', '{"code":"P0001","message":"payment successful!|Success","orderNo":"10014017540216734278","merNo":"100140","billNo":"1001407300003276","amount":"8.00","currency":"1","tradeStatus":"S0001","returnURL":"http://119.91.142.92:3000/api/payment/get3DResult","md5Info":"f348a95e97b2b42efbb63f9c10a4553e","tradeTime":1754021673309,"auth3DUrl":null,"billAddr":"buyaaa","rebillToken":"J0x810w1p1/4n45Gc+4ToIABRv3Q==","threeDSecure":"","cnyexchangeRate":"7.1863"}', 'itemBtn1', '钻石礼包-12钻石', '{"diamonds":12,"isFirstCharge":false}'),
('CCCCCC', 'test17538785329844475', 8.00, '1002043438704951', '2025-08-01 12:14:34', '{"code":"P0001","message":"3D支付成功"}', 'itemBtn1', '钻石礼包-12钻石', '{"diamonds":12,"isFirstCharge":false}'),
('CCCCCC', 'test17538785329844475', 8.00, '1002043438704951_2', '2025-08-01 12:14:16', '{"code":"P0001","message":"3D支付成功"}', 'itemBtn1', '钻石礼包-12钻石', '{"diamonds":12,"isFirstCharge":false}'),
('CCCCCC', 'test17538785329844475', 100.00, '1002048645706683', '2025-08-01 09:59:56', '{"code":"P0001","message":"3D支付成功"}', 'itemBtn5', '钻石礼包-180钻石', '{"diamonds":180,"isFirstCharge":false}'),
('CCCCCC', 'test17538785329844475', 8.00, '1002042599703189', '2025-08-01 09:59:30', '{"code":"P0001","message":"3D支付成功"}', 'itemBtn1', '钻石礼包-12钻石', '{"diamonds":12,"isFirstCharge":false}'),
('357753', 'test17539571145917840', 8.00, '1002040618404649', '2025-07-31 18:33:38', '{"code":"P0001","message":"3D支付成功"}', 'itemBtn1', '钻石礼包-12钻石', '{"diamonds":12,"isFirstCharge":false}'),
('357753', 'test17539571145917840', 8.00, '1002040659107976', '2025-07-31 18:20:16', '{"code":"P0001","message":"3D支付成功"}', 'itemBtn1', '钻石礼包-12钻石', '{"diamonds":12,"isFirstCharge":false}'),
('ghjkl', 'test17537353169118058', 80.00, '1002040048209697', '2025-07-31 18:15:13', '{"code":"P0001","message":"3D支付成功"}', 'itemBtn4', '钻石礼包-140钻石', '{"diamonds":140,"isFirstCharge":false}'),
('ghjkl', 'test17537353169118058', 40.00, '1002045061600681', '2025-07-31 18:14:41', '{"code":"P0001","message":"3D支付成功"}', 'itemBtn3', '钻石礼包-70钻石', '{"diamonds":70,"isFirstCharge":false}'),
('ghjkl', 'test17537353169118058', 80.00, '1002040711600615', '2025-07-31 18:13:39', '{"code":"P0001","message":"3D支付成功"}', 'itemBtn4', '钻石礼包-140钻石', '{"diamonds":140,"isFirstCharge":false}');

-- 插入示例系统日志
INSERT INTO system_logs (log_level, log_type, message, user_id, ip_address, user_agent) VALUES
('INFO', 'USER_LOGIN', '用户登录成功', 'test001', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'),
('INFO', 'PAYMENT_SUCCESS', '支付成功', 'CCCCCC', '192.168.1.101', 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)'),
('WARN', 'SYNC_FAILED', '数据同步失败，网络异常', 'test002', '192.168.1.102', 'Mozilla/5.0 (Android 10; Mobile)'),
('ERROR', 'DATABASE_ERROR', '数据库连接失败', NULL, '127.0.0.1', 'Node.js/16.0.0'),
('INFO', 'ADMIN_LOGIN', '管理员登录成功', 'admin001', '192.168.1.103', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

-- 插入示例管理员操作日志
INSERT INTO admin_operation_logs (admin_id, operation_type, operation_desc, target_table, target_id, old_data, new_data, ip_address) VALUES
('admin001', 'UPDATE_CONFIG', '更新支付模式为3D', 'global_config', 'payment_mode', '{"config_value":"2D"}', '{"config_value":"3D"}', '192.168.1.103'),
('admin001', 'QUERY_ORDERS', '查询所有支付订单', 'payment_records', NULL, NULL, NULL, '192.168.1.103'),
('admin001', 'EXPORT_DATA', '导出订单数据为Excel', 'payment_records', NULL, NULL, NULL, '192.168.1.103'),
('admin001', 'VIEW_USER', '查看用户信息', 'users', 'test001', NULL, '{"pid":"test001","name":"测试用户1","level":1,"gold":500}', '192.168.1.103');

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
-- 数据库状态检查
-- =====================================================

-- 显示表信息
SHOW TABLES;

-- 显示表结构
DESCRIBE users;
DESCRIBE user_game_data;
DESCRIBE global_config;
DESCRIBE payment_records;
DESCRIBE system_logs;
DESCRIBE admin_operation_logs;

-- 显示初始数据
SELECT 'Users Table' as table_name, COUNT(*) as record_count FROM users
UNION ALL
SELECT 'User Game Data Table', COUNT(*) FROM user_game_data
UNION ALL
SELECT 'Global Config Table', COUNT(*) FROM global_config
UNION ALL
SELECT 'Payment Records Table', COUNT(*) FROM payment_records
UNION ALL
SELECT 'System Logs Table', COUNT(*) FROM system_logs
UNION ALL
SELECT 'Admin Operation Logs Table', COUNT(*) FROM admin_operation_logs;

-- 显示管理员账号
SELECT id, pid, name, level, created_at FROM users WHERE level >= 99;

-- 显示全局配置
SELECT config_key, config_value, description FROM global_config;

-- =====================================================
-- 备份完成提示
-- =====================================================

SELECT 'Database backup completed successfully!' as status;
SELECT 'Total tables created: 6' as info;
SELECT 'Initial data inserted successfully' as info;
SELECT 'All indexes and triggers created' as info;
SELECT 'Database is ready for use' as info; 