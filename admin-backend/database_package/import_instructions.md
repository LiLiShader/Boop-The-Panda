# 数据库导入说明

## 文件说明
- `game_db_complete_backup.sql`: 完整的数据库备份（包含结构和数据）
- `setup-db.sql`: 仅数据库结构（用于新建数据库）

## 导入步骤

### 方法1：导入完整备份
```bash
# 1. 创建数据库
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS game_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 2. 导入完整备份
mysql -u root -p game_db < game_db_complete_backup.sql
```

### 方法2：仅导入结构（新建数据库）
```bash
# 1. 创建数据库
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS game_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 2. 导入结构
mysql -u root -p game_db < setup-db.sql
```

## 数据库配置
导入后，需要更新 `config.env` 文件中的数据库连接信息：
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password_here
DB_NAME=game_db
DB_PORT=3306
```

## 验证导入
```bash
# 检查表是否存在
mysql -u root -p -e "USE game_db; SHOW TABLES;"

# 检查数据
mysql -u root -p -e "USE game_db; SELECT COUNT(*) FROM users;"
``` 