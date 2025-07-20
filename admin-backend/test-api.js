const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

// 测试数据
const testUser = {
    pid: 'testplayer' + Date.now(),
    name: 'Test Player',
    password: '123456'
};

async function testAPI() {
    console.log('=== API 测试开始 ===\n');

    try {
        // 1. 测试健康检查
        console.log('1. 测试健康检查...');
        const healthResponse = await axios.get(`${BASE_URL}/health`);
        console.log('✅ 健康检查成功:', healthResponse.data);
        console.log('');

        // 2. 测试用户注册
        console.log('2. 测试用户注册...');
        const registerResponse = await axios.post(`${BASE_URL}/auth/register`, testUser);
        console.log('✅ 注册成功:', registerResponse.data);
        console.log('');

        // 3. 测试用户登录
        console.log('3. 测试用户登录...');
        const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
            pid: testUser.pid,
            password: testUser.password
        });
        console.log('✅ 登录成功:', loginResponse.data);
        console.log('');

        // 4. 测试获取用户信息
        console.log('4. 测试获取用户信息...');
        const userInfoResponse = await axios.get(`${BASE_URL}/users/${testUser.pid}`);
        console.log('✅ 获取用户信息成功:', userInfoResponse.data);
        console.log('');

        // 5. 测试更新用户信息
        console.log('5. 测试更新用户信息...');
        const updateResponse = await axios.put(`${BASE_URL}/users/${testUser.pid}`, {
            level: 10,
            gold: 1000
        });
        console.log('✅ 更新用户信息成功:', updateResponse.data);
        console.log('');

        // 6. 测试获取用户列表
        console.log('6. 测试获取用户列表...');
        const userListResponse = await axios.get(`${BASE_URL}/users?page=1&limit=10`);
        console.log('✅ 获取用户列表成功:', userListResponse.data);
        console.log('');

        console.log('=== 所有测试通过 ===');
        console.log('测试用户ID:', testUser.pid);

    } catch (error) {
        console.error('❌ 测试失败:', error.response?.data || error.message);
        
        if (error.code === 'ECONNREFUSED') {
            console.error('请确保服务器正在运行: npm start');
        }
    }
}

// 运行测试
testAPI(); 