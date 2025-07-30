# Boop-The-Panda 后端服务

这是 Boop-The-Panda 游戏的后端服务，合并了原有的三个服务（admin、3d-callback-server和pay-proxy）为一个统一的服务。

## 功能介绍

本服务提供以下功能：

1. **用户管理**：创建、查询、更新用户信息
2. **支付处理**：处理游戏内支付请求
3. **3D支付回调**：处理第三方3D支付的回调
4. **支付状态查询**：查询支付状态
5. **支付记录管理**：记录和查询支付记录

## 安装和配置

### 环境要求

- Node.js (v14+)
- MySQL (v5.7+)
- 可选：PM2进程管理器 (`npm install -g pm2`)

### 安装步骤

1. 确保已安装Node.js和MySQL

2. 安装依赖包
   ```
   cd release/backend
   npm install
   ```

3. 配置环境变量
   ```
   cp config.env.example config.env
   ```
   然后编辑 `config.env` 文件，填写正确的数据库配置等信息

4. 初始化数据库（如果尚未创建）
   ```
   mysql -u YOUR_USERNAME -p < setup-db.sql
   ```

## 目录结构

```
release/backend/
├── server.js              # 主服务器文件
├── package.json           # 依赖配置
├── config.env             # 环境配置
├── config.env.example     # 环境配置示例
├── setup-db.sql           # 数据库初始化脚本
├── start.sh               # 启动脚本
├── stop.sh                # 停止脚本
└── src/                   # 源代码目录
    ├── config/            # 配置文件
    ├── controllers/       # 控制器
    ├── middleware/        # 中间件
    ├── models/            # 数据模型
    ├── routes/            # 路由
    ├── services/          # 服务
    ├── types/             # 类型定义
    └── utils/             # 工具函数
```

## 启动和停止服务

### 启动服务

```bash
./start.sh
```

### 停止服务

```bash
./stop.sh
```

## API接口

### 管理后台API

- `GET /admin/api/users`: 获取所有用户
- `GET /admin/api/users/:pid`: 获取单个用户
- `POST /admin/api/users`: 创建新用户
- `PUT /admin/api/users/:pid`: 更新用户信息
- `GET /admin/api/payments`: 获取所有支付记录
- `GET /admin/api/users/:pid/payments`: 获取用户支付记录

### 支付相关API

- `POST /api/payment/pay`: 支付代理
- `GET /api/payment/get3DResult`: 3D支付回调
- `GET /api/payment/status/:billNo`: 查询支付状态
- `POST /api/payment/record`: 添加支付记录

### 其他API

- `GET /health`: 健康检查

## 日志

服务日志保存在 `logs` 目录下。如果使用PM2启动，可以通过以下命令查看日志：

```bash
pm2 logs boop-backend
```

如果使用nohup启动，可以通过以下命令查看日志：

```bash
tail -f logs/server.log
``` 