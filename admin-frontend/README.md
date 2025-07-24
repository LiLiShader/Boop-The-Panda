# 游戏运维管理系统 (Web版)

这是一个基于HTML、CSS和JavaScript开发的游戏运维管理系统，用于查询用户信息和支付订单数据。

## 功能特点

- 用户信息查询：通过用户ID查询用户基本信息
- 用户订单查询：查看指定用户的所有支付订单
- 全部订单查询：查看系统中所有用户的支付订单
- 响应式设计：适配不同屏幕尺寸的设备

## 部署说明

### 方法一：本地部署

1. 将整个`admin-frontend`文件夹复制到Web服务器的根目录下
2. 配置Web服务器（如Nginx、Apache）指向该目录
3. 访问对应的URL即可使用

### 方法二：使用Node.js简易服务器

1. 安装Node.js (如果尚未安装)
2. 在`admin-frontend`目录下创建`server.js`文件，内容如下：

```javascript
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8080;

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

const server = http.createServer((req, res) => {
  // 默认提供index.html
  let filePath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url);
  
  // 获取文件扩展名
  const ext = path.extname(filePath);
  let contentType = MIME_TYPES[ext] || 'application/octet-stream';
  
  // 读取文件
  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        // 文件不存在
        fs.readFile(path.join(__dirname, '404.html'), (err, content) => {
          res.writeHead(404, { 'Content-Type': 'text/html' });
          res.end(content, 'utf8');
        });
      } else {
        // 服务器错误
        res.writeHead(500);
        res.end(`Server Error: ${err.code}`);
      }
    } else {
      // 成功响应
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf8');
    }
  });
});

server.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});
```

3. 创建启动脚本`start.sh`(Linux/Mac)或`start.bat`(Windows)：

**start.sh**:
```bash
#!/bin/bash
node server.js
```

**start.bat**:
```batch
@echo off
node server.js
```

4. 给启动脚本添加执行权限(Linux/Mac)：`chmod +x start.sh`
5. 运行启动脚本
6. 在浏览器中访问`http://localhost:8080`

### 方法三：使用Docker部署

1. 在`admin-frontend`目录下创建`Dockerfile`：

```dockerfile
FROM nginx:alpine
COPY . /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

2. 构建Docker镜像：
```bash
docker build -t game-admin-system .
```

3. 运行Docker容器：
```bash
docker run -d -p 8080:80 game-admin-system
```

4. 访问`http://localhost:8080`

## 配置说明

系统默认连接到`http://119.91.142.92:3001/api`作为后端API地址。如需修改，请编辑`script.js`文件中的`API_BASE_URL`常量：

```javascript
const API_BASE_URL = 'http://你的API地址';
```

## 使用说明

1. 用户查询：在"用户ID"输入框中输入用户ID，点击"查询"按钮
2. 查看所有订单：点击"查询所有订单"按钮
3. 查询结果将显示在对应区域

## 注意事项

- 确保后端API服务正常运行
- 如果使用本地部署，需要处理跨域(CORS)问题
- 本系统仅用于内部运维管理，请勿暴露在公网环境

## 技术栈

- HTML5
- CSS3 (响应式设计)
- JavaScript (ES6+)
- Fetch API (异步数据请求) 