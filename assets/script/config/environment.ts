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
    private static currentEnv: Environment = Environment.PRODUCTION;
    
    // 各环境的服务器配置
    private static readonly SERVER_CONFIGS = {
        [Environment.DEVELOPMENT]: {
            host: '119.91.142.92',
            mainServerPort: 3001,
            payProxyPort: 5000,
            callbackServerPort: 5001,
            protocol: 'http'
        },
        [Environment.TESTING]: {
            host: '119.91.142.92',
            mainServerPort: 3001,
            payProxyPort: 5000,
            callbackServerPort: 5001,
            protocol: 'http'
        },
        [Environment.PRODUCTION]: {
            host: 'thunderousfreeze.com',
            mainServerPort: 3001,
            payProxyPort: 5000,
            callbackServerPort: 5001,
            protocol: 'https' 
        }
    };
    
    /**
     * 设置当前环境
     */
    static setEnvironment(env: Environment): void {
        this.currentEnv = env;
        console.log(`[EnvironmentConfig] 当前环境设置为: ${env}`);
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
        return `${config.protocol}://${config.host}:${config.mainServerPort}/api`;
    }
    
    /**
     * 获取主服务器地址
     */
    static getMainServerURL(): string {
        const config = this.getCurrentConfig();
        return `${config.protocol}://${config.host}:${config.mainServerPort}`;
    }
    
    /**
     * 获取支付代理服务器地址
     */
    static getPayProxyURL(): string {
        const config = this.getCurrentConfig();
        return `${config.protocol}://${config.host}:${config.payProxyPort}`;
    }
    
    /**
     * 获取支付代理API地址
     */
    static getPayProxyAPI(): string {
        const config = this.getCurrentConfig();
        return `${config.protocol}://${config.host}:${config.payProxyPort}/api`;
    }
    
    /**
     * 获取3D支付回调服务器地址
     */
    static getCallbackServerURL(): string {
        const config = this.getCurrentConfig();
        return `${config.protocol}://${config.host}:${config.callbackServerPort}`;
    }
    
    /**
     * 获取3D支付回调API地址
     */
    static getCallbackServerAPI(): string {
        const config = this.getCurrentConfig();
        return `${config.protocol}://${config.host}:${config.callbackServerPort}/api`;
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
            ports: {
                main: config.mainServerPort,
                payProxy: config.payProxyPort,
                callback: config.callbackServerPort
            },
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
            }
        }
    }
} 