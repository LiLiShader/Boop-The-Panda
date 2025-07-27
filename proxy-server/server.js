const express = require('express');
const cors = require('cors');
const axios = require('axios');
const bodyParser = require('body-parser');
const querystring = require('querystring');

const app = express();
const port = process.env.PORT || 5000; // 使用5000端口作为支付代理
const PAY_API_URL = 'https://testurl.carespay.com:28081/carespay/pay';

// 内存缓存，用于存储3D支付的临时状态
// 注意：在生产环境中应该使用Redis或数据库存储
const paymentStatusCache = {};

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
    console.log('请求来源:', req.get('origin'));

    try {
        // 直接转发URL编码的数据
        const response = await axios({
            method: 'post',
            url: PAY_API_URL,
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
        
        // 如果是3D支付，缓存请求信息以便后续处理回调
        if (response.data && response.data.code === 'P0004' && response.data.auth3DUrl) {
            const billNo = req.body.billNo;
            paymentStatusCache[billNo] = {
                status: 'PENDING',
                requestData: req.body,
                responseData: response.data,
                timestamp: Date.now()
            };
            console.log(`缓存3D支付状态，订单号: ${billNo}`);
        }
        
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

// 3D支付回调处理
app.get('/api/get3DResult', async (req, res) => {
    console.log('收到3D支付回调:', req.query);
    
    const { amount, billNo, code, message } = req.query;
    
    try {
        // 更新支付状态缓存
        if (billNo && paymentStatusCache[billNo]) {
            paymentStatusCache[billNo].status = code === 'P0001' ? 'PAID' : 'FAILED';
            paymentStatusCache[billNo].callbackData = req.query;
            paymentStatusCache[billNo].updatedAt = Date.now();
            
            console.log(`更新3D支付状态，订单号: ${billNo}, 状态: ${paymentStatusCache[billNo].status}`);
            
            // 如果支付成功，记录支付信息到支付记录服务
            if (code === 'P0001') {
                try {
                    // 从缓存中获取原始请求数据和商品信息
                    const originalRequest = paymentStatusCache[billNo].requestData;
                    const productInfo = originalRequest ? decodeURIComponent(originalRequest.productInfo || '') : '';
                    
                    // 构造支付记录数据
                    const paymentRecord = {
                        user_id: '', // 可能需要从原始请求中提取用户ID
                        user_name: '',
                        amount: parseFloat(amount || 0),
                        order_no: billNo,
                        pay_time: new Date().toISOString().replace('T', ' ').substring(0, 19),
                        raw_response: req.query,
                        product_info: productInfo,
                        payment_type: '3D',
                        status: 'PAID'
                    };
                    
                    // 发送到支付记录服务
                    await axios.post('http://119.91.142.92:3001/api/payments/record', paymentRecord);
                    console.log('3D支付记录已发送到支付记录服务');
                } catch (recordError) {
                    console.error('记录3D支付信息失败:', recordError);
                }
            }
        } else {
            console.warn(`未找到订单号为 ${billNo} 的支付状态缓存`);
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

// 查询支付状态API
app.get('/api/payment/status/:billNo', (req, res) => {
    const { billNo } = req.params;
    
    if (!billNo) {
        return res.status(400).json({ success: false, message: '订单号不能为空' });
    }
    
    const paymentStatus = paymentStatusCache[billNo];
    if (paymentStatus) {
        res.json({
            success: true,
            data: {
                billNo,
                status: paymentStatus.status,
                updatedAt: paymentStatus.updatedAt || paymentStatus.timestamp
            }
        });
    } else {
        res.json({
            success: false,
            message: '未找到该订单的支付状态'
        });
    }
});

// 健康检查接口
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok',
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString()
    });
});

// 清理过期的支付状态缓存
setInterval(() => {
    const now = Date.now();
    const expireTime = 24 * 60 * 60 * 1000; // 24小时过期
    
    Object.keys(paymentStatusCache).forEach(billNo => {
        const status = paymentStatusCache[billNo];
        if (now - (status.updatedAt || status.timestamp) > expireTime) {
            delete paymentStatusCache[billNo];
            console.log(`清理过期的支付状态缓存，订单号: ${billNo}`);
        }
    });
}, 60 * 60 * 1000); // 每小时运行一次

app.listen(port, () => {
    console.log(`支付代理服务器运行在 http://localhost:${port}`);
    console.log('当前环境:', process.env.NODE_ENV || 'development');
    console.log('支持的接口:');
    console.log('- POST /api/pay: 支付代理');
    console.log('- GET /api/get3DResult: 3D支付回调处理');
    console.log('- GET /api/payment/status/:billNo: 查询支付状态');
    console.log('- GET /health: 健康检查');
}); 