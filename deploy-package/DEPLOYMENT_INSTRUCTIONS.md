# 管理员登录功能部署说明

## 🚀 快速部署步骤

### 1. 上传文件到服务器

```bash
# 上传后端文件
scp adminRoutes.js user@119.91.142.92:/path/to/release/backend/src/routes/

# 上传部署脚本
scp deploy-admin-login.sh user@119.91.142.92:/path/to/release/backend/

# 上传SQL文件
scp add-admin-user.sql user@119.91.142.92:/path/to/release/backend/
```

### 2. 在服务器上执行部署

```bash
# 登录服务器
ssh user@119.91.142.92

# 进入后端目录
cd /path/to/release/backend

# 添加执行权限
chmod +x deploy-admin-login.sh

# 执行部署脚本
./deploy-admin-login.sh
```

### 3. 验证部署结果

```bash
# 测试管理员登录API
curl -X POST http://119.91.142.92:3000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"pid": "admin001", "password": "admin123456"}'
```

## 📋 文件说明

- `adminRoutes.js` - 包含管理员登录API的后端路由文件
- `deploy-admin-login.sh` - 自动化部署脚本
- `add-admin-user.sql` - 添加管理员账号的SQL脚本

## 🔐 默认登录信息

- **管理员ID**: `admin001`
- **密码**: `admin123456`
- **登录地址**: `http://119.91.142.92:3001`

## 🐛 故障排除

如果遇到问题，请检查：

1. **后端服务状态**：
   ```bash
   pm2 status boop-backend
   ```

2. **API是否可用**：
   ```bash
   curl http://119.91.142.92:3000/health
   ```

3. **管理员账号是否存在**：
   ```bash
   mysql -h127.0.0.1 -P3306 -ugameuser -p123456 game_db -e "
   SELECT * FROM users WHERE name = 'administrators';
   "
   ```

## 📞 技术支持

如遇到问题，请提供：
1. 错误日志
2. 部署步骤
3. 服务器环境信息 