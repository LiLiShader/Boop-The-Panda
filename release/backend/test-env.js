require('dotenv').config();

console.log('=== 环境变量测试 ===');
console.log('process.env.DB_HOST:', process.env.DB_HOST);
console.log('process.env.DB_USER:', process.env.DB_USER);
console.log('process.env.DB_PASSWORD:', process.env.DB_PASSWORD);
console.log('process.env.DB_NAME:', process.env.DB_NAME);
console.log('process.env.DB_PORT:', process.env.DB_PORT);

// 检查config.env文件是否存在
const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, 'config.env');
console.log('config.env路径:', configPath);
console.log('config.env存在:', fs.existsSync(configPath));

if (fs.existsSync(configPath)) {
    const configContent = fs.readFileSync(configPath, 'utf8');
    console.log('config.env内容:');
    console.log(configContent);
} 