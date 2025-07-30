#!/bin/bash

echo "=== 添加测试数据脚本 ==="

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 生成随机用户ID
generate_pid() {
    echo "test$(date +%s)$(shuf -i 1000-9999 -n 1)"
}

# 生成随机用户名
generate_name() {
    names=("测试用户" "游戏玩家" "新用户" "玩家" "用户")
    echo "${names[$((RANDOM % ${#names[@]}))]}$(shuf -i 100-999 -n 1)"
}

# 生成随机密码
generate_password() {
    echo "pass$(shuf -i 100000-999999 -n 1)"
}

echo -e "${YELLOW}请输入要添加的用户数量:${NC}"
read -p "数量: " user_count

if [ -z "$user_count" ] || [ "$user_count" -lt 1 ]; then
    echo "无效的数量，使用默认值 5"
    user_count=5
fi

echo -e "${YELLOW}开始添加 $user_count 个测试用户...${NC}"

# 构建SQL语句
sql="USE game_db;"

for i in $(seq 1 $user_count); do
    pid=$(generate_pid)
    name=$(generate_name)
    password=$(generate_password)
    
    sql="$sql INSERT INTO users (pid, name, password, level, gold, icon, created_at, updated_at) VALUES ('$pid', '$name', '$password', 1, 500, 1, NOW(), NOW());"
done

# 执行SQL
echo -e "${YELLOW}执行SQL语句...${NC}"
mysql -u root -p -e "$sql"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ 成功添加 $user_count 个测试用户${NC}"
    
    # 显示最新添加的用户
    echo -e "${YELLOW}最新添加的用户:${NC}"
    mysql -u root -p -e "USE game_db; SELECT pid, name, level, gold, created_at FROM users ORDER BY created_at DESC LIMIT $user_count;"
else
    echo -e "${RED}✗ 添加用户失败${NC}"
fi

echo "=== 脚本执行完成 ===" 