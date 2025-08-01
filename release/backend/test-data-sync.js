// 使用内置的fetch（Node.js 18+支持）
// const fetch = require('node-fetch'); // 注释掉，使用内置fetch

const BASE_URL = 'http://localhost:3000';

// 测试数据
const testData = [
    { key: 'Gold', value: '1000', type: 'string' },
    { key: 'Level', value: '10', type: 'number' },
    { key: 'Music_Status', value: '1', type: 'boolean' },
    { key: 'Audio_Volume', value: '1.0', type: 'number' }
];

async function testDataSync() {
    console.log('开始测试数据同步API...\n');

    try {
        // 1. 测试同步数据
        console.log('1. 测试同步数据...');
        const syncResponse = await fetch(`${BASE_URL}/api/user/sync-data`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: 1,
                data: testData
            })
        });

        const syncResult = await syncResponse.json();
        console.log('同步结果:', syncResult);

        if (syncResult.success) {
            console.log('✅ 数据同步成功\n');
        } else {
            console.log('❌ 数据同步失败\n');
            return;
        }

        // 2. 测试获取数据
        console.log('2. 测试获取数据...');
        const getResponse = await fetch(`${BASE_URL}/api/user/get-game-data?userId=1`);
        const getResult = await getResponse.json();
        console.log('获取结果:', getResult);

        if (getResult.success) {
            console.log('✅ 数据获取成功\n');
            console.log('获取到的数据:');
            getResult.data.forEach(item => {
                console.log(`  ${item.key}: ${item.value} (${item.type})`);
            });
        } else {
            console.log('❌ 数据获取失败\n');
        }

        // 3. 测试初始化数据
        console.log('3. 测试初始化数据...');
        const initResponse = await fetch(`${BASE_URL}/api/user/init-game-data`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: 2
            })
        });

        const initResult = await initResponse.json();
        console.log('初始化结果:', initResult);

        if (initResult.success) {
            console.log('✅ 数据初始化成功\n');
        } else {
            console.log('❌ 数据初始化失败\n');
        }

        // 4. 测试获取同步状态
        console.log('4. 测试获取同步状态...');
        const statusResponse = await fetch(`${BASE_URL}/api/user/sync-status?userId=1`);
        const statusResult = await statusResponse.json();
        console.log('同步状态结果:', statusResult);

        if (statusResult.success) {
            console.log('✅ 同步状态获取成功\n');
        } else {
            console.log('❌ 同步状态获取失败\n');
        }

        console.log('所有测试完成！');

    } catch (error) {
        console.error('测试过程中发生错误:', error);
    }
}

// 运行测试
testDataSync(); 