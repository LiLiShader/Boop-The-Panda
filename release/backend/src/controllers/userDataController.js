const userDataService = require('../services/userDataService');

class UserDataController {
    /**
     * 同步用户游戏数据
     * POST /api/user/sync-data
     */
    async syncUserData(req, res) {
        try {
            const { data, userId } = req.body;

            if (!userId || !data || !Array.isArray(data)) {
                return res.status(400).json({
                    success: false,
                    message: '参数错误'
                });
            }

            // 验证数据格式
            for (const item of data) {
                if (!item.key || item.value === undefined) {
                    return res.status(400).json({
                        success: false,
                        message: '数据格式错误'
                    });
                }
            }

            // 保存数据
            await userDataService.saveUserGameData(userId, data);

            res.json({
                success: true,
                message: '数据同步成功',
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            console.error('同步用户数据失败:', error);
            res.status(500).json({
                success: false,
                message: '服务器内部错误',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    /**
     * 获取用户游戏数据
     * GET /api/user/get-game-data
     */
    async getUserGameData(req, res) {
        try {
            const { userId } = req.query;

            if (!userId) {
                return res.status(400).json({
                    success: false,
                    message: '缺少用户ID'
                });
            }

            const gameData = await userDataService.getUserGameData(userId);

            res.json({
                success: true,
                data: gameData,
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            console.error('获取用户游戏数据失败:', error);
            res.status(500).json({
                success: false,
                message: '服务器内部错误',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    /**
     * 获取用户特定游戏数据
     * GET /api/user/get-game-data/:key
     */
    async getUserGameDataByKey(req, res) {
        try {
            const { userId } = req.query;
            const { key } = req.params;

            if (!userId) {
                return res.status(400).json({
                    success: false,
                    message: '缺少用户ID'
                });
            }

            if (!key) {
                return res.status(400).json({
                    success: false,
                    message: '缺少数据键'
                });
            }

            const gameData = await userDataService.getUserGameDataByKey(userId, key);

            if (!gameData) {
                return res.status(404).json({
                    success: false,
                    message: '数据不存在'
                });
            }

            res.json({
                success: true,
                data: gameData,
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            console.error('获取用户特定游戏数据失败:', error);
            res.status(500).json({
                success: false,
                message: '服务器内部错误',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    /**
     * 删除用户特定游戏数据
     * DELETE /api/user/delete-game-data/:key
     */
    async deleteUserGameData(req, res) {
        try {
            const { userId } = req.query;
            const { key } = req.params;

            if (!userId) {
                return res.status(400).json({
                    success: false,
                    message: '缺少用户ID'
                });
            }

            if (!key) {
                return res.status(400).json({
                    success: false,
                    message: '缺少数据键'
                });
            }

            const deleted = await userDataService.deleteUserGameData(userId, key);

            if (!deleted) {
                return res.status(404).json({
                    success: false,
                    message: '数据不存在'
                });
            }

            res.json({
                success: true,
                message: '数据删除成功',
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            console.error('删除用户游戏数据失败:', error);
            res.status(500).json({
                success: false,
                message: '服务器内部错误',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    /**
     * 初始化用户游戏数据
     * POST /api/user/init-game-data
     */
    async initializeUserGameData(req, res) {
        try {
            const { userId } = req.body;

            if (!userId) {
                return res.status(400).json({
                    success: false,
                    message: '缺少用户ID'
                });
            }

            // 检查用户是否已有游戏数据
            const hasData = await userDataService.hasUserGameData(userId);
            
            if (hasData) {
                return res.status(400).json({
                    success: false,
                    message: '用户已有游戏数据，无需初始化'
                });
            }

            // 初始化默认数据
            await userDataService.initializeUserGameData(userId);

            res.json({
                success: true,
                message: '游戏数据初始化成功',
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            console.error('初始化用户游戏数据失败:', error);
            res.status(500).json({
                success: false,
                message: '服务器内部错误',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    /**
     * 获取用户同步状态
     * GET /api/user/sync-status
     */
    async getSyncStatus(req, res) {
        try {
            const { userId } = req.query;

            if (!userId) {
                return res.status(400).json({
                    success: false,
                    message: '缺少用户ID'
                });
            }

            const lastSyncTime = await userDataService.getUserLastSyncTime(userId);
            const hasData = await userDataService.hasUserGameData(userId);

            res.json({
                success: true,
                data: {
                    hasGameData: hasData,
                    lastSyncTime: lastSyncTime,
                    timestamp: new Date().toISOString()
                }
            });

        } catch (error) {
            console.error('获取用户同步状态失败:', error);
            res.status(500).json({
                success: false,
                message: '服务器内部错误',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }
}

module.exports = new UserDataController(); 