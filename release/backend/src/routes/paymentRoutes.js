const express = require('express');
const paymentService = require('../services/paymentService');

const router = express.Router();

// 支付代理接口
router.post('/pay', async (req, res) => {
    console.log('收到支付请求，请求体:', req.body);
    console.log('请求头:', req.headers);
    console.log('请求来源:', req.get('origin'));

    try {
        const response = await paymentService.processPayment(req.body);
        res.json(response);
    } catch (error) {
        console.error('代理请求失败:', error.message);
        res.status(500).json(error);
    }
});

// 3D支付回调处理
router.get('/get3DResult', (req, res) => {
    console.log('收到3D支付回调:', req.query);
    
    const { amount, billNo, code, message } = req.query;
    
    try {
        // 处理3D回调
        paymentService.process3DCallback(req.query);
        
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

// 查询支付状态API
router.get('/status/:billNo', (req, res) => {
    const { billNo } = req.params;
    const result = paymentService.getPaymentStatus(billNo);
    res.json(result);
});

// 添加支付记录API
router.post('/record', async (req, res) => {
    const { user_id, user_name, amount, order_no, product_id, product_info, raw_response } = req.body;
    
    if (!user_id || !user_name || !amount || !order_no) {
        return res.status(400).json({
            success: false,
            message: 'user_id, user_name, amount和order_no为必填项'
        });
    }
    
    try {
        const result = await paymentService.savePaymentRecord(req.body);
        if (result.success) {
            res.status(201).json(result);
        } else {
            res.status(500).json(result);
        }
    } catch (error) {
        console.error('添加支付记录失败:', error);
        res.status(500).json({
            success: false,
            message: '添加支付记录失败: ' + error.message
        });
    }
});

module.exports = router; 