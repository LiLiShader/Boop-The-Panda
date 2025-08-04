#!/bin/bash

# =====================================================
# Boop-The-Panda API 全面测试脚本
# 创建时间: 2025-08-01
# 版本: v1.0.0
# 说明: 测试所有关键API接口
# =====================================================

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 配置
SERVER_IP="119.91.142.92"
SERVER_PORT="3000"
BASE_URL="http://${SERVER_IP}:${SERVER_PORT}"

# 测试用户数据
TEST_USER_PID="test001"
TEST_USER_PASSWORD="123456"
ADMIN_PID="admin001"
ADMIN_PASSWORD="admin123456"

echo -e "${BLUE}🚀 开始测试 Boop-The-Panda API 接口...${NC}"
echo -e "${BLUE}服务器地址: ${BASE_URL}${NC}"
echo -e "${BLUE}测试时间: $(date)${NC}"
echo "=========================================="

# 测试计数器
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# 测试函数
test_api() {
    local test_name="$1"
    local method="$2"
    local endpoint="$3"
    local data="$4"
    local expected_status="$5"
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    echo -e "\n${CYAN}🔍 测试: ${test_name}${NC}"
    echo -e "${YELLOW}请求: ${method} ${BASE_URL}${endpoint}${NC}"
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" "${BASE_URL}${endpoint}")
    else
        response=$(curl -s -w "\n%{http_code}" -X "${method}" \
            -H "Content-Type: application/json" \
            -d "${data}" \
            "${BASE_URL}${endpoint}")
    fi
    
    # 分离响应体和状态码
    http_code=$(echo "$response" | tail -n1)
    response_body=$(echo "$response" | head -n -1)
    
    echo -e "${YELLOW}状态码: ${http_code}${NC}"
    echo -e "${YELLOW}响应: ${response_body}${NC}"
    
    if [ "$http_code" = "$expected_status" ]; then
        echo -e "${GREEN}✅ 测试通过${NC}"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        echo -e "${RED}❌ 测试失败 - 期望状态码: ${expected_status}${NC}"
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
}

# 1. 测试服务器连通性
echo -e "\n${PURPLE}📡 1. 测试服务器连通性${NC}"
test_api "服务器连通性测试" "GET" "/" "" "200"

# 2. 测试用户登录
echo -e "\n${PURPLE}👤 2. 测试用户登录${NC}"
test_api "用户登录" "POST" "/admin/api/login" \
    "{\"pid\":\"${TEST_USER_PID}\",\"password\":\"${TEST_USER_PASSWORD}\"}" "200"

# 3. 测试管理员登录
echo -e "\n${PURPLE}🔐 3. 测试管理员登录${NC}"
test_api "管理员登录" "POST" "/admin/api/admin/login" \
    "{\"pid\":\"${ADMIN_PID}\",\"password\":\"${ADMIN_PASSWORD}\"}" "200"

# 4. 测试获取用户游戏数据
echo -e "\n${PURPLE}🎮 4. 测试获取用户游戏数据${NC}"
test_api "获取用户游戏数据" "GET" "/api/user/get-game-data?userId=${TEST_USER_PID}" "" "200"

# 5. 测试同步用户数据
echo -e "\n${PURPLE}🔄 5. 测试同步用户数据${NC}"
test_api "同步用户数据" "POST" "/api/user/sync-data" \
    "{\"userId\":\"${TEST_USER_PID}\",\"data\":[{\"key\":\"Gold\",\"value\":\"600\",\"type\":\"number\"}]}" "200"

# 6. 测试获取支付模式
echo -e "\n${PURPLE}💳 6. 测试获取支付模式${NC}"
test_api "获取支付模式" "GET" "/api/config/payment/mode" "" "200"

# 7. 测试设置支付模式
echo -e "\n${PURPLE}⚙️  7. 测试设置支付模式${NC}"
test_api "设置支付模式" "POST" "/api/config/payment/mode" \
    "{\"mode\":\"3D\"}" "200"

# 8. 测试获取所有配置
echo -e "\n${PURPLE}📋 8. 测试获取所有配置${NC}"
test_api "获取所有配置" "GET" "/api/config/all" "" "200"

# 9. 测试获取用户信息
echo -e "\n${PURPLE}👥 9. 测试获取用户信息${NC}"
test_api "获取用户信息" "GET" "/admin/api/users/${TEST_USER_PID}" "" "200"

# 10. 测试获取用户支付记录
echo -e "\n${PURPLE}💰 10. 测试获取用户支付记录${NC}"
test_api "获取用户支付记录" "GET" "/admin/api/payments/user/${TEST_USER_PID}" "" "200"

# 11. 测试获取所有支付记录
echo -e "\n${PURPLE}📊 11. 测试获取所有支付记录${NC}"
test_api "获取所有支付记录" "GET" "/admin/api/payments" "" "200"

# 12. 测试初始化用户游戏数据
echo -e "\n${PURPLE}🎯 12. 测试初始化用户游戏数据${NC}"
test_api "初始化用户游戏数据" "POST" "/api/user/init-game-data" \
    "{\"userId\":\"newuser001\"}" "200"

# 13. 测试数据库连接
echo -e "\n${PURPLE}🗄️  13. 测试数据库连接${NC}"
if command -v mysql &> /dev/null; then
    echo -e "${YELLOW}检查MySQL连接...${NC}"
    if mysql -ugameuser -p123456 -h127.0.0.1 -e "USE game_db; SELECT COUNT(*) FROM users;" 2>/dev/null; then
        echo -e "${GREEN}✅ 数据库连接正常${NC}"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        echo -e "${RED}❌ 数据库连接失败${NC}"
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
else
    echo -e "${YELLOW}⚠️  MySQL客户端未安装，跳过数据库连接测试${NC}"
fi

# 14. 测试PM2服务状态
echo -e "\n${PURPLE}⚡ 14. 测试PM2服务状态${NC}"
if command -v pm2 &> /dev/null; then
    echo -e "${YELLOW}检查PM2服务状态...${NC}"
    if pm2 list | grep -q "boop-backend"; then
        echo -e "${GREEN}✅ PM2服务运行正常${NC}"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        echo -e "${RED}❌ PM2服务未运行${NC}"
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
else
    echo -e "${YELLOW}⚠️  PM2未安装，跳过服务状态测试${NC}"
fi

# 15. 测试端口监听
echo -e "\n${PURPLE}🔌 15. 测试端口监听${NC}"
if command -v netstat &> /dev/null; then
    if netstat -tlnp 2>/dev/null | grep -q ":${SERVER_PORT} "; then
        echo -e "${GREEN}✅ 端口 ${SERVER_PORT} 正在监听${NC}"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        echo -e "${RED}❌ 端口 ${SERVER_PORT} 未监听${NC}"
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
else
    echo -e "${YELLOW}⚠️  netstat未安装，跳过端口监听测试${NC}"
fi

# 显示测试结果
echo -e "\n${BLUE}==========================================${NC}"
echo -e "${BLUE}📊 测试结果汇总${NC}"
echo -e "${BLUE}==========================================${NC}"
echo -e "${GREEN}总测试数: ${TOTAL_TESTS}${NC}"
echo -e "${GREEN}通过测试: ${PASSED_TESTS}${NC}"
echo -e "${RED}失败测试: ${FAILED_TESTS}${NC}"

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "\n${GREEN}🎉 所有测试通过！服务器运行正常。${NC}"
else
    echo -e "\n${RED}⚠️  有 ${FAILED_TESTS} 个测试失败，请检查服务器配置。${NC}"
    echo -e "\n${YELLOW}🔧 故障排除建议:${NC}"
    echo -e "${YELLOW}1. 检查后端服务是否启动: pm2 list${NC}"
    echo -e "${YELLOW}2. 检查数据库连接: mysql -ugameuser -p123456 -e 'USE game_db;'${NC}"
    echo -e "${YELLOW}3. 检查端口监听: netstat -tlnp | grep 3000${NC}"
    echo -e "${YELLOW}4. 查看服务日志: pm2 logs boop-backend${NC}"
    echo -e "${YELLOW}5. 检查防火墙设置: ufw status${NC}"
fi

echo -e "\n${BLUE}📝 测试完成时间: $(date)${NC}" 