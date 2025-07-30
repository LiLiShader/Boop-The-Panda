# 数据库设置指南

## 问题描述

甲方反馈数据无法进入数据库，错误信息：
```
Access denied for user 'root'@'localhost' (using password: YES)
```

## 解决步骤

### 1. 检查数据库服务状态

```bash
# 检查MySQL/MariaDB服务状态
systemctl status mysql
# 或者
systemctl status mariadb

# 如果服务未启动，启动服务
sudo systemctl start mysql
# 或者
sudo systemctl start mariadb
```

### 2. 设置数据库密码

#### 方法一：使用mysql_secure_installation
```bash
sudo mysql_secure_installation
```
按照提示设置root密码。

#### 方法二：直接设置密码
```bash
# 登录MySQL
sudo mysql

# 设置root密码
ALTER USER 'root'@'localhost' IDENTIFIED BY 'your_new_password';
FLUSH PRIVILEGES;
EXIT;
```

### 3. 创建数据库和用户

```bash
# 登录MySQL
mysql -u root -p

# 创建数据库
CREATE DATABASE IF NOT EXISTS game_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# 创建专用用户（推荐）
CREATE USER 'game_user'@'localhost' IDENTIFIED BY 'game_password';
GRANT ALL PRIVILEGES ON game_db.* TO 'game_user'@'localhost';
FLUSH PRIVILEGES;

# 验证数据库
SHOW DATABASES;
USE game_db;
SHOW TABLES;
```

### 4. 修改配置文件

编辑 `admin-backend/config.env` 文件：

```bash
cd admin-backend
nano config.env
```

修改以下内容：
```env
# 服务器配置
PORT=3001

# 数据库配置
DB_HOST=localhost
DB_USER=root                    # 或者使用 game_user
DB_PASSWORD=your_actual_password # 替换为实际密码
DB_NAME=game_db
DB_PORT=3306

# 其他配置
NODE_ENV=production
```

### 5. 测试数据库连接

```bash
# 测试连接
mysql -u root -p -e "USE game_db; SELECT 1;"

# 或者使用配置文件中的用户
mysql -u game_user -p -e "USE game_db; SELECT 1;"
```

### 6. 重启后端服务

```bash
# 重启PM2服务
pm2 restart game-account-server

# 查看服务状态
pm2 status

# 查看日志
pm2 logs game-account-server
```

## 常见问题解决

### 问题1：Access denied for user 'root'@'localhost'

**解决方案**：
1. 确认MySQL服务已启动
2. 重置root密码：
```bash
sudo mysql
ALTER USER 'root'@'localhost' IDENTIFIED BY 'new_password';
FLUSH PRIVILEGES;
EXIT;
```

### 问题2：数据库不存在

**解决方案**：
```bash
mysql -u root -p
CREATE DATABASE game_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 问题3：表不存在

**解决方案**：
```bash
# 导入数据库结构
mysql -u root -p game_db < setup-db.sql

# 或者导入完整备份
mysql -u root -p game_db < game_db_backup.sql
```

### 问题4：权限不足

**解决方案**：
```bash
mysql -u root -p
GRANT ALL PRIVILEGES ON game_db.* TO 'root'@'localhost';
FLUSH PRIVILEGES;
```

## 验证步骤

### 1. 检查数据库连接
```bash
# 测试连接
mysql -u root -p -e "SHOW DATABASES;"
```

### 2. 检查表结构
```bash
mysql -u root -p -e "USE game_db; SHOW TABLES;"
```

### 3. 测试API接口
```bash
# 测试健康检查接口
curl http://localhost:3001/api/health

# 测试注册接口
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"pid":"test123","name":"testuser","password":"testpass"}'
```

### 4. 检查服务日志
```bash
pm2 logs game-account-server --lines 50
```

## 安全建议

1. **使用专用用户**：不要使用root用户，创建专用的数据库用户
2. **强密码**：使用复杂的密码
3. **限制权限**：只授予必要的数据库权限
4. **定期备份**：定期备份数据库

## 完整设置脚本

创建 `setup-database.sh` 脚本：

```bash
#!/bin/bash

echo "开始设置数据库..."

# 1. 检查MySQL服务
if ! systemctl is-active --quiet mysql; then
    echo "启动MySQL服务..."
    sudo systemctl start mysql
fi

# 2. 设置root密码（如果需要）
read -p "是否需要设置root密码？(y/n): " set_password
if [ "$set_password" = "y" ]; then
    sudo mysql_secure_installation
fi

# 3. 创建数据库
echo "创建数据库..."
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS game_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 4. 导入数据
echo "导入数据库结构..."
mysql -u root -p game_db < setup-db.sql

echo "数据库设置完成！"
```

## 联系支持

如果问题仍然存在，请提供以下信息：
1. MySQL/MariaDB版本
2. 操作系统版本
3. 完整的错误日志
4. 配置文件内容（隐藏密码）

## 总结

主要问题是数据库密码配置错误。按照以上步骤：
1. ✅ 设置正确的数据库密码
2. ✅ 修改配置文件
3. ✅ 重启后端服务
4. ✅ 验证连接

完成后，数据应该能够正常进入数据库。 