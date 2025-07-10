import { _decorator, Component, Node, Button, Sprite, Event } from 'cc';
import { BaseViewCmpt } from '../../components/baseViewCmpt';
import { Bomb } from '../../const/enumConst';
import { EventName } from '../../const/eventName';
import { LevelConfig } from '../../const/levelConfig';
import { App } from '../../core/app';
import { PayManager } from '../../core/payManager';
import { CocosHelper } from '../../utils/cocosHelper';
import { GlobalFuncHelper } from '../../utils/globalFuncHelper';
import { StorageHelper, StorageHelperKey } from '../../utils/storageHelper';
import { ToolsHelper } from '../../utils/toolsHelper';
import { WxManager } from '../../wx/wxManager';
const { ccclass, property } = _decorator;

@ccclass('buyViewCmpt')
export class BuyViewCmpt extends BaseViewCmpt {
    private lbGold: Node = null;
    private content: Node = null;

    onLoad() {
        for (let i = 1; i < 11; i++) {
            this[`onClick_itemBtn${i}`] = this.handleBtnEvent.bind(this);
        }
        super.onLoad();
        this.lbGold = this.viewList.get('top/lbGold');
        this.content = this.viewList.get('s/view/content');
        App.event.on(EventName.Game.UpdataGold, this.evtUpdateGold, this);
        this.evtUpdateGold();
        this.updateItemStatus();
    }

    evtUpdateGold() {
        let gold = GlobalFuncHelper.getGold();
        CocosHelper.updateLabelText(this.lbGold, gold);
    }

    updateItemStatus() {
        let gold = GlobalFuncHelper.getGold();
        let bool = gold < 50;
        let item1 = this.content.getChildByName('itemBtn1');
        ToolsHelper.setNodeGray(item1, bool);

        bool = gold < 10;
        item1 = this.content.getChildByName('itemBtn4');
        ToolsHelper.setNodeGray(item1, bool);
        item1 = this.content.getChildByName('itemBtn5');
        ToolsHelper.setNodeGray(item1, bool);
        item1 = this.content.getChildByName('itemBtn7');
        ToolsHelper.setNodeGray(item1, bool);
        bool = gold < 10;
        item1 = this.content.getChildByName('itemBtn6');
        ToolsHelper.setNodeGray(item1, bool);
    }

    handleBtnEvent(btn: Node)  {
        App.audio.play('button_click');
        let gold = GlobalFuncHelper.getGold();
        let bool = gold < 50;
        let lv = LevelConfig.getCurLevel();
        

        
        const btnName = btn.name;
        // 先尝试调用支付测试
        this.testPay("50", "道具包");


        // 原有的游戏逻辑
        switch (btnName) {
            case 'itemBtn1':
                if (bool) {
                    App.view.showMsgTips("Diamond shortage");
                    return;
                }
                GlobalFuncHelper.setGold(-50);
                App.event.emit(EventName.Game.UpdataGold);
                App.view.showMsgTips("Purchase successful");
                GlobalFuncHelper.setBomb(Bomb.hor, 1)
                GlobalFuncHelper.setBomb(Bomb.allSame, 1)
                GlobalFuncHelper.setBomb(Bomb.bomb, 1)
                break;
            case 'itemBtn2':
                App.event.emit(EventName.Game.Share, lv, false);
                GlobalFuncHelper.setGold(12);
                App.event.emit(EventName.Game.UpdataGold);
                break;
            case 'itemBtn3':
                App.event.emit(EventName.Game.Share, lv, false);
                GlobalFuncHelper.setGold(40);
                App.event.emit(EventName.Game.UpdataGold);
                break;
            case 'itemBtn4':
                bool = gold < 10;
                if (bool) {
                    App.view.showMsgTips("Diamond shortage");
                    return;
                }
                GlobalFuncHelper.setGold(-10);
                App.event.emit(EventName.Game.UpdataGold);
                App.view.showMsgTips("Purchase successful");
                GlobalFuncHelper.setBomb(Bomb.bomb, 1)
                break;
            case 'itemBtn5':
                bool = gold < 10;
                if (bool) {
                    App.view.showMsgTips("Diamond shortage");
                    return;
                }
                GlobalFuncHelper.setGold(-10);
                App.event.emit(EventName.Game.UpdataGold);
                App.view.showMsgTips("Purchase successful");
                GlobalFuncHelper.setBomb(Bomb.hor, 1);
                break;
            case 'itemBtn6':
                bool = gold < 10;
                if (bool) {
                    App.view.showMsgTips("Diamond shortage");
                    return;
                }
                GlobalFuncHelper.setGold(-10);
                App.event.emit(EventName.Game.UpdataGold);
                App.view.showMsgTips("Purchase successful");
                GlobalFuncHelper.setBomb(Bomb.allSame, 1)
                break;
            case 'itemBtn7':
                bool = gold < 10;
                if (bool) {
                    App.view.showMsgTips("Diamond shortage");
                    return;
                }
                GlobalFuncHelper.setGold(-10);
                App.event.emit(EventName.Game.UpdataGold);
                App.view.showMsgTips("Purchase successful");
                GlobalFuncHelper.setHeart(1)
                break;
            case 'itemBtn8':
                App.event.emit(EventName.Game.Share, lv, false);
                GlobalFuncHelper.setGold(70);
                App.event.emit(EventName.Game.UpdataGold);
                break;
            case 'itemBtn9':
                App.event.emit(EventName.Game.Share, lv, false);
                GlobalFuncHelper.setGold(140);
                App.event.emit(EventName.Game.UpdataGold);
                break;
            case 'itemBtn10':
                App.event.emit(EventName.Game.Share, lv, false);
                GlobalFuncHelper.setGold(180);
                App.event.emit(EventName.Game.UpdataGold);
                break;
        }
        this.updateItemStatus();
    }

    // 支付测试功能
    async testPay(amount: string, productInfo: string) {
        try {
            const payParams = {
                amount: amount,
                currency: "1",   // 货币类型
                productInfo: productInfo,
                email: "test@example.com",
                firstName: "Player",
                lastName: "Test",
                phone: "1234567890",
                address: "Test Address",
                city: "Test City",
                state: "Test State",
                country: "United States",
                zipCode: "12345"
            };

            const payManager = PayManager.getInstance();
            if (!payManager) {
                console.error('PayManager not initialized');
                return;
            }

            const result = await payManager.requestPay(payParams);
            console.log('支付结果:', result);
            
            if (result.code === 'R0000') {
                // 支付成功
                console.log('支付成功');
                App.view.showMsgTips('支付成功');
            } else {
                // 支付失败
                console.log('支付失败:', result.message);
                App.view.showMsgTips('支付失败: ' + result.message);
            }
        } catch (error) {
            console.error('支付请求失败:', error);
            App.view.showMsgTips('支付请求失败，请稍后重试');
        }
    }
}