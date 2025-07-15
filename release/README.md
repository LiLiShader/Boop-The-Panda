# 游戏部署说明

## 环境要求
- Node.js 14.0.0 或以上
- npm 6.0.0 或以上

## 安装步骤

1. 安装 Node.js
   - 访问 https://nodejs.org/
   - 下载并安装 Node.js LTS版本

2. 安装全局依赖
   ```bash
   npm install -g http-server
   ```

3. 安装项目依赖
   ```bash
   cd backend
   npm install
   ```

## 启动服务

### Windows用户
1. 双击运行 `start.bat`
2. 等待服务启动完成

### Linux/Mac用户
1. 打开终端
2. 进入项目目录
3. 执行以下命令：
   ```bash
   chmod +x start.sh
   ./start.sh
   ```

## 访问地址
- 前端页面：http://localhost:8080
- 后端服务：http://localhost:3000

## 目录结构
```
release/
  ├── frontend/         # Cocos前端文件
  ├── backend/          # Node.js后端文件
  ├── start.bat         # Windows启动脚本
  ├── start.sh          # Linux/Mac启动脚本
  └── README.md         # 说明文档
```

## 注意事项
1. 确保端口 3000 和 8080 未被其他程序占用
2. 如需修改端口：
   - 修改 backend/server.js 中的端口号
   - 修改启动脚本中的前端端口号
   - 修改前端配置中的API地址

## 常见问题

### 端口被占用
如果看到端口被占用的错误：
1. Windows：
   ```bash
   netstat -ano | findstr :3000
   netstat -ano | findstr :8080
   ```
2. Linux/Mac：
   ```bash
   lsof -i :3000
   lsof -i :8080
   ```

### 服务无法启动
1. 检查 Node.js 是否正确安装：
   ```bash
   node --version
   npm --version
   ```
2. 检查依赖是否安装完整：
   ```bash
   cd backend
   npm install
   ```

## 联系支持
如有问题请联系技术支持 