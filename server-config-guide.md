# 服务器配置统一管理说明

## 概述

本项目已将所有硬编码的服务器地址 `119.91.142.92` 统一配置管理，支持多环境部署和动态配置。

## 配置架构

### 1. 环境配置系统

```
assets/script/config/
├── environment.ts      # 环境配置管理（推荐使用）
└── serverConfig.ts     # 服务器配置（向后兼容）
```

### 2. 支持的配置方式

#### 方式一：使用 EnvironmentConfig（推荐）
```typescript
import { EnvironmentConfig, Environment } from '../config/environment';

// 设置环境
EnvironmentConfig.setEnvironment(Environment.PRODUCTION);

// 获取服务器地址
const apiUrl = EnvironmentConfig.getMainServerAPI();
```

#### 方式二：使用 ServerConfig（向后兼容）
```typescript
import { ServerConfig } from '../config/serverConfig';

// 获取服务器地址
const apiUrl = ServerConfig.getMainServerAPI();
```

#### 方式三：URL参数自动检测
```
http://your-game.com/?env=development
http://your-game.com/?env=testing
http://your-game.com/?env=production
```

## 环境配置

### 开发环境 (Development)
- **主机**: localhost
- **协议**: http
- **端口**: 3001, 5000, 5001

### 测试环境 (Testing)
- **主机**: 119.91.142.92
- **协议**: http
- **端口**: 3001, 5000, 5001

### 生产环境 (Production)
- **主机**: 119.91.142.92
- **协议**: https
- **端口**: 3001, 5000, 5001

## 已修改的文件

### 前端文件
1. **`assets/script/config/serverConfig.ts`** - 统一配置管理
2. **`assets/script/config/environment.ts`** - 环境配置管理
3. **`assets/script/core/userInfo.ts`** - 用户信息管理
4. **`assets/script/core/payManager.ts`** - 支付管理
5. **`assets/script/game/ui/settingViewCmpt.ts`** - 设置视图
6. **`assets/script/game/ui/AdminViewCmpt.ts`** - 管理员视图

### 后端文件
1. **`proxy-server/3d-callback-server.js`** - 3D支付回调服务器
2. **`admin-backend/test-api.js`** - 测试API
3. **`admin-frontend/script.js`** - 前端管理界面

## 使用方法

### 1. 基本使用
```typescript
// 获取主服务器API地址
const apiUrl = ServerConfig.getMainServerAPI();
// 结果: http://119.91.142.92:3001/api

// 获取支付代理API地址
const payUrl = ServerConfig.getPayProxyAPI();
// 结果: http://119.91.142.92:5000/api
```

### 2. 环境切换
```typescript
// 切换到开发环境
EnvironmentConfig.setEnvironment(Environment.DEVELOPMENT);

// 切换到测试环境
EnvironmentConfig.setEnvironment(Environment.TESTING);

// 切换到生产环境
EnvironmentConfig.setEnvironment(Environment.PRODUCTION);
```

### 3. 调试配置
```typescript
// 查看当前所有配置
console.log(ServerConfig.getAllConfig());
// 输出:
// {
//   environment: 'production',
//   host: '119.91.142.92',
//   mainServer: 'https://119.91.142.92:3001/api',
//   payProxy: 'https://119.91.142.92:5000/api',
//   callbackServer: 'https://119.91.142.92:5001/api',
//   ports: { main: 3001, payProxy: 5000, callback: 5001 },
//   protocol: 'https'
// }
```

## 配置更新

### 修改服务器地址
如需修改服务器地址，只需要更新 `environment.ts` 中的配置：

```typescript
private static readonly SERVER_CONFIGS = {
    [Environment.PRODUCTION]: {
        host: 'your-new-server.com',  // 修改这里
        mainServerPort: 3001,
        payProxyPort: 5000,
        callbackServerPort: 5001,
        protocol: 'https'
    }
};
```

### 添加新环境
```typescript
[Environment.STAGING]: {
    host: 'staging-server.com',
    mainServerPort: 3001,
    payProxyPort: 5000,
    callbackServerPort: 5001,
    protocol: 'https'
}
```

## 优势

1. **统一管理**: 所有服务器地址集中配置
2. **环境隔离**: 支持开发、测试、生产环境
3. **动态切换**: 支持运行时环境切换
4. **向后兼容**: 现有代码无需大幅修改
5. **易于维护**: 修改服务器地址只需更新配置文件

## 注意事项

1. **生产环境**: 建议使用HTTPS协议
2. **环境变量**: 可以通过环境变量设置当前环境
3. **URL参数**: 支持通过URL参数动态切换环境
4. **缓存**: 配置变更后需要重新加载页面

## 迁移指南

### 从硬编码地址迁移
```typescript
// 旧代码
const apiUrl = 'http://119.91.142.92:3001/api';

// 新代码
const apiUrl = ServerConfig.getMainServerAPI();
```

### 从环境变量迁移
```typescript
// 旧代码
const apiUrl = process.env.API_URL || 'http://119.91.142.92:3001/api';

// 新代码
const apiUrl = EnvironmentConfig.getMainServerAPI();
```

## 故障排除

### 1. 配置不生效
- 检查是否正确导入了配置类
- 确认环境设置是否正确
- 查看控制台是否有配置相关的日志

### 2. 网络连接失败
- 确认服务器地址是否正确
- 检查网络连接是否正常
- 验证端口是否开放

### 3. 环境切换失败
- 确认环境枚举值是否正确
- 检查URL参数格式是否正确
- 查看浏览器控制台错误信息 