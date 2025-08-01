import { sys } from "cc";
import { RankData } from "../const/enumConst";
import { EventName } from "../const/eventName";
import { Router } from "../net/routers";
import { GlobalFuncHelper } from "../utils/globalFuncHelper";
import { StorageHelper, StorageHelperKey } from "../utils/storageHelper";
import { App } from "./app";
import { SingletonClass } from "./singletonClass";
import { ServerConfig } from "../config/serverConfig";
import { DataSyncManager } from "./dataSyncManager";

/**
 * 用户管理
 */
export class UserInfo extends SingletonClass<UserInfo> implements UserInfo {
    /** 排行数据 */
    public rankData: RankData = {
        star: 0,
        id: 0,
        level: 0,
        icon: GlobalFuncHelper.getIcon(),
        name: "",
        gold: 0,
        rank: 0,
        time: "",
    }

    public pid: number = 0;

    // 账号系统API地址 - 使用统一配置
    private readonly ACCOUNT_API = ServerConfig.getMainServerAPI();
    
    // 用户登录状态
    public isLoggedIn: boolean = false;
    public currentUser: any = null;

    public updateRankData(data: RankData) {
        this.rankData = data;
    }

    init(...args: any[]): void {
        this.rankData.name = "Happy Barry";
        App.event.on(Router.rut_login, this.evtLogin, this)
        
        // 检查是否有保存的登录信息
        this.checkSavedLogin();
    }

    evtLogin(data) {
        this.pid = data.msg.user.pid;
        console.log('-------------------- pid -------------------');
        console.log('-------------------- pid -------------------');
        console.log('-------------------- pid -------------------');
        console.log(this.pid);
    }

    // 账号系统：用户注册
    async registerUser(pid: string, name: string, password: string): Promise<boolean> {
        try {
            console.log('[Register] 开始注册请求:', { pid, name, password: '***' });
            console.log('[Register] 请求URL:', `${this.ACCOUNT_API}/users`);
            
            // 尝试使用fetch，如果失败则使用XMLHttpRequest
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 10000);
                
            const response = await fetch(`${this.ACCOUNT_API}/users`, {
                method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({ pid, name, password }),
                    signal: controller.signal
            });
                
                clearTimeout(timeoutId);
                
                console.log('[Register] 响应状态:', response.status);
                
                if (!response.ok) {
                    console.error('[Register] HTTP错误:', response.status, response.statusText);
                    return false;
                }
            
            const result = await response.json();
                console.log('[Register] 响应数据:', result);
                
            if (result.success) {
                console.log('用户注册成功:', result.data);
                return true;
            } else {
                console.error('用户注册失败:', result.message);
                return false;
                }
            } catch (fetchError) {
                console.log('[Register] Fetch失败，尝试XMLHttpRequest:', fetchError);
                return this.registerUserWithXHR(pid, name, password);
            }
        } catch (error) {
            console.error('[Register] 注册请求异常:', error);
            return false;
        }
    }

    // 使用XMLHttpRequest进行注册（移动端兼容）
    private registerUserWithXHR(pid: string, name: string, password: string): Promise<boolean> {
        return new Promise((resolve) => {
            const xhr = new XMLHttpRequest();
            xhr.timeout = 10000; // 10秒超时
            const apiUrl = this.ACCOUNT_API; // 保存this引用
            
            xhr.onreadystatechange = function() {
                if (xhr.readyState === 4) {
                    console.log('[Register XHR] 状态:', xhr.status);
                    console.log('[Register XHR] 响应:', xhr.responseText);
                    
                    if (xhr.status === 200) {
                        try {
                            const result = JSON.parse(xhr.responseText);
                            if (result.success) {
                                console.log('用户注册成功(XHR):', result.data);
                                resolve(true);
                            } else {
                                console.error('用户注册失败(XHR):', result.message);
                                resolve(false);
                            }
                        } catch (e) {
                            console.error('[Register XHR] JSON解析失败:', e);
                            resolve(false);
                        }
                    } else {
                        console.error('[Register XHR] HTTP错误:', xhr.status);
                        resolve(false);
                    }
                }
            };
            
            xhr.ontimeout = function() {
                console.error('[Register XHR] 请求超时');
                resolve(false);
            };
            
            xhr.onerror = function() {
                console.error('[Register XHR] 网络错误');
                resolve(false);
            };
            
            xhr.open('POST', `${apiUrl}/users`, true);
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.setRequestHeader('Accept', 'application/json');
            xhr.send(JSON.stringify({ pid, name, password }));
        });
    }

    // 账号系统：用户登录
    async loginUser(pid: string, password: string): Promise<boolean> {
        try {
            console.log('[Login] 开始登录请求:', { pid, password: '***' });
            console.log('[Login] 请求URL:', `${this.ACCOUNT_API}/login`);
            
            // 尝试使用fetch，如果失败则使用XMLHttpRequest
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 10000);
                
            const response = await fetch(`${this.ACCOUNT_API}/login`, {
                method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({ pid, password }),
                    signal: controller.signal
            });
                
                clearTimeout(timeoutId);
                
                console.log('[Login] 响应状态:', response.status);
                
                if (!response.ok) {
                    console.error('[Login] HTTP错误:', response.status, response.statusText);
                    return false;
                }
            
            const result = await response.json();
                console.log('[Login] 响应数据:', result);
                
            if (result.success) {
                console.log('用户登录成功:', result.data);
                this.isLoggedIn = true;
                this.currentUser = result.data;
                
                // 保存登录信息
                this.saveLoginInfo(pid, password);
                
                // 同步用户数据到本地存储和UI
                await this.syncUserData(result.data);
                
                return true;
            } else {
                console.error('用户登录失败:', result.message);
                return false;
                }
            } catch (fetchError) {
                console.log('[Login] Fetch失败，尝试XMLHttpRequest:', fetchError);
                return this.loginUserWithXHR(pid, password);
            }
        } catch (error) {
            console.error('[Login] 登录请求异常:', error);
            return false;
        }
    }

    // 使用XMLHttpRequest进行登录（移动端兼容）
    private loginUserWithXHR(pid: string, password: string): Promise<boolean> {
        return new Promise((resolve) => {
            const xhr = new XMLHttpRequest();
            xhr.timeout = 10000; // 10秒超时
            const apiUrl = this.ACCOUNT_API; // 保存this引用
            const self = this; // 保存this引用
            
            xhr.onreadystatechange = function() {
                if (xhr.readyState === 4) {
                    console.log('[Login XHR] 状态:', xhr.status);
                    console.log('[Login XHR] 响应:', xhr.responseText);
                    
                    if (xhr.status === 200) {
                        try {
                            const result = JSON.parse(xhr.responseText);
                                                    if (result.success) {
                            console.log('用户登录成功(XHR):', result.data);
                            self.isLoggedIn = true;
                            self.currentUser = result.data;
                            
                            // 保存登录信息
                            self.saveLoginInfo(pid, password);
                            
                            // 同步用户数据到本地存储和UI
                            self.syncUserData(result.data).then(() => {
                                resolve(true);
                            }).catch(error => {
                                console.error('[Login XHR] 同步用户数据失败:', error);
                                resolve(true); // 即使同步失败，登录仍然成功
                            });
                            } else {
                                console.error('用户登录失败(XHR):', result.message);
                                resolve(false);
                            }
                        } catch (e) {
                            console.error('[Login XHR] JSON解析失败:', e);
                            resolve(false);
                        }
                    } else {
                        console.error('[Login XHR] HTTP错误:', xhr.status);
                        resolve(false);
                    }
                }
            };
            
            xhr.ontimeout = function() {
                console.error('[Login XHR] 请求超时');
                resolve(false);
            };
            
            xhr.onerror = function() {
                console.error('[Login XHR] 网络错误');
                resolve(false);
            };
            
            xhr.open('POST', `${apiUrl}/login`, true);
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.setRequestHeader('Accept', 'application/json');
            xhr.send(JSON.stringify({ pid, password }));
        });
    }

    // 同步用户数据到本地
    private async syncUserData(userData: any) {
        console.log('[UserInfo] syncUserData 开始，用户数据:', userData);
        
        // 更新用户信息
        this.rankData.name = userData.name;
        this.rankData.gold = userData.gold;
        this.rankData.level = userData.level;
        this.rankData.icon = userData.icon;
        
        console.log('[UserInfo] 更新rankData完成:', this.rankData);
        
        // 同步到本地存储
        StorageHelper.setData(StorageHelperKey.Gold, userData.gold);
        StorageHelper.setData(StorageHelperKey.Level, userData.level);
        
        console.log('[UserInfo] 本地存储更新完成，当前金币:', GlobalFuncHelper.getGold());
        
        // 触发UI更新
        App.event.emit(EventName.Game.UpdataGold);
        
        console.log('[UserInfo] 开始初始化数据同步管理器...');
        // 初始化数据同步管理器
        await this.initDataSyncManager();
        
        console.log('[UserInfo] 开始从服务器获取用户游戏数据...');
        // 从服务器获取用户游戏数据
        await this.fetchUserGameData();
        
        console.log('[UserInfo] syncUserData 完成，最终金币:', GlobalFuncHelper.getGold());
    }
    
    /**
     * 初始化数据同步管理器
     */
    private async initDataSyncManager() {
        try {
            // 延迟初始化，避免循环依赖
            setTimeout(() => {
                try {
                    // 初始化数据同步管理器
                    const dataSyncManager = DataSyncManager.getInstance();
                    // 设置全局变量，供其他模块使用
                    (window as any)['dataSyncManager'] = dataSyncManager;
                    console.log('[UserInfo] 数据同步管理器初始化成功');
                } catch (error) {
                    console.error('[UserInfo] 初始化数据同步管理器失败:', error);
                }
            }, 1000);
        } catch (error) {
            console.error('[UserInfo] 初始化数据同步管理器失败:', error);
        }
    }
    
    /**
     * 从服务器获取用户游戏数据
     */
    private async fetchUserGameData() {
        try {
            // 直接从服务器获取用户游戏数据
            const userId = this.currentUser?.id;
            if (!userId) {
                console.warn('[UserInfo] 用户ID不存在，跳过获取游戏数据');
                return;
            }
            
            console.log('[UserInfo] 开始从服务器获取用户游戏数据，用户ID:', userId);
            
            const response = await fetch(`${ServerConfig.getMainServerURL()}/api/user/get-game-data?userId=${userId}`);
            const result = await response.json();
            
            if (result.success && result.data) {
                console.log('[UserInfo] 从服务器获取游戏数据成功:', result.data);
                
                // 更新本地存储
                result.data.forEach((item: any) => {
                    if (item.key === 'Gold') {
                        const goldValue = parseInt(item.value);
                        StorageHelper.setData(StorageHelperKey.Gold, goldValue);
                        this.rankData.gold = goldValue;
                        console.log('[UserInfo] 更新金币数据:', goldValue);
                    } else if (item.key === 'Level') {
                        const levelValue = parseInt(item.value);
                        StorageHelper.setData(StorageHelperKey.Level, levelValue);
                        this.rankData.level = levelValue;
                        console.log('[UserInfo] 更新等级数据:', levelValue);
                    }
                    // 可以添加其他数据的处理
                });
                
                // 触发UI更新
                App.event.emit(EventName.Game.UpdataGold);
                console.log('[UserInfo] 本地存储和UI已更新');
            } else {
                console.log('[UserInfo] 从服务器获取游戏数据失败，尝试初始化默认数据');
                await this.initializeUserGameData();
            }
        } catch (error) {
            console.error('[UserInfo] 获取用户游戏数据失败:', error);
            // 如果获取失败，尝试初始化默认数据
            await this.initializeUserGameData();
        }
    }
    
    /**
     * 初始化用户游戏数据
     */
    private async initializeUserGameData() {
        try {
            const userId = this.currentUser?.id;
            if (!userId) {
                console.warn('[UserInfo] 用户ID不存在，跳过初始化游戏数据');
                return;
            }
            
            console.log('[UserInfo] 开始初始化用户游戏数据，用户ID:', userId);
            
            const response = await fetch(`${ServerConfig.getMainServerURL()}/api/user/init-game-data`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: userId })
            });
            
            const result = await response.json();
            
            if (result.success) {
                console.log('[UserInfo] 用户游戏数据初始化成功');
                // 初始化成功后，重新获取数据
                await this.fetchUserGameData();
            } else {
                console.error('[UserInfo] 用户游戏数据初始化失败:', result.message);
            }
        } catch (error) {
            console.error('[UserInfo] 初始化用户游戏数据失败:', error);
        }
    }

    // 保存登录信息到本地
    private saveLoginInfo(pid: string, password: string) {
        const loginInfo = { pid, password, timestamp: Date.now() };
        sys.localStorage.setItem('loginInfo', JSON.stringify(loginInfo));
    }

    // 检查保存的登录信息
    private async checkSavedLogin() {
        const loginInfoStr = sys.localStorage.getItem('loginInfo');
        if (loginInfoStr) {
            try {
                const loginInfo = JSON.parse(loginInfoStr);
                // 检查登录信息是否过期（7天）
                if (Date.now() - loginInfo.timestamp < 7 * 24 * 60 * 60 * 1000) {
                    const success = await this.loginUser(loginInfo.pid, loginInfo.password);
                    if (success) {
                        console.log('自动登录成功');
                    }
                }
            } catch (error) {
                console.error('检查保存的登录信息失败:', error);
            }
        }
    }

    // 更新用户数据到服务器
    async updateUserData(updates: any): Promise<boolean> {
        if (!this.isLoggedIn || !this.currentUser) {
            console.error('用户未登录');
            return false;
        }

        try {
            const response = await fetch(`${this.ACCOUNT_API}/users/${this.currentUser.pid}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            });
            
            const result = await response.json();
            if (result.success) {
                console.log('用户数据更新成功');
                return true;
            } else {
                console.error('用户数据更新失败:', result.message);
                return false;
            }
        } catch (error) {
            console.error('更新用户数据请求失败:', error);
            return false;
        }
    }

    // 登出
    logout() {
        this.isLoggedIn = false;
        this.currentUser = null;
        sys.localStorage.removeItem('loginInfo');
        console.log('用户已登出');
    }

    // 获取用户信息
    async getUserInfo(pid: string): Promise<any> {
        try {
            const response = await fetch(`${this.ACCOUNT_API}/users/${pid}`);
            const result = await response.json();
            if (result.success) {
                return result.data;
            } else {
                console.error('获取用户信息失败:', result.message);
                return null;
            }
        } catch (error) {
            console.error('获取用户信息请求失败:', error);
            return null;
        }
    }

    // 简单网络连接测试
    async testSimpleConnection(): Promise<boolean> {
        return new Promise((resolve) => {
            console.log('[Simple Network] 开始简单连接测试');
            
            // 直接测试API连接
            const testUrl = `${this.ACCOUNT_API.replace('/admin/api', '')}/test`;
            
            // 先尝试fetch
            fetch(testUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            })
            .then(response => {
                console.log('[Simple Network] Fetch API连接成功');
                resolve(true);
            })
            .catch(fetchError => {
                console.log('[Simple Network] Fetch失败，尝试XMLHttpRequest:', fetchError);
                
                // 如果fetch失败，尝试XMLHttpRequest
                const xhr = new XMLHttpRequest();
                xhr.timeout = 5000;
                
                xhr.onreadystatechange = function() {
                    if (xhr.readyState === 4) {
                        if (xhr.status === 200) {
                            console.log('[Simple Network] XHR API连接成功');
                            resolve(true);
                        } else {
                            console.error('[Simple Network] XHR API连接失败:', xhr.status);
                            resolve(false);
                        }
                    }
                };
                
                xhr.ontimeout = function() {
                    console.error('[Simple Network] XHR请求超时');
                    resolve(false);
                };
                
                xhr.onerror = function() {
                    console.error('[Simple Network] XHR网络错误');
                    resolve(false);
                };
                
                xhr.open('GET', testUrl, true);
                xhr.setRequestHeader('Content-Type', 'application/json');
                xhr.setRequestHeader('Accept', 'application/json');
                xhr.send();
            });
        });
    }
}//电子邮件puhalskijsemen@gmail.com
//源码网站 开vpn全局模式打开 http://web3incubators.com/
//电报https://t.me/gamecode999
