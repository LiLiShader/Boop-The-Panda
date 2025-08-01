const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../config.env') });

// 数据库连接池
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

class ConfigService {
    /**
     * 获取配置值
     * @param {string} configKey - 配置键名
     * @returns {Promise<Object>} 配置信息
     */
    async getConfig(configKey) {
        try {
            const [rows] = await pool.query(
                'SELECT config_key, config_value, description, updated_at FROM global_config WHERE config_key = ?',
                [configKey]
            );
            
            if (rows.length === 0) {
                return null;
            }
            
            return rows[0];
        } catch (error) {
            console.error('获取配置失败:', error);
            throw error;
        }
    }

    /**
     * 获取所有配置
     * @returns {Promise<Array>} 所有配置列表
     */
    async getAllConfigs() {
        try {
            const [rows] = await pool.query(
                'SELECT config_key, config_value, description, updated_at FROM global_config ORDER BY config_key'
            );
            
            return rows;
        } catch (error) {
            console.error('获取所有配置失败:', error);
            throw error;
        }
    }

    /**
     * 设置配置值
     * @param {string} configKey - 配置键名
     * @param {string} configValue - 配置值
     * @param {string} description - 配置描述（可选）
     * @returns {Promise<boolean>} 是否成功
     */
    async setConfig(configKey, configValue, description = null) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            // 检查配置是否存在
            const [existingRows] = await connection.query(
                'SELECT id FROM global_config WHERE config_key = ?',
                [configKey]
            );

            if (existingRows.length > 0) {
                // 更新现有配置
                const updateQuery = description 
                    ? 'UPDATE global_config SET config_value = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE config_key = ?'
                    : 'UPDATE global_config SET config_value = ?, updated_at = CURRENT_TIMESTAMP WHERE config_key = ?';
                
                const updateParams = description 
                    ? [configValue, description, configKey]
                    : [configValue, configKey];
                
                await connection.query(updateQuery, updateParams);
            } else {
                // 插入新配置
                const insertQuery = description
                    ? 'INSERT INTO global_config (config_key, config_value, description) VALUES (?, ?, ?)'
                    : 'INSERT INTO global_config (config_key, config_value) VALUES (?, ?)';
                
                const insertParams = description
                    ? [configKey, configValue, description]
                    : [configKey, configValue];
                
                await connection.query(insertQuery, insertParams);
            }

            await connection.commit();
            return true;
        } catch (error) {
            await connection.rollback();
            console.error('设置配置失败:', error);
            throw error;
        } finally {
            connection.release();
        }
    }

    /**
     * 删除配置
     * @param {string} configKey - 配置键名
     * @returns {Promise<boolean>} 是否成功
     */
    async deleteConfig(configKey) {
        try {
            const [result] = await pool.query(
                'DELETE FROM global_config WHERE config_key = ?',
                [configKey]
            );
            
            return result.affectedRows > 0;
        } catch (error) {
            console.error('删除配置失败:', error);
            throw error;
        }
    }

    /**
     * 获取支付模式
     * @returns {Promise<string>} 支付模式（2D或3D）
     */
    async getPaymentMode() {
        try {
            const config = await this.getConfig('payment_mode');
            return config ? config.config_value : '2D'; // 默认返回2D
        } catch (error) {
            console.error('获取支付模式失败:', error);
            return '2D'; // 出错时返回默认值
        }
    }

    /**
     * 设置支付模式
     * @param {string} mode - 支付模式（2D或3D）
     * @returns {Promise<boolean>} 是否成功
     */
    async setPaymentMode(mode) {
        if (mode !== '2D' && mode !== '3D') {
            throw new Error('支付模式必须是2D或3D');
        }
        
        return await this.setConfig('payment_mode', mode, '支付模式：2D或3D');
    }

    /**
     * 获取维护模式状态
     * @returns {Promise<boolean>} 是否处于维护模式
     */
    async getMaintenanceMode() {
        try {
            const config = await this.getConfig('maintenance_mode');
            return config ? config.config_value === 'true' : false;
        } catch (error) {
            console.error('获取维护模式失败:', error);
            return false;
        }
    }

    /**
     * 设置维护模式
     * @param {boolean} enabled - 是否启用维护模式
     * @returns {Promise<boolean>} 是否成功
     */
    async setMaintenanceMode(enabled) {
        const value = enabled ? 'true' : 'false';
        return await this.setConfig('maintenance_mode', value, '维护模式：true或false');
    }

    /**
     * 批量更新配置
     * @param {Array} configs - 配置数组，每个元素包含key, value, description
     * @returns {Promise<boolean>} 是否成功
     */
    async batchUpdateConfigs(configs) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            for (const config of configs) {
                const { key, value, description } = config;
                await this.setConfig(key, value, description);
            }

            await connection.commit();
            return true;
        } catch (error) {
            await connection.rollback();
            console.error('批量更新配置失败:', error);
            throw error;
        } finally {
            connection.release();
        }
    }
}

module.exports = new ConfigService(); 