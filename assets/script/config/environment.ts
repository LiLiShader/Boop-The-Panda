/**
 * 环境配置管理
 * 用于管理不同环境（开发、测试、生产）的服务器地址
 */

export enum Environment {
    DEVELOPMENT = 'development',
    TESTING = 'testing',
    PRODUCTION = 'production'
}

export class EnvironmentConfig {
    // 当前环境，可以通过环境变量或构建配置设置
    // 默认设置为测试环境，避免误用生产环境
    private static currentEnv: Environment = Environment.TESTING;
    
    // 各环境的服务器配置
    private static readonly SERVER_CONFIGS = {
        [Environment.DEVELOPMENT]: {
            host: '119.91.142.92',
            serverPort: 3000,  // 合并后的统一端口
            protocol: 'http'
        },
        [Environment.TESTING]: {
            host: '119.91.142.92',
            serverPort: 3000,  // 合并后的统一端口
            protocol: 'http'
        },
        [Environment.PRODUCTION]: {
            host: 'thunderousfreeze.com',
            serverPort: 3000,  // 合并后的统一端口
            protocol: 'https' 
        }
    };
    
    /**
     * 设置当前环境
     */
    static setEnvironment(env: Environment): void {
        this.currentEnv = env;
        const config = this.getCurrentConfig();
        console.log(`[EnvironmentConfig] 当前环境设置为: ${env}`);
        console.log(`[EnvironmentConfig] 服务器配置: ${config.protocol}://${config.host}:${config.serverPort}`);
    }
    
    /**
     * 获取当前环境
     */
    static getCurrentEnvironment(): Environment {
        return this.currentEnv;
    }
    
    /**
     * 获取当前环境的服务器配置
     */
    private static getCurrentConfig() {
        return this.SERVER_CONFIGS[this.currentEnv];
    }
    
    /**
     * 获取主服务器API地址
     */
    static getMainServerAPI(): string {
        const config = this.getCurrentConfig();
        return `${config.protocol}://${config.host}:${config.serverPort}/admin/api`;
    }
    
    /**
     * 获取主服务器地址
     */
    static getMainServerURL(): string {
        const config = this.getCurrentConfig();
        return `${config.protocol}://${config.host}:${config.serverPort}`;
    }
    
    /**
     * 获取支付代理服务器地址
     */
    static getPayProxyURL(): string {
        const config = this.getCurrentConfig();
        return `${config.protocol}://${config.host}:${config.serverPort}`;
    }
    
    /**
     * 获取支付代理API地址
     */
    static getPayProxyAPI(): string {
        const config = this.getCurrentConfig();
        return `${config.protocol}://${config.host}:${config.serverPort}/api/payment`;
    }
    
    /**
     * 获取3D支付回调服务器地址
     */
    static getCallbackServerURL(): string {
        const config = this.getCurrentConfig();
        return `${config.protocol}://${config.host}:${config.serverPort}`;
    }
    
    /**
     * 获取3D支付回调API地址
     */
    static getCallbackServerAPI(): string {
        const config = this.getCurrentConfig();
        return `${config.protocol}://${config.host}:${config.serverPort}/api/payment`;
    }
    
    /**
     * 获取服务器主机地址
     */
    static getServerHost(): string {
        return this.getCurrentConfig().host;
    }
    
    /**
     * 获取所有配置信息（用于调试）
     */
    static getAllConfig() {
        const config = this.getCurrentConfig();
        return {
            environment: this.currentEnv,
            host: config.host,
            mainServer: this.getMainServerAPI(),
            payProxy: this.getPayProxyAPI(),
            callbackServer: this.getCallbackServerAPI(),
            port: config.serverPort,
            protocol: config.protocol
        };
    }
    
    /**
     * 根据URL参数自动设置环境
     * 例如：?env=development
     */
    static autoDetectEnvironment(): void {
        if (typeof window !== 'undefined') {
            const urlParams = new URLSearchParams(window.location.search);
            const envParam = urlParams.get('env');
            if (envParam) {
                const env = envParam as Environment;
                if (Object.values(Environment).includes(env)) {
                    this.setEnvironment(env);
                    console.log(`[EnvironmentConfig] 通过URL参数自动设置环境: ${env}`);
                }
            } else {
                // 如果没有URL参数，根据当前域名自动检测
                const hostname = window.location.hostname;
                if (hostname === 'localhost' || hostname === '127.0.0.1') {
                    this.setEnvironment(Environment.DEVELOPMENT);
                    console.log(`[EnvironmentConfig] 根据域名自动设置为开发环境: ${hostname}`);
                } else if (hostname === 'thunderousfreeze.com') {
                    this.setEnvironment(Environment.PRODUCTION);
                    console.log(`[EnvironmentConfig] 根据域名自动设置为生产环境: ${hostname}`);
                } else {
                    // 默认使用测试环境
                    this.setEnvironment(Environment.TESTING);
                    console.log(`[EnvironmentConfig] 根据域名自动设置为测试环境: ${hostname}`);
                }
            }
        }
    }
} 