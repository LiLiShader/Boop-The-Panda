# 游戏账号系统后端

## 项目简介
这是一个简单的游戏账号系统后端，提供用户注册、登录、信息管理等功能。

## 功能特性
- 用户注册
- 用户登录
- 用户信息查询
- 用户信息更新
- 用户列表查询（分页、搜索）
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
sudo apt update && sudo apt upgrade -y

# 安装 Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 安装 MySQL
sudo apt install mysql-server -y

# 启动 MySQL 服务
sudo systemctl start mysql
sudo systemctl enable mysql

# 配置 MySQL 安全设置
sudo mysql_secure_installation
```

### 2. 数据库配置
```bash
# 登录 MySQL
sudo mysql -u root -p

# 创建数据库
CREATE DATABASE game_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# 创建用户（可选）
CREATE USER 'gameuser'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON game_db.* TO 'gameuser'@'localhost';
FLUSH PRIVILEGES;

# 退出 MySQL
EXIT;
```

### 3. 项目部署
```bash
# 创建项目目录
mkdir -p /var/www/admin-backend
cd /var/www/admin-backend

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
pm2 start server.js --name "game-account-server"

# 设置开机自启
pm2 startup
pm2 save

# 查看运行状态
pm2 status
pm2 logs game-account-server
```

### 6. 配置 Nginx 反向代理（可选）
```bash
# 安装 Nginx
sudo apt install nginx -y

# 创建 Nginx 配置
sudo nano /etc/nginx/sites-available/game-account
```

Nginx 配置内容：
```nginx
server {
    listen 80;
    server_name your_domain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# 启用站点
sudo ln -s /etc/nginx/sites-available/game-account /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 7. 防火墙配置
```bash
# 开放端口
sudo ufw allow 3001
sudo ufw allow 80
sudo ufw allow 443

# 启用防火墙
sudo ufw enable
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

### 健康检查
```
GET /api/health
```

## 常用命令

```bash
# 查看应用状态
pm2 status

# 查看日志
pm2 logs game-account-server

# 重启应用
pm2 restart game-account-server

# 停止应用
pm2 stop game-account-server

# 删除应用
pm2 delete game-account-server
```

## 故障排除

### 1. 数据库连接失败
- 检查 MySQL 服务是否运行：`sudo systemctl status mysql`
- 检查数据库配置是否正确
- 检查防火墙设置

### 2. 端口被占用
- 检查端口占用：`sudo netstat -tlnp | grep 3001`
- 修改端口配置或停止占用端口的进程

### 3. 权限问题
- 确保项目目录权限正确：`sudo chown -R $USER:$USER /var/www/admin-backend`
- 检查文件权限：`chmod +x server.js`

## 联系信息
如有问题，请联系开发团队。 