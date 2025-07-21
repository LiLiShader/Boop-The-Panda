import { _decorator, Component, Node } from 'cc';
import { App } from '../../core/app';
import { EventName } from '../../const/eventName';
import { LoginViewConfig } from './loginViewConfig';
const { ccclass, property } = _decorator;

/**
 * 登录界面测试组件
 * 用于测试登录和注册功能
 */
@ccclass('loginViewTest')
export class LoginViewTest extends Component {
    
    onLoad() {
        // 监听登录成功事件
        App.event.on(EventName.Game.LoginSuccess, this.onLoginSuccess, this);
        App.event.on(EventName.Game.LoginFailed, this.onLoginFailed, this);
        App.event.on(EventName.Game.RegisterSuccess, this.onRegisterSuccess, this);
        App.event.on(EventName.Game.RegisterFailed, this.onRegisterFailed, this);
    }

    onDestroy() {
        App.event.off(EventName.Game.LoginSuccess, this);
        App.event.off(EventName.Game.LoginFailed, this);
        App.event.off(EventName.Game.RegisterSuccess, this);
        App.event.off(EventName.Game.RegisterFailed, this);
    }

    // 测试登录功能
    async testLogin() {
        console.log('=== 测试登录功能 ===');
        
        const testPid = 'testplayer' + Date.now();
        const testPassword = '123456';
        
        try {
            const success = await App.user.loginUser(testPid, testPassword);
            if (success) {
                console.log('✅ 登录测试成功');
            } else {
                console.log('❌ 登录测试失败 - 用户不存在');
            }
        } catch (error) {
            console.error('❌ 登录测试异常:', error);
        }
    }

    // 测试注册功能
    async testRegister() {
        console.log('=== 测试注册功能 ===');
        
        const testPid = 'testplayer' + Date.now();
        const testName = 'Test Player';
        const testPassword = '123456';
        
        try {
            const success = await App.user.registerUser(testPid, testName, testPassword);
            if (success) {
                console.log('✅ 注册测试成功');
                // 注册成功后测试登录
                await this.testLoginAfterRegister(testPid, testPassword);
            } else {
                console.log('❌ 注册测试失败');
            }
        } catch (error) {
            console.error('❌ 注册测试异常:', error);
        }
    }

    // 测试注册后登录
    async testLoginAfterRegister(pid: string, password: string) {
        console.log('=== 测试注册后登录 ===');
        
        try {
            const success = await App.user.loginUser(pid, password);
            if (success) {
                console.log('✅ 注册后登录测试成功');
            } else {
                console.log('❌ 注册后登录测试失败');
            }
        } catch (error) {
            console.error('❌ 注册后登录测试异常:', error);
        }
    }

    // 测试数据同步
    async testDataSync() {
        console.log('=== 测试数据同步 ===');
        
        if (!App.user.isLoggedIn) {
            console.log('❌ 用户未登录，无法测试数据同步');
            return;
        }

        try {
            const success = await App.user.updateUserData({
                level: 10,
                gold: 1000
            });
            
            if (success) {
                console.log('✅ 数据同步测试成功');
                console.log('当前用户数据:', App.user.currentUser);
            } else {
                console.log('❌ 数据同步测试失败');
            }
        } catch (error) {
            console.error('❌ 数据同步测试异常:', error);
        }
    }

    // 测试登出功能
    testLogout() {
        console.log('=== 测试登出功能 ===');
        
        App.user.logout();
        console.log('✅ 登出测试成功');
        console.log('登录状态:', App.user.isLoggedIn);
    }

    // 事件回调
    private onLoginSuccess() {
        console.log('🎉 登录成功事件触发');
    }

    private onLoginFailed() {
        console.log('💥 登录失败事件触发');
    }

    private onRegisterSuccess() {
        console.log('🎉 注册成功事件触发');
    }

    private onRegisterFailed() {
        console.log('💥 注册失败事件触发');
    }

    // 运行所有测试
    async runAllTests() {
        console.log('🚀 开始运行登录界面测试...\n');
        
        // 测试注册
        await this.testRegister();
        console.log('');
        
        // 测试登录
        await this.testLogin();
        console.log('');
        
        // 测试数据同步
        await this.testDataSync();
        console.log('');
        
        // 测试登出
        this.testLogout();
        console.log('');
        
        console.log('✅ 所有测试完成！');
    }

    // 手动触发测试
    onClick_testRegister() {
        this.testRegister();
    }

    onClick_testLogin() {
        this.testLogin();
    }

    onClick_testDataSync() {
        this.testDataSync();
    }

    onClick_testLogout() {
        this.testLogout();
    }

    onClick_runAllTests() {
        this.runAllTests();
    }
} 