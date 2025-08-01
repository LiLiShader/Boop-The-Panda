const express = require('express');
const router = express.Router();
const userDataController = require('../controllers/userDataController');

// 同步用户游戏数据
router.post('/sync-data', userDataController.syncUserData);

// 获取用户所有游戏数据
router.get('/get-game-data', userDataController.getUserGameData);

// 获取用户特定游戏数据
router.get('/get-game-data/:key', userDataController.getUserGameDataByKey);

// 删除用户特定游戏数据
router.delete('/delete-game-data/:key', userDataController.deleteUserGameData);

// 初始化用户游戏数据
router.post('/init-game-data', userDataController.initializeUserGameData);

// 获取用户同步状态
router.get('/sync-status', userDataController.getSyncStatus);

module.exports = router; 