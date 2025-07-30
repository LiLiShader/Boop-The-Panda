const mysql = require('mysql2/promise');
require('dotenv').config();

// 数据库配置
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'game_db',
    port: process.env.DB_PORT || 3306
};

// 生成随机数据
function generateRandomData() {
    const timestamp = Date.now();
    const randomNum = Math.floor(Math.random() * 10000);
    
    return {
        pid: `test${timestamp}${randomNum}`,
        name: `测试用户${randomNum}`,
        password: `pass${randomNum}`,
        level: 1,
        gold: 500,
        icon: 1
    };
}

// 添加单个用户
async function addUser(connection, userData) {
    try {
        const [result] = await connection.execute(
            'INSERT INTO users (pid, name, password, level, gold, icon, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())',
            [userData.pid, userData.name, userData.password, userData.level, userData.gold, userData.icon]
        );
        console.log(`✓ 添加用户成功: ${userData.pid} - ${userData.name}`);
        return result;
    } catch (error) {
        console.error(`✗ 添加用户失败: ${userData.pid}`, error.message);
        return null;
    }
}

// 批量添加用户
async function addMultipleUsers(count = 5) {
    let connection;
    
    try {
        // 连接数据库
        connection = await mysql.createConnection(dbConfig);
        console.log('✓ 数据库连接成功');
        
        // 添加用户
        console.log(`开始添加 ${count} 个测试用户...`);
        
        for (let i = 0; i < count; i++) {
            const userData = generateRandomData();
            await addUser(connection, userData);
        }
        
        // 显示最新添加的用户
        console.log('\n最新添加的用户:');
        const [rows] = await connection.execute(
            'SELECT pid, name, level, gold, created_at FROM users ORDER BY created_at DESC LIMIT ?',
            [count]
        );
        
        rows.forEach(row => {
            console.log(`  ${row.pid} - ${row.name} - 等级:${row.level} - 金币:${row.gold} - ${row.created_at}`);
        });
        
        console.log(`\n✓ 成功添加 ${count} 个测试用户`);
        
    } catch (error) {
        console.error('✗ 数据库操作失败:', error.message);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

// 主函数
async function main() {
    const args = process.argv.slice(2);
    const count = parseInt(args[0]) || 5;
    
    console.log('=== 数据库添加测试数据 ===');
    console.log(`准备添加 ${count} 个测试用户`);
    
    await addMultipleUsers(count);
    
    console.log('=== 脚本执行完成 ===');
}

// 运行脚本
if (require.main === module) {
    main().catch(console.error);
}

module.exports = { addUser, addMultipleUsers, generateRandomData }; 