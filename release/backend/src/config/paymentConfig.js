require('dotenv').config();

// 支付服务配置
const paymentConfig = {
    // 主服务器配置
    adminPort: process.env.ADMIN_PORT || 3001,
    
    // 支付代理服务配置
    payProxyPort: process.env.PAY_PROXY_PORT || 5000,
    payApiUrl: process.env.PAY_API_URL || 'https://testurl.carespay.com:28081/carespay/pay',
    
    // 3D回调服务配置
    callbackPort: process.env.CALLBACK_PORT || 5001,
    
    // 服务器基础URL，用于构建回调URL等
    baseUrl: process.env.BASE_URL || 'http://localhost',
    
    // 支付状态缓存过期时间
    cacheExpireTime: 24 * 60 * 60 * 1000 // 24小时
};

module.exports = paymentConfig; 