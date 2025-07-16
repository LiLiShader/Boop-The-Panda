import { _decorator, Component, find, Node } from 'cc';
const { ccclass, property } = _decorator;
import { BaseViewCmpt } from '../../components/baseViewCmpt';
import { ViewName } from '../../const/viewNameConst';
import { App } from '../../core/app';
@ccclass('acrossViewCmpt')
export class acrossViewCmpt extends BaseViewCmpt {
    onLoad() {
        super.onLoad();
        // 判断是否第一次进入
        const isFirstEnter = !(cc as any).sys.localStorage.getItem('hasRegistered');
        const userRegNode = find('User Registration', this.node);
        if (userRegNode) {
            userRegNode.active = isFirstEnter;
        }
        if (isFirstEnter) {
            (cc as any).sys.localStorage.setItem('hasRegistered', '1');
        }
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


