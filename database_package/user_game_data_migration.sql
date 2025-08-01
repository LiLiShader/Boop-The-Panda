-- 用户游戏数据表迁移脚本
-- 创建时间: 2025-01-22
-- 描述: 为游戏添加用户数据同步功能

-- 1. 创建用户游戏数据表
CREATE TABLE IF NOT EXISTS user_game_data (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    data_key VARCHAR(100) NOT NULL,
    data_value TEXT,
    data_type ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_data (user_id, data_key),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_data_key (data_key),
    INDEX idx_updated_at (updated_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. 为用户表添加最后同步时间字段（可选）
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_sync_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- 3. 创建索引优化查询性能
CREATE INDEX IF NOT EXISTS idx_user_game_data_user_key ON user_game_data(user_id, data_key);
CREATE INDEX IF NOT EXISTS idx_user_game_data_updated ON user_game_data(user_id, updated_at);

-- 4. 插入一些测试数据（可选，用于测试）
-- INSERT INTO user_game_data (user_id, data_key, data_value, data_type) VALUES 
-- (1, 'Gold', '1000', 'string'),
-- (1, 'Level', '10', 'number'),
-- (1, 'Music_Status', '1', 'boolean'),
-- (1, 'Audio_Volume', '1.0', 'number');

-- 5. 验证表创建成功
SELECT 'user_game_data table created successfully' as status;
SHOW CREATE TABLE user_game_data; 