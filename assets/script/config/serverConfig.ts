/**
 * 服务器配置统一管理
 * 所有服务器地址和端口都在这里配置
 * 
 * 注意：这个类现在主要用于向后兼容
 * 新的项目建议使用 EnvironmentConfig 类
 */

import { EnvironmentConfig } from './environment';

export class ServerConfig {
    // 为了向后兼容，保持原有的静态配置
    // 但实际使用 EnvironmentConfig 的方法
    
    /**
     * 获取主服务器API地址
     */
    static getMainServerAPI(): string {
        return EnvironmentConfig.getMainServerAPI();
    }
    
    /**
     * 获取主服务器地址
     */
    static getMainServerURL(): string {
        return EnvironmentConfig.getMainServerURL();
    }
    
    /**
     * 获取支付代理服务器地址
     */
    static getPayProxyURL(): string {
        return EnvironmentConfig.getPayProxyURL();
    }
    
    /**
     * 获取支付代理API地址
     */
    static getPayProxyAPI(): string {
        return EnvironmentConfig.getPayProxyAPI();
    }
    
    /**
     * 获取3D支付回调服务器地址
     */
    static getCallbackServerURL(): string {
        return EnvironmentConfig.getCallbackServerURL();
    }
    
    /**
     * 获取3D支付回调API地址
     */
    static getCallbackServerAPI(): string {
        return EnvironmentConfig.getCallbackServerAPI();
    }
    
    /**
     * 获取服务器主机地址
     */
    static getServerHost(): string {
        return EnvironmentConfig.getServerHost();
    }
    
    /**
     * 获取所有配置信息（用于调试）
     */
    static getAllConfig() {
        return EnvironmentConfig.getAllConfig();
    }
} 