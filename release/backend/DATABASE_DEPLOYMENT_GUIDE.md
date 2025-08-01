# 数据库部署指南

## 概述

本指南将帮助您部署游戏数据同步系统的数据库改动。

## 部署前准备

### 1. 检查数据库连接
确保您能够连接到MySQL数据库：
```bash
mysql -h 127.0.0.1 -P 3306 -u gameuser -p123456 -e "USE game_db; SELECT 1;"
```

### 2. 备份现有数据（推荐）
```bash
mysqldump -h 127.0.0.1 -P 3306 -u gameuser -p123456 game_db > backup_$(date +%Y%m%d_%H%M%S).sql
```

## 部署方法

### 方法一：自动部署（推荐）

**步骤：**
1. 将代码部署到服务器
2. 启动后端服务：
   ```bash
   cd release/backend
   npm start
   ```
3. 服务会自动创建所需的表结构

**优点：**
- 简单快捷
- 无需手动执行SQL
- 自动处理错误

### 方法二：手动执行SQL脚本

**步骤：**
1. 连接到数据库：
   ```bash
   mysql -h 127.0.0.1 -P 3306 -u gameuser -p123456 game_db
   ```

2. 执行迁移脚本：
   ```bash
   mysql -h 127.0.0.1 -P 3306 -u gameuser -p123456 game_db < database-migration.sql
   ```

### 方法三：使用部署脚本

**步骤：**
1. 确保脚本有执行权限：
   ```bash
   chmod +x deploy-database.sh
   ```

2. 运行部署脚本：
   ```bash
   ./deploy-database.sh
   ```

## 验证部署

### 1. 检查表结构
```sql
USE game_db;
SHOW TABLES;
DESCRIBE user_game_data;
DESCRIBE users;
```

### 2. 检查索引
```sql
SHOW INDEX FROM user_game_data;
SHOW INDEX FROM users;
```

### 3. 测试API接口
```bash
node test-data-sync.js
```

## 预期结果

部署成功后，您应该看到：

### 1. 新增的表
- `user_game_data` - 用户游戏数据表

### 2. 修改的表
- `users` - 添加了 `last_sync_time` 字段

### 3. 新增的索引
- `idx_user_id` - 用户ID索引
- `idx_data_key` - 数据键索引
- `idx_updated_at` - 更新时间索引
- `unique_user_data` - 用户数据唯一索引

## 故障排除

### 1. 数据库连接失败
- 检查数据库服务是否运行
- 验证用户名和密码
- 确认数据库名称

### 2. 权限错误
- 确保用户有创建表的权限
- 确保用户有修改表结构的权限

### 3. 外键约束错误
- 确保 `users` 表存在
- 检查 `users` 表的 `id` 字段类型

### 4. 字符集错误
- 确保数据库使用 `utf8mb4` 字符集
- 检查表的字符集设置

## 回滚方案

如果需要回滚，可以执行以下SQL：

```sql
-- 删除用户游戏数据表
DROP TABLE IF EXISTS user_game_data;

-- 删除users表的新字段（如果存在）
ALTER TABLE users DROP COLUMN IF EXISTS last_sync_time;
```

## 联系支持

如果遇到问题，请检查：
1. 数据库日志
2. 后端服务日志
3. 网络连接状态

## 下一步

部署完成后：
1. 启动后端服务
2. 测试API接口
3. 验证前端数据同步功能
4. 监控系统运行状态 