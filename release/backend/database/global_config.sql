-- 创建全局配置表
CREATE TABLE IF NOT EXISTS global_config (
    id INT PRIMARY KEY AUTO_INCREMENT,
    config_key VARCHAR(50) UNIQUE NOT NULL COMMENT '配置键名',
    config_value TEXT COMMENT '配置值',
    description VARCHAR(255) COMMENT '配置描述',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='全局配置表';

-- 插入支付模式配置
INSERT INTO global_config (config_key, config_value, description) 
VALUES ('payment_mode', '2D', '支付模式：2D或3D')
ON DUPLICATE KEY UPDATE 
    config_value = VALUES(config_value),
    description = VALUES(description),
    updated_at = CURRENT_TIMESTAMP;

-- 插入其他可能的全局配置（便于后续扩展）
INSERT INTO global_config (config_key, config_value, description) 
VALUES 
    ('maintenance_mode', 'false', '维护模式：true或false'),
    ('game_version', '1.0.0', '游戏版本号'),
    ('max_retry_count', '3', '最大重试次数')
ON DUPLICATE KEY UPDATE 
    config_value = VALUES(config_value),
    description = VALUES(description),
    updated_at = CURRENT_TIMESTAMP;

-- 创建索引
CREATE INDEX idx_config_key ON global_config(config_key);
CREATE INDEX idx_updated_at ON global_config(updated_at); 