import { _decorator, Component, Node, Button, Sprite, Event, find, EditBox } from 'cc';
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

    // 新增：支付表单数据
    private paymentFormData = {
        email: '',
        firstName: '',
        lastName: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        country: '',
        zipCode: ''
    };
    // 新增：表单UI节点引用
    private formNodes: { [key: string]: Node } = {};

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
        // 新增：初始化表单节点引用
        this.initPaymentFormNodes();
    }

    // 新增：初始化表单节点引用
    private initPaymentFormNodes() {
        const fields = ['email', 'firstName', 'lastName', 'phone', 'address', 'city', 'state', 'country', 'zipCode'];
        fields.forEach(key => {
            const node = find('PaymentForm/' + key, this.node);
            if (node) this.formNodes[key] = node;
        });
        // 监听国家选择变化
        if (this.formNodes['country']) {
            this.formNodes['country'].on('change', this.onCountryChange, this);
        }
        // 初始化state显示
        this.updateStateFieldVisibility();
    }

    // 新增：国家选择变化时，显示/隐藏state字段
    private onCountryChange() {
        if (!this.formNodes['country']) return;
        let countryValue = '';
        // 只处理EditBox
        const editBox = this.formNodes['country'].getComponent(EditBox);
        if (editBox) {
            countryValue = editBox.string;
        }
        this.paymentFormData.country = countryValue;
        this.updateStateFieldVisibility();
    }

    // 新增：根据国家显示/隐藏state字段
    private updateStateFieldVisibility() {
        const country = this.paymentFormData.country.trim().toLowerCase();
        const showState = country === 'united states' || country === 'canada' || country === '美国' || country === '加拿大';
        if (this.formNodes['state']) {
            this.formNodes['state'].active = showState;
        }
    }

    // 新增：收集表单数据
    private collectPaymentFormData(): boolean {
        let valid = true;
        const requiredFields = ['email', 'firstName', 'lastName', 'phone', 'address', 'city', 'country', 'zipCode'];
        // 如果需要state
        const editBox = this.formNodes['country']?.getComponent(EditBox);
        let country = '';
        if (editBox) {
            country = editBox.string.trim().toLowerCase();
        }
        const needState = country === 'united states' || country === 'canada' || country === '美国' || country === '加拿大';
        if (needState) requiredFields.push('state');
        requiredFields.forEach(key => {
            let value = '';
            const editBox = this.formNodes[key]?.getComponent(EditBox);
            if (editBox) {
                value = editBox.string.trim();
            }
            this.paymentFormData[key] = value;
            if (!value) valid = false;
        });
        return valid;
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
    showPaymentInformation(){
        const isFirstEnter = !(cc as any).sys.localStorage.getItem('hasPaymentInformation');
        const paymentInformationNode = find('Payment Information', this.node);
        if (paymentInformationNode) {
            paymentInformationNode.active = isFirstEnter;
        }
        if (isFirstEnter) {
            (cc as any).sys.localStorage.setItem('hasPaymentInformation', '1');
        }
    }
    closePaymentInformation(){
        const paymentInformationNode = find('Payment Information', this.node);
        if (paymentInformationNode) {
            paymentInformationNode.active = false;
        }
    }
    async handleBtnEvent(btn: Node) {
        if(!(cc as any).sys.localStorage.getItem('hasPaymentInformation')){
            this.showPaymentInformation();
            return;
        }
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
                
                App.view.showMsgTips(`Purchase successful!`);
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