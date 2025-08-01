# 游戏数据同步系统 (Release版本)

## 概述

本系统实现了游戏本地数据与服务器数据库的统一存储和同步功能。当用户登录成功后，系统会自动从服务器获取所有游戏数据，并在本地数据变更时自动同步到服务器。

## 系统架构

### 1. 数据库层
- **表结构**: `user_game_data` 表存储用户游戏数据
- **字段**: `user_id`, `data_key`, `data_value`, `data_type`, `created_at`, `updated_at`
- **索引**: 优化查询性能

### 2. 后端API层 (release/backend)
- **同步数据**: `POST /api/user/sync-data`
- **获取数据**: `GET /api/user/get-game-data`
- **初始化数据**: `POST /api/user/init-game-data`

### 3. 前端同步层
- **数据同步管理器**: `DataSyncManager` 类
- **本地存储**: `StorageHelper` 类增强
- **自动同步**: 登录时获取，变更时上传

## 功能特性

### 1. 自动数据同步
- 登录成功后自动从服务器获取数据
- 本地数据变更时自动上传到服务器
- 支持离线存储，网络恢复后自动同步

### 2. 数据类型支持
- **string**: 字符串类型
- **number**: 数字类型
- **boolean**: 布尔类型
- **json**: JSON对象类型

### 3. 错误处理
- 网络异常时自动重试
- 数据冲突解决机制
- 完善的错误日志记录

### 4. 性能优化
- 批量数据操作
- 智能缓存机制
- 增量同步策略

## 使用方法

### 1. 数据库设置

数据库表会在后端服务启动时自动创建，包括：
- `user_game_data` 表
- `users` 表的 `last_sync_time` 字段

### 2. 后端启动

```bash
cd release/backend
npm install
npm start
```

### 3. 前端集成

前端代码已经集成，主要文件：
- `assets/script/core/dataSyncManager.ts` - 数据同步管理器
- `assets/script/utils/storageHelper.ts` - 增强的存储助手
- `assets/script/core/userInfo.ts` - 用户信息管理

### 4. API测试

运行测试脚本：
```bash
cd release/backend
node test-data-sync.js
```

## API接口说明

### 1. 同步用户游戏数据
```
POST /api/user/sync-data
Content-Type: application/json

{
    "userId": 1,
    "data": [
        {
            "key": "Gold",
            "value": "1000",
            "type": "string"
        },
        {
            "key": "Level",
            "value": "10",
            "type": "number"
        }
    ]
}
```

### 2. 获取用户游戏数据
```
GET /api/user/get-game-data?userId=1

Response:
{
    "success": true,
    "data": [
        {
            "key": "Gold",
            "value": "1000",
            "type": "string"
        }
    ],
    "timestamp": "2025-01-22T10:30:00.000Z"
}
```

### 3. 初始化用户游戏数据
```
POST /api/user/init-game-data
Content-Type: application/json

{
    "userId": 1
}
```

### 4. 获取用户同步状态
```
GET /api/user/sync-status?userId=1

Response:
{
    "success": true,
    "data": {
        "hasGameData": true,
        "lastSyncTime": "2025-01-22T10:30:00.000Z",
        "timestamp": "2025-01-22T10:30:00.000Z"
    }
}
```

## 数据同步流程

### 1. 用户登录流程
1. 用户登录成功
2. 初始化数据同步管理器
3. 从服务器获取用户游戏数据
4. 如果服务器无数据，初始化默认数据
5. 将数据应用到本地存储

### 2. 数据变更流程
1. 本地数据发生变更
2. 自动添加到同步队列
3. 网络在线时立即同步
4. 网络离线时缓存到队列
5. 网络恢复后自动同步

### 3. 错误处理流程
1. 同步失败时记录错误
2. 自动重试机制（最多3次）
3. 递增延迟重试
4. 达到最大重试次数后停止

## 配置说明

### 1. 同步间隔
```typescript
private readonly SYNC_INTERVAL = 5000; // 5秒
```

### 2. 重试配置
```typescript
private readonly MAX_RETRY_COUNT = 3; // 最大重试次数
```

### 3. 默认数据
在 `userDataService.js` 中配置默认游戏数据。

## 监控和调试

### 1. 日志查看
- 后端日志: `release/backend/logs/`
- 前端日志: 浏览器控制台

### 2. 数据库查询
```sql
-- 查看用户游戏数据
SELECT * FROM user_game_data WHERE user_id = 1;

-- 查看同步状态
SELECT id, pid, name, last_sync_time FROM users WHERE id = 1;
```

### 3. 网络状态
前端会自动检测网络状态，离线时切换到离线模式。

## 注意事项

1. **循环依赖**: 避免在初始化阶段产生循环依赖
2. **数据一致性**: 确保本地和服务器数据的一致性
3. **性能优化**: 大量数据时使用批量操作
4. **错误处理**: 完善的错误处理机制
5. **安全性**: 验证用户权限和数据格式

## 故障排除

### 1. 同步失败
- 检查网络连接
- 查看服务器日志
- 验证API接口状态

### 2. 数据不一致
- 检查数据库连接
- 验证数据格式
- 查看同步日志

### 3. 性能问题
- 优化数据库查询
- 调整同步间隔
- 检查数据量大小

## 更新日志

### v1.0.0 (2025-01-22)
- 初始版本发布
- 实现基本的数据同步功能
- 支持多种数据类型
- 添加错误处理和重试机制
- 适配release/backend服务架构 