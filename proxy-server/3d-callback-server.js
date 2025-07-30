const express = require('express');
const cors = require('cors');
const axios = require('axios');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 5001; // 3D支付回调服务监听5001端口
// 服务器配置
const SERVER_HOST = '119.91.142.92';
const MAIN_SERVER_PORT = 3001;
const PROXY_SERVER_PORT = 5000;
const PROTOCOL = 'http';

const MAIN_SERVER_URL = `${PROTOCOL}://${SERVER_HOST}:${MAIN_SERVER_PORT}`; // 主服务器URL
const PROXY_SERVER_URL = `${PROTOCOL}://${SERVER_HOST}:${PROXY_SERVER_PORT}`; // 支付代理服务器URL

// 允许所有域名访问的CORS配置
app.use(cors({
    origin: '*',  // 允许所有域名访问
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// 解析URL编码的请求体
app.use(bodyParser.urlencoded({ extended: true }));
// 解析JSON请求体
app.use(bodyParser.json());

// 3D支付回调处理
app.get('/api/get3DResult', async (req, res) => {
    console.log('收到3D支付回调:', req.query);
    
    const { amount, billNo, code, message } = req.query;
    
    try {
        // 通知支付代理服务器更新支付状态
        try {
            await axios.get(`${PROXY_SERVER_URL}/api/get3DResult`, { params: req.query });
            console.log('已通知支付代理服务器更新支付状态');
        } catch (proxyError) {
            console.error('通知支付代理服务器失败:', proxyError.message);
        }
        
        // 3D支付成功，但支付记录由游戏客户端负责上传
        if (code === 'P0001') {
            console.log('3D支付成功，支付记录将由游戏客户端上传');
        }
        
        // 返回简单的成功页面
        res.send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>支付结果</title>
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        text-align: center;
                        margin: 50px;
                    }
                    .success {
                        color: green;
                        font-size: 24px;
                    }
                    .failed {
                        color: red;
                        font-size: 24px;
                    }
                    .message {
                        margin: 20px 0;
                    }
                    .button {
                        background-color: #4CAF50;
                        border: none;
                        color: white;
                        padding: 10px 20px;
                        text-align: center;
                        text-decoration: none;
                        display: inline-block;
                        font-size: 16px;
                        margin: 4px 2px;
                        cursor: pointer;
                        border-radius: 5px;
                    }
                </style>
            </head>
            <body>
                <h1 class="${code === 'P0001' ? 'success' : 'failed'}">
                    ${code === 'P0001' ? '支付成功' : '支付失败'}
                </h1>
                <div class="message">
                    订单号: ${billNo}<br>
                    ${amount ? `金额: ${amount}<br>` : ''}
                    ${message ? `消息: ${message}<br>` : ''}
                </div>
                <p>请关闭此窗口并返回游戏继续。</p>
                <button class="button" onclick="window.close()">关闭窗口</button>
                <script>
                    // 5秒后尝试自动关闭窗口
                    setTimeout(() => {
                        try {
                            window.close();
                        } catch (e) {
                            console.log('无法自动关闭窗口');
                        }
                    }, 5000);
                </script>
            </body>
            </html>
        `);
    } catch (error) {
        console.error('处理3D支付回调失败:', error);
        res.status(500).send('处理支付回调时出错');
    }
});

// 健康检查接口
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok',
        service: '3D支付回调服务器',
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString()
    });
});

app.listen(port, () => {
    console.log(`3D支付回调服务器运行在 http://localhost:${port}`);
    console.log('当前环境:', process.env.NODE_ENV || 'development');
    console.log('支持的接口:');
    console.log('- GET /api/get3DResult: 3D支付回调处理');
    console.log('- GET /health: 健康检查');
}); 