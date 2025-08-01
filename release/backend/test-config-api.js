// 使用Node.js 18+内置的fetch
// const fetch = require('node-fetch'); // 注释掉，使用内置fetch

const BASE_URL = 'http://localhost:3000/api/config';

async function testConfigAPI() {
    console.log('🧪 测试配置管理API...\n');

    try {
        // 1. 获取所有配置
        console.log('1. 测试获取所有配置...');
        const allConfigsResponse = await fetch(`${BASE_URL}/all`);
        const allConfigsData = await allConfigsResponse.json();
        console.log('响应:', JSON.stringify(allConfigsData, null, 2));
        console.log('');

        // 2. 获取支付模式
        console.log('2. 测试获取支付模式...');
        const paymentModeResponse = await fetch(`${BASE_URL}/payment/mode`);
        const paymentModeData = await paymentModeResponse.json();
        console.log('响应:', JSON.stringify(paymentModeData, null, 2));
        console.log('');

        // 3. 设置支付模式为3D
        console.log('3. 测试设置支付模式为3D...');
        const set3DResponse = await fetch(`${BASE_URL}/payment/mode`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mode: '3D' })
        });
        const set3DData = await set3DResponse.json();
        console.log('响应:', JSON.stringify(set3DData, null, 2));
        console.log('');

        // 4. 验证支付模式已更新
        console.log('4. 验证支付模式已更新...');
        const verify3DResponse = await fetch(`${BASE_URL}/payment/mode`);
        const verify3DData = await verify3DResponse.json();
        console.log('响应:', JSON.stringify(verify3DData, null, 2));
        console.log('');

        // 5. 设置支付模式回2D
        console.log('5. 测试设置支付模式回2D...');
        const set2DResponse = await fetch(`${BASE_URL}/payment/mode`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mode: '2D' })
        });
        const set2DData = await set2DResponse.json();
        console.log('响应:', JSON.stringify(set2DData, null, 2));
        console.log('');

        // 6. 测试获取维护模式
        console.log('6. 测试获取维护模式...');
        const maintenanceResponse = await fetch(`${BASE_URL}/maintenance/mode`);
        const maintenanceData = await maintenanceResponse.json();
        console.log('响应:', JSON.stringify(maintenanceData, null, 2));
        console.log('');

        // 7. 测试设置维护模式
        console.log('7. 测试设置维护模式...');
        const setMaintenanceResponse = await fetch(`${BASE_URL}/maintenance/mode`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ enabled: true })
        });
        const setMaintenanceData = await setMaintenanceResponse.json();
        console.log('响应:', JSON.stringify(setMaintenanceData, null, 2));
        console.log('');

        // 8. 测试获取指定配置
        console.log('8. 测试获取指定配置...');
        const specificConfigResponse = await fetch(`${BASE_URL}/payment_mode`);
        const specificConfigData = await specificConfigResponse.json();
        console.log('响应:', JSON.stringify(specificConfigData, null, 2));
        console.log('');

        // 9. 测试批量更新配置
        console.log('9. 测试批量更新配置...');
        const batchUpdateResponse = await fetch(`${BASE_URL}/batch-update`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                configs: [
                    { key: 'test_config_1', value: 'test_value_1', description: '测试配置1' },
                    { key: 'test_config_2', value: 'test_value_2', description: '测试配置2' }
                ]
            })
        });
        const batchUpdateData = await batchUpdateResponse.json();
        console.log('响应:', JSON.stringify(batchUpdateData, null, 2));
        console.log('');

        // 10. 测试错误处理 - 无效的支付模式
        console.log('10. 测试错误处理 - 无效的支付模式...');
        const invalidModeResponse = await fetch(`${BASE_URL}/payment/mode`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mode: '4D' })
        });
        const invalidModeData = await invalidModeResponse.json();
        console.log('响应:', JSON.stringify(invalidModeData, null, 2));
        console.log('');

        console.log('🎉 所有API测试完成！');

    } catch (error) {
        console.error('❌ API测试失败:', error.message);
        console.log('请确保后端服务正在运行: npm start');
    }
}

// 运行测试
testConfigAPI(); 