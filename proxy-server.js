const express = require('express');
const cors = require('cors');
const axios = require('axios');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// 启用 CORS
app.use(cors());
// 解析 JSON 请求体
app.use(bodyParser.json());
// 解析 URL 编码的请求体
app.use(bodyParser.urlencoded({ extended: true }));

// 支付代理接口
app.post('/api/pay', async (req, res) => {
    try {
        const response = await axios({
            method: 'post',
            url: 'https://testurl.carespay.com:28081/carespay/pay',
            data: req.body,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
        
        res.json(response.data);
    } catch (error) {
        console.error('代理请求失败:', error);
        res.status(500).json({
            code: 'ERROR',
            message: error.message || '代理请求失败'
        });
    }
});

app.listen(port, () => {
    console.log(`代理服务器运行在 http://localhost:${port}`);
}); 