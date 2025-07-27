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
app.get('/api/get3DResult', (req, res) => {
  console.log('【代理服务器】收到3D回调请求，参数:', req.query);
  const { amount, billNo, code, message } = req.query;
  
  if (!billNo) {
    console.error('【代理服务器】错误：缺少billNo参数');
    return res.status(400).send('缺少订单号');
  }
  
  console.log(`【代理服务器】检查订单 ${billNo} 是否在缓存中`, !!paymentStatusCache[billNo]);
  
  if (paymentStatusCache[billNo]) {
    const oldStatus = paymentStatusCache[billNo].status;
    const newStatus = code === 'P0001' ? 'PAID' : 'FAILED';
    paymentStatusCache[billNo].status = newStatus;
    paymentStatusCache[billNo].callbackData = req.query;
    paymentStatusCache[billNo].updatedAt = Date.now();
    
    console.log(`【代理服务器】更新订单 ${billNo} 状态: ${oldStatus} -> ${newStatus}`);
    console.log(`【代理服务器】当前缓存内容:`, paymentStatusCache[billNo]);
  } else {
    console.warn(`【代理服务器】警告：找不到订单 ${billNo} 的缓存记录，新建记录`);
    // 如果缓存中没有，创建一个新记录
    paymentStatusCache[billNo] = {
      status: code === 'P0001' ? 'PAID' : 'FAILED',
      callbackData: req.query,
      timestamp: Date.now(),
      updatedAt: Date.now()
    };
    console.log(`【代理服务器】新建缓存记录:`, paymentStatusCache[billNo]);
  }
  
  // 定期打印缓存状态
  console.log('【代理服务器】当前所有订单状态:', Object.keys(paymentStatusCache).map(key => ({
    billNo: key,
    status: paymentStatusCache[key].status
  })));
  
  res.send('OK');
});

// 查询支付状态API
app.get('/api/payment/status/:billNo', (req, res) => {
    const { billNo } = req.params;
    
    console.log(`收到订单查询请求: ${billNo}`);
    
    if (!billNo) {
        console.log('订单号为空，返回错误');
        return res.status(400).json({ success: false, message: '订单号不能为空' });
    }
    
    const paymentStatus = paymentStatusCache[billNo];
    if (paymentStatus) {
        console.log(`找到订单 ${billNo} 的状态:`, paymentStatus);
        res.json({
            success: true,
            data: {
                billNo,
                status: paymentStatus.status,
                updatedAt: paymentStatus.updatedAt || paymentStatus.timestamp
            }
        });
    } else {
        console.log(`未找到订单 ${billNo} 的状态`);
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