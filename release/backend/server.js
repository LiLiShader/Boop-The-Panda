const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'config.env') });

// 导入配置
const { testConnection, initializeTables } = require('./src/config/database');
const paymentConfig = require('./src/config/paymentConfig');

// 导入路由
const adminRoutes = require('./src/routes/adminRoutes');
const paymentRoutes = require('./src/routes/paymentRoutes');
const userDataRoutes = require('./src/routes/userDataRoutes');
const configRoutes = require('./src/routes/configRoutes');

// 导入服务
const paymentService = require('./src/services/paymentService');

// 创建Express应用实例
const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'User-Agent', 'X-Requested-With'],
    credentials: false,
    preflightContinue: false,
    optionsSuccessStatus: 204
}));

// 全局CORS处理
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, User-Agent, X-Requested-With');
    res.header('Access-Control-Allow-Credentials', 'false');
    
    if (req.method === 'OPTIONS') {
        res.sendStatus(204);
    } else {
        next();
    }
});
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// API路由
app.use('/admin/api', adminRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/user', userDataRoutes);
app.use('/api/config', configRoutes);

// 健康检查接口
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok',
        service: 'Boop-The-Panda后端服务',
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString()
    });
});

// 简单测试接口
app.get('/test', (req, res) => {
    res.json({ 
        message: 'Backend service is working',
        timestamp: new Date().toISOString(),
        headers: req.headers
    });
});

// POST测试接口
app.post('/test', (req, res) => {
    res.json({ 
        message: 'POST request received',
        body: req.body,
        timestamp: new Date().toISOString(),
        headers: req.headers
    });
});

// 错误处理中间件
app.use((err, req, res, next) => {
    console.error('服务器错误:', err);
    res.status(500).json({
        success: false,
        message: '服务器内部错误',
        error: process.env.NODE_ENV === 'production' ? null : err.message
    });
});

// 启动服务器
const startServer = async () => {
    try {
        // 测试数据库连接
        await testConnection();
        
        // 初始化数据库表
        await initializeTables();
        
        // 启动缓存清理定时任务
        paymentService.initCacheCleaner();
        
        // 启动服务
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`Boop-The-Panda后端服务运行在 http://0.0.0.0:${PORT}`);
            console.log('当前环境:', process.env.NODE_ENV || 'development');
            console.log('=== 支持的API ===');
            console.log('管理后台API:');
            console.log('- GET /admin/api/users: 获取所有用户');
            console.log('- GET /admin/api/users/:pid: 获取单个用户');
            console.log('- POST /admin/api/users: 创建新用户');
            console.log('- PUT /admin/api/users/:pid: 更新用户信息');
            console.log('- GET /admin/api/payments: 获取所有支付记录');
            console.log('- GET /admin/api/users/:pid/payments: 获取用户支付记录');
            console.log('');
            console.log('支付相关API:');
            console.log('- POST /api/payment/pay: 支付代理');
            console.log('- GET /api/payment/get3DResult: 3D支付回调');
            console.log('- GET /api/payment/status/:billNo: 查询支付状态');
            console.log('- POST /api/payment/record: 添加支付记录');
            console.log('');
            console.log('用户数据同步API:');
            console.log('- POST /api/user/sync-data: 同步用户游戏数据');
            console.log('- GET /api/user/get-game-data: 获取用户游戏数据');
            console.log('- GET /api/user/get-game-data/:key: 获取特定游戏数据');
            console.log('- DELETE /api/user/delete-game-data/:key: 删除特定游戏数据');
            console.log('- POST /api/user/init-game-data: 初始化用户游戏数据');
            console.log('- GET /api/user/sync-status: 获取同步状态');
            console.log('');
            console.log('其他API:');
            console.log('- GET /health: 健康检查');
        });
    } catch (error) {
        console.error('服务启动失败:', error);
        process.exit(1);
    }
};

startServer(); 