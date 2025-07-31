const mysql = require('mysql2');
require('dotenv').config();

// 数据库连接配置
   const dbConfig = {
       host: '127.0.0.1',  // 明确使用IPv4地址，而不是process.env.DB_HOST
       user: process.env.DB_USER || 'gameuser',
       password: process.env.DB_PASSWORD || '123456',
       database: process.env.DB_NAME || 'game_db',
       port: process.env.DB_PORT || 3306
   };

   // 创建数据库连接池
   const pool = mysql.createPool({
       ...dbConfig,
       waitForConnections: true,
       connectionLimit: 10,
       queueLimit: 0,
       socketPath: undefined  // 不使用socket连接
       // 删除family参数
   });

// 测试数据库连接
const testConnection = () => {
    return new Promise((resolve, reject) => {
        pool.getConnection((err, connection) => {
            if (err) {
                console.error('数据库连接失败:', err);
                reject(err);
                return;
            }
            console.log('数据库连接成功');
            connection.release();
            resolve(true);
        });
    });
};

// 创建所需的数据库表
const initializeTables = async () => {
    // 创建用户表的SQL
    const createUsersTableSQL = `
    CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        pid VARCHAR(50) UNIQUE NOT NULL,
        name VARCHAR(100) NOT NULL,
        password VARCHAR(100) NOT NULL,
        level INT DEFAULT 1,
        gold INT DEFAULT 500,
        icon VARCHAR(100) DEFAULT '1',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `;

    // 创建支付记录表的SQL
    const createPaymentRecordsTableSQL = `
    CREATE TABLE IF NOT EXISTS payment_records (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id VARCHAR(50) NOT NULL,
        user_name VARCHAR(100) NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        order_no VARCHAR(100) NOT NULL UNIQUE,
        pay_time DATETIME NOT NULL,
        raw_response JSON DEFAULT NULL,
        product_id VARCHAR(20) DEFAULT NULL COMMENT '商品ID',
        product_info TEXT DEFAULT NULL COMMENT '商品信息',
        product_details JSON DEFAULT NULL COMMENT '商品详细信息',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_user_id (user_id),
        INDEX idx_order_no (order_no)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `;

    try {
        await pool.promise().query(createUsersTableSQL);
        console.log('用户表初始化成功');
        
        await pool.promise().query(createPaymentRecordsTableSQL);
        console.log('支付记录表初始化成功');
        
        return true;
    } catch (error) {
        console.error('初始化数据库表失败:', error);
        return false;
    }
};

module.exports = {
    pool,
    testConnection,
    initializeTables
}; 