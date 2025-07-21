import { sys } from "cc";
import { RankData } from "../const/enumConst";
import { EventName } from "../const/eventName";
import { Router } from "../net/routers";
import { GlobalFuncHelper } from "../utils/globalFuncHelper";
import { StorageHelper, StorageHelperKey } from "../utils/storageHelper";
import { App } from "./app";
import { SingletonClass } from "./singletonClass";

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
    
    // 账号系统API地址
    private readonly ACCOUNT_API = 'http://119.91.142.92:3001/api';
    
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
            const response = await fetch(`${this.ACCOUNT_API}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pid, name, password })
            });
            
            const result = await response.json();
            if (result.success) {
                console.log('用户注册成功:', result.data);
                return true;
            } else {
                console.error('用户注册失败:', result.message);
                return false;
            }
        } catch (error) {
            console.error('注册请求失败:', error);
            return false;
        }
    }

    // 账号系统：用户登录
    async loginUser(pid: string, password: string): Promise<boolean> {
        try {
            const response = await fetch(`${this.ACCOUNT_API}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pid, password })
            });
            
            const result = await response.json();
            if (result.success) {
                console.log('用户登录成功:', result.data);
                this.isLoggedIn = true;
                this.currentUser = result.data;
                
                // 同步用户数据到本地
                this.syncUserData(result.data);
                
                // 保存登录信息
                this.saveLoginInfo(pid, password);
                
                return true;
            } else {
                console.error('用户登录失败:', result.message);
                return false;
            }
        } catch (error) {
            console.error('登录请求失败:', error);
            return false;
        }
    }

    // 同步用户数据到本地
    private syncUserData(userData: any) {
        // 更新用户信息
        this.rankData.name = userData.name;
        this.rankData.gold = userData.gold;
        this.rankData.level = userData.level;
        this.rankData.icon = userData.icon;
        
        // 同步到本地存储
        StorageHelper.setData(StorageHelperKey.Gold, userData.gold);
        StorageHelper.setData(StorageHelperKey.Level, userData.level);
        
        // 触发UI更新
        App.event.emit(EventName.Game.UpdataGold);
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
}//电子邮件puhalskijsemen@gmail.com
//源码网站 开vpn全局模式打开 http://web3incubators.com/
//电报https://t.me/gamecode999
