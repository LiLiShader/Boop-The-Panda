const configService = require('../services/configService');

class ConfigController {
    /**
     * 获取所有配置
     * @param {Object} req - 请求对象
     * @param {Object} res - 响应对象
     */
    async getAllConfigs(req, res) {
        try {
            console.log('[ConfigController] 获取所有配置');
            const configs = await configService.getAllConfigs();
            
            res.json({
                success: true,
                message: '获取配置成功',
                data: configs
            });
        } catch (error) {
            console.error('[ConfigController] 获取所有配置失败:', error);
            res.status(500).json({
                success: false,
                message: '获取配置失败',
                error: error.message
            });
        }
    }

    /**
     * 获取指定配置
     * @param {Object} req - 请求对象
     * @param {Object} res - 响应对象
     */
    async getConfig(req, res) {
        try {
            const { configKey } = req.params;
            console.log(`[ConfigController] 获取配置: ${configKey}`);
            
            const config = await configService.getConfig(configKey);
            
            if (!config) {
                return res.status(404).json({
                    success: false,
                    message: '配置不存在'
                });
            }
            
            res.json({
                success: true,
                message: '获取配置成功',
                data: config
            });
        } catch (error) {
            console.error('[ConfigController] 获取配置失败:', error);
            res.status(500).json({
                success: false,
                message: '获取配置失败',
                error: error.message
            });
        }
    }

    /**
     * 设置配置
     * @param {Object} req - 请求对象
     * @param {Object} res - 响应对象
     */
    async setConfig(req, res) {
        try {
            const { configKey, configValue, description } = req.body;
            console.log(`[ConfigController] 设置配置: ${configKey} = ${configValue}`);
            
            if (!configKey || configValue === undefined) {
                return res.status(400).json({
                    success: false,
                    message: '配置键和配置值不能为空'
                });
            }
            
            await configService.setConfig(configKey, configValue, description);
            
            res.json({
                success: true,
                message: '设置配置成功'
            });
        } catch (error) {
            console.error('[ConfigController] 设置配置失败:', error);
            res.status(500).json({
                success: false,
                message: '设置配置失败',
                error: error.message
            });
        }
    }

    /**
     * 删除配置
     * @param {Object} req - 请求对象
     * @param {Object} res - 响应对象
     */
    async deleteConfig(req, res) {
        try {
            const { configKey } = req.params;
            console.log(`[ConfigController] 删除配置: ${configKey}`);
            
            const success = await configService.deleteConfig(configKey);
            
            if (!success) {
                return res.status(404).json({
                    success: false,
                    message: '配置不存在'
                });
            }
            
            res.json({
                success: true,
                message: '删除配置成功'
            });
        } catch (error) {
            console.error('[ConfigController] 删除配置失败:', error);
            res.status(500).json({
                success: false,
                message: '删除配置失败',
                error: error.message
            });
        }
    }

    /**
     * 获取支付模式
     * @param {Object} req - 请求对象
     * @param {Object} res - 响应对象
     */
    async getPaymentMode(req, res) {
        try {
            console.log('[ConfigController] 获取支付模式');
            const mode = await configService.getPaymentMode();
            
            res.json({
                success: true,
                message: '获取支付模式成功',
                data: {
                    mode: mode
                }
            });
        } catch (error) {
            console.error('[ConfigController] 获取支付模式失败:', error);
            res.status(500).json({
                success: false,
                message: '获取支付模式失败',
                error: error.message
            });
        }
    }

    /**
     * 设置支付模式
     * @param {Object} req - 请求对象
     * @param {Object} res - 响应对象
     */
    async setPaymentMode(req, res) {
        try {
            const { mode } = req.body;
            console.log(`[ConfigController] 设置支付模式: ${mode}`);
            
            if (!mode || (mode !== '2D' && mode !== '3D')) {
                return res.status(400).json({
                    success: false,
                    message: '支付模式必须是2D或3D'
                });
            }
            
            await configService.setPaymentMode(mode);
            
            res.json({
                success: true,
                message: `支付模式已设置为${mode}`,
                data: {
                    mode: mode
                }
            });
        } catch (error) {
            console.error('[ConfigController] 设置支付模式失败:', error);
            res.status(500).json({
                success: false,
                message: '设置支付模式失败',
                error: error.message
            });
        }
    }

    /**
     * 获取维护模式状态
     * @param {Object} req - 请求对象
     * @param {Object} res - 响应对象
     */
    async getMaintenanceMode(req, res) {
        try {
            console.log('[ConfigController] 获取维护模式状态');
            const enabled = await configService.getMaintenanceMode();
            
            res.json({
                success: true,
                message: '获取维护模式状态成功',
                data: {
                    maintenanceMode: enabled
                }
            });
        } catch (error) {
            console.error('[ConfigController] 获取维护模式状态失败:', error);
            res.status(500).json({
                success: false,
                message: '获取维护模式状态失败',
                error: error.message
            });
        }
    }

    /**
     * 设置维护模式
     * @param {Object} req - 请求对象
     * @param {Object} res - 响应对象
     */
    async setMaintenanceMode(req, res) {
        try {
            const { enabled } = req.body;
            console.log(`[ConfigController] 设置维护模式: ${enabled}`);
            
            if (typeof enabled !== 'boolean') {
                return res.status(400).json({
                    success: false,
                    message: '维护模式状态必须是布尔值'
                });
            }
            
            await configService.setMaintenanceMode(enabled);
            
            res.json({
                success: true,
                message: `维护模式已${enabled ? '启用' : '禁用'}`,
                data: {
                    maintenanceMode: enabled
                }
            });
        } catch (error) {
            console.error('[ConfigController] 设置维护模式失败:', error);
            res.status(500).json({
                success: false,
                message: '设置维护模式失败',
                error: error.message
            });
        }
    }

    /**
     * 批量更新配置
     * @param {Object} req - 请求对象
     * @param {Object} res - 响应对象
     */
    async batchUpdateConfigs(req, res) {
        try {
            const { configs } = req.body;
            console.log('[ConfigController] 批量更新配置:', configs);
            
            if (!Array.isArray(configs) || configs.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: '配置数组不能为空'
                });
            }
            
            // 验证配置格式
            for (const config of configs) {
                if (!config.key || config.value === undefined) {
                    return res.status(400).json({
                        success: false,
                        message: '配置格式错误，必须包含key和value字段'
                    });
                }
            }
            
            await configService.batchUpdateConfigs(configs);
            
            res.json({
                success: true,
                message: '批量更新配置成功'
            });
        } catch (error) {
            console.error('[ConfigController] 批量更新配置失败:', error);
            res.status(500).json({
                success: false,
                message: '批量更新配置失败',
                error: error.message
            });
        }
    }
}

module.exports = new ConfigController(); 