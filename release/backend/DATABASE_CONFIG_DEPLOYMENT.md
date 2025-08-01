# 全局配置表部署指南

## 概述
本文档介绍如何部署全局配置表，用于管理支付模式等全局设置。

## 文件说明
- `database/global_config.sql` - 数据库表结构和初始数据
- `deploy-config-db.sh` - 自动部署脚本
- `check-mysql-status.sh` - MySQL状态检查脚本
- `test-config-db.js` - 数据库设计验证脚本

## 部署步骤

### 1. 检查MySQL状态
```bash
# 运行状态检查脚本
./check-mysql-status.sh
```

### 2. 自动部署（推荐）
```bash
# 运行自动部署脚本
./deploy-config-db.sh
```

### 3. 手动部署（如果自动部署失败）
```bash
# 方法1：使用mysql命令行
mysql -h[主机] -P[端口] -u[用户] -p[密码] [数据库名] < database/global_config.sql

# 方法2：登录MySQL后执行
mysql -h[主机] -P[端口] -u[用户] -p[密码] [数据库名]
source database/global_config.sql;
```

### 4. 验证部署
```bash
# 运行验证脚本
node test-config-db.js
```

## 常见问题解决

### 问题1：MySQL连接失败
**错误信息：** `错误:无法连接到MySQL数据库`

**解决方案：**
1. 检查MySQL服务是否运行：
   ```bash
   systemctl status mysql
   # 或
   systemctl status mysqld
   ```

2. 启动MySQL服务：
   ```bash
   systemctl start mysql
   # 或
   systemctl start mysqld
   ```

3. 检查端口监听：
   ```bash
   netstat -tlnp | grep 3306
   ```

### 问题2：配置文件不存在
**错误信息：** `config.env文件不存在`

**解决方案：**
1. 确保 `config.env` 文件存在
2. 检查文件内容是否包含必要的数据库配置：
   ```
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=your_username
   DB_PASSWORD=your_password
   DB_NAME=your_database
   ```

### 问题3：权限不足
**错误信息：** `Access denied for user`

**解决方案：**
1. 检查数据库用户权限：
   ```sql
   SHOW GRANTS FOR 'your_username'@'your_host';
   ```

2. 授予必要权限：
   ```sql
   GRANT ALL PRIVILEGES ON your_database.* TO 'your_username'@'your_host';
   FLUSH PRIVILEGES;
   ```

### 问题4：数据库不存在
**错误信息：** `Unknown database`

**解决方案：**
1. 创建数据库：
   ```sql
   CREATE DATABASE your_database CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

## 表结构说明

### global_config 表
| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | INT | 主键，自增 |
| config_key | VARCHAR(50) | 配置键名，唯一 |
| config_value | TEXT | 配置值 |
| description | VARCHAR(255) | 配置描述 |
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 更新时间 |

### 初始配置
- `payment_mode`: "2D" - 支付模式（2D或3D）
- `maintenance_mode`: "false" - 维护模式
- `game_version`: "1.0.0" - 游戏版本
- `max_retry_count`: "3" - 最大重试次数

## 验证部署成功

部署成功后，您应该看到：
1. ✅ 表创建成功
2. ✅ 初始数据插入成功
3. ✅ 索引创建成功
4. ✅ 支付模式切换测试通过

## 下一步
部署完成后，可以继续：
1. 实现后端API
2. 修改前端游戏逻辑
3. 实现运维后台管理界面 