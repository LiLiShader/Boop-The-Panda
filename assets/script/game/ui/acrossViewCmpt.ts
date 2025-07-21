import { _decorator, Component, find, Node } from 'cc';
const { ccclass, property } = _decorator;
import { BaseViewCmpt } from '../../components/baseViewCmpt';
import { ViewName } from '../../const/viewNameConst';
import { App } from '../../core/app';
import { EventName } from '../../const/eventName';

@ccclass('acrossViewCmpt')
export class acrossViewCmpt extends BaseViewCmpt {
    onLoad() {
        super.onLoad();
        // 登录检查
        this.checkLoginStatus();
        // 监听登录成功事件
        App.event.on(EventName.Game.LoginSuccess, this.onLoginSuccess, this);
    }

    onDestroy() {
        App.event.off(EventName.Game.LoginSuccess, this);
    }

    private checkLoginStatus() {
        if (!App.user.isLoggedIn) {
            this.showLoginView();
        }
    }

    private showLoginView() {
        App.view.openView(ViewName.Single.eLoginView);
    }

    private onLoginSuccess() {
        // 登录成功后的逻辑，比如刷新界面
        // this.initData(); // 如有需要
        console.log('登录成功，acrossViewCmpt 可刷新数据');
    }

    loadExtraData() {
        App.view.closeView(ViewName.Single.eLoadingView);
    }
    onClick_startBtn() {
        App.view.openView(ViewName.Single.eHomeView);
        find('startBtn', this.node).active = false;
        find('Loading', this.node).active = true;
    }
}


