# 配置管理API文档

## 概述
配置管理API提供全局配置的获取、设置和管理功能，包括支付模式、维护模式等。

## 基础URL
```
http://localhost:3000/api/config
```

## API端点

### 1. 获取所有配置
**GET** `/api/config/all`

获取所有全局配置。

**响应示例：**
```json
{
  "success": true,
  "message": "获取配置成功",
  "data": [
    {
      "config_key": "payment_mode",
      "config_value": "2D",
      "description": "支付模式：2D或3D",
      "updated_at": "2025-01-09T21:45:05.000Z"
    },
    {
      "config_key": "maintenance_mode",
      "config_value": "false",
      "description": "维护模式：true或false",
      "updated_at": "2025-01-09T21:45:05.000Z"
    }
  ]
}
```

### 2. 获取指定配置
**GET** `/api/config/:configKey`

获取指定配置键的值。

**参数：**
- `configKey` (路径参数) - 配置键名

**响应示例：**
```json
{
  "success": true,
  "message": "获取配置成功",
  "data": {
    "config_key": "payment_mode",
    "config_value": "2D",
    "description": "支付模式：2D或3D",
    "updated_at": "2025-01-09T21:45:05.000Z"
  }
}
```

### 3. 设置配置
**POST** `/api/config/set`

设置配置值。

**请求体：**
```json
{
  "configKey": "payment_mode",
  "configValue": "3D",
  "description": "支付模式：2D或3D"
}
```

**响应示例：**
```json
{
  "success": true,
  "message": "设置配置成功"
}
```

### 4. 删除配置
**DELETE** `/api/config/:configKey`

删除指定配置。

**参数：**
- `configKey` (路径参数) - 配置键名

**响应示例：**
```json
{
  "success": true,
  "message": "删除配置成功"
}
```

### 5. 获取支付模式
**GET** `/api/config/payment/mode`

获取当前支付模式。

**响应示例：**
```json
{
  "success": true,
  "message": "获取支付模式成功",
  "data": {
    "mode": "2D"
  }
}
```

### 6. 设置支付模式
**POST** `/api/config/payment/mode`

设置支付模式。

**请求体：**
```json
{
  "mode": "3D"
}
```

**响应示例：**
```json
{
  "success": true,
  "message": "支付模式已设置为3D",
  "data": {
    "mode": "3D"
  }
}
```

### 7. 获取维护模式状态
**GET** `/api/config/maintenance/mode`

获取维护模式状态。

**响应示例：**
```json
{
  "success": true,
  "message": "获取维护模式状态成功",
  "data": {
    "maintenanceMode": false
  }
}
```

### 8. 设置维护模式
**POST** `/api/config/maintenance/mode`

设置维护模式。

**请求体：**
```json
{
  "enabled": true
}
```

**响应示例：**
```json
{
  "success": true,
  "message": "维护模式已启用",
  "data": {
    "maintenanceMode": true
  }
}
```

### 9. 批量更新配置
**POST** `/api/config/batch-update`

批量更新多个配置。

**请求体：**
```json
{
  "configs": [
    {
      "key": "payment_mode",
      "value": "3D",
      "description": "支付模式：2D或3D"
    },
    {
      "key": "maintenance_mode",
      "value": "true",
      "description": "维护模式：true或false"
    }
  ]
}
```

**响应示例：**
```json
{
  "success": true,
  "message": "批量更新配置成功"
}
```

## 错误响应

### 400 Bad Request
```json
{
  "success": false,
  "message": "支付模式必须是2D或3D"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "配置不存在"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "获取配置失败",
  "error": "错误详情"
}
```

## 使用示例

### 使用curl测试API

```bash
# 获取所有配置
curl -X GET http://localhost:3000/api/config/all

# 获取支付模式
curl -X GET http://localhost:3000/api/config/payment/mode

# 设置支付模式为3D
curl -X POST http://localhost:3000/api/config/payment/mode \
  -H "Content-Type: application/json" \
  -d '{"mode": "3D"}'

# 设置维护模式
curl -X POST http://localhost:3000/api/config/maintenance/mode \
  -H "Content-Type: application/json" \
  -d '{"enabled": true}'
```

### 使用JavaScript测试API

```javascript
// 获取支付模式
const response = await fetch('http://localhost:3000/api/config/payment/mode');
const data = await response.json();
console.log('当前支付模式:', data.data.mode);

// 设置支付模式
const setResponse = await fetch('http://localhost:3000/api/config/payment/mode', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ mode: '3D' })
});
const setData = await setResponse.json();
console.log('设置结果:', setData.message);
```

## 测试脚本

运行测试脚本验证API功能：

```bash
node test-config-api.js
```

## 注意事项

1. **支付模式值**：只能是 `2D` 或 `3D`
2. **维护模式值**：只能是 `true` 或 `false`
3. **配置键名**：建议使用下划线分隔的小写字母
4. **事务安全**：所有写操作都使用数据库事务确保数据一致性
5. **错误处理**：所有API都包含完整的错误处理和日志记录 