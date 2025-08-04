-- =====================================================
-- 修复 user_game_data 表结构
-- 创建时间: 2025-08-01
-- 版本: v1.0.0
-- 说明: 添加缺失的 data_type 字段
-- =====================================================

USE game_db;

-- 1. 检查当前表结构
SELECT '当前表结构:' as info;
DESCRIBE user_game_data;

-- 2. 添加缺失的 data_type 字段
ALTER TABLE user_game_data 
ADD COLUMN data_type ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string' 
COMMENT '数据类型' 
AFTER data_value;

-- 3. 验证修改后的表结构
SELECT '修改后的表结构:' as info;
DESCRIBE user_game_data;

-- 4. 更新现有数据的 data_type 字段
-- 根据 data_value 的内容推断数据类型
UPDATE user_game_data 
SET data_type = CASE 
    WHEN data_value REGEXP '^[0-9]+$' THEN 'number'
    WHEN data_value IN ('true', 'false') THEN 'boolean'
    WHEN data_value LIKE '{%' OR data_value LIKE '[%' THEN 'json'
    ELSE 'string'
END
WHERE data_type IS NULL OR data_type = 'string';

-- 5. 显示更新结果
SELECT '数据类型更新结果:' as info;
SELECT data_key, data_value, data_type FROM user_game_data LIMIT 10;

-- 6. 验证表结构完整性
SELECT '表结构验证:' as info;
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE,
    COLUMN_DEFAULT,
    COLUMN_COMMENT
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'game_db' 
AND TABLE_NAME = 'user_game_data'
ORDER BY ORDINAL_POSITION;

-- 7. 检查索引
SELECT '索引信息:' as info;
SHOW INDEX FROM user_game_data;

-- 8. 测试插入数据
SELECT '测试插入数据:' as info;
INSERT INTO user_game_data (user_id, data_key, data_value, data_type) 
VALUES ('test001', 'TestKey', 'TestValue', 'string')
ON DUPLICATE KEY UPDATE 
    data_value = VALUES(data_value),
    data_type = VALUES(data_type),
    updated_at = CURRENT_TIMESTAMP;

-- 9. 验证插入结果
SELECT '插入测试结果:' as info;
SELECT * FROM user_game_data WHERE data_key = 'TestKey';

-- 10. 清理测试数据
DELETE FROM user_game_data WHERE data_key = 'TestKey';

SELECT '修复完成！' as status; 