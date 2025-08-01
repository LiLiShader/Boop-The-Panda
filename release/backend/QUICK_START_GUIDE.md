# 🚀 快速开始指南

## 📋 概述

根据服务器交接同事的建议，我们提供了一个完整的数据库备份文件，避免手动添加字段和建表时出现错误。

## 📁 文件说明

### 核心文件
- **`complete_database_backup.sql`** - 完整的数据库备份文件
- **`deploy-complete-database.sh`** - 一键部署脚本
- **`DEPLOYMENT_COMPLETE_GUIDE.md`** - 详细部署指南

## 🎯 快速部署步骤

### 方法一：使用一键部署脚本（推荐）

```bash
# 1. 上传文件到服务器
scp complete_database_backup.sql user@your-server:/path/to/backend/
scp deploy-complete-database.sh user@your-server:/path/to/backend/

# 2. 登录服务器
ssh user@your-server

# 3. 进入目录
cd /path/to/backend

# 4. 执行部署脚本
./deploy-complete-database.sh
```

### 方法二：手动执行SQL文件

```bash
# 1. 登录MySQL
mysql -u root -p

# 2. 执行完整备份文件
source /path/to/complete_database_backup.sql;
```

## ✅ 部署验证

部署完成后，您应该看到以下信息：

### 数据库表结构
- ✅ `users` - 用户基础信息表
- ✅ `user_game_data` - 用户游戏数据表  
- ✅ `global_config` - 全局配置表
- ✅ `payment_records` - 支付记录表
- ✅ `system_logs` - 系统日志表
- ✅ `admin_operation_logs` - 管理员操作日志表

### 初始数据
- ✅ 管理员账号：`admin001` / `admin123456`
- ✅ 测试用户数据：15个测试账号
- ✅ 全局配置：支付模式、游戏版本等
- ✅ 示例支付记录：10条测试记录

### 重要配置
- ✅ 支付模式：`2D`（默认）
- ✅ 数据库用户：`gameuser` / `123456`
- ✅ 字符集：`utf8mb4`

## 🔧 后续配置

### 1. 配置后端服务
```bash
# 编辑配置文件
vim config.env

# 确保数据库配置正确
DB_HOST=127.0.0.1
DB_USER=gameuser
DB_PASSWORD=123456
DB_NAME=game_db
DB_PORT=3306
```

### 2. 启动后端服务
```bash
# 安装依赖
npm install

# 启动服务
pm2 start server.js --name boop-backend
pm2 save
```

### 3. 部署运维后台
```bash
# 上传运维后台文件
scp -r admin-frontend/* user@your-server:/var/www/html/admin/

# 配置Web服务器（Nginx示例）
server {
    listen 3001;
    server_name your-server-ip;
    root /var/www/html/admin;
    index index.html;
    
    location /api/ {
        proxy_pass http://localhost:3000;
    }
}
```

## 🔍 测试验证

### 1. 测试数据库连接
```bash
mysql -ugameuser -p123456 -e "USE game_db; SELECT COUNT(*) FROM users;"
```

### 2. 测试API接口
```bash
# 测试支付模式获取
curl -X GET http://your-server-ip:3000/api/config/payment/mode

# 测试管理员登录
curl -X POST http://your-server-ip:3000/admin/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"pid":"admin001","password":"admin123456"}'
```

### 3. 访问运维后台
- 地址：`http://your-server-ip:3001`
- 账号：`admin001`
- 密码：`admin123456`

## 🛡️ 安全提醒

### 立即修改默认密码
```sql
-- 修改管理员密码
UPDATE users SET password = 'your-new-password' WHERE name = 'administrators';

-- 修改数据库用户密码
ALTER USER 'gameuser'@'localhost' IDENTIFIED BY 'your-new-password';
FLUSH PRIVILEGES;
```

### 定期备份
```bash
# 创建备份脚本
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mysqldump -ugameuser -p123456 game_db > backup_${DATE}.sql

# 添加到定时任务
crontab -e
# 每天凌晨2点备份
0 2 * * * /path/to/backup.sh
```

## 📞 技术支持

如果遇到问题，请检查：

1. **MySQL服务状态**：`systemctl status mysql`
2. **数据库连接**：`mysql -u root -p`
3. **文件权限**：`ls -la *.sql *.sh`
4. **日志信息**：查看部署脚本输出的详细信息

## 📝 更新日志

- **v1.0.0** (2025-08-01)
  - ✅ 创建完整数据库备份文件
  - ✅ 添加一键部署脚本
  - ✅ 包含所有表结构和初始数据
  - ✅ 添加索引、触发器、存储过程
  - ✅ 配置用户权限和安全设置

---

**注意**：此备份文件包含完整的数据库结构，可以直接导入使用，无需手动添加字段或建表。 