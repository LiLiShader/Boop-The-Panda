/**
 * 环境配置调试工具
 * 用于检查和调试环境配置
 */

import { EnvironmentConfig, Environment } from './environment';

export class EnvironmentDebug {
    /**
     * 检查当前环境配置
     */
    static checkCurrentEnvironment(): void {
        console.log('=== 环境配置检查 ===');
        
        const currentEnv = EnvironmentConfig.getCurrentEnvironment();
        const config = EnvironmentConfig.getAllConfig();
        
        console.log('当前环境:', currentEnv);
        console.log('完整配置:', config);
        
        // 检查各个API地址
        console.log('主服务器API:', EnvironmentConfig.getMainServerAPI());
        console.log('支付代理API:', EnvironmentConfig.getPayProxyAPI());
        console.log('3D支付回调API:', EnvironmentConfig.getCallbackServerAPI());
        
        // 检查当前域名
        if (typeof window !== 'undefined') {
            console.log('当前域名:', window.location.hostname);
            console.log('当前协议:', window.location.protocol);
            console.log('当前端口:', window.location.port);
        }
        
        console.log('=== 环境配置检查完成 ===');
    }
    
    /**
     * 测试网络连接
     */
    static async testNetworkConnection(): Promise<void> {
        console.log('=== 网络连接测试 ===');
        
        const apiUrl = EnvironmentConfig.getMainServerAPI();
        console.log('测试API地址:', apiUrl);
        
        try {
            const response = await fetch(apiUrl + '/health');
            console.log('网络连接成功，状态码:', response.status);
            
            if (response.ok) {
                const data = await response.json();
                console.log('服务器响应:', data);
            } else {
                console.warn('服务器响应异常，状态码:', response.status);
            }
        } catch (error) {
            console.error('网络连接失败:', error);
        }
        
        console.log('=== 网络连接测试完成 ===');
    }
    
    /**
     * 切换环境
     */
    static switchEnvironment(env: Environment): void {
        console.log(`=== 切换环境到: ${env} ===`);
        
        EnvironmentConfig.setEnvironment(env);
        this.checkCurrentEnvironment();
        
        console.log(`=== 环境切换完成 ===`);
    }
    
    /**
     * 显示所有环境配置
     */
    static showAllEnvironments(): void {
        console.log('=== 所有环境配置 ===');
        
        Object.values(Environment).forEach(env => {
            EnvironmentConfig.setEnvironment(env);
            const config = EnvironmentConfig.getAllConfig();
            console.log(`${env} 环境:`, config);
        });
        
        console.log('=== 所有环境配置显示完成 ===');
    }
    
    /**
     * 根据URL参数设置环境
     */
    static setEnvironmentFromURL(): void {
        console.log('=== 根据URL参数设置环境 ===');
        
        if (typeof window !== 'undefined') {
            const urlParams = new URLSearchParams(window.location.search);
            const envParam = urlParams.get('env');
            
            if (envParam) {
                console.log('URL参数中的环境:', envParam);
                const env = envParam as Environment;
                if (Object.values(Environment).includes(env)) {
                    EnvironmentConfig.setEnvironment(env);
                    console.log('环境设置成功:', env);
                } else {
                    console.warn('无效的环境参数:', envParam);
                }
            } else {
                console.log('URL中没有环境参数，使用自动检测');
                EnvironmentConfig.autoDetectEnvironment();
            }
        }
        
        this.checkCurrentEnvironment();
        console.log('=== URL环境设置完成 ===');
    }
}

// 将调试工具添加到全局对象，方便在控制台调用
if (typeof window !== 'undefined') {
    (window as any).EnvironmentDebug = EnvironmentDebug;
    console.log('环境调试工具已加载，可在控制台使用 EnvironmentDebug 进行调试');
    console.log('可用方法:');
    console.log('- EnvironmentDebug.checkCurrentEnvironment() - 检查当前环境');
    console.log('- EnvironmentDebug.testNetworkConnection() - 测试网络连接');
    console.log('- EnvironmentDebug.switchEnvironment("development") - 切换环境');
    console.log('- EnvironmentDebug.showAllEnvironments() - 显示所有环境');
    console.log('- EnvironmentDebug.setEnvironmentFromURL() - 根据URL设置环境');
} 