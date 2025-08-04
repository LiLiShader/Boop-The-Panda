#!/bin/bash

# =====================================================
# 用户登录和数据获取测试脚本
# 创建时间: 2025-08-01
# 版本: v1.0.0
# 说明: 专门测试用户登录和金币显示问题
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
TEST_USERS=(
    "test001:123456"
    "CCCCCC:123456"
    "357753:123456"
    "admin001:admin123456"
)

echo -e "${BLUE}🔍 开始测试用户登录和数据获取...${NC}"
echo -e "${BLUE}服务器地址: ${BASE_URL}${NC}"
echo -e "${BLUE}测试时间: $(date)${NC}"
echo "=========================================="

# 测试函数
test_user_login() {
    local user_pid="$1"
    local password="$2"
    
    echo -e "\n${PURPLE}👤 测试用户登录: ${user_pid}${NC}"
    
    # 1. 测试普通用户登录
    echo -e "${YELLOW}1. 测试普通用户登录...${NC}"
    login_response=$(curl -s -w "\n%{http_code}" -X POST \
        -H "Content-Type: application/json" \
        -d "{\"pid\":\"${user_pid}\",\"password\":\"${password}\"}" \
        "${BASE_URL}/admin/api/login")
    
    http_code=$(echo "$login_response" | tail -n1)
    response_body=$(echo "$login_response" | head -n -1)
    
    echo -e "${YELLOW}状态码: ${http_code}${NC}"
    echo -e "${YELLOW}响应: ${response_body}${NC}"
    
    if [ "$http_code" = "200" ]; then
        echo -e "${GREEN}✅ 用户登录成功${NC}"
        
        # 解析返回的用户数据
        user_gold=$(echo "$response_body" | grep -o '"gold":[0-9]*' | cut -d':' -f2)
        user_level=$(echo "$response_body" | grep -o '"level":[0-9]*' | cut -d':' -f2)
        
        echo -e "${GREEN}   用户金币: ${user_gold}${NC}"
        echo -e "${GREEN}   用户等级: ${user_level}${NC}"
        
        # 2. 测试获取用户游戏数据
        echo -e "${YELLOW}2. 测试获取用户游戏数据...${NC}"
        game_data_response=$(curl -s -w "\n%{http_code}" \
            "${BASE_URL}/api/user/get-game-data?userId=${user_pid}")
        
        game_data_code=$(echo "$game_data_response" | tail -n1)
        game_data_body=$(echo "$game_data_response" | head -n -1)
        
        echo -e "${YELLOW}状态码: ${game_data_code}${NC}"
        echo -e "${YELLOW}响应: ${game_data_body}${NC}"
        
        if [ "$game_data_code" = "200" ]; then
            echo -e "${GREEN}✅ 获取用户游戏数据成功${NC}"
            
            # 解析游戏数据中的金币
            game_gold=$(echo "$game_data_body" | grep -o '"Gold":"[^"]*"' | cut -d'"' -f4)
            if [ -n "$game_gold" ]; then
                echo -e "${GREEN}   游戏数据金币: ${game_gold}${NC}"
                
                # 比较两个金币值
                if [ "$user_gold" = "$game_gold" ]; then
                    echo -e "${GREEN}✅ 金币数据一致${NC}"
                else
                    echo -e "${RED}❌ 金币数据不一致 - 用户表: ${user_gold}, 游戏数据: ${game_gold}${NC}"
                fi
            else
                echo -e "${YELLOW}⚠️  未找到游戏数据中的金币信息${NC}"
            fi
        else
            echo -e "${RED}❌ 获取用户游戏数据失败${NC}"
        fi
        
        # 3. 测试同步用户数据
        echo -e "${YELLOW}3. 测试同步用户数据...${NC}"
        new_gold=$((user_gold + 10))
        sync_response=$(curl -s -w "\n%{http_code}" -X POST \
            -H "Content-Type: application/json" \
            -d "{\"userId\":\"${user_pid}\",\"data\":[{\"key\":\"Gold\",\"value\":\"${new_gold}\",\"type\":\"number\"}]}" \
            "${BASE_URL}/api/user/sync-data")
        
        sync_code=$(echo "$sync_response" | tail -n1)
        sync_body=$(echo "$sync_response" | head -n -1)
        
        echo -e "${YELLOW}状态码: ${sync_code}${NC}"
        echo -e "${YELLOW}响应: ${sync_body}${NC}"
        
        if [ "$sync_code" = "200" ]; then
            echo -e "${GREEN}✅ 同步用户数据成功${NC}"
            
            # 4. 再次获取用户数据验证同步
            echo -e "${YELLOW}4. 验证数据同步...${NC}"
            verify_response=$(curl -s -w "\n%{http_code}" \
                "${BASE_URL}/api/user/get-game-data?userId=${user_pid}")
            
            verify_code=$(echo "$verify_response" | tail -n1)
            verify_body=$(echo "$verify_response" | head -n -1)
            
            if [ "$verify_code" = "200" ]; then
                verify_gold=$(echo "$verify_body" | grep -o '"Gold":"[^"]*"' | cut -d'"' -f4)
                if [ "$verify_gold" = "$new_gold" ]; then
                    echo -e "${GREEN}✅ 数据同步验证成功${NC}"
                else
                    echo -e "${RED}❌ 数据同步验证失败 - 期望: ${new_gold}, 实际: ${verify_gold}${NC}"
                fi
            fi
        else
            echo -e "${RED}❌ 同步用户数据失败${NC}"
        fi
        
    else
        echo -e "${RED}❌ 用户登录失败${NC}"
    fi
}

# 测试管理员登录
test_admin_login() {
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
    else
        echo -e "${RED}❌ 管理员登录失败${NC}"
    fi
}

# 测试数据库连接
test_database() {
    echo -e "\n${PURPLE}🗄️  测试数据库连接${NC}"
    
    if command -v mysql &> /dev/null; then
        echo -e "${YELLOW}检查数据库连接...${NC}"
        
        # 检查用户表
        user_count=$(mysql -ugameuser -p123456 -h127.0.0.1 -e "USE game_db; SELECT COUNT(*) FROM users;" 2>/dev/null | tail -n 1)
        if [ -n "$user_count" ] && [ "$user_count" -gt 0 ]; then
            echo -e "${GREEN}✅ 用户表正常，共 ${user_count} 个用户${NC}"
        else
            echo -e "${RED}❌ 用户表异常或为空${NC}"
        fi
        
        # 检查用户游戏数据表
        game_data_count=$(mysql -ugameuser -p123456 -h127.0.0.1 -e "USE game_db; SELECT COUNT(*) FROM user_game_data;" 2>/dev/null | tail -n 1)
        if [ -n "$game_data_count" ]; then
            echo -e "${GREEN}✅ 用户游戏数据表正常，共 ${game_data_count} 条记录${NC}"
        else
            echo -e "${RED}❌ 用户游戏数据表异常${NC}"
        fi
        
        # 检查特定用户的金币数据
        echo -e "${YELLOW}检查用户金币数据...${NC}"
        for user_info in "${TEST_USERS[@]}"; do
            user_pid=$(echo "$user_info" | cut -d':' -f1)
            if [ "$user_pid" != "admin001" ]; then
                user_gold=$(mysql -ugameuser -p123456 -h127.0.0.1 -e "USE game_db; SELECT gold FROM users WHERE pid = '${user_pid}';" 2>/dev/null | tail -n 1)
                game_gold=$(mysql -ugameuser -p123456 -h127.0.0.1 -e "USE game_db; SELECT data_value FROM user_game_data WHERE user_id = '${user_pid}' AND data_key = 'Gold';" 2>/dev/null | tail -n 1)
                
                echo -e "${YELLOW}用户 ${user_pid}:${NC}"
                echo -e "${YELLOW}  用户表金币: ${user_gold}${NC}"
                echo -e "${YELLOW}  游戏数据金币: ${game_gold}${NC}"
                
                if [ "$user_gold" = "$game_gold" ] && [ -n "$user_gold" ]; then
                    echo -e "${GREEN}  ✅ 金币数据一致${NC}"
                else
                    echo -e "${RED}  ❌ 金币数据不一致${NC}"
                fi
            fi
        done
    else
        echo -e "${YELLOW}⚠️  MySQL客户端未安装，跳过数据库测试${NC}"
    fi
}

# 执行测试
for user_info in "${TEST_USERS[@]}"; do
    user_pid=$(echo "$user_info" | cut -d':' -f1)
    password=$(echo "$user_info" | cut -d':' -f2)
    
    if [ "$user_pid" = "admin001" ]; then
        test_admin_login
    else
        test_user_login "$user_pid" "$password"
    fi
done

# 测试数据库
test_database

echo -e "\n${BLUE}==========================================${NC}"
echo -e "${BLUE}📊 测试完成${NC}"
echo -e "${BLUE}==========================================${NC}"
echo -e "${BLUE}📝 测试完成时间: $(date)${NC}"

echo -e "\n${YELLOW}🔧 如果发现问题，请检查:${NC}"
echo -e "${YELLOW}1. 后端服务是否正常运行: pm2 list${NC}"
echo -e "${YELLOW}2. 数据库连接是否正常: mysql -ugameuser -p123456 -e 'USE game_db;'${NC}"
echo -e "${YELLOW}3. 查看服务日志: pm2 logs boop-backend${NC}"
echo -e "${YELLOW}4. 检查数据库表结构: mysql -ugameuser -p123456 -e 'USE game_db; DESCRIBE users;'${NC}"
echo -e "${YELLOW}5. 检查用户数据: mysql -ugameuser -p123456 -e 'USE game_db; SELECT * FROM users LIMIT 5;'${NC}" 