const express = require('express');
const cors = require('cors');
const axios = require('axios');
const bodyParser = require('body-parser');
const querystring = require('querystring');

const app = express();
const port = process.env.PORT || 5000;

// 允许所有域名访问的CORS配置
app.use(cors({
    origin: '*',  // 允许所有域名访问
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// 解析application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// 支付代理接口
app.post('/api/pay', async (req, res) => {
    console.log('收到支付请求，请求体:', req.body);
    console.log('请求头:', req.headers);

    try {
        // 直接转发URL编码的数据
        const response = await axios({
            method: 'post',
            url: 'https://thunderousfreeze.com/api/pay',
            data: req.body,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json'
            },
            // 允许自签名证书（仅用于测试环境）
            httpsAgent: new (require('https').Agent)({
                rejectUnauthorized: false
            })
        });
        
        console.log('支付服务器响应:', response.data);
        res.json(response.data);
    } catch (error) {
        console.error('代理请求失败:', error.message);
        if (error.response) {
            console.error('错误响应数据:', error.response.data);
            console.error('错误响应状态:', error.response.status);
            console.error('错误响应头:', error.response.headers);
        } else if (error.request) {
            console.error('请求发送失败:', error.request);
        }
        
        res.status(500).json({
            code: 'ERROR',
            message: error.message || '代理请求失败'
        });
    }
});

// 健康检查接口
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

app.listen(port, '0.0.0.0', () => {
    console.log(`代理服务器运行在 http://0.0.0.0:${port}`);
    console.log('支持的接口:');
    console.log('- POST /api/pay: 支付代理');
    console.log('- GET /health: 健康检查');
});