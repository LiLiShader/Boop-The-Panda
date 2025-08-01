# 手动部署管理员登录功能

## 🚨 问题说明

如果自动部署脚本无法正常工作，请按照以下步骤手动部署：

## 📋 手动部署步骤

### 1. 检查当前文件状态

```bash
# 检查当前路由文件
ls -la src/routes/adminRoutes.js

# 检查文件内容（查看是否包含管理员登录API）
grep -n "admin/login" src/routes/adminRoutes.js
```

### 2. 备份当前文件

```bash
# 备份当前文件
cp src/routes/adminRoutes.js src/routes/adminRoutes.js.backup.$(date +%Y%m%d_%H%M%S)
```

### 3. 更新路由文件

```bash
# 复制新的路由文件
cp adminRoutes.js src/routes/adminRoutes.js

# 验证文件已更新
grep -n "admin/login" src/routes/adminRoutes.js
```

### 4. 添加管理员账号

```bash
# 执行SQL脚本
mysql -h127.0.0.1 -P3306 -ugameuser -p123456 game_db < add-admin-user.sql

# 验证管理员账号
mysql -h127.0.0.1 -P3306 -ugameuser -p123456 game_db -e "
SELECT id, pid, name, level, created_at, updated_at 
FROM users 
WHERE name = 'administrators';
"
```

### 5. 重启后端服务

```bash
# 重启服务
pm2 restart boop-backend

# 等待服务启动
sleep 5

# 检查服务状态
pm2 status boop-backend

# 查看服务日志
pm2 logs boop-backend --lines 20
```

### 6. 测试API

```bash
# 测试管理员登录API
curl -X POST http://localhost:3000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"pid": "admin001", "password": "admin123456"}'

# 测试外部访问
curl -X POST http://119.91.142.92:3000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"pid": "admin001", "password": "admin123456"}'
```

## 🔍 故障排除

### 如果API仍然返回404

1. **检查路由注册**：
   ```bash
   # 查看server.js中是否正确注册了adminRoutes
   grep -n "adminRoutes" server.js
   ```

2. **检查文件路径**：
   ```bash
   # 确认文件路径正确
   find . -name "adminRoutes.js" -type f
   ```

3. **检查服务日志**：
   ```bash
   # 查看详细错误日志
   pm2 logs boop-backend --lines 50
   ```

### 如果数据库连接失败

1. **检查MySQL服务**：
   ```bash
   systemctl status mysql
   ```

2. **检查数据库连接**：
   ```bash
   mysql -h127.0.0.1 -P3306 -ugameuser -p123456 -e "SELECT 1;"
   ```

### 如果服务启动失败

1. **检查配置文件**：
   ```bash
   cat config.env
   ```

2. **检查端口占用**：
   ```bash
   netstat -tlnp | grep 3000
   ```

## 📞 技术支持

如果按照以上步骤仍然无法解决问题，请提供：

1. 完整的错误日志
2. 当前文件内容
3. 服务器环境信息 