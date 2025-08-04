#!/bin/bash

# =====================================================
# 用户登录问题诊断脚本
# 创建时间: 2025-08-01
# 版本: v1.0.0
# 说明: 专门诊断用户登录和金币显示问题
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

echo -e "${BLUE}🔍 诊断用户登录和金币显示问题...${NC}"
echo -e "${BLUE}服务器地址: ${BASE_URL}${NC}"
echo -e "${BLUE}测试时间: $(date)${NC}"
echo "=========================================="

# 测试用户登录并检查金币
test_login_and_gold() {
    local user_pid="$1"
    local password="$2"
    
    echo -e "\n${PURPLE}👤 测试用户: ${user_pid}${NC}"
    
    # 1. 测试登录API
    echo -e "${YELLOW}1. 测试登录API...${NC}"
    login_response=$(curl -s -w "\n%{http_code}" -X POST \
        -H "Content-Type: application/json" \
        -d "{\"pid\":\"${user_pid}\",\"password\":\"${password}\"}" \
        "${BASE_URL}/admin/api/login")
    
    http_code=$(echo "$login_response" | tail -n1)
    response_body=$(echo "$login_response" | head -n -1)
    
    echo -e "${YELLOW}   状态码: ${http_code}${NC}"
    echo -e "${YELLOW}   响应: ${response_body}${NC}"
    
    if [ "$http_code" != "200" ]; then
        echo -e "${RED}❌ 登录失败 - 状态码: ${http_code}${NC}"
        return 1
    fi
    
    # 解析登录响应
    success=$(echo "$response_body" | grep -o '"success":[^,]*' | cut -d':' -f2)
    if [ "$success" != "true" ]; then
        echo -e "${RED}❌ 登录失败 - success: ${success}${NC}"
        return 1
    fi
    
    echo -e "${GREEN}✅ 登录成功${NC}"
    
    # 2. 检查用户数据
    user_gold=$(echo "$response_body" | grep -o '"gold":[0-9]*' | cut -d':' -f2)
    user_level=$(echo "$response_body" | grep -o '"level":[0-9]*' | cut -d':' -f2)
    user_name=$(echo "$response_body" | grep -o '"name":"[^"]*"' | cut -d'"' -f4)
    
    echo -e "${GREEN}   用户信息:${NC}"
    echo -e "${GREEN}   - 用户名: ${user_name}${NC}"
    echo -e "${GREEN}   - 等级: ${user_level}${NC}"
    echo -e "${GREEN}   - 金币: ${user_gold}${NC}"
    
    # 3. 检查数据库中的金币
    echo -e "${YELLOW}2. 检查数据库中的金币...${NC}"
    if command -v mysql &> /dev/null; then
        db_gold=$(mysql -ugameuser -p123456 -h127.0.0.1 -e "USE game_db; SELECT gold FROM users WHERE pid = '${user_pid}';" 2>/dev/null | tail -n 1)
        game_data_gold=$(mysql -ugameuser -p123456 -h127.0.0.1 -e "USE game_db; SELECT data_value FROM user_game_data WHERE user_id = '${user_pid}' AND data_key = 'Gold';" 2>/dev/null | tail -n 1)
        
        echo -e "${YELLOW}   数据库中的金币:${NC}"
        echo -e "${YELLOW}   - users表: ${db_gold}${NC}"
        echo -e "${YELLOW}   - user_game_data表: ${game_data_gold}${NC}"
        
        # 比较金币值
        if [ "$user_gold" = "$db_gold" ] && [ "$user_gold" = "$game_data_gold" ]; then
            echo -e "${GREEN}✅ 金币数据一致${NC}"
        else
            echo -e "${RED}❌ 金币数据不一致${NC}"
            echo -e "${RED}   - API返回: ${user_gold}${NC}"
            echo -e "${RED}   - users表: ${db_gold}${NC}"
            echo -e "${RED}   - user_game_data表: ${game_data_gold}${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️  MySQL客户端未安装，跳过数据库检查${NC}"
    fi
    
    # 4. 测试获取用户游戏数据API
    echo -e "${YELLOW}3. 测试获取用户游戏数据API...${NC}"
    game_data_response=$(curl -s -w "\n%{http_code}" \
        "${BASE_URL}/api/user/get-game-data?userId=${user_pid}")
    
    game_data_code=$(echo "$game_data_response" | tail -n1)
    game_data_body=$(echo "$game_data_response" | head -n -1)
    
    echo -e "${YELLOW}   状态码: ${game_data_code}${NC}"
    echo -e "${YELLOW}   响应: ${game_data_body}${NC}"
    
    if [ "$game_data_code" = "200" ]; then
        echo -e "${GREEN}✅ 获取游戏数据成功${NC}"
        
        # 解析游戏数据中的金币
        api_game_gold=$(echo "$game_data_body" | grep -o '"Gold":"[^"]*"' | cut -d'"' -f4)
        if [ -n "$api_game_gold" ]; then
            echo -e "${GREEN}   API游戏数据金币: ${api_game_gold}${NC}"
            
            if [ "$user_gold" = "$api_game_gold" ]; then
                echo -e "${GREEN}✅ API金币数据一致${NC}"
            else
                echo -e "${RED}❌ API金币数据不一致${NC}"
            fi
        else
            echo -e "${YELLOW}⚠️  未找到API游戏数据中的金币${NC}"
        fi
    else
        echo -e "${RED}❌ 获取游戏数据失败${NC}"
    fi
    
    return 0
}

# 测试多个用户
test_users=(
    "test001:123456"
    "CCCCCC:123456"
    "357753:123456"
)

echo -e "\n${BLUE}开始测试用户登录...${NC}"

success_count=0
total_count=0

for user_info in "${test_users[@]}"; do
    user_pid=$(echo "$user_info" | cut -d':' -f1)
    password=$(echo "$user_info" | cut -d':' -f2)
    
    total_count=$((total_count + 1))
    if test_login_and_gold "$user_pid" "$password"; then
        success_count=$((success_count + 1))
    fi
done

# 测试管理员登录
echo -e "\n${PURPLE}🔐 测试管理员登录${NC}"
admin_response=$(curl -s -w "\n%{http_code}" -X POST \
    -H "Content-Type: application/json" \
    -d "{\"pid\":\"admin001\",\"password\":\"admin123456\"}" \
    "${BASE_URL}/admin/api/admin/login")

admin_code=$(echo "$admin_response" | tail -n1)
admin_body=$(echo "$admin_response" | head -n -1)

echo -e "${YELLOW}状态码: ${admin_code}${NC}"
echo -e "${YELLOW}响应: ${admin_body}${NC}"

if [ "$admin_code" = "200" ]; then
    echo -e "${GREEN}✅ 管理员登录成功${NC}"
    success_count=$((success_count + 1))
else
    echo -e "${RED}❌ 管理员登录失败${NC}"
fi
total_count=$((total_count + 1))

# 显示测试结果
echo -e "\n${BLUE}==========================================${NC}"
echo -e "${BLUE}📊 测试结果汇总${NC}"
echo -e "${BLUE}==========================================${NC}"
echo -e "${GREEN}成功登录: ${success_count}/${total_count}${NC}"

if [ $success_count -eq $total_count ]; then
    echo -e "\n${GREEN}🎉 所有用户登录测试通过！${NC}"
else
    echo -e "\n${RED}⚠️  有登录失败的情况，请检查:${NC}"
    echo -e "${YELLOW}1. 后端服务是否正常运行${NC}"
    echo -e "${YELLOW}2. 数据库连接是否正常${NC}"
    echo -e "${YELLOW}3. 用户数据是否存在${NC}"
    echo -e "${YELLOW}4. API路由是否正确${NC}"
fi

# 提供调试建议
echo -e "\n${YELLOW}🔧 调试建议:${NC}"
echo -e "${YELLOW}1. 查看后端日志: pm2 logs boop-backend${NC}"
echo -e "${YELLOW}2. 检查数据库: mysql -ugameuser -p123456 -e 'USE game_db; SELECT * FROM users;'${NC}"
echo -e "${YELLOW}3. 检查API路由: curl -X GET ${BASE_URL}/admin/api/login${NC}"
echo -e "${YELLOW}4. 检查网络连接: ping ${SERVER_IP}${NC}"

echo -e "\n${BLUE}📝 测试完成时间: $(date)${NC}" 