const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

// 游戏集成测试
async function testGameIntegration() {
    console.log('=== 游戏集成测试开始 ===\n');

    try {
        // 1. 测试用户注册
        console.log('1. 测试游戏用户注册...');
        const testUser = {
            pid: 'gameplayer' + Date.now(),
            name: 'Game Player',
            password: '123456'
        };
        
        const registerResponse = await axios.post(`${BASE_URL}/auth/register`, testUser);
        console.log('✅ 游戏用户注册成功:', registerResponse.data);
        console.log('');

        // 2. 测试用户登录
        console.log('2. 测试游戏用户登录...');
        const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
            pid: testUser.pid,
            password: testUser.password
        });
        console.log('✅ 游戏用户登录成功:', loginResponse.data);
        console.log('');

        // 3. 测试游戏数据更新
        console.log('3. 测试游戏数据更新...');
        const updateResponse = await axios.put(`${BASE_URL}/users/${testUser.pid}`, {
            level: 15,
            gold: 2000
        });
        console.log('✅ 游戏数据更新成功:', updateResponse.data);
        console.log('');

        // 4. 测试获取用户信息
        console.log('4. 测试获取游戏用户信息...');
        const userInfoResponse = await axios.get(`${BASE_URL}/users/${testUser.pid}`);
        console.log('✅ 获取游戏用户信息成功:', userInfoResponse.data);
        console.log('');

        console.log('=== 游戏集成测试全部通过 ===');
        console.log('测试用户ID:', testUser.pid);
        console.log('游戏数据已同步到服务器');

    } catch (error) {
        console.error('❌ 游戏集成测试失败:', error.response?.data || error.message);
    }
}

// 运行测试
testGameIntegration(); 