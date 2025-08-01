const { pool } = require('../config/database');

class UserDataService {
    /**
     * 批量保存用户游戏数据
     * @param {number} userId - 用户ID
     * @param {Array} dataArray - 数据数组，格式：[{key, value, type}]
     * @returns {Promise<boolean>}
     */
    async saveUserGameData(userId, dataArray) {
        const connection = await pool.promise().getConnection();
        try {
            await connection.beginTransaction();

            // 用于更新users表的gold字段
            let newGold = null;
            
            for (const data of dataArray) {
                const { key, value, type = 'string' } = data;
                
                // 如果是金币数据，记录下来用于更新users表
                if (key === 'Gold') {
                    newGold = parseInt(value);
                }
                
                // 使用 ON DUPLICATE KEY UPDATE 来处理重复数据
                const query = `
                    INSERT INTO user_game_data (user_id, data_key, data_value, data_type) 
                    VALUES (?, ?, ?, ?) 
                    ON DUPLICATE KEY UPDATE 
                        data_value = VALUES(data_value),
                        data_type = VALUES(data_type),
                        updated_at = CURRENT_TIMESTAMP
                `;
                
                await connection.execute(query, [userId, key, value, type]);
            }

            // 如果更新了金币数据，同时更新users表的gold字段
            if (newGold !== null) {
                console.log(`[UserDataService] 更新用户 ${userId} 的gold字段: ${newGold}`);
                await connection.execute(
                    'UPDATE users SET gold = ?, last_sync_time = CURRENT_TIMESTAMP WHERE id = ?',
                    [newGold, userId]
                );
            } else {
                // 更新用户的最后同步时间
                await connection.execute(
                    'UPDATE users SET last_sync_time = CURRENT_TIMESTAMP WHERE id = ?',
                    [userId]
                );
            }

            await connection.commit();
            return true;
        } catch (error) {
            await connection.rollback();
            console.error('保存用户游戏数据失败:', error);
            throw error;
        } finally {
            connection.release();
        }
    }

    /**
     * 获取用户所有游戏数据
     * @param {number} userId - 用户ID
     * @returns {Promise<Array>}
     */
    async getUserGameData(userId) {
        try {
            const [rows] = await pool.promise().execute(
                'SELECT data_key, data_value, data_type FROM user_game_data WHERE user_id = ?',
                [userId]
            );
            
            return rows.map(row => ({
                key: row.data_key,
                value: this.convertValueByType(row.data_value, row.data_type),
                type: row.data_type
            }));
        } catch (error) {
            console.error('获取用户游戏数据失败:', error);
            throw error;
        }
    }

    /**
     * 获取用户特定游戏数据
     * @param {number} userId - 用户ID
     * @param {string} key - 数据键
     * @returns {Promise<Object|null>}
     */
    async getUserGameDataByKey(userId, key) {
        try {
            const [rows] = await pool.promise().execute(
                'SELECT data_key, data_value, data_type FROM user_game_data WHERE user_id = ? AND data_key = ?',
                [userId, key]
            );
            
            if (rows.length === 0) {
                return null;
            }
            
            const row = rows[0];
            return {
                key: row.data_key,
                value: this.convertValueByType(row.data_value, row.data_type),
                type: row.data_type
            };
        } catch (error) {
            console.error('获取用户特定游戏数据失败:', error);
            throw error;
        }
    }

    /**
     * 删除用户特定游戏数据
     * @param {number} userId - 用户ID
     * @param {string} key - 数据键
     * @returns {Promise<boolean>}
     */
    async deleteUserGameData(userId, key) {
        try {
            const [result] = await pool.promise().execute(
                'DELETE FROM user_game_data WHERE user_id = ? AND data_key = ?',
                [userId, key]
            );
            
            return result.affectedRows > 0;
        } catch (error) {
            console.error('删除用户游戏数据失败:', error);
            throw error;
        }
    }

    /**
     * 根据数据类型转换值
     * @param {string} value - 原始值
     * @param {string} type - 数据类型
     * @returns {any} 转换后的值
     */
    convertValueByType(value, type) {
        if (value === null || value === undefined) {
            return null;
        }

        switch (type) {
            case 'number':
                return parseFloat(value) || 0;
            case 'boolean':
                return value === '1' || value === 'true' || value === true;
            case 'json':
                try {
                    return JSON.parse(value);
                } catch (e) {
                    return value;
                }
            case 'string':
            default:
                return value;
        }
    }

    /**
     * 获取用户最后同步时间
     * @param {number} userId - 用户ID
     * @returns {Promise<Date|null>}
     */
    async getUserLastSyncTime(userId) {
        try {
            const [rows] = await pool.promise().execute(
                'SELECT last_sync_time FROM users WHERE id = ?',
                [userId]
            );
            
            return rows.length > 0 ? rows[0].last_sync_time : null;
        } catch (error) {
            console.error('获取用户最后同步时间失败:', error);
            throw error;
        }
    }

    /**
     * 检查用户是否有游戏数据
     * @param {number} userId - 用户ID
     * @returns {Promise<boolean>}
     */
    async hasUserGameData(userId) {
        try {
            const [rows] = await pool.promise().execute(
                'SELECT COUNT(*) as count FROM user_game_data WHERE user_id = ?',
                [userId]
            );
            
            return rows[0].count > 0;
        } catch (error) {
            console.error('检查用户游戏数据失败:', error);
            throw error;
        }
    }

    /**
     * 初始化用户默认游戏数据
     * @param {number} userId - 用户ID
     * @returns {Promise<boolean>}
     */
    async initializeUserGameData(userId) {
        const defaultData = [
            { key: 'Icon', value: '1', type: 'string' },
            { key: 'Music_Status', value: '1', type: 'boolean' },
            { key: 'Music_Eff_Status', value: '1', type: 'boolean' },
            { key: 'Zhen_Dong_Status', value: '1', type: 'boolean' },
            { key: 'Level', value: '1', type: 'number' },
            { key: 'Gold', value: '500', type: 'string' },
            { key: 'RefreshTools', value: '4', type: 'string' },
            { key: 'ToolTime', value: '4', type: 'string' },
            { key: 'ToolReturn', value: '4', type: 'string' },
            { key: 'StarBoxIndex', value: '0', type: 'string' },
            { key: 'BombHor', value: '3', type: 'string' },
            { key: 'BombVer', value: '3', type: 'string' },
            { key: 'BombBomb', value: '3', type: 'string' },
            { key: 'BombAllSame', value: '3', type: 'string' },
            { key: 'BombHint', value: '3', type: 'string' },
            { key: 'BombExtraSteps', value: '3', type: 'string' },
            { key: 'BombReshuffle', value: '3', type: 'string' },
            { key: 'Heart', value: '3', type: 'string' },
            { key: 'Audio_Volume', value: '1.0', type: 'number' }
        ];

        try {
            await this.saveUserGameData(userId, defaultData);
            return true;
        } catch (error) {
            console.error('初始化用户游戏数据失败:', error);
            throw error;
        }
    }
}

module.exports = new UserDataService(); 