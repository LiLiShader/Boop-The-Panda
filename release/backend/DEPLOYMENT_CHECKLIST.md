# 后端部署检查清单

## 需要上传的文件

### 新增文件
- [ ] `src/services/userDataService.js`
- [ ] `src/controllers/userDataController.js`
- [ ] `src/routes/userDataRoutes.js`
- [ ] `test-data-sync.js`
- [ ] `database-migration.sql`
- [ ] `deploy-database.sh`
- [ ] `DATABASE_DEPLOYMENT_GUIDE.md`
- [ ] `DEPLOYMENT_CHECKLIST.md`

### 修改文件
- [ ] `src/config/database.js` (添加了用户游戏数据表创建逻辑)
- [ ] `server.js` (添加了新的路由和API接口)

## 部署步骤

### 1. 上传文件到服务器
```bash
# 上传所有文件到服务器的 release/backend 目录
scp -r src/ user@server:/path/to/release/backend/
scp server.js user@server:/path/to/release/backend/
scp test-data-sync.js user@server:/path/to/release/backend/
scp database-migration.sql user@server:/path/to/release/backend/
scp deploy-database.sh user@server:/path/to/release/backend/
scp *.md user@server:/path/to/release/backend/
```

### 2. 安装依赖（如果需要）
```bash
cd release/backend
npm install
```

### 3. 重启服务
```bash
# 停止现有服务
pm2 stop backend-service
# 或者
npm run stop

# 启动服务
pm2 start server.js --name backend-service
# 或者
npm start
```

### 4. 验证部署
```bash
# 检查服务状态
pm2 status
# 或者
ps aux | grep node

# 测试健康检查
curl http://localhost:3000/health

# 测试数据同步API
node test-data-sync.js
```

## 验证清单

- [ ] 服务正常启动
- [ ] 数据库表自动创建
- [ ] 健康检查接口正常
- [ ] 数据同步API正常
- [ ] 前端可以正常连接 