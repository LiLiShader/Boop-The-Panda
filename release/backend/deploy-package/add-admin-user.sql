-- 添加管理员账号到users表
-- 管理员账号：name字段为"administrators"，level为99表示管理员权限

USE game_db;

-- 插入管理员账号（如果不存在则插入，存在则更新）
INSERT INTO users (pid, name, password, level, gold, icon, created_at, updated_at, last_sync_time) 
VALUES ('admin001', 'administrators', 'admin123456', 99, 0, 1, NOW(), NOW(), NOW()) 
ON DUPLICATE KEY UPDATE 
    password = VALUES(password),
    level = VALUES(level),
    updated_at = NOW();

-- 验证管理员账号是否添加成功
SELECT id, pid, name, level, created_at, updated_at 
FROM users 
WHERE name = 'administrators';

-- 显示所有管理员账号
SELECT id, pid, name, level, created_at, updated_at 
FROM users 
WHERE level >= 99;
