import { _decorator, Component, Node, Button, Sprite, Event, find } from 'cc';
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

interface ProductConfig {
    amount: string;      // 支付金额（美元）
    diamonds?: number;    // 钻石数量
    isFirstCharge?: boolean; // 是否是首充礼包
    bombBomb?: number;    // 周围爆炸道具数量
    bombHor?: number;     // 横向炸弹道具数量
    bombVer?: number;     // 竖向炸弹道具数量
    bombAllSame?: number; // 同类型炸弹道具数量
}

@ccclass('buyViewCmpt')
export class BuyViewCmpt extends BaseViewCmpt {
    private lbGold: Node = null;
    private content: Node = null;

    // 商品配置
    private readonly products: { [key: string]: ProductConfig } = {
        'itemBtn1': { amount: '8', diamonds: 12 },
        'itemBtn2': { amount: '20', diamonds: 40 },
        'itemBtn3': { amount: '40', diamonds: 70 },
        'itemBtn4': { amount: '80', diamonds: 140 },
        'itemBtn5': { amount: '100', diamonds: 180 },
        // 首充双倍礼包
        'itemBtn6': { amount: '8', diamonds: 24, isFirstCharge: true },
        'itemBtn7': { amount: '20', diamonds: 80, isFirstCharge: true },
        'itemBtn8': { amount: '40', diamonds: 140, isFirstCharge: true },
        'itemBtn9': { amount: '80', diamonds: 280, isFirstCharge: true },
        'itemBtn10': { amount: '100', diamonds: 360, isFirstCharge: true },
        // 道具礼包
        'itemBtn11': { 
            amount: '200', 
            diamonds: 50,
            bombBomb: 3,
            bombHor: 3,
            bombVer: 5,
            bombAllSame: 2
        },
        'itemBtn12': { 
            amount: '500', 
            diamonds: 200,
            bombBomb: 5,
            bombHor: 5,
            bombVer: 10,
            bombAllSame: 3
        },
        'itemBtn13': { 
            amount: '1000',
            bombBomb: 10,
            bombHor: 10,
            bombVer: 20,
            bombAllSame: 5
        },
        'itemBtn14': { 
            amount: '1500', 
            diamonds: 1000,
            bombBomb: 20,
            bombHor: 20,
            bombAllSame: 10
        }
    };

    onLoad() {
        for (let i = 1; i < 15; i++) {
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
        // 更新每个首充礼包按钮的状态
        for (let i = 6; i <= 10; i++) {
            const btn = this.content.getChildByName(`itemBtn${i}`);
            if (btn) {
                const hasFirstCharge = StorageHelper.getBooleanData(StorageHelperKey[`FirstChargeItem${i}`], false);
                ToolsHelper.setNodeGray(btn, hasFirstCharge);
            }
        }
    }

    async handleBtnEvent(btn: Node) {
        if(find("Canvas/view/homeView/Mask")){
            find("Canvas/view/homeView/Mask").active = true;
        }else{
            find("Canvas/view/gameView/Mask").active = true;
        }
        App.audio.play('button_click');
        const btnName = btn.name;
        const product = this.products[btnName];
        
        if (!product) {
            console.error('未找到商品配置:', btnName);
            return;
        }

        // 检查是否是首充礼包
        if (product.isFirstCharge) {
            const itemNumber = parseInt(btnName.replace('itemBtn', ''));
            const storageKey = StorageHelperKey[`FirstChargeItem${itemNumber}`];
            const hasFirstCharge = StorageHelper.getBooleanData(storageKey, false);
            if (hasFirstCharge) {
                App.view.showMsgTips("The first recharge gift package has been purchased");
                return;
            }
        }

        try {
            // 发起支付
            const result = await this.requestPayment(product.amount, `钻石礼包-${product.diamonds}钻石`);
            
            if (result.code === 'P0001') {
                // 支付成功
                console.log('支付成功');
                
                // 发放钻石
                if (product.diamonds) {
                    GlobalFuncHelper.setGold(product.diamonds);
                    App.event.emit(EventName.Game.UpdataGold);
                }
                
                // 发放道具
                let rewardText = [];
                if (product.diamonds) {
                    rewardText.push(`${product.diamonds} Diamonds`);
                }
                
                // 发放炸弹道具
                if (product.bombBomb) {
                    const currentBombBomb = StorageHelper.getData(StorageHelperKey.BombBomb, 0);
                    StorageHelper.setData(StorageHelperKey.BombBomb, currentBombBomb + product.bombBomb);
                    rewardText.push(`${product.bombBomb} Bomb Blast`);
                }
                
                if (product.bombHor) {
                    const currentBombHor = StorageHelper.getData(StorageHelperKey.BombHor, 0);
                    StorageHelper.setData(StorageHelperKey.BombHor, currentBombHor + product.bombHor);
                    rewardText.push(`${product.bombHor} Horizontal Bomb`);
                }
                
                if (product.bombVer) {
                    const currentBombVer = StorageHelper.getData(StorageHelperKey.BombVer, 0);
                    StorageHelper.setData(StorageHelperKey.BombVer, currentBombVer + product.bombVer);
                    rewardText.push(`${product.bombVer} Vertical Bomb`);
                }
                
                if (product.bombAllSame) {
                    const currentBombAllSame = StorageHelper.getData(StorageHelperKey.BombAllSame, 0);
                    StorageHelper.setData(StorageHelperKey.BombAllSame, currentBombAllSame + product.bombAllSame);
                    rewardText.push(`${product.bombAllSame} Color Bomb`);
                }
                
                // 如果是首充礼包，标记对应礼包已购买
                if (product.isFirstCharge) {
                    const itemNumber = parseInt(btnName.replace('itemBtn', ''));
                    const storageKey = StorageHelperKey[`FirstChargeItem${itemNumber}`];
                    StorageHelper.setBooleanData(storageKey, true);
                    this.updateItemStatus();
                }
                
                App.view.showMsgTips(`Purchase successful! You got ${rewardText.join(', ')}`);
            } else {
                // 支付失败
                console.log('支付失败:', result);
                App.view.showMsgTips('Payment failed: ' + result.message);
            }
        } catch (error) {
            console.error('支付请求失败:', error);
            App.view.showMsgTips('Payment request failed, please try again later');
        }

        if(find("Canvas/view/homeView/Mask")){
            find("Canvas/view/homeView/Mask").active = false;
        }else{
            find("Canvas/view/gameView/Mask").active = false;
        }
    }
    return(){
        this.node.active = false;
    }
    // 支付请求
    private async requestPayment(amount: string, productInfo: string) {
        try {
            const payParams = {
                amount: amount,
                currency: "1",  // 修改currency参数为"1"
                productInfo: encodeURIComponent(productInfo),
                email: "test@example.com",
                firstName: "Test",
                lastName: "User",
                phone: "18888888888",
                address: "Test Address",
                city: "Test City",
                state: "CA",
                country: "United States",
                zipCode: "12345"
            };

            const payManager = PayManager.getInstance();
            if (!payManager) {
                throw new Error('PayManager not initialized');
            }

            console.log('发起支付请求，参数:', payParams);
            return await payManager.requestPay(payParams);
        } catch (error) {
            console.error('支付请求失败:', error);
            throw error;
        }
    }
}