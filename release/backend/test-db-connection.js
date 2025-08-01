const mysql = require('mysql2');
require('dotenv').config();

console.log('=== 数据库连接测试 ===');
console.log('环境变量:');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_PORT:', process.env.DB_PORT);

// 数据库连接配置
const dbConfig = {
    host: '127.0.0.1',
    user: process.env.DB_USER || 'gameuser',
    password: process.env.DB_PASSWORD || '123456',
    database: process.env.DB_NAME || 'game_db',
    port: process.env.DB_PORT || 3306
};

console.log('数据库配置:', dbConfig);

// 创建数据库连接池
const pool = mysql.createPool({
    host: dbConfig.host,
    user: dbConfig.user,
    password: dbConfig.password,
    database: dbConfig.database,
    port: dbConfig.port,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// 测试连接
pool.getConnection((err, connection) => {
    if (err) {
        console.error('数据库连接失败:', err);
        process.exit(1);
    }
    
    console.log('数据库连接成功！');
    
    // 测试查询
    connection.query('SELECT 1 as test', (err, results) => {
        if (err) {
            console.error('查询失败:', err);
        } else {
            console.log('查询成功:', results);
        }
        
        connection.release();
        pool.end();
        console.log('测试完成');
    });
}); 