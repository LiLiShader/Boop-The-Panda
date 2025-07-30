# 环境配置问题修复指南

## 问题描述

测试环境请求了正式环境的域名 `https://thunderousfreeze.com:3001/api/auth/login`，导致连接失败。

## 问题原因

1. **默认环境设置错误**: 环境配置默认设置为生产环境
2. **缺少自动环境检测**: 没有根据当前域名自动设置环境
3. **环境切换机制不完善**: 缺少运行时环境切换功能

## 已修复的问题

### 1. 修改默认环境
```typescript
// 修改前
private static currentEnv: Environment = Environment.PRODUCTION;

// 修改后
private static currentEnv: Environment = Environment.TESTING;
```

### 2. 添加自动环境检测
```typescript
static autoDetectEnvironment(): void {
    if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            this.setEnvironment(Environment.DEVELOPMENT);
        } else if (hostname === 'thunderousfreeze.com') {
            this.setEnvironment(Environment.PRODUCTION);
        } else {
            this.setEnvironment(Environment.TESTING);
        }
    }
}
```

### 3. 在应用启动时自动检测环境
```typescript
// 在 app.ts 的 onInit 方法中添加
EnvironmentConfig.autoDetectEnvironment();
```

## 环境配置说明

### 当前环境配置
- **开发环境**: localhost (HTTP)
- **测试环境**: 119.91.142.92 (HTTP)
- **生产环境**: thunderousfreeze.com (HTTPS)

### 环境检测规则
1. **URL参数优先**: `?env=development`
2. **域名自动检测**: 根据当前域名自动设置
3. **默认回退**: 如果没有匹配，使用测试环境

## 调试方法

### 1. 检查当前环境
在浏览器控制台执行：
```javascript
EnvironmentDebug.checkCurrentEnvironment()
```

### 2. 切换环境
```javascript
// 切换到测试环境
EnvironmentDebug.switchEnvironment('testing')

// 切换到开发环境
EnvironmentDebug.switchEnvironment('development')

// 切换到生产环境
EnvironmentDebug.switchEnvironment('production')
```

### 3. 测试网络连接
```javascript
EnvironmentDebug.testNetworkConnection()
```

### 4. 显示所有环境配置
```javascript
EnvironmentDebug.showAllEnvironments()
```

## 使用方法

### 1. 开发环境
```
http://localhost:8080/
http://127.0.0.1:8080/
http://your-domain.com/?env=development
```

### 2. 测试环境
```
http://119.91.142.92:8080/
http://your-domain.com/?env=testing
```

### 3. 生产环境
```
https://thunderousfreeze.com/
http://your-domain.com/?env=production
```

## 验证修复

### 1. 检查控制台日志
启动应用后，应该看到类似日志：
```
[EnvironmentConfig] 根据域名自动设置为测试环境: your-domain.com
[EnvironmentConfig] 当前环境设置为: testing
[EnvironmentConfig] 服务器配置: http://119.91.142.92:3001
```

### 2. 验证API请求
网络请求应该指向正确的服务器：
- 测试环境: `http://119.91.142.92:3001/api/`
- 生产环境: `https://thunderousfreeze.com:3001/api/`

### 3. 测试登录功能
尝试登录，应该不再出现连接错误。

## 常见问题

### Q: 为什么还是请求生产环境？
A: 检查以下几点：
1. 确认当前域名不是 `thunderousfreeze.com`
2. 检查URL参数是否包含 `?env=production`
3. 清除浏览器缓存后重试

### Q: 如何强制使用测试环境？
A: 使用以下方法之一：
1. 在URL中添加参数: `?env=testing`
2. 在控制台执行: `EnvironmentDebug.switchEnvironment('testing')`

### Q: 如何检查当前配置？
A: 在控制台执行: `EnvironmentDebug.checkCurrentEnvironment()`

## 预防措施

1. **开发时使用测试环境**: 避免误用生产环境
2. **定期检查环境配置**: 确保环境设置正确
3. **使用调试工具**: 利用 `EnvironmentDebug` 进行调试
4. **添加环境标识**: 在UI中显示当前环境（可选）

## 总结

通过以上修复，环境配置问题已解决：
- ✅ 默认环境改为测试环境
- ✅ 添加了自动环境检测
- ✅ 提供了调试工具
- ✅ 支持多种环境切换方式

现在应用会根据当前域名自动选择正确的环境，避免误用生产环境。 