import { sys } from "cc";
import { App } from "./app";
import { Net } from "../net/net";
import { Router } from "../net/routers";
import { StorageHelper, StorageHelperKey } from "../utils/storageHelper";
import { PrintError, PrintLog } from "../utils/logHelper";
import { ServerConfig } from "../config/serverConfig";

/**
 * 数据同步状态枚举
 */
export enum SyncStatus {
    IDLE = 'idle',
    SYNCING = 'syncing',
    SUCCESS = 'success',
    FAILED = 'failed',
    OFFLINE = 'offline'
}

/**
 * 数据同步项接口
 */
export interface SyncItem {
    key: string;
    value: any;
    type: 'string' | 'number' | 'boolean' | 'json';
    timestamp: number;
}

/**
 * 数据同步管理器
 * 负责管理本地数据与服务器数据的同步
 */
export class DataSyncManager {
    private static instance: DataSyncManager;
    private syncQueue: SyncItem[] = [];
    private syncStatus: SyncStatus = SyncStatus.IDLE;
    private isOnline: boolean = true;
    private retryCount: number = 0;
    private readonly MAX_RETRY_COUNT = 3;
    private readonly SYNC_INTERVAL = 5000; // 5秒
    private syncTimer: any = null;
    private lastSyncTime: number = 0;

    public static getInstance(): DataSyncManager {
        if (!DataSyncManager.instance) {
            DataSyncManager.instance = new DataSyncManager();
        }
        return DataSyncManager.instance;
    }

    constructor() {
        this.init();
    }

    /**
     * 初始化同步管理器
     */
    private init() {
        // 监听网络状态变化
        this.checkNetworkStatus();
        
        // 启动定时同步
        this.startPeriodicSync();
        
        // 监听应用前后台切换
        this.setupAppLifecycleListeners();
    }

    /**
     * 检查网络状态
     */
    private checkNetworkStatus() {
        // 简单的网络检查
        this.isOnline = navigator.onLine;
        
        // 监听网络状态变化
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.onNetworkRestored();
        });
        
        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.onNetworkLost();
        });
    }

    /**
     * 网络恢复时的处理
     */
    private onNetworkRestored() {
        PrintLog('[DataSync] 网络恢复，开始同步离线数据');
        this.syncOfflineData();
    }

    /**
     * 网络断开时的处理
     */
    private onNetworkLost() {
        PrintLog('[DataSync] 网络断开，切换到离线模式');
        this.syncStatus = SyncStatus.OFFLINE;
    }

    /**
     * 设置应用生命周期监听
     */
    private setupAppLifecycleListeners() {
        // 应用进入前台时同步数据
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                this.syncData();
            }
        });
    }

    /**
     * 启动定时同步
     */
    private startPeriodicSync() {
        if (this.syncTimer) {
            clearInterval(this.syncTimer);
        }
        
        this.syncTimer = setInterval(() => {
            if (this.isOnline && this.syncQueue.length > 0) {
                this.syncData();
            }
        }, this.SYNC_INTERVAL);
    }

    /**
     * 添加数据到同步队列
     */
    public addToSyncQueue(key: string, value: any, type: 'string' | 'number' | 'boolean' | 'json' = 'string') {
        const syncItem: SyncItem = {
            key,
            value,
            type,
            timestamp: Date.now()
        };

        // 检查队列中是否已有相同key的数据，如果有则更新
        const existingIndex = this.syncQueue.findIndex(item => item.key === key);
        if (existingIndex >= 0) {
            this.syncQueue[existingIndex] = syncItem;
        } else {
            this.syncQueue.push(syncItem);
        }

        PrintLog(`[DataSync] 添加数据到同步队列: ${key} = ${value}`);
        
        // 如果在线，立即同步
        if (this.isOnline) {
            this.syncData();
        }
    }

    /**
     * 同步数据到服务器
     */
    public async syncData(): Promise<boolean> {
        if (this.syncStatus === SyncStatus.SYNCING) {
            PrintLog('[DataSync] 同步正在进行中，跳过');
            return false;
        }

        if (!this.isOnline) {
            PrintLog('[DataSync] 网络离线，无法同步');
            return false;
        }

        if (this.syncQueue.length === 0) {
            return true;
        }

        this.syncStatus = SyncStatus.SYNCING;
        PrintLog(`[DataSync] 开始同步 ${this.syncQueue.length} 条数据`);

        try {
            const currentUser = App.user.currentUser;
            if (!currentUser || !currentUser.id) {
                PrintError('[DataSync] 用户未登录，无法同步数据');
                this.syncStatus = SyncStatus.FAILED;
                return false;
            }

            const dataToSync = [...this.syncQueue];
            this.syncQueue = []; // 清空队列

            const response = await fetch(`${ServerConfig.getMainServerURL()}/api/user/sync-data`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: currentUser.id,
                    data: dataToSync
                })
            });

            const result = await response.json();

            if (result.success) {
                this.syncStatus = SyncStatus.SUCCESS;
                this.retryCount = 0;
                this.lastSyncTime = Date.now();
                PrintLog(`[DataSync] 数据同步成功: ${dataToSync.length} 条`);
                return true;
            } else {
                throw new Error(result.message || '同步失败');
            }

        } catch (error) {
            PrintError(`[DataSync] 数据同步失败: ${error.message}`);
            this.syncStatus = SyncStatus.FAILED;
            
            // 将数据重新加入队列
            this.syncQueue.unshift(...this.syncQueue);
            
            // 重试机制
            if (this.retryCount < this.MAX_RETRY_COUNT) {
                this.retryCount++;
                PrintLog(`[DataSync] 准备重试 (${this.retryCount}/${this.MAX_RETRY_COUNT})`);
                setTimeout(() => {
                    this.syncData();
                }, 2000 * this.retryCount); // 递增延迟
            } else {
                PrintError('[DataSync] 达到最大重试次数，停止重试');
            }
            
            return false;
        }
    }

    /**
     * 同步离线数据
     */
    private async syncOfflineData() {
        if (this.syncQueue.length > 0) {
            await this.syncData();
        }
    }

    /**
     * 从服务器获取用户数据
     */
    public async fetchUserData(): Promise<boolean> {
        try {
            const currentUser = App.user.currentUser;
            if (!currentUser || !currentUser.id) {
                PrintError('[DataSync] 用户未登录，无法获取数据');
                return false;
            }

            const response = await fetch(`${ServerConfig.getMainServerURL()}/api/user/get-game-data?userId=${currentUser.id}`);
            const result = await response.json();

            if (result.success && result.data) {
                // 将服务器数据应用到本地存储
                for (const item of result.data) {
                    StorageHelper.setData(item.key, item.value);
                }
                
                PrintLog(`[DataSync] 从服务器获取数据成功: ${result.data.length} 条`);
                return true;
            } else {
                throw new Error(result.message || '获取数据失败');
            }

        } catch (error) {
            PrintError(`[DataSync] 获取用户数据失败: ${error.message}`);
            return false;
        }
    }

    /**
     * 初始化用户游戏数据
     */
    public async initializeUserData(): Promise<boolean> {
        try {
            const currentUser = App.user.currentUser;
            if (!currentUser || !currentUser.id) {
                PrintError('[DataSync] 用户未登录，无法初始化数据');
                return false;
            }

            const response = await fetch(`${ServerConfig.getMainServerURL()}/api/user/init-game-data`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: currentUser.id
                })
            });

            const result = await response.json();

            if (result.success) {
                PrintLog('[DataSync] 用户游戏数据初始化成功');
                return true;
            } else {
                throw new Error(result.message || '初始化失败');
            }

        } catch (error) {
            PrintError(`[DataSync] 初始化用户数据失败: ${error.message}`);
            return false;
        }
    }

    /**
     * 获取同步状态
     */
    public getSyncStatus(): SyncStatus {
        return this.syncStatus;
    }

    /**
     * 获取队列长度
     */
    public getQueueLength(): number {
        return this.syncQueue.length;
    }

    /**
     * 获取最后同步时间
     */
    public getLastSyncTime(): number {
        return this.lastSyncTime;
    }

    /**
     * 检查是否在线
     */
    public isNetworkOnline(): boolean {
        return this.isOnline;
    }

    /**
     * 强制同步所有本地数据
     */
    public async forceSyncAllData(): Promise<boolean> {
        PrintLog('[DataSync] 开始强制同步所有本地数据');
        
        // 获取所有本地存储的数据
        const allKeys = Object.values(StorageHelperKey);
        const localData: SyncItem[] = [];
        
        for (const key of allKeys) {
            const value = StorageHelper.getData(key);
            if (value !== null && value !== undefined) {
                let type: 'string' | 'number' | 'boolean' | 'json' = 'string';
                
                // 根据值类型判断数据类型
                if (typeof value === 'number') {
                    type = 'number';
                } else if (typeof value === 'boolean') {
                    type = 'boolean';
                } else if (typeof value === 'object') {
                    type = 'json';
                }
                
                localData.push({
                    key,
                    value,
                    type,
                    timestamp: Date.now()
                });
            }
        }
        
        if (localData.length === 0) {
            PrintLog('[DataSync] 没有需要同步的数据');
            return true;
        }
        
        // 添加到同步队列
        this.syncQueue = localData;
        
        // 执行同步
        return await this.syncData();
    }

    /**
     * 清理同步管理器
     */
    public destroy() {
        if (this.syncTimer) {
            clearInterval(this.syncTimer);
            this.syncTimer = null;
        }
        
        this.syncQueue = [];
        this.syncStatus = SyncStatus.IDLE;
    }
}

// 导出单例实例
export const dataSyncManager = DataSyncManager.getInstance(); 