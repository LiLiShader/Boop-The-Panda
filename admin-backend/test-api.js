// 测试API返回的数据是否包含商品信息
const http = require('http');

// 配置
const API_HOST = '119.91.142.92';
const API_PORT = 3001;
const USER_ID = 'testid'; // 替换为实际存在的用户ID

// 测试获取用户支付记录
function testGetUserPayments() {
  const options = {
    hostname: API_HOST,
    port: API_PORT,
    path: `/api/payments/user/${USER_ID}`,
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    console.log(`状态码: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const result = JSON.parse(data);
        console.log('API返回结果:');
        console.log(JSON.stringify(result, null, 2));
        
        // 检查是否包含商品信息字段
        if (result.success && result.data && result.data.length > 0) {
          const firstRecord = result.data[0];
          console.log('\n第一条记录的详细信息:');
          console.log('- product_id:', firstRecord.product_id || '无');
          console.log('- product_info:', firstRecord.product_info || '无');
          console.log('- product_details:', firstRecord.product_details || '无');
          
          if (!firstRecord.product_id && !firstRecord.product_info && !firstRecord.product_details) {
            console.log('\n问题诊断: API返回的数据不包含商品信息字段，可能需要检查后端代码。');
          }
        } else {
          console.log('\n问题诊断: 没有找到支付记录或API返回错误。');
        }
      } catch (e) {
        console.error('解析API返回数据失败:', e);
      }
    });
  });
  
  req.on('error', (e) => {
    console.error(`请求出错: ${e.message}`);
  });
  
  req.end();
}

// 测试获取所有支付记录
function testGetAllPayments() {
  const options = {
    hostname: API_HOST,
    port: API_PORT,
    path: '/api/payments/all',
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    console.log(`\n状态码: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const result = JSON.parse(data);
        console.log('API返回结果 (前3条):');
        if (result.success && result.data && result.data.length > 0) {
          console.log(JSON.stringify(result.data.slice(0, 3), null, 2));
          
          // 检查是否包含商品信息字段
          const recordsWithProductInfo = result.data.filter(record => 
            record.product_id || record.product_info || record.product_details
          );
          
          console.log(`\n总记录数: ${result.data.length}`);
          console.log(`包含商品信息的记录数: ${recordsWithProductInfo.length}`);
          
          if (recordsWithProductInfo.length === 0) {
            console.log('\n问题诊断: 所有记录都不包含商品信息，需要更新现有记录。');
          }
        } else {
          console.log('\n问题诊断: 没有找到支付记录或API返回错误。');
        }
      } catch (e) {
        console.error('解析API返回数据失败:', e);
      }
    });
  });
  
  req.on('error', (e) => {
    console.error(`请求出错: ${e.message}`);
  });
  
  req.end();
}

// 测试添加新支付记录
function testAddPayment() {
  const data = JSON.stringify({
    user_id: "testuser",
    user_name: "测试用户",
    amount: 100.00,
    order_no: `ORDER${Date.now()}`,
    pay_time: new Date().toISOString().replace('T', ' ').substring(0, 19),
    raw_response: {"code":"P0001","message":"success"},
    product_id: "itemBtn5",
    product_info: "钻石礼包-180钻石",
    product_details: {"diamonds": 180, "isFirstCharge": false}
  });

  const options = {
    hostname: API_HOST,
    port: API_PORT,
    path: '/api/payments/record',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };

  const req = http.request(options, (res) => {
    console.log(`\n状态码: ${res.statusCode}`);
    
    let responseData = '';
    res.on('data', (chunk) => {
      responseData += chunk;
    });
    
    res.on('end', () => {
      try {
        const result = JSON.parse(responseData);
        console.log('添加支付记录结果:');
        console.log(JSON.stringify(result, null, 2));
        
        if (result.success) {
          console.log('\n添加成功，现在测试查询这条新记录...');
          // 等待1秒后查询
          setTimeout(() => {
            testGetUserPayments('testuser');
          }, 1000);
        }
      } catch (e) {
        console.error('解析API返回数据失败:', e);
      }
    });
  });
  
  req.on('error', (e) => {
    console.error(`请求出错: ${e.message}`);
  });
  
  req.write(data);
  req.end();
}

// 执行测试
console.log('开始测试API...');
console.log('1. 测试获取用户支付记录');
testGetUserPayments();

console.log('\n2. 测试获取所有支付记录');
testGetAllPayments();

console.log('\n3. 测试添加新支付记录');
testAddPayment(); 