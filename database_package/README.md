# 游戏数据库包

## 文件说明

- `game_db_backup.sql`: 完整的数据库备份（包含所有用户数据和表结构）
- `setup-db.sql`: 数据库结构文件（用于新建数据库）
- `import_instructions.md`: 详细的导入说明
- `config.env.example`: 配置文件示例

## 快速开始

1. **导入完整数据库**：
   ```bash
   mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS game_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
   mysql -u root -p game_db < game_db_backup.sql
   ```

2. **配置环境变量**：
   ```bash
   cp config.env.example config.env
   # 编辑 config.env 文件，设置正确的数据库密码
   ```

3. **启动服务器**：
   ```bash
   npm install
   npm start
   ```

## 数据库信息

- **数据库名**: game_db
- **字符集**: utf8mb4
- **包含表**: users, payment_records
- **数据量**: 包含所有用户账户和支付记录

## 注意事项

- 请确保MySQL/MariaDB已安装
- 导入前请备份现有数据库
- 确保有足够的磁盘空间 