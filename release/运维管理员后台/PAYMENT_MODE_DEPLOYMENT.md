# 支付模式管理功能部署说明

## 📋 功能概述

运维后台新增了支付模式管理功能，允许运维人员通过Web界面实时切换游戏的支付模式（2D/3D），所有用户将立即使用新的支付模式。

## 🎯 主要功能

1. **实时显示当前支付模式**
   - 页面加载时自动获取当前支付模式
   - 显示模式状态和详细说明

2. **一键切换支付模式**
   - 2D支付模式：标准支付流程
   - 3D支付模式：3D Secure验证流程

3. **智能按钮状态管理**
   - 当前模式按钮禁用
   - 其他模式按钮启用
   - 防止重复点击

4. **完整的错误处理**
   - 网络异常处理
   - 服务器错误处理
   - 用户友好的错误提示

## 🚀 部署步骤

### 1. 确保后端服务正常运行

```bash
# 检查后端服务状态
pm2 status boop-backend

# 如果服务未运行，启动服务
pm2 start boop-backend

# 检查服务日志
pm2 logs boop-backend --lines 20
```

### 2. 验证后端API可用性

```bash
# 测试获取支付模式API
curl -X GET http://119.91.142.92:3000/api/config/payment/mode

# 测试设置支付模式API
curl -X POST http://119.91.142.92:3000/api/config/payment/mode \
  -H "Content-Type: application/json" \
  -d '{"mode": "3D"}'

# 切换回2D模式
curl -X POST http://119.91.142.92:3000/api/config/payment/mode \
  -H "Content-Type: application/json" \
  -d '{"mode": "2D"}'
```

### 3. 部署前端文件

将以下文件上传到服务器：

```bash
# 上传修改后的文件
scp index.html user@119.91.142.92:/path/to/admin-frontend/
scp styles.css user@119.91.142.92:/path/to/admin-frontend/
scp script.js user@119.91.142.92:/path/to/admin-frontend/
```

### 4. 启动运维后台服务

```bash
# 进入运维后台目录
cd /path/to/admin-frontend

# 安装依赖（如果需要）
npm install

# 启动服务
npm start
# 或者
node server.js
```

### 5. 访问运维后台

打开浏览器访问：`http://119.91.142.92:3001`

**注意**：运维后台前端运行在3001端口，但后端API运行在3000端口

## 🧪 功能测试

### 1. 测试获取支付模式

1. 打开运维后台页面
2. 查看"支付模式管理"区域
3. 确认显示当前支付模式（2D或3D）
4. 确认按钮状态正确

### 2. 测试切换支付模式

1. 点击"切换到3D支付"按钮
2. 确认按钮变为禁用状态
3. 等待操作完成
4. 确认模式显示更新为"3D"
5. 确认按钮状态更新

### 3. 测试游戏端响应

1. 在游戏中尝试支付
2. 确认使用新的支付模式
3. 验证支付流程正常

## 🔧 配置说明

### API配置

在 `script.js` 中配置API地址：

```javascript
const SERVER_HOST = '119.91.142.92';
const MAIN_SERVER_PORT = 3000; // 后端API端口
const PROTOCOL = 'http';
const API_BASE_URL = `${PROTOCOL}://${SERVER_HOST}:${MAIN_SERVER_PORT}/api`;
```

### 样式配置

支付模式管理区域的样式在 `styles.css` 中定义：

- `.payment-mode-container`: 主容器样式
- `.mode-value`: 模式显示样式
- `.mode-btn`: 按钮样式
- `.mode-description`: 描述文本样式

## 🐛 故障排除

### 1. 无法获取支付模式

**症状**：显示"获取失败"或"加载中..."

**解决方案**：
```bash
# 检查后端服务状态
pm2 status boop-backend

# 检查API是否可访问
curl http://119.91.142.92:3000/api/config/payment/mode

# 检查网络连接
ping 119.91.142.92
```

### 2. 切换支付模式失败

**症状**：点击按钮后显示错误消息

**解决方案**：
```bash
# 检查后端日志
pm2 logs boop-backend --lines 50

# 手动测试API
curl -X POST http://119.91.142.92:3000/api/config/payment/mode \
  -H "Content-Type: application/json" \
  -d '{"mode": "2D"}'
```

### 3. 游戏端未响应模式变更

**症状**：运维后台切换成功，但游戏仍使用旧模式

**解决方案**：
1. 确认游戏端已更新为最新版本
2. 检查游戏端是否正确调用支付模式API
3. 清除游戏端缓存或重启游戏

## 📊 监控建议

### 1. 日志监控

```bash
# 监控后端API调用
pm2 logs boop-backend --lines 100 | grep "payment/mode"

# 监控前端错误
tail -f /path/to/admin-frontend/logs/error.log
```

### 2. 性能监控

- 监控API响应时间
- 监控切换操作成功率
- 监控用户支付成功率

### 3. 告警设置

- API调用失败告警
- 支付模式切换失败告警
- 游戏端支付异常告警

## 🔒 安全建议

1. **访问控制**
   - 限制运维后台访问IP
   - 使用HTTPS协议
   - 添加用户认证

2. **操作审计**
   - 记录所有支付模式切换操作
   - 记录操作人员和时间
   - 定期审查操作日志

3. **备份策略**
   - 定期备份支付配置
   - 保存配置变更历史
   - 建立回滚机制

## 📞 技术支持

如遇到问题，请提供以下信息：

1. 错误截图或日志
2. 操作步骤描述
3. 浏览器控制台错误信息
4. 后端服务日志

---

**部署完成时间**：2025-08-01  
**版本**：v1.0.0  
**维护人员**：系统管理员 