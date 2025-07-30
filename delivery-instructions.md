# 项目交付说明

## 问题解决

甲方反馈"数据进不去数据库"，经诊断发现是数据库连接配置问题。

### 问题原因
- 数据库密码配置错误（还是占位符 `your_password_here`）
- 数据库服务可能未启动
- 数据库用户权限不足

## 快速解决方案

### 1. 运行诊断脚本
```bash
cd admin-backend
./diagnose-db.sh
```

### 2. 运行修复脚本
```bash
cd admin-backend
./fix-database.sh
```

### 3. 手动设置数据库密码
```bash
# 设置MySQL root密码
sudo mysql_secure_installation

# 或者直接设置
sudo mysql
ALTER USER 'root'@'localhost' IDENTIFIED BY 'your_new_password';
FLUSH PRIVILEGES;
EXIT;
```

### 4. 修改配置文件
编辑 `admin-backend/config.env`：
```env
DB_PASSWORD=your_actual_password  # 替换为实际密码
```

### 5. 重启服务
```bash
pm2 restart game-account-server
```

## 文件说明

### 新增文件
- `database-setup-guide.md` - 详细数据库设置指南
- `admin-backend/fix-database.sh` - 自动修复脚本
- `admin-backend/diagnose-db.sh` - 诊断脚本
- `admin-backend/config.env.template` - 配置模板

### 修改文件
- `admin-backend/config.env` - 需要设置实际数据库密码

## 验证步骤

### 1. 检查数据库连接
```bash
mysql -u root -p -e "USE game_db; SHOW TABLES;"
```

### 2. 测试API接口
```bash
curl http://localhost:3001/api/health
```

### 3. 测试注册功能
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"pid":"test123","name":"testuser","password":"testpass"}'
```

## 常见问题

### Q: 数据库连接失败
A: 检查以下几点：
1. MySQL服务是否启动：`systemctl status mysql`
2. 密码是否正确：`mysql -u root -p`
3. 数据库是否存在：`mysql -u root -p -e "SHOW DATABASES;"`

### Q: API接口无响应
A: 检查以下几点：
1. 后端服务是否启动：`pm2 status`
2. 端口是否被占用：`netstat -tlnp | grep 3001`
3. 防火墙设置：`sudo ufw status`

### Q: 表不存在
A: 导入数据库结构：
```bash
mysql -u root -p game_db < setup-db.sql
```

## 联系支持

如果问题仍然存在，请提供：
1. 诊断脚本输出结果
2. 错误日志：`pm2 logs game-account-server`
3. 数据库版本：`mysql --version`
4. 操作系统版本：`uname -a`

## 总结

主要问题是数据库密码配置错误。按照以上步骤操作后，数据应该能够正常进入数据库。

**关键步骤**：
1. ✅ 设置正确的数据库密码
2. ✅ 修改 config.env 文件
3. ✅ 重启后端服务
4. ✅ 验证连接和功能 