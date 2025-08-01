#!/bin/bash

# 后端服务部署脚本
# 使用方法: ./deploy-backend.sh

echo "=== 后端服务部署脚本 ==="
echo "开始时间: $(date)"
echo ""

# 检查Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装，请先安装 Node.js"
    exit 1
fi

echo "✅ Node.js 版本: $(node --version)"

# 检查npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm 未安装，请先安装 npm"
    exit 1
fi

echo "✅ npm 版本: $(npm --version)"

# 检查配置文件
if [ ! -f "config.env" ]; then
    echo "❌ config.env 文件不存在"
    exit 1
fi

echo "✅ 配置文件存在"

# 安装依赖
echo ""
echo "1. 安装依赖..."
npm install
if [ $? -eq 0 ]; then
    echo "✅ 依赖安装成功"
else
    echo "❌ 依赖安装失败"
    exit 1
fi

# 检查PM2
if command -v pm2 &> /dev/null; then
    echo "✅ PM2 已安装"
    USE_PM2=true
else
    echo "⚠️  PM2 未安装，将使用 npm start"
    USE_PM2=false
fi

# 停止现有服务
echo ""
echo "2. 停止现有服务..."
if [ "$USE_PM2" = true ]; then
    pm2 stop backend-service 2>/dev/null || echo "没有运行中的服务"
else
    pkill -f "node server.js" 2>/dev/null || echo "没有运行中的服务"
fi

# 启动服务
echo ""
echo "3. 启动服务..."
if [ "$USE_PM2" = true ]; then
    pm2 start server.js --name backend-service
    if [ $? -eq 0 ]; then
        echo "✅ 服务启动成功 (PM2)"
        pm2 status
    else
        echo "❌ 服务启动失败"
        exit 1
    fi
else
    nohup node server.js > logs/app.log 2>&1 &
    if [ $? -eq 0 ]; then
        echo "✅ 服务启动成功 (nohup)"
        sleep 3
        ps aux | grep "node server.js" | grep -v grep
    else
        echo "❌ 服务启动失败"
        exit 1
    fi
fi

# 等待服务启动
echo ""
echo "4. 等待服务启动..."
sleep 5

# 测试健康检查
echo ""
echo "5. 测试健康检查..."
HEALTH_RESPONSE=$(curl -s http://localhost:3000/health)
if echo "$HEALTH_RESPONSE" | grep -q "ok"; then
    echo "✅ 健康检查通过"
    echo "响应: $HEALTH_RESPONSE"
else
    echo "❌ 健康检查失败"
    echo "响应: $HEALTH_RESPONSE"
    exit 1
fi

# 测试数据同步API
echo ""
echo "6. 测试数据同步API..."
if [ -f "test-data-sync.js" ]; then
    node test-data-sync.js
    if [ $? -eq 0 ]; then
        echo "✅ API测试通过"
    else
        echo "⚠️  API测试失败，请检查日志"
    fi
else
    echo "⚠️  测试脚本不存在，跳过API测试"
fi

echo ""
echo "=== 部署完成 ==="
echo "完成时间: $(date)"
echo ""
echo "服务信息:"
echo "- 端口: 3000"
echo "- 健康检查: http://localhost:3000/health"
echo "- 数据同步API: http://localhost:3000/api/user/*"
echo ""
echo "日志位置:"
if [ "$USE_PM2" = true ]; then
    echo "- PM2日志: pm2 logs backend-service"
else
    echo "- 应用日志: logs/app.log"
fi 