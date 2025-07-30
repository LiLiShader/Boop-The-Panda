const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

// 导入配置
const { testConnection, initializeTables } = require('./src/config/database');
const paymentConfig = require('./src/config/paymentConfig');

// 导入路由
const adminRoutes = require('./src/routes/adminRoutes');
const paymentRoutes = require('./src/routes/paymentRoutes');

// 导入服务
const paymentService = require('./src/services/paymentService');

// 创建Express应用实例
const app = express();
const PORT = process.env.PORT || 3000;

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

// API路由
app.use('/admin/api', adminRoutes);
app.use('/api/payment', paymentRoutes);

// 健康检查接口
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok',
        service: 'Boop-The-Panda后端服务',
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString()
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
        app.listen(PORT, () => {
            console.log(`Boop-The-Panda后端服务运行在 http://localhost:${PORT}`);
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
            console.log('其他API:');
            console.log('- GET /health: 健康检查');
        });
    } catch (error) {
        console.error('服务启动失败:', error);
        process.exit(1);
    }
};

startServer(); 