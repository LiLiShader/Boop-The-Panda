# 游戏后端服务架构说明

## 概述

本项目包含三个独立的后端服务，分别负责不同的功能模块，共同构成完整的游戏支付和用户管理系统。

## 服务架构图

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   游戏客户端     │    │   第三方支付平台   │    │   数据库服务器    │
│                │    │                │    │                │
│  - 用户注册/登录  │    │  - 支付处理      │    │  - MySQL/MariaDB │
│  - 发起支付      │    │  - 3D验证       │    │  - game_db      │
│  - 查询支付状态   │    │  - 支付回调      │    │                │
│  - 上传支付记录   │    │                │    │                │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   主服务器       │    │   支付代理服务器   │    │   3D支付回调服务器 │
│   Port: 3001    │    │   Port: 5000    │    │   Port: 5001    │
│                │    │                │    │                │
│  - 用户管理      │    │  - 支付请求代理   │    │  - 3D支付回调处理 │
│  - 支付记录管理   │    │  - 支付状态缓存   │    │  - 状态同步      │
│  - 数据存储      │    │  - 状态查询      │    │  - 结果页面      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 服务详情

### 1. 主服务器 (Port: 3001)

**文件位置**: `admin-backend/server.js`  
**PM2进程名**: `game-account-server`  
**功能**: 游戏账号系统和支付记录管理

#### 主要功能
- **用户管理**
  - 用户注册 (`POST /api/auth/register`)
  - 用户登录 (`POST /api/auth/login`)
  - 用户信息查询 (`GET /api/users/:pid`)
  - 用户信息更新 (`PUT /api/users/:pid`)

- **支付记录管理**
  - 上传支付记录 (`POST /api/payments/record`)
  - 查询用户支付记录 (`GET /api/payments/user/:user_id`)
  - 查询所有支付记录 (`GET /api/payments/all`)

- **系统管理**
  - 健康检查 (`GET /api/health`)
  - 用户列表查询 (`GET /api/users`)

#### 数据库表结构
```sql
-- 用户表
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pid VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    password VARCHAR(100) NOT NULL,
    level INT DEFAULT 1,
    gold INT DEFAULT 500,
    icon VARCHAR(100) DEFAULT '1',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 支付记录表
CREATE TABLE payment_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    user_name VARCHAR(100) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    order_no VARCHAR(100) NOT NULL UNIQUE,
    pay_time DATETIME NOT NULL,
    raw_response JSON DEFAULT NULL,
    product_id VARCHAR(20) DEFAULT NULL,
    product_info TEXT DEFAULT NULL,
    product_details JSON DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 2. 支付代理服务器 (Port: 5000)

**文件位置**: `proxy-server/server.js`  
**PM2进程名**: `pay-proxy`  
**功能**: 支付请求代理和3D支付状态管理

#### 主要功能
- **支付请求代理**
  - 转发支付请求到第三方支付平台
  - 处理2D和3D支付请求
  - 管理支付状态缓存

- **支付状态管理**
  - 3D支付状态缓存
  - 支付状态查询 (`GET /api/payment/status/:billNo`)
  - 3D支付回调处理 (`GET /api/get3DResult`)

#### 配置信息
- **第三方支付平台**: `https://testurl.carespay.com:28081/carespay/pay`
- **支付状态缓存**: 内存缓存（生产环境建议使用Redis）
- **支持支付类型**: 2D支付、3D支付

### 3. 3D支付回调服务器 (Port: 5001)

**文件位置**: `proxy-server/3d-callback-server.js`  
**PM2进程名**: `3d-callback-server`  
**功能**: 处理3D支付回调

#### 主要功能
- **3D支付回调处理**
  - 接收第三方支付平台的3D支付回调
  - 通知支付代理服务器更新支付状态
  - 显示支付结果页面

- **状态同步**
  - 与支付代理服务器同步支付状态
  - 提供支付结果反馈

#### 配置信息
- **回调URL**: `http://119.91.142.92:5001/api/get3DResult`
- **主服务器URL**: `http://119.91.142.92:3001`
- **支付代理URL**: `http://119.91.142.92:5000`

## 服务交互流程

### 用户注册/登录流程
```
1. 游戏客户端 → 主服务器 (3001)
   ├── POST /api/auth/register - 用户注册
   ├── POST /api/auth/login - 用户登录
   └── GET /api/users/:pid - 查询用户信息
```

### 支付流程
```
1. 发起支付
   游戏客户端 → 支付代理服务器 (5000)
   ├── POST /api/pay - 发起支付请求
   └── 支付代理转发到第三方支付平台

2. 3D支付处理 (如需要)
   第三方支付平台 → 3D支付回调服务器 (5001)
   ├── GET /api/get3DResult - 3D支付回调
   └── 回调服务器通知支付代理更新状态

3. 支付状态查询
   游戏客户端 → 支付代理服务器 (5000)
   ├── GET /api/payment/status/:billNo - 查询支付状态
   └── 轮询直到支付完成

4. 支付记录上传
   游戏客户端 → 主服务器 (3001)
   ├── POST /api/payments/record - 上传支付记录
   └── 支付记录存储到数据库
```

### 支付记录管理流程
```
游戏客户端 → 主服务器 (3001)
├── POST /api/payments/record - 上传支付记录
├── GET /api/payments/user/:user_id - 查询用户支付记录
└── GET /api/payments/all - 查询所有支付记录
```

## 部署信息

### 服务器环境
- **操作系统**: CentOS/OpenCloudOS
- **Node.js版本**: 18.x
- **数据库**: MySQL/MariaDB
- **进程管理**: PM2

### PM2进程状态
```bash
┌────┬────────────────────┬──────────┬──────┬───────────┬──────────┬──────────┐
│ id │ name               │ mode     │ ↺    │ status    │ cpu      │ memory   │
├────┼────────────────────┼──────────┼──────┼───────────┼──────────┼──────────┤
│ 4  │ 3d-callback-server │ fork     │ 0    │ online    │ 0%       │ 71.6mb   │
│ 2  │ game-account-server│ fork     │ 7    │ online    │ 0%       │ 69.9mb   │
│ 5  │ pay-proxy          │ cluster  │ 0    │ online    │ 0%       │ 70.6mb   │
└────┴────────────────────┴──────────┴──────┴───────────┴──────────┴──────────┘
```

### 端口配置
- **3001**: 主服务器 (用户管理、支付记录)
- **5000**: 支付代理服务器 (支付请求代理)
- **5001**: 3D支付回调服务器 (3D支付回调处理)

## 配置管理

### 环境变量配置
```bash
# 主服务器配置 (admin-backend/config.env)
PORT=3001
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password_here
DB_NAME=game_db
DB_PORT=3306
NODE_ENV=production

# 支付代理服务器配置
PORT=5000
PAY_API_URL=https://testurl.carespay.com:28081/carespay/pay

# 3D支付回调服务器配置
PORT=5001
MAIN_SERVER_URL=http://119.91.142.92:3001
PROXY_SERVER_URL=http://119.91.142.92:5000
```

### 数据库配置
```sql
-- 创建数据库
CREATE DATABASE game_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 创建用户 (可选)
CREATE USER 'gameuser'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON game_db.* TO 'gameuser'@'localhost';
FLUSH PRIVILEGES;
```

## 监控和维护

### 日志查看
```bash
# 查看主服务器日志
pm2 logs game-account-server

# 查看支付代理服务器日志
pm2 logs pay-proxy

# 查看3D支付回调服务器日志
pm2 logs 3d-callback-server
```

### 服务重启
```bash
# 重启所有服务
pm2 restart all

# 重启特定服务
pm2 restart game-account-server
pm2 restart pay-proxy
pm2 restart 3d-callback-server
```

### 健康检查
```bash
# 主服务器健康检查
curl http://119.91.142.92:3001/api/health

# 支付代理服务器检查
curl http://119.91.142.92:5000/api/payment/status/test

# 3D支付回调服务器检查
curl http://119.91.142.92:5001/api/get3DResult
```

## 安全考虑

### 网络安全
- 所有服务都配置了CORS，允许跨域访问
- 支付相关接口需要验证请求来源
- 敏感信息（如数据库密码）通过环境变量管理

### 数据安全
- 用户密码在数据库中加密存储
- 支付记录包含完整的原始响应数据
- 数据库连接使用连接池管理

### 错误处理
- 所有服务都有完善的错误处理机制
- 支付失败时有详细的错误日志
- 网络异常时有重试机制

## 扩展性

### 水平扩展
- 支付代理服务器使用cluster模式，支持多进程
- 主服务器可以部署多个实例，通过负载均衡分发
- 数据库支持读写分离

### 功能扩展
- 支持添加新的支付方式
- 支持添加新的用户管理功能
- 支持添加新的数据统计功能

## 故障排除

### 常见问题
1. **支付失败**: 检查支付代理服务器是否正常运行
2. **3D支付回调失败**: 检查3D支付回调服务器是否正常运行
3. **用户注册失败**: 检查主服务器和数据库连接
4. **支付记录上传失败**: 检查主服务器和数据库连接

### 调试方法
1. 查看PM2日志获取详细错误信息
2. 检查数据库连接和表结构
3. 验证网络连接和端口开放情况
4. 检查环境变量配置是否正确

## 总结

这个三服务架构实现了完整的游戏支付系统，具有良好的解耦性和可扩展性：

- **主服务器**负责用户管理和数据存储
- **支付代理服务器**负责支付请求处理和状态管理
- **3D支付回调服务器**负责3D支付回调处理

三个服务协同工作，为游戏提供了稳定可靠的支付和用户管理功能。 