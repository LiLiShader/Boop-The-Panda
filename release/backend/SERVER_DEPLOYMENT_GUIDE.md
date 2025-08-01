# 服务器端部署指南

## 问题描述
在服务器上运行 `./deploy-config-db.sh` 时遇到 "错误：无法连接到MySQL数据库" 的问题。

## 解决方案

### 方法1：使用诊断脚本（推荐）

1. **上传诊断脚本到服务器**
   ```bash
   # 在本地执行，将文件上传到服务器
   scp server-diagnosis.sh root@[服务器IP]:/path/to/backend/
   scp manual-deploy-config.sh root@[服务器IP]:/path/to/backend/
   scp database/global_config.sql root@[服务器IP]:/path/to/backend/database/
   ```

2. **在服务器上运行诊断**
   ```bash
   chmod +x server-diagnosis.sh
   ./server-diagnosis.sh
   ```

3. **根据诊断结果解决问题**

### 方法2：手动部署（如果自动部署失败）

1. **运行手动部署脚本**
   ```bash
   chmod +x manual-deploy-config.sh
   ./manual-deploy-config.sh
   ```

2. **按提示输入数据库信息**

### 方法3：直接执行SQL（最直接）

1. **确保MySQL服务运行**
   ```bash
   systemctl status mysql
   # 如果未运行，启动服务
   systemctl start mysql
   ```

2. **直接执行SQL**
   ```bash
   # 方法1：使用mysql命令行
   mysql -h[主机] -P[端口] -u[用户] -p[密码] [数据库名] < database/global_config.sql
   
   # 方法2：登录后执行
   mysql -h[主机] -P[端口] -u[用户] -p[密码] [数据库名]
   source database/global_config.sql;
   exit;
   ```

## 常见问题排查

### 问题1：MySQL服务未运行
```bash
# 检查服务状态
systemctl status mysql
systemctl status mysqld

# 启动服务
systemctl start mysql
# 或
systemctl start mysqld
```

### 问题2：配置文件问题
```bash
# 检查配置文件
cat config.env

# 如果文件不存在或配置错误，手动创建
cat > config.env << EOF
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=your_database
EOF
```

### 问题3：权限问题
```bash
# 检查MySQL用户权限
mysql -u root -p
SHOW GRANTS FOR 'your_username'@'localhost';

# 授予权限
GRANT ALL PRIVILEGES ON your_database.* TO 'your_username'@'localhost';
FLUSH PRIVILEGES;
```

### 问题4：数据库不存在
```bash
# 创建数据库
mysql -u root -p
CREATE DATABASE your_database CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

## 验证部署成功

部署成功后，运行以下命令验证：

```bash
# 检查表是否存在
mysql -h[主机] -P[端口] -u[用户] -p[密码] [数据库名] -e "
SHOW TABLES LIKE 'global_config';
"

# 检查数据是否正确
mysql -h[主机] -P[端口] -u[用户] -p[密码] [数据库名] -e "
SELECT * FROM global_config;
"
```

## 预期结果

成功部署后，您应该看到：
- ✅ `global_config` 表创建成功
- ✅ 包含4条初始配置记录
- ✅ 支付模式默认为 "2D"

## 下一步

部署成功后，可以继续：
1. 实现后端API
2. 修改前端游戏逻辑
3. 实现运维后台管理界面 