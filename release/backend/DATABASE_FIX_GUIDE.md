# 🔧 数据库问题修复指南

## 📋 问题描述

**错误信息**: `Unknown column 'data_type' in 'INSERT INTO'`

**问题原因**: `user_game_data` 表中缺少 `data_type` 字段，导致后端代码无法正常插入数据。

**影响范围**: 用户登录、数据同步、金币显示等功能。

## 🚀 快速修复方案

### 方案一：使用自动化修复脚本（推荐）

```bash
# 1. 上传修复脚本到服务器
scp fix-database-issue.sh user@your-server:/path/to/backend/

# 2. 登录服务器
ssh user@your-server

# 3. 进入目录
cd /path/to/backend

# 4. 执行修复脚本
./fix-database-issue.sh
```

### 方案二：手动执行SQL修复

```bash
# 1. 登录MySQL
mysql -u root -p

# 2. 选择数据库
USE game_db;

# 3. 添加缺失字段
ALTER TABLE user_game_data 
ADD COLUMN data_type ENUM('string', 'number', 'boolean', 'json') 
DEFAULT 'string' 
COMMENT '数据类型' 
AFTER data_value;

# 4. 更新现有数据
UPDATE user_game_data 
SET data_type = CASE 
    WHEN data_value REGEXP '^[0-9]+$' THEN 'number'
    WHEN data_value IN ('true', 'false') THEN 'boolean'
    WHEN data_value LIKE '{%' OR data_value LIKE '[%' THEN 'json'
    ELSE 'string'
END 
WHERE data_type IS NULL OR data_type = 'string';

# 5. 验证修复结果
DESCRIBE user_game_data;
```

### 方案三：使用SQL脚本文件

```bash
# 1. 上传SQL脚本
scp fix-user-game-data-table.sql user@your-server:/path/to/backend/

# 2. 执行SQL脚本
mysql -u root -p < fix-user-game-data-table.sql
```

## 🔍 问题诊断

### 检查当前表结构

```sql
-- 查看当前表结构
DESCRIBE user_game_data;

-- 查看是否有 data_type 字段
SHOW COLUMNS FROM user_game_data LIKE 'data_type';
```

### 检查后端日志

```bash
# 查看后端服务日志
pm2 logs boop-backend

# 查看最近的错误
pm2 logs boop-backend --lines 50
```

### 测试数据插入

```sql
-- 测试插入数据
INSERT INTO user_game_data (user_id, data_key, data_value, data_type) 
VALUES ('test001', 'TestKey', 'TestValue', 'string')
ON DUPLICATE KEY UPDATE 
    data_value = VALUES(data_value),
    data_type = VALUES(data_type),
    updated_at = CURRENT_TIMESTAMP;
```

## ✅ 修复验证

### 1. 验证表结构

```sql
-- 检查表结构是否完整
DESCRIBE user_game_data;

-- 应该看到以下字段：
-- id, user_id, data_key, data_value, data_type, created_at, updated_at
```

### 2. 验证数据完整性

```sql
-- 检查数据类型是否正确
SELECT data_key, data_value, data_type 
FROM user_game_data 
LIMIT 10;
```

### 3. 验证API功能

```bash
# 测试用户登录
curl -X POST http://119.91.142.92:3000/admin/api/login \
  -H "Content-Type: application/json" \
  -d '{"pid":"test001","password":"123456"}'

# 测试数据同步
curl -X POST http://119.91.142.92:3000/api/user/sync-data \
  -H "Content-Type: application/json" \
  -d '{"userId":"test001","data":[{"key":"Gold","value":"600","type":"number"}]}'
```

## 🔄 重启服务

修复完成后，需要重启后端服务：

```bash
# 重启PM2服务
pm2 restart boop-backend

# 检查服务状态
pm2 list

# 查看启动日志
pm2 logs boop-backend --lines 20
```

## 📊 预期结果

### 修复前的问题
```
❌ 错误: Unknown column 'data_type' in 'INSERT INTO'
❌ 用户登录失败
❌ 数据同步失败
❌ 金币显示异常
```

### 修复后的状态
```
✅ 表结构完整
✅ 数据插入正常
✅ 用户登录成功
✅ 数据同步正常
✅ 金币显示正确
```

## 🛡️ 预防措施

### 1. 数据库备份

```bash
# 定期备份数据库
mysqldump -ugameuser -p123456 game_db > backup_$(date +%Y%m%d).sql
```

### 2. 表结构检查

```sql
-- 定期检查表结构
SHOW CREATE TABLE user_game_data;
```

### 3. 监控日志

```bash
# 监控后端日志
pm2 logs boop-backend --lines 100 | grep -i error
```

## 🔧 故障排除

### 如果修复脚本失败

1. **权限问题**
   ```bash
   # 使用root用户执行
   mysql -u root -p -e "USE game_db; ALTER TABLE user_game_data ADD COLUMN data_type ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string' COMMENT '数据类型' AFTER data_value;"
   ```

2. **连接问题**
   ```bash
   # 检查MySQL服务状态
   systemctl status mysql
   
   # 重启MySQL服务
   systemctl restart mysql
   ```

3. **表锁定问题**
   ```sql
   -- 检查表状态
   SHOW TABLE STATUS LIKE 'user_game_data';
   
   -- 修复表
   REPAIR TABLE user_game_data;
   ```

### 如果仍有错误

1. **检查后端代码**
   ```bash
   # 查看userDataService.js文件
   cat src/services/userDataService.js
   ```

2. **检查数据库连接配置**
   ```bash
   # 查看配置文件
   cat config.env
   ```

3. **重新部署完整数据库**
   ```bash
   # 使用完整备份重新创建
   ./deploy-complete-database.sh
   ```

## 📞 技术支持

如果问题仍未解决，请提供以下信息：

1. **错误日志**: `pm2 logs boop-backend`
2. **表结构**: `DESCRIBE user_game_data;`
3. **数据库版本**: `SELECT VERSION();`
4. **修复脚本输出**: 完整的修复过程日志

---

**注意**: 修复过程中会自动备份现有数据，但建议在修复前手动备份重要数据。 