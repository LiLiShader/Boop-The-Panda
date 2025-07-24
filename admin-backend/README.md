# 游戏账号系统后端

## 项目简介
这是一个简单的游戏账号系统后端，提供用户注册、登录、信息管理以及支付记录管理等功能。

## 功能特性
- 用户注册
- 用户登录
- 用户信息查询
- 用户信息更新
- 用户列表查询（分页、搜索）
- 支付记录存储
- 支付记录查询
- 健康检查

## 技术栈
- Node.js
- Express.js
- MySQL
- CORS

## 部署步骤

### 1. 服务器环境准备
```bash
# 更新系统
sudo yum update -y

# 安装 Node.js
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# 安装 MariaDB (MySQL替代品)
sudo yum install -y mariadb-server
sudo systemctl start mariadb
sudo systemctl enable mariadb

# 配置 MariaDB 安全设置
sudo mysql_secure_installation
```

### 2. 数据库配置
```bash
# 登录 MariaDB
sudo mysql -u root -p

# 创建数据库
CREATE DATABASE game_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# 创建用户（可选）
CREATE USER 'gameuser'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON game_db.* TO 'gameuser'@'localhost';
FLUSH PRIVILEGES;

# 退出 MariaDB
EXIT;
```

### 3. 项目部署
```bash
# 创建项目目录
mkdir -p /root/admin
cd /root/admin

# 上传项目文件到此目录

# 安装依赖
npm install

# 配置环境变量
cp config.env .env
# 编辑 .env 文件，修改数据库配置
nano .env
```

### 4. 配置环境变量
编辑 `.env` 文件：
```env
PORT=3001
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=game_db
DB_PORT=3306
NODE_ENV=production
```

### 5. 使用 PM2 管理进程
```bash
# 安装 PM2
sudo npm install -g pm2

# 启动应用
pm2 start server.js --name "game-acc"

# 设置开机自启
pm2 startup
pm2 save

# 查看运行状态
pm2 status
pm2 logs game-acc
```

### 6. 防火墙配置
```bash
# 开放端口
sudo firewall-cmd --permanent --add-port=3001/tcp
sudo firewall-cmd --reload

# 查看开放的端口
sudo firewall-cmd --list-all
```

## API 接口文档

### 注册用户
```
POST /api/auth/register
Content-Type: application/json

{
    "pid": "player123",
    "name": "Happy Barry",
    "password": "123456"
}
```

### 用户登录
```
POST /api/auth/login
Content-Type: application/json

{
    "pid": "player123",
    "password": "123456"
}
```

### 获取用户信息
```
GET /api/users/:pid
```

### 更新用户信息
```
PUT /api/users/:pid
Content-Type: application/json

{
    "level": 10,
    "gold": 1000,
    "icon": "2"
}
```

### 获取用户列表
```
GET /api/users?page=1&limit=20&search=player
```

### 记录支付信息
```
POST /api/payments/record
Content-Type: application/json

{
    "user_id": "player123",
    "user_name": "Happy Barry",
    "amount": 100.00,
    "order_no": "ORDER12345678",
    "pay_time": "2024-07-21 12:00:00",
    "raw_response": {"code":"P0001","message":"success"},
    "product_id": "itemBtn5",
    "product_info": "钻石礼包-180钻石",
    "product_details": {
        "diamonds": 180,
        "isFirstCharge": false
    }
}
```

### 获取用户支付记录
```
GET /api/payments/user/:user_id
```

### 获取所有支付记录
```
GET /api/payments/all
```

### 健康检查
```
GET /api/health
```

## 数据库表结构

### users 表
```sql
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pid VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    password VARCHAR(100) NOT NULL,
    level INT DEFAULT 1,
    gold INT DEFAULT 500,
    icon VARCHAR(100) DEFAULT '1',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### payment_records 表
```sql
CREATE TABLE IF NOT EXISTS payment_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    user_name VARCHAR(100) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    order_no VARCHAR(100) NOT NULL UNIQUE,
    pay_time DATETIME NOT NULL,
    raw_response JSON DEFAULT NULL,
    product_id VARCHAR(20) DEFAULT NULL COMMENT '商品ID',
    product_info TEXT DEFAULT NULL COMMENT '商品信息',
    product_details JSON DEFAULT NULL COMMENT '商品详细信息',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_order_no (order_no)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

## 常用命令

```bash
# 查看应用状态
pm2 status

# 查看日志
pm2 logs game-acc

# 重启应用
pm2 restart game-acc

# 停止应用
pm2 stop game-acc

# 删除应用
pm2 delete game-acc
```

## 故障排除

### 1. 数据库连接失败
- 检查 MariaDB 服务是否运行：`sudo systemctl status mariadb`
- 检查数据库配置是否正确
- 检查防火墙设置

### 2. 端口被占用
- 检查端口占用：`sudo netstat -tlnp | grep 3001`

### 3. 支付记录上传失败
- 检查数据格式是否正确，特别是 `pay_time` 字段必须是 `YYYY-MM-DD HH:MM:SS` 格式
- 检查 `order_no` 是否重复（该字段有唯一约束）
- 检查 `product_details` 字段是否为有效的 JSON 对象 