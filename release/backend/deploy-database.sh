#!/bin/bash

# 游戏数据同步系统数据库部署脚本
# 使用方法: ./deploy-database.sh

echo "=== 游戏数据同步系统数据库部署 ==="
echo "开始时间: $(date)"
echo ""

# 数据库配置
DB_HOST="127.0.0.1"
DB_USER="gameuser"
DB_PASSWORD="123456"
DB_NAME="game_db"
DB_PORT="3306"

# 检查MySQL连接
echo "1. 检查数据库连接..."
if mysql -h $DB_HOST -P $DB_PORT -u $DB_USER -p$DB_PASSWORD -e "USE $DB_NAME; SELECT 1;" > /dev/null 2>&1; then
    echo "✅ 数据库连接成功"
else
    echo "❌ 数据库连接失败，请检查配置"
    exit 1
fi

# 备份现有数据（可选）
echo ""
echo "2. 备份现有数据..."
BACKUP_FILE="backup_$(date +%Y%m%d_%H%M%S).sql"
mysqldump -h $DB_HOST -P $DB_PORT -u $DB_USER -p$DB_PASSWORD $DB_NAME > $BACKUP_FILE
if [ $? -eq 0 ]; then
    echo "✅ 数据备份成功: $BACKUP_FILE"
else
    echo "⚠️  数据备份失败，继续执行..."
fi

# 执行数据库迁移
echo ""
echo "3. 执行数据库迁移..."
mysql -h $DB_HOST -P $DB_PORT -u $DB_USER -p$DB_PASSWORD $DB_NAME < database-migration.sql
if [ $? -eq 0 ]; then
    echo "✅ 数据库迁移成功"
else
    echo "❌ 数据库迁移失败"
    exit 1
fi

# 验证表结构
echo ""
echo "4. 验证表结构..."
mysql -h $DB_HOST -P $DB_PORT -u $DB_USER -p$DB_PASSWORD -e "USE $DB_NAME; SHOW TABLES;" | grep -E "(users|user_game_data|payment_records)"
if [ $? -eq 0 ]; then
    echo "✅ 表结构验证成功"
else
    echo "❌ 表结构验证失败"
    exit 1
fi

# 检查user_game_data表
echo ""
echo "5. 检查user_game_data表..."
mysql -h $DB_HOST -P $DB_PORT -u $DB_USER -p$DB_PASSWORD -e "USE $DB_NAME; DESCRIBE user_game_data;"

# 检查users表的新字段
echo ""
echo "6. 检查users表结构..."
mysql -h $DB_HOST -P $DB_PORT -u $DB_USER -p$DB_PASSWORD -e "USE $DB_NAME; DESCRIBE users;" | grep last_sync_time

echo ""
echo "=== 数据库部署完成 ==="
echo "完成时间: $(date)"
echo ""
echo "下一步："
echo "1. 启动后端服务: npm start"
echo "2. 测试API接口: node test-data-sync.js"
echo "3. 检查前端数据同步功能" 