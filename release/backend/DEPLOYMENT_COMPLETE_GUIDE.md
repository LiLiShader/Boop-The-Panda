# Boop-The-Panda 后端服务完整部署指南

## 📋 目录
1. [系统概述](#系统概述)
2. [环境要求](#环境要求)
3. [数据库配置](#数据库配置)
4. [后端服务部署](#后端服务部署)
5. [运维后台配置](#运维后台配置)
6. [功能说明](#功能说明)
7. [API接口文档](#api接口文档)
8. [故障排除](#故障排除)
9. [维护指南](#维护指南)

---

## 🎯 系统概述

本次更新新增了以下核心功能：
- **统一数据存储系统**：游戏数据同步到数据库
- **管理员登录系统**：运维后台安全访问
- **全局支付模式控制**：2D/3D支付模式切换
- **订单管理系统**：完整的支付订单查询和管理

### 系统架构
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   游戏前端      │    │   运维后台      │    │   后端服务      │
│   (Cocos)       │    │   (Web)         │    │   (Node.js)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   MySQL数据库   │
                    └─────────────────┘
```

---

## 🔧 环境要求

### 服务器环境
- **操作系统**: Linux (推荐 CentOS 7+ 或 Ubuntu 18+)
- **Node.js**: v16.0.0 或更高版本
- **MySQL**: 5.7 或更高版本 (推荐 MariaDB 10.3+)
- **内存**: 最少 2GB RAM
- **存储**: 最少 10GB 可用空间

### 网络要求
- **端口**: 3000 (后端API), 3001 (运维后台)
- **防火墙**: 开放 3000, 3001, 3306 端口

---

## 🗄️ 数据库配置

### 1. 数据库初始化

```bash
# 登录MySQL
mysql -u root -p

# 创建数据库和用户
CREATE DATABASE game_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'gameuser'@'localhost' IDENTIFIED BY '123456';
GRANT ALL PRIVILEGES ON game_db.* TO 'gameuser'@'localhost';
FLUSH PRIVILEGES;
```

### 2. 数据库表结构

#### 核心表结构

**users表** (用户基础信息)
```sql
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
    last_sync_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '最后同步时间'
);
```

**user_game_data表** (游戏数据)
```sql
CREATE TABLE user_game_data (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL COMMENT '用户ID',
    data_key VARCHAR(100) NOT NULL COMMENT '数据键',
    data_value TEXT COMMENT '数据值',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_data (user_id, data_key),
    FOREIGN KEY (user_id) REFERENCES users(pid) ON DELETE CASCADE
);
```

**global_config表** (全局配置)
```sql
CREATE TABLE global_config (
    id INT AUTO_INCREMENT PRIMARY KEY,
    config_key VARCHAR(100) UNIQUE NOT NULL COMMENT '配置键',
    config_value TEXT NOT NULL COMMENT '配置值',
    description VARCHAR(255) COMMENT '配置描述',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

**payment_records表** (支付记录)
```sql
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
    FOREIGN KEY (user_id) REFERENCES users(pid) ON DELETE CASCADE
);
```

### 3. 初始化数据

```sql
-- 插入管理员账号
INSERT INTO users (pid, name, password, level, gold, icon, created_at, updated_at, last_sync_time) 
VALUES ('admin001', 'administrators', 'admin123456', 99, 0, 1, NOW(), NOW(), NOW()) 
ON DUPLICATE KEY UPDATE 
    password = VALUES(password),
    level = VALUES(level),
    updated_at = NOW();

-- 插入全局配置
INSERT INTO global_config (config_key, config_value, description) VALUES
('payment_mode', '2D', '支付模式：2D或3D'),
('game_version', '1.0.0', '游戏版本号'),
('maintenance_mode', 'false', '维护模式：true或false'),
('max_retry_count', '3', '最大重试次数')
ON DUPLICATE KEY UPDATE 
    config_value = VALUES(config_value),
    description = VALUES(description),
    updated_at = NOW();
```

---

## 🚀 后端服务部署

### 1. 文件结构
```
release/backend/
├── server.js                 # 主服务器文件
├── config.env               # 环境配置文件
├── package.json             # 依赖配置
├── src/
│   ├── config/
│   │   ├── database.js      # 数据库配置
│   │   └── paymentConfig.js # 支付配置
│   ├── routes/
│   │   ├── adminRoutes.js   # 管理员路由
│   │   ├── userDataRoutes.js # 用户数据路由
│   │   ├── configRoutes.js  # 配置管理路由
│   │   └── paymentRoutes.js # 支付路由
│   ├── services/
│   │   ├── userDataService.js # 用户数据服务
│   │   └── configService.js # 配置服务
│   └── controllers/
│       ├── userDataController.js # 用户数据控制器
│       └── configController.js # 配置控制器
└── deploy-*.sh              # 部署脚本
```

### 2. 环境配置

**config.env** 文件配置：
```env
PORT=3000
ADMIN_PORT=3001
PAY_PROXY_PORT=5000
CALLBACK_PORT=5001
DB_HOST=127.0.0.1
DB_USER=gameuser
DB_PASSWORD=123456
DB_NAME=game_db
DB_PORT=3306
PAY_API_URL=https://testurl.carespay.com:28081/carespay/pay
BASE_URL=http://your-server-ip
```

### 3. 部署步骤

```bash
# 1. 上传文件到服务器
scp -r release/backend/* user@your-server:/path/to/backend/

# 2. 安装依赖
cd /path/to/backend
npm install

# 3. 配置环境变量
cp config.env.example config.env
# 编辑 config.env 文件，填入正确的配置

# 4. 初始化数据库
mysql -h127.0.0.1 -P3306 -ugameuser -p123456 game_db < database-migration.sql

# 5. 启动服务
pm2 start server.js --name boop-backend
pm2 save
pm2 startup
```

### 4. 服务管理

```bash
# 启动服务
pm2 start boop-backend

# 停止服务
pm2 stop boop-backend

# 重启服务
pm2 restart boop-backend

# 查看日志
pm2 logs boop-backend

# 查看状态
pm2 status
```

---

## 🖥️ 运维后台配置

### 1. 运维后台部署

**文件结构**：
```
admin-frontend/
├── index.html          # 主页面
├── styles.css          # 样式文件
├── script.js           # 功能脚本
└── README.md           # 说明文档
```

**部署步骤**：
```bash
# 1. 上传运维后台文件
scp -r admin-frontend/* user@your-server:/var/www/html/admin/

# 2. 配置Web服务器 (Nginx示例)
server {
    listen 3001;
    server_name your-server-ip;
    root /var/www/html/admin;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # 代理API请求到后端
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 2. 访问信息

- **运维后台地址**: `http://your-server-ip:3001`
- **管理员账号**: `admin001`
- **管理员密码**: `admin123456`

### 3. 安全配置

```bash
# 修改默认密码
mysql -h127.0.0.1 -P3306 -ugameuser -p123456 game_db -e "
UPDATE users SET password = 'your-new-password' WHERE name = 'administrators';
"
```

---

## ⚙️ 功能说明

### 1. 统一数据存储系统

**功能描述**: 游戏数据自动同步到数据库，确保数据安全性和一致性。

**核心特性**:
- 自动数据同步
- 离线数据缓存
- 冲突解决机制
- 实时数据更新

**数据同步流程**:
1. 游戏启动时从数据库加载用户数据
2. 本地数据变更时自动同步到服务器
3. 网络异常时本地缓存，网络恢复后同步
4. 支持批量数据同步

### 2. 管理员登录系统

**功能描述**: 运维后台安全访问控制，基于数据库用户表的管理员认证。

**安全特性**:
- 基于数据库的用户认证
- 管理员权限控制 (level >= 99)
- 会话管理
- 安全退出机制

**登录流程**:
1. 验证用户ID和密码
2. 检查用户类型 (name = 'administrators')
3. 验证管理员权限 (level >= 99)
4. 创建会话并跳转到管理界面

### 3. 全局支付模式控制

**功能描述**: 通过运维后台统一控制所有用户的支付模式 (2D/3D)。

**控制特性**:
- 实时模式切换
- 全局生效
- 无缓存机制
- 操作日志记录

**支付模式说明**:
- **2D模式**: 标准支付流程，适用于大多数用户
- **3D模式**: 3D Secure验证，提供更高安全性

**切换流程**:
1. 管理员在运维后台选择支付模式
2. 系统立即更新数据库配置
3. 游戏前端实时获取最新模式
4. 所有新支付请求使用新模式

### 4. 订单管理系统

**功能描述**: 完整的支付订单查询、统计和管理功能。

**查询功能**:
- 按用户ID查询
- 按订单号查询
- 按时间范围查询
- 查询所有订单
- 导出Excel功能

**订单信息**:
- 用户信息 (ID, 姓名)
- 订单详情 (订单号, 金额, 时间)
- 商品信息 (商品ID, 商品名称, 商品详情)
- 支付状态和响应数据

---

## 📡 API接口文档

### 1. 管理员接口

#### 管理员登录
```
POST /admin/api/admin/login
Content-Type: application/json

{
    "pid": "admin001",
    "password": "admin123456"
}

Response:
{
    "success": true,
    "message": "管理员登录成功",
    "data": {
        "id": 35,
        "pid": "admin001",
        "name": "administrators",
        "level": 99,
        "isAdmin": true,
        "loginTime": "2025-08-01T05:08:18.468Z"
    }
}
```

#### 获取所有用户
```
GET /admin/api/users

Response:
{
    "success": true,
    "data": [
        {
            "id": 1,
            "pid": "user123",
            "name": "用户名",
            "level": 1,
            "gold": 500,
            "created_at": "2025-08-01T00:00:00.000Z"
        }
    ]
}
```

#### 获取用户支付记录
```
GET /admin/api/payments/user/{userId}

Response:
{
    "success": true,
    "data": [
        {
            "id": 1,
            "user_id": "user123",
            "amount": "8.00",
            "order_no": "1002043438704951",
            "pay_time": "2025-08-01T04:14:34.000Z",
            "product_info": "钻石礼包-12钻石"
        }
    ]
}
```

#### 获取所有支付记录
```
GET /admin/api/payments

Response:
{
    "success": true,
    "data": [
        // 支付记录数组
    ]
}
```

### 2. 配置管理接口

#### 获取支付模式
```
GET /api/config/payment/mode

Response:
{
    "success": true,
    "message": "获取支付模式成功",
    "data": {
        "mode": "2D"
    }
}
```

#### 设置支付模式
```
POST /api/config/payment/mode
Content-Type: application/json

{
    "mode": "3D"
}

Response:
{
    "success": true,
    "message": "支付模式已设置为3D",
    "data": {
        "mode": "3D"
    }
}
```

#### 获取所有配置
```
GET /api/config/all

Response:
{
    "success": true,
    "data": [
        {
            "config_key": "payment_mode",
            "config_value": "2D",
            "description": "支付模式：2D或3D"
        }
    ]
}
```

### 3. 用户数据接口

#### 同步用户数据
```
POST /api/user/sync-data
Content-Type: application/json

{
    "userId": "user123",
    "data": {
        "Gold": 1000,
        "Level": 5,
        "Heart": 3
    }
}

Response:
{
    "success": true,
    "message": "数据同步成功"
}
```

#### 获取用户数据
```
GET /api/user/get-game-data?userId=user123

Response:
{
    "success": true,
    "data": {
        "Gold": 1000,
        "Level": 5,
        "Heart": 3
    }
}
```

#### 初始化用户数据
```
POST /api/user/init-game-data
Content-Type: application/json

{
    "userId": "user123",
    "data": {
        "Gold": 500,
        "Level": 1,
        "Heart": 5
    }
}

Response:
{
    "success": true,
    "message": "用户数据初始化成功"
}
```

### 4. 支付接口

#### 支付代理
```
POST /api/payment/pay
Content-Type: application/json

{
    "userId": "user123",
    "amount": 8.00,
    "productId": "itemBtn1"
}

Response:
{
    "success": true,
    "data": {
        "orderNo": "1002043438704951",
        "payUrl": "https://payment-gateway.com/pay"
    }
}
```

#### 查询支付状态
```
GET /api/payment/status/{billNo}

Response:
{
    "success": true,
    "data": {
        "status": "SUCCESS",
        "orderNo": "1002043438704951"
    }
}
```

---

## 🔧 故障排除

### 1. 常见问题

#### 数据库连接失败
```bash
# 检查MySQL服务状态
systemctl status mysql

# 检查数据库连接
mysql -h127.0.0.1 -P3306 -ugameuser -p123456 -e "SELECT 1;"

# 检查配置文件
cat config.env
```

#### 后端服务启动失败
```bash
# 查看服务日志
pm2 logs boop-backend

# 检查端口占用
netstat -tlnp | grep 3000

# 检查环境变量
node -e "console.log(process.env)"
```

#### 运维后台无法访问
```bash
# 检查Web服务器状态
systemctl status nginx

# 检查端口监听
netstat -tlnp | grep 3001

# 检查防火墙
firewall-cmd --list-ports
```

### 2. 日志分析

#### 后端日志位置
```bash
# PM2日志
pm2 logs boop-backend

# 应用日志
tail -f logs/app.log

# 错误日志
tail -f logs/error.log
```

#### 数据库日志
```bash
# MySQL错误日志
tail -f /var/log/mysql/error.log

# 慢查询日志
tail -f /var/log/mysql/slow.log
```

### 3. 性能优化

#### 数据库优化
```sql
-- 添加索引
CREATE INDEX idx_user_id ON user_game_data(user_id);
CREATE INDEX idx_payment_time ON payment_records(pay_time);
CREATE INDEX idx_order_no ON payment_records(order_no);

-- 优化查询
EXPLAIN SELECT * FROM payment_records WHERE user_id = 'user123';
```

#### 应用优化
```bash
# 增加PM2实例数
pm2 start server.js --name boop-backend -i max

# 监控内存使用
pm2 monit
```

---

## 🛠️ 维护指南

### 1. 日常维护

#### 数据库备份
```bash
# 创建备份脚本
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mysqldump -h127.0.0.1 -P3306 -ugameuser -p123456 game_db > backup_${DATE}.sql

# 添加到定时任务
crontab -e
# 每天凌晨2点备份
0 2 * * * /path/to/backup.sh
```

#### 日志清理
```bash
# 清理旧日志
find /path/to/logs -name "*.log" -mtime +30 -delete

# 清理PM2日志
pm2 flush
```

#### 监控检查
```bash
# 检查服务状态
pm2 status

# 检查数据库连接
mysql -h127.0.0.1 -P3306 -ugameuser -p123456 -e "SELECT COUNT(*) FROM users;"

# 检查磁盘空间
df -h
```

### 2. 更新部署

#### 代码更新
```bash
# 备份当前版本
cp -r /path/to/backend /path/to/backend_backup_$(date +%Y%m%d)

# 更新代码
git pull origin main

# 安装新依赖
npm install

# 重启服务
pm2 restart boop-backend
```

#### 数据库迁移
```bash
# 备份数据库
mysqldump -h127.0.0.1 -P3306 -ugameuser -p123456 game_db > migration_backup.sql

# 执行迁移脚本
mysql -h127.0.0.1 -P3306 -ugameuser -p123456 game_db < migration.sql
```

### 3. 安全维护

#### 密码更新
```bash
# 更新管理员密码
mysql -h127.0.0.1 -P3306 -ugameuser -p123456 game_db -e "
UPDATE users SET password = 'new-password' WHERE name = 'administrators';
"

# 更新数据库用户密码
mysql -u root -p -e "
ALTER USER 'gameuser'@'localhost' IDENTIFIED BY 'new-password';
FLUSH PRIVILEGES;
"
```

#### 访问控制
```bash
# 限制数据库访问
mysql -u root -p -e "
REVOKE ALL PRIVILEGES ON game_db.* FROM 'gameuser'@'%';
GRANT ALL PRIVILEGES ON game_db.* TO 'gameuser'@'localhost';
FLUSH PRIVILEGES;
"
```

---

## 📞 技术支持

### 联系信息
- **技术支持**: 请联系开发团队
- **紧急联系**: 系统管理员
- **文档更新**: 定期检查最新版本

### 重要提醒
1. **定期备份**: 建议每天备份数据库
2. **监控告警**: 设置服务监控和告警
3. **安全更新**: 定期更新系统和依赖包
4. **性能监控**: 监控系统性能和资源使用

---

## 📝 更新日志

### v1.0.0 (2025-08-01)
- ✅ 新增统一数据存储系统
- ✅ 新增管理员登录功能
- ✅ 新增全局支付模式控制
- ✅ 新增订单管理系统
- ✅ 新增运维后台界面
- ✅ 完善API接口文档
- ✅ 优化数据库结构
- ✅ 增强安全机制

---

**文档版本**: v1.0.0  
**最后更新**: 2025-08-01  
**维护人员**: 开发团队 