import { ServerConfig } from '../config/serverConfig';

/**
 * 支付模式枚举
 */
export enum PaymentMode {
    TWO_D = '2D',
    THREE_D = '3D'
}

/**
 * 支付模式管理服务
 * 负责从服务器获取支付模式，每次支付都实时请求
 */
export class PaymentModeManager {
    private static instance: PaymentModeManager = null;
    
    // 是否正在获取支付模式
    private isFetching: boolean = false;
    
    // 获取支付模式的Promise缓存（防止并发请求）
    private fetchPromise: Promise<PaymentMode> = null;

    private constructor() {
        // 私有构造函数，防止直接实例化
    }

    public static getInstance(): PaymentModeManager {
        if (!PaymentModeManager.instance) {
            PaymentModeManager.instance = new PaymentModeManager();
        }
        return PaymentModeManager.instance;
    }

    /**
     * 获取当前支付模式
     * 每次调用都实时请求服务器
     * @returns Promise<PaymentMode>
     */
    public async getPaymentMode(): Promise<PaymentMode> {
        // 如果正在获取，返回现有的Promise（防止并发请求）
        if (this.isFetching && this.fetchPromise) {
            console.log('[PaymentModeManager] 等待正在进行的支付模式获取...');
            return this.fetchPromise;
        }
        
        // 开始获取支付模式
        this.isFetching = true;
        this.fetchPromise = this.fetchPaymentModeFromServer();
        
        try {
            const mode = await this.fetchPromise;
            console.log(`[PaymentModeManager] 从服务器获取支付模式成功: ${mode}`);
            return mode;
        } catch (error) {
            console.error('[PaymentModeManager] 获取支付模式失败，使用默认模式:', error);
            // 如果获取失败，使用默认的2D模式
            return PaymentMode.TWO_D;
        } finally {
            this.isFetching = false;
            this.fetchPromise = null;
        }
    }

    /**
     * 从服务器获取支付模式
     * @returns Promise<PaymentMode>
     */
    private async fetchPaymentModeFromServer(): Promise<PaymentMode> {
        try {
            const response = await fetch(`${ServerConfig.getMainServerURL()}/api/config/payment/mode`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.message || '获取支付模式失败');
            }
            
            const mode = result.data.mode;
            
            // 验证支付模式值
            if (mode !== PaymentMode.TWO_D && mode !== PaymentMode.THREE_D) {
                console.warn(`[PaymentModeManager] 无效的支付模式: ${mode}，使用默认2D模式`);
                return PaymentMode.TWO_D;
            }
            
            return mode as PaymentMode;
        } catch (error) {
            console.error('[PaymentModeManager] 从服务器获取支付模式异常:', error);
            throw error;
        }
    }

    /**
     * 强制刷新支付模式（已废弃，现在每次都实时请求）
     * @returns Promise<PaymentMode>
     */
    public async refreshPaymentMode(): Promise<PaymentMode> {
        console.log('[PaymentModeManager] refreshPaymentMode已废弃，现在每次都实时请求');
        return this.getPaymentMode();
    }

    /**
     * 获取当前请求状态
     * @returns boolean
     */
    public isRequesting(): boolean {
        return this.isFetching;
    }

    /**
     * 清除当前请求状态
     */
    public clearRequestState(): void {
        this.isFetching = false;
        this.fetchPromise = null;
        console.log('[PaymentModeManager] 请求状态已清除');
    }
}

// 导出单例实例
export const paymentModeManager = PaymentModeManager.getInstance(); 