#!/bin/bash

echo "🔧 完整部署管理员登录功能..."
echo "================================"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查必要文件是否存在
echo "1. 检查部署文件..."
if [ ! -f "adminRoutes.js" ]; then
    echo -e "${RED}❌ 错误：adminRoutes.js 文件不存在${NC}"
    exit 1
fi

if [ ! -f "add-admin-user.sql" ]; then
    echo -e "${RED}❌ 错误：add-admin-user.sql 文件不存在${NC}"
    exit 1
fi

echo -e "${GREEN}✅ 部署文件检查完成${NC}"

# 备份当前文件
echo "2. 备份当前文件..."
if [ -f "src/routes/adminRoutes.js" ]; then
    cp src/routes/adminRoutes.js src/routes/adminRoutes.js.backup
    echo -e "${GREEN}✅ 已备份当前 adminRoutes.js${NC}"
fi

# 更新路由文件
echo "3. 更新路由文件..."
cp adminRoutes.js src/routes/adminRoutes.js
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ 路由文件更新成功${NC}"
else
    echo -e "${RED}❌ 路由文件更新失败${NC}"
    exit 1
fi

# 检查MySQL连接
echo "4. 检查MySQL连接..."
if mysqladmin ping -h127.0.0.1 -P3306 -ugameuser -p123456 --silent; then
    echo -e "${GREEN}✅ MySQL连接正常${NC}"
else
    echo -e "${RED}❌ MySQL连接失败${NC}"
    exit 1
fi

# 添加管理员账号
echo "5. 添加管理员账号..."
mysql -h127.0.0.1 -P3306 -ugameuser -p123456 game_db < add-admin-user.sql
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ 管理员账号添加/更新成功${NC}"
else
    echo -e "${RED}❌ 管理员账号添加失败${NC}"
    exit 1
fi

# 验证管理员账号
echo "6. 验证管理员账号..."
mysql -h127.0.0.1 -P3306 -ugameuser -p123456 game_db -e "
SELECT id, pid, name, level, created_at, updated_at 
FROM users 
WHERE name = 'administrators';
"

# 重启后端服务
echo "7. 重启后端服务..."
pm2 restart boop-backend
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ 后端服务重启成功${NC}"
else
    echo -e "${RED}❌ 后端服务重启失败${NC}"
    exit 1
fi

# 等待服务启动
echo "8. 等待服务启动..."
sleep 5

# 检查服务状态
echo "9. 检查服务状态..."
pm2 status boop-backend

# 测试API
echo "10. 测试管理员登录API..."
response=$(curl -s -X POST http://localhost:3000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"pid": "admin001", "password": "admin123456"}')

if [[ $response == *"success"* ]] && [[ $response == *"true"* ]]; then
    echo -e "${GREEN}✅ 管理员登录API测试成功${NC}"
    echo "响应: $response"
else
    echo -e "${RED}❌ 管理员登录API测试失败${NC}"
    echo "响应: $response"
fi

echo ""
echo -e "${GREEN}🎉 管理员登录功能部署完成！${NC}"
echo ""
echo "📋 登录信息："
echo "   管理员ID: admin001"
echo "   密码: admin123456"
echo "   登录地址: http://119.91.142.92:3001"
echo ""
echo -e "${YELLOW}🔒 安全提醒：${NC}"
echo "   - 请及时修改默认密码"
echo "   - 建议定期更换管理员密码"
echo "   - 请确保运维后台访问安全"
