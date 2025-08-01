const express = require('express');
const configController = require('../controllers/configController');

const router = express.Router();

// 获取所有配置
router.get('/all', configController.getAllConfigs);

// 获取指定配置
router.get('/:configKey', configController.getConfig);

// 设置配置
router.post('/set', configController.setConfig);

// 删除配置
router.delete('/:configKey', configController.deleteConfig);

// 获取支付模式
router.get('/payment/mode', configController.getPaymentMode);

// 设置支付模式
router.post('/payment/mode', configController.setPaymentMode);

// 获取维护模式状态
router.get('/maintenance/mode', configController.getMaintenanceMode);

// 设置维护模式
router.post('/maintenance/mode', configController.setMaintenanceMode);

// 批量更新配置
router.post('/batch-update', configController.batchUpdateConfigs);

module.exports = router; 