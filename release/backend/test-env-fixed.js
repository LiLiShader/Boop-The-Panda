const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'config.env') });

console.log('=== 修复后环境变量测试 ===');
console.log('process.env.DB_HOST:', process.env.DB_HOST);
console.log('process.env.DB_USER:', process.env.DB_USER);
console.log('process.env.DB_PASSWORD:', process.env.DB_PASSWORD);
console.log('process.env.DB_NAME:', process.env.DB_NAME);
console.log('process.env.DB_PORT:', process.env.DB_PORT); 