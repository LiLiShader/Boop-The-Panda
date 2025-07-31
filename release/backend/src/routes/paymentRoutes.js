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
                <title>Payment Result</title>
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
                    ${code === 'P0001' ? 'Payment Successful' : 'Payment Failed'}
                </h1>
                <div class="message">
                    Order ID: ${billNo}<br>
                    ${amount ? `Amount: ${amount}<br>` : ''}
                    ${message ? `Message: ${message}<br>` : ''}
                </div>
                <p>Please close this window and return to the game to continue.</p>
                <button class="button" onclick="closeWindow()">Close Window</button>
                <script>
                    function closeWindow() {
                        // Try multiple methods to close the window
                        try {
                            // Method 1: Direct close
                            window.close();
                        } catch (e) {
                            console.log('Method 1 failed:', e);
                        }
                        
                        // Method 2: Delayed close
                        setTimeout(() => {
                            try {
                                window.close();
                            } catch (e) {
                                console.log('Method 2 failed:', e);
                            }
                        }, 100);
                        
                        // Method 3: Go back to previous page
                        setTimeout(() => {
                            try {
                                if (window.history.length > 1) {
                                    window.history.back();
                                } else {
                                    window.location.href = 'about:blank';
                                }
                            } catch (e) {
                                console.log('Method 3 failed:', e);
                            }
                        }, 200);
                        
                        // Method 4: Redirect to blank page
                        setTimeout(() => {
                            try {
                                window.location.replace('about:blank');
                            } catch (e) {
                                console.log('Method 4 failed:', e);
                            }
                        }, 300);
                    }
                    
                    // Detect if it's a mobile device
                    function isMobile() {
                        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
                    }
                    
                    // Mobile device auto-handling
                    if (isMobile()) {
                        // Mobile: auto-close after 3 seconds
                        setTimeout(() => {
                            closeWindow();
                        }, 3000);
                        
                        // Mobile: show special message
                        document.addEventListener('DOMContentLoaded', function() {
                            const messageDiv = document.querySelector('.message');
                            if (messageDiv) {
                                messageDiv.innerHTML += '<br><strong style="color: #ff6b6b;">Mobile users: Please manually return to the game or close this tab</strong>';
                            }
                        });
                    } else {
                        // PC: auto-close after 5 seconds
                        setTimeout(() => {
                            closeWindow();
                        }, 5000);
                    }
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