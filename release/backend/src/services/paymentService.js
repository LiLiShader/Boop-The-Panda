const axios = require('axios');
const https = require('https');
const { pool } = require('../config/database');
const paymentConfig = require('../config/paymentConfig');

// 内存缓存，用于存储3D支付的临时状态
// 注意：在生产环境中应该使用Redis或数据库存储
const paymentStatusCache = {};

/**
 * 处理支付请求
 * @param {Object} paymentData - 支付请求数据
 * @returns {Promise<Object>} - 支付服务器响应
 */
const processPayment = async (paymentData) => {
    try {
        // 直接转发URL编码的数据到支付API
        const response = await axios({
            method: 'post',
            url: paymentConfig.payApiUrl,
            data: paymentData,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json'
            },
            // 允许自签名证书（仅用于测试环境）
            httpsAgent: new https.Agent({
                rejectUnauthorized: false
            })
        });
        
        console.log('支付服务器响应:', response.data);
        
        // 如果是3D支付，缓存请求信息以便后续处理回调
        if (response.data && response.data.code === 'P0004' && response.data.auth3DUrl) {
            const billNo = paymentData.billNo;
            paymentStatusCache[billNo] = {
                status: 'PENDING',
                requestData: paymentData,
                responseData: response.data,
                timestamp: Date.now()
            };
            console.log(`缓存3D支付状态，订单号: ${billNo}`);
        }
        
        return response.data;
    } catch (error) {
        console.error('支付请求失败:', error.message);
        if (error.response) {
            console.error('错误响应数据:', error.response.data);
            console.error('错误响应状态:', error.response.status);
        } else if (error.request) {
            console.error('请求发送失败:', error.request);
        }
        
        throw {
            code: 'ERROR',
            message: error.message || '支付请求失败'
        };
    }
};

/**
 * 处理3D支付回调
 * @param {Object} callbackData - 回调请求数据
 * @returns {Boolean} - 处理结果
 */
const process3DCallback = (callbackData) => {
    const { amount, billNo, code, message } = callbackData;
  
    if (!billNo) {
        console.error('错误：缺少billNo参数');
        return false;
    }
    
    console.log(`检查订单 ${billNo} 是否在缓存中`, !!paymentStatusCache[billNo]);
    
    if (paymentStatusCache[billNo]) {
        const oldStatus = paymentStatusCache[billNo].status;
        const newStatus = code === 'P0001' ? 'PAID' : 'FAILED';
        paymentStatusCache[billNo].status = newStatus;
        paymentStatusCache[billNo].callbackData = callbackData;
        paymentStatusCache[billNo].updatedAt = Date.now();
        
        console.log(`更新订单 ${billNo} 状态: ${oldStatus} -> ${newStatus}`);
    } else {
        console.warn(`警告：找不到订单 ${billNo} 的缓存记录，新建记录`);
        // 如果缓存中没有，创建一个新记录
        paymentStatusCache[billNo] = {
            status: code === 'P0001' ? 'PAID' : 'FAILED',
            callbackData: callbackData,
            timestamp: Date.now(),
            updatedAt: Date.now()
        };
    }
    
    return true;
};

/**
 * 查询支付状态
 * @param {String} billNo - 订单号
 * @returns {Object} - 支付状态信息
 */
const getPaymentStatus = (billNo) => {
    if (!billNo) {
        return { success: false, message: '订单号不能为空' };
    }
    
    const paymentStatus = paymentStatusCache[billNo];
    if (paymentStatus) {
        return {
            success: true,
            data: {
                billNo,
                status: paymentStatus.status,
                updatedAt: paymentStatus.updatedAt || paymentStatus.timestamp
            }
        };
    } else {
        return {
            success: false,
            message: '未找到该订单的支付状态'
        };
    }
};

/**
 * 保存支付记录到数据库
 * @param {Object} paymentRecord - 支付记录数据
 * @returns {Promise<Object>} - 保存结果
 */
const savePaymentRecord = async (paymentRecord) => {
    const { user_id, user_name, amount, order_no, product_id, product_info, raw_response } = paymentRecord;
    
    const sql = `
        INSERT INTO payment_records 
        (user_id, user_name, amount, order_no, pay_time, product_id, product_info, raw_response)
        VALUES (?, ?, ?, ?, NOW(), ?, ?, ?)
        ON DUPLICATE KEY UPDATE 
        user_id = VALUES(user_id),
        user_name = VALUES(user_name),
        amount = VALUES(amount),
        pay_time = NOW(),
        product_id = VALUES(product_id),
        product_info = VALUES(product_info),
        raw_response = VALUES(raw_response)
    `;
    
    try {
        const [result] = await pool.promise().query(sql, [
            user_id, 
            user_name, 
            amount, 
            order_no, 
            product_id || null, 
            product_info || null, 
            raw_response ? JSON.stringify(raw_response) : null
        ]);
        
        return { success: true, data: result };
    } catch (error) {
        console.error('保存支付记录失败:', error);
        return { success: false, message: error.message };
    }
};

// 定期清理过期的支付状态缓存
const initCacheCleaner = () => {
    setInterval(() => {
        const now = Date.now();
        
        Object.keys(paymentStatusCache).forEach(billNo => {
            const status = paymentStatusCache[billNo];
            if (now - (status.updatedAt || status.timestamp) > paymentConfig.cacheExpireTime) {
                delete paymentStatusCache[billNo];
                console.log(`清理过期的支付状态缓存，订单号: ${billNo}`);
            }
        });
    }, 60 * 60 * 1000); // 每小时运行一次
};

module.exports = {
    processPayment,
    process3DCallback,
    getPaymentStatus,
    savePaymentRecord,
    paymentStatusCache,
    initCacheCleaner
}; 