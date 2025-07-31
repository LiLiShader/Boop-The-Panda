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
        
        // 返回自动关闭的页面
        res.send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Processing...</title>
                <meta name="viewport" content="width=device-width, initial-scale=1">
            </head>
            <body>
                <script>
                    // 立即尝试关闭窗口
                    function closeWindow() {
                        try {
                            window.close();
                        } catch (e) {
                            console.log('Direct close failed:', e);
                        }
                        
                        // 延迟尝试其他方法
                        setTimeout(() => {
                            try {
                                window.close();
                            } catch (e) {
                                console.log('Delayed close failed:', e);
                            }
                        }, 100);
                        
                        // 尝试返回上一页
                        setTimeout(() => {
                            try {
                                if (window.history.length > 1) {
                                    window.history.back();
                                } else {
                                    window.location.href = 'about:blank';
                                }
                            } catch (e) {
                                console.log('Go back failed:', e);
                            }
                        }, 200);
                        
                        // 最后尝试跳转空白页
                        setTimeout(() => {
                            try {
                                window.location.replace('about:blank');
                            } catch (e) {
                                console.log('Redirect failed:', e);
                            }
                        }, 300);
                    }
                    
                    // 页面加载完成后立即关闭
                    window.onload = function() {
                        closeWindow();
                    };
                    
                    // 如果onload没有触发，也尝试关闭
                    setTimeout(closeWindow, 100);
                    setTimeout(closeWindow, 500);
                    setTimeout(closeWindow, 1000);
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