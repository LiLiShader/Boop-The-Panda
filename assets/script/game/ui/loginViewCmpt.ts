import { _decorator, Component, Node, EditBox, Button, Label } from 'cc';
import { BaseViewCmpt } from '../../components/baseViewCmpt';
import { App } from '../../core/app';
import { EventName } from '../../const/eventName';
const { ccclass, property } = _decorator;

@ccclass('loginViewCmpt')
export class LoginViewCmpt extends BaseViewCmpt {
    // UI 组件引用
    @property(EditBox)
    pidInput: EditBox = null;
    @property(EditBox)
    nameInput: EditBox = null;
    @property(EditBox)
    passwordInput: EditBox = null;
    @property(Button)
    loginBtn: Button = null;
    @property(Button)
    registerBtn: Button = null;
    @property(Label)
    statusLabel: Label = null;
    @property(Node)
    InputContainer: Node = null;
    @property(Button)
    switchToRegisterBtn: Button = null;
    @property(Button)
    switchToLoginBtn: Button = null;
    
    // 当前模式：login 或 register
    private currentMode: 'login' | 'register' = 'login';

    onLoad() {
        super.onLoad();
        this.initUI();
        this.setMode('login');
    }

    private initUI() {
        // 绑定按钮事件
        this.bindEvents();
    }

    private bindEvents() {
        // 登录按钮
        if (this.loginBtn) {
            this.loginBtn.node.on(Button.EventType.CLICK, this.onLoginClick, this);
        }
        
        // 注册按钮
        if (this.registerBtn) {
            this.registerBtn.node.on(Button.EventType.CLICK, this.onRegisterClick, this);
        }
        
        // 切换模式按钮
        if (this.switchToRegisterBtn) {
            this.switchToRegisterBtn.node.on(Button.EventType.CLICK, () => this.setMode('register'), this);
        }
        
        if (this.switchToLoginBtn) {
            this.switchToLoginBtn.node.on(Button.EventType.CLICK, () => this.setMode('login'), this);
        }
    }

    private setMode(mode: 'login' | 'register') {
        this.currentMode = mode;
        
        // 更新UI显示
        if (mode === 'login') {
            console.log('登录模式');
            // 登录模式：隐藏昵称输入框
            if (this.nameInput) this.nameInput.node.active = false;
            if (this.loginBtn) this.loginBtn.node.active = true;
            if (this.registerBtn) this.registerBtn.node.active = false;
        } else {
            console.log('注册模式');
            // 注册模式：显示昵称输入框
            if (this.nameInput) this.nameInput.node.active = true;
            if (this.loginBtn) this.loginBtn.node.active = false;
            if (this.registerBtn) this.registerBtn.node.active = true;
        }
        
        this.updateStatusLabel('');
    }

    private async onLoginClick() {
        console.log('登录按钮点击');
        const pid = this.pidInput?.string?.trim();
        const password = this.passwordInput?.string?.trim();
        
        if (!pid || !password) {
            this.updateStatusLabel('请填写完整信息');
            return;
        }
        
        this.updateStatusLabel('登录中...');
        
        try {
            const success = await App.user.loginUser(pid, password);
            if (success) {
                this.updateStatusLabel('登录成功！');
                // 延迟关闭登录界面
                setTimeout(() => {
                    this.closeLoginView();
                }, 1000);
            } else {
                this.updateStatusLabel('登录失败，请检查账号密码');
            }
        } catch (error) {
            this.updateStatusLabel('登录失败，请重试');
            console.error('登录失败:', error);
        }
    }

    private async onRegisterClick() {
        console.log('注册按钮点击');
        const pid = this.pidInput?.string?.trim();
        const name = this.nameInput?.string?.trim();
        const password = this.passwordInput?.string?.trim();
        
        if (!pid || !name || !password) {
            this.updateStatusLabel('请填写完整信息');
            return;
        }
        
        if (password.length < 6) {
            this.updateStatusLabel('密码至少6位');
            return;
        }
        
        this.updateStatusLabel('注册中...');
        
        try {
            const success = await App.user.registerUser(pid, name, password);
            if (success) {
                this.updateStatusLabel('注册成功！正在登录...');
                // 注册成功后自动登录
                const loginSuccess = await App.user.loginUser(pid, password);
                if (loginSuccess) {
                    this.updateStatusLabel('注册并登录成功！');
                    setTimeout(() => {
                        this.closeLoginView();
                    }, 1000);
                } else {
                    this.updateStatusLabel('注册成功，但登录失败');
                }
            } else {
                this.updateStatusLabel('注册失败，玩家ID可能已存在');
            }
        } catch (error) {
            this.updateStatusLabel('注册失败，请重试');
            console.error('注册失败:', error);
        }
    }

    private updateStatusLabel(message: string) {
        if (this.statusLabel) {
            this.statusLabel.string = message;
        }
    }

    private closeLoginView() {
        console.log('关闭登录界面');
        // 关闭登录界面，显示主界面
        this.node.active = false;
        
        // 触发登录成功事件
        App.event.emit(EventName.Game.LoginSuccess);
        
        // 更新主界面显示
        App.event.emit(EventName.Game.UpdataGold);
    }

    // 显示登录界面
    showLoginView() {
        console.log('显示登录界面');
        this.node.active = true;
        this.setMode('login');
        this.clearInputs();
    }

    private clearInputs() {
        console.log('清除输入');
        if (this.pidInput) this.pidInput.string = '';
        if (this.nameInput) this.nameInput.string = '';
        if (this.passwordInput) this.passwordInput.string = '';
        this.updateStatusLabel('');
    }
} 