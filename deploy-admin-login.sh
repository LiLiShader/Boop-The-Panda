#!/bin/bash

echo "🔧 部署管理员登录功能..."
echo "================================"

# 检查MySQL连接
echo "1. 检查MySQL连接..."
if mysqladmin ping -h127.0.0.1 -P3306 -ugameuser -p123456 --silent 2>/dev/null; then
    echo "✅ MySQL连接正常"
else
    echo "❌ MySQL连接失败"
    exit 1
fi

# 添加管理员账号
echo ""
echo "2. 添加管理员账号..."
mysql -h127.0.0.1 -P3306 -ugameuser -p123456 game_db << EOF
INSERT INTO users (pid, name, password, level, gold, icon, created_at, updated_at, last_sync_time) 
VALUES ('admin001', 'administrators', 'admin123456', 99, 0, 1, NOW(), NOW(), NOW()) 
ON DUPLICATE KEY UPDATE 
    password = VALUES(password),
    level = VALUES(level),
    updated_at = NOW();
EOF

if [ $? -eq 0 ]; then
    echo "✅ 管理员账号添加/更新成功"
else
    echo "❌ 管理员账号添加失败"
    exit 1
fi

# 验证管理员账号
echo ""
echo "3. 验证管理员账号..."
mysql -h127.0.0.1 -P3306 -ugameuser -p123456 game_db -e "
SELECT id, pid, name, level, created_at, updated_at 
FROM users 
WHERE name = 'administrators';
"

# 重启后端服务
echo ""
echo "4. 重启后端服务..."
pm2 restart boop-backend

if [ $? -eq 0 ]; then
    echo "✅ 后端服务重启成功"
else
    echo "❌ 后端服务重启失败"
    exit 1
fi

# 检查服务状态
echo ""
echo "5. 检查服务状态..."
sleep 3
pm2 status boop-backend

# 测试管理员登录API
echo ""
echo "6. 测试管理员登录API..."
curl -X POST http://119.91.142.92:3000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"pid": "admin001", "password": "admin123456"}' \
  -s | jq '.'

echo ""
echo "🎉 管理员登录功能部署完成！"
echo ""
echo "📋 登录信息："
echo "   管理员ID: admin001"
echo "   密码: admin123456"
echo "   登录地址: http://119.91.142.92:3001"
echo ""
echo "🔒 安全提醒："
echo "   - 请及时修改默认密码"
echo "   - 建议定期更换管理员密码"
echo "   - 请确保运维后台访问安全" 