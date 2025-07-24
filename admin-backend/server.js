const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.sendStatus(204);
});
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 数据库连接配置
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'game_db',
    port: process.env.DB_PORT || 3306
};

// 创建数据库连接池
const pool = mysql.createPool({
    ...dbConfig,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// 测试数据库连接
pool.getConnection((err, connection) => {
    if (err) {
        console.error('数据库连接失败:', err);
        return;
    }
    console.log('数据库连接成功');
    connection.release();
});

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

// 初始化数据库表
pool.query(createUsersTableSQL, (err) => {
    if (err) {
        console.error('创建用户表失败:', err);
    } else {
        console.log('用户表初始化成功');
    }
});

pool.query(createPaymentRecordsTableSQL, (err) => {
    if (err) {
        console.error('创建支付记录表失败:', err);
    } else {
        console.log('支付记录表初始化成功');
    }
});

// 注册接口
app.post('/api/auth/register', (req, res) => {
    const { pid, name, password } = req.body;
    
    if (!pid || !name || !password) {
        return res.json({
            success: false,
            message: '请填写完整信息'
        });
    }
    
    const sql = 'INSERT INTO users (pid, name, password) VALUES (?, ?, ?)';
    pool.query(sql, [pid, name, password], (err, result) => {
        if (err) {
            console.error('注册失败:', err);
            if (err.code === 'ER_DUP_ENTRY') {
                return res.json({
                    success: false,
                    message: '玩家ID已存在'
                });
            }
            return res.json({
                success: false,
                message: '注册失败，请重试'
            });
        }
        
        res.json({
            success: true,
            message: '注册成功',
            data: {
                id: result.insertId,
                pid,
                name,
                level: 1,
                gold: 500
            }
        });
    });
});

// 登录接口
app.post('/api/auth/login', (req, res) => {
    const { pid, password } = req.body;
    
    if (!pid || !password) {
        return res.json({
            success: false,
            message: '请填写完整信息'
        });
    }
    
    const sql = 'SELECT * FROM users WHERE pid = ? AND password = ?';
    pool.query(sql, [pid, password], (err, results) => {
        if (err) {
            console.error('登录查询失败:', err);
            return res.json({
                success: false,
                message: '登录失败，请重试'
            });
        }
        
        if (results.length === 0) {
            return res.json({
                success: false,
                message: '玩家ID或密码错误'
            });
        }
        
        const user = results[0];
        res.json({
            success: true,
            message: '登录成功',
            data: {
                id: user.id,
                pid: user.pid,
                name: user.name,
                level: user.level,
                gold: user.gold,
                icon: user.icon
            }
        });
    });
});

// 获取用户信息
app.get('/api/users/:pid', (req, res) => {
    const { pid } = req.params;
    
    const sql = 'SELECT id, pid, name, level, gold, icon, created_at FROM users WHERE pid = ?';
    pool.query(sql, [pid], (err, results) => {
        if (err) {
            console.error('查询用户信息失败:', err);
            return res.json({
                success: false,
                message: '查询失败'
            });
        }
        
        if (results.length === 0) {
            return res.json({
                success: false,
                message: '用户不存在'
            });
        }
        
        res.json({
            success: true,
            data: results[0]
        });
    });
});

// 更新用户信息
app.put('/api/users/:pid', (req, res) => {
    const { pid } = req.params;
    const { level, gold, icon } = req.body;
    
    const updateFields = [];
    const updateValues = [];
    
    if (level !== undefined) {
        updateFields.push('level = ?');
        updateValues.push(level);
    }
    if (gold !== undefined) {
        updateFields.push('gold = ?');
        updateValues.push(gold);
    }
    if (icon !== undefined) {
        updateFields.push('icon = ?');
        updateValues.push(icon);
    }
    
    if (updateFields.length === 0) {
        return res.json({
            success: false,
            message: '没有需要更新的数据'
        });
    }
    
    updateValues.push(pid);
    const sql = `UPDATE users SET ${updateFields.join(', ')} WHERE pid = ?`;
    
    pool.query(sql, updateValues, (err, result) => {
        if (err) {
            console.error('更新用户信息失败:', err);
            return res.json({
                success: false,
                message: '更新失败'
            });
        }
        
        if (result.affectedRows === 0) {
            return res.json({
                success: false,
                message: '用户不存在'
            });
        }
        
        res.json({
            success: true,
            message: '更新成功'
        });
    });
});

// 获取所有用户列表（管理员用）
app.get('/api/users', (req, res) => {
    const { page = 1, limit = 20, search = '' } = req.query;
    const offset = (page - 1) * limit;
    
    let sql = 'SELECT id, pid, name, level, gold, icon, created_at FROM users';
    let countSql = 'SELECT COUNT(*) as total FROM users';
    let params = [];
    let countParams = [];
    
    if (search) {
        sql += ' WHERE pid LIKE ? OR name LIKE ?';
        countSql += ' WHERE pid LIKE ? OR name LIKE ?';
        const searchParam = `%${search}%`;
        params = [searchParam, searchParam];
        countParams = [searchParam, searchParam];
    }
    
    sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);
    
    // 先获取总数
    pool.query(countSql, countParams, (err, countResults) => {
        if (err) {
            console.error('查询用户总数失败:', err);
            return res.json({
                success: false,
                message: '查询失败'
            });
        }
        
        const total = countResults[0].total;
        
        // 再获取用户列表
        pool.query(sql, params, (err, results) => {
            if (err) {
                console.error('查询用户列表失败:', err);
                return res.json({
                    success: false,
                    message: '查询失败'
                });
            }
            
            res.json({
                success: true,
                data: {
                    users: results,
                    pagination: {
                        page: parseInt(page),
                        limit: parseInt(limit),
                        total,
                        pages: Math.ceil(total / limit)
                    }
                }
            });
        });
    });
});

// 记录支付信息接口
app.post('/api/payments/record', (req, res) => {
    const { user_id, user_name, amount, order_no, pay_time, raw_response, product_id, product_info, product_details } = req.body;

    if (!user_id || !user_name || !amount || !order_no || !pay_time) {
        return res.json({
            success: false,
            message: '缺少必要参数'
        });
    }

    // 使用包含商品信息的SQL语句
    const sql = `INSERT INTO payment_records 
                (user_id, user_name, amount, order_no, pay_time, raw_response, product_id, product_info, product_details) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    
    pool.query(
        sql, 
        [
            user_id, 
            user_name, 
            amount, 
            order_no, 
            pay_time, 
            JSON.stringify(raw_response || {}),
            product_id || null,
            product_info || null,
            product_details ? JSON.stringify(product_details) : null
        ], 
        (err, result) => {
            if (err) {
                console.error('记录支付信息失败:', err);
                return res.json({
                    success: false,
                    message: '记录失败'
                });
            }
            res.json({
                success: true,
                message: '记录成功'
            });
        }
    );
});

// 查询某用户所有支付记录
app.get('/api/payments/user/:user_id', (req, res) => {
    const { user_id } = req.params;
    // 修改SQL查询，包含商品信息字段
    const sql = `SELECT id, user_id, user_name, amount, order_no, pay_time, created_at, 
                product_id, product_info, product_details 
                FROM payment_records WHERE user_id = ? ORDER BY id DESC`;
    
    pool.query(sql, [user_id], (err, results) => {
        if (err) {
            console.error('查询支付记录失败:', err);
            return res.json({ success: false, message: '查询失败' });
        }
        res.json({ success: true, data: results });
    });
});

// 查询所有支付订单
app.get('/api/payments/all', (req, res) => {
    // 修改SQL查询，包含商品信息字段
    const sql = `SELECT id, user_id, user_name, amount, order_no, pay_time, created_at, 
                product_id, product_info, product_details 
                FROM payment_records ORDER BY id DESC`;
    
    pool.query(sql, [], (err, results) => {
        if (err) {
            console.error('查询所有支付订单失败:', err);
            return res.json({ success: false, message: '查询失败' });
        }
        res.json({ success: true, data: results });
    });
});

// 健康检查接口
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: '服务器运行正常',
        timestamp: new Date().toISOString()
    });
});

// 全局CORS头，确保所有响应都带上
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

// 错误处理中间件
app.use((err, req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    console.error('服务器错误:', err);
    res.status(500).json({
        success: false,
        message: '服务器内部错误'
    });
});

// 404处理
app.use((req, res) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.status(404).json({
        success: false,
        message: '接口不存在'
    });
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`账号系统服务器运行在端口 ${PORT}`);
    console.log(`健康检查: http://localhost:${PORT}/api/health`);
}); 