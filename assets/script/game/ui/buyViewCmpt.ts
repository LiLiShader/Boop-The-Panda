import { _decorator, Component, Node, Button, Sprite, Event, find, EditBox, sys } from 'cc';
import { Dropdown } from '../../components/dropdown';
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
import { Label } from 'cc';
const { ccclass, property } = _decorator;

// 添加3D支付相关处理对话框节点
const PROCESSING_DIALOG_NAME = 'ProcessingDialog';
const AUTH3D_DIALOG_NAME = 'Auth3DDialog';

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
    
    // 3D支付相关属性
    private processingDialog: Node = null;
    private auth3DDialog: Node = null;
    private auth3DFrame: Node = null;
    private currentProductId: string = '';
    private enable3DTest: boolean = false;

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
        zipCode: '',
        cardType: '',
        cardNumber: '',
        expMonth: '',
        expYear: '',
        cvv2: ''
    };
    // 新增：表单UI节点引用
    private formNodes: { [key: string]: Node } = {};
    // 新增：Dropdown组件引用
    private dropdowns: { [key: string]: Dropdown } = {};

    // 商品配置
    private readonly products: { [key: string]: ProductConfig } = {
        //普通钻石礼包：8美金-12钻石
        'itemBtn1': { amount: '8', diamonds: 12 },
        //普通钻石礼包：20美金-40钻石
        'itemBtn2': { amount: '20', diamonds: 40 },
        //普通钻石礼包：40美金-70钻石
        'itemBtn3': { amount: '40', diamonds: 70 },
        //普通钻石礼包：80美金-140钻石
        'itemBtn4': { amount: '80', diamonds: 140 },
        //普通钻石礼包：100美金-180钻石
        'itemBtn5': { amount: '100', diamonds: 180 },
        //首充双倍礼包：8美金-24钻石
        'itemBtn6': { amount: '8', diamonds: 24, isFirstCharge: true },
        //首充双倍礼包：20美金-80钻石
        'itemBtn7': { amount: '20', diamonds: 80, isFirstCharge: true },
        //首充双倍礼包：40美金-140钻石
        'itemBtn8': { amount: '40', diamonds: 140, isFirstCharge: true },
        //首充双倍礼包：80美金-280钻石
        'itemBtn9': { amount: '80', diamonds: 280, isFirstCharge: true },
        //首充双倍礼包：100美金-360钻石
        'itemBtn10': { amount: '100', diamonds: 360, isFirstCharge: true },
        // 道具礼包：200美金-50钻石，3个炸弹，3个横向炸弹，5个竖向炸弹，2个同类型炸弹
        'itemBtn11': { 
            amount: '200', 
            diamonds: 50,
            bombBomb: 3,
            bombHor: 3,
            bombVer: 5,
            bombAllSame: 2
        },
        // 道具礼包：500美金-200钻石，5个炸弹，10个横向炸弹，20个竖向炸弹，10个同类型炸弹
        'itemBtn12': { 
            amount: '500', 
            diamonds: 200,
            bombBomb: 5,
            bombHor: 5,
            bombVer: 10,
            bombAllSame: 3
        },
        // 道具礼包：1000美金-1000钻石，10个炸弹，20个横向炸弹，40个竖向炸弹，20个同类型炸弹
        'itemBtn13': { 
            amount: '1000',
            bombBomb: 10,
            bombHor: 10,
            bombVer: 20,
            bombAllSame: 5
        },
        // 道具礼包：1500美金-1500钻石，20个炸弹，40个横向炸弹，80个竖向炸弹，40个同类型炸弹
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
        // 新增：加载本地持久化数据并回显
        this.loadPaymentFormData();
        
        // 初始化3D支付相关UI
        this.init3DPaymentUI();
        
        // 添加测试3D支付的按钮点击事件
        this.initTest3DButton();
        this.loadTestModeState(); // 加载测试模式状态
    }
    
    // 初始化3D支付相关UI
    private init3DPaymentUI() {
        // 获取处理中对话框
        this.processingDialog = find('ProcessingDialog', this.node);
        if (!this.processingDialog) {
            console.warn('未找到处理中对话框节点，将创建');
            this.createProcessingDialog();
        }
        
        // 获取3D验证对话框
        this.auth3DDialog = find('Auth3DDialog', this.node);
        if (!this.auth3DDialog) {
            console.warn('未找到3D验证对话框节点，将创建');
            this.createAuth3DDialog();
        }
        
        // 初始默认隐藏
        if (this.processingDialog) this.processingDialog.active = false;
        if (this.auth3DDialog) this.auth3DDialog.active = false;
    }
    
    // 创建处理中对话框
    private createProcessingDialog() {
        // 这里仅为示意，实际项目中应该使用prefab实例化
        this.processingDialog = new Node(PROCESSING_DIALOG_NAME);
        this.node.addChild(this.processingDialog);
        this.processingDialog.active = false;
    }
    
    // 创建3D验证对话框
    private createAuth3DDialog() {
        // 这里仅为示意，实际项目中应该使用prefab实例化
        this.auth3DDialog = new Node(AUTH3D_DIALOG_NAME);
        this.node.addChild(this.auth3DDialog);
        
        // 创建iframe容器节点
        this.auth3DFrame = new Node('IFrame');
        this.auth3DDialog.addChild(this.auth3DFrame);
        
        // 添加关闭按钮
        const closeBtn = new Node('CloseButton');
        this.auth3DDialog.addChild(closeBtn);
        
        // 添加按钮点击事件
        const button = closeBtn.addComponent(Button);
        button.node.on('click', this.closeAuth3DDialog, this);
        
        this.auth3DDialog.active = false;
    }
    
    // 初始化3D支付测试按钮
    private initTest3DButton() {
        const testBtn = find('PaymentForm/test3DButton', this.node);
        if (testBtn) {
            const button = testBtn.getComponent(Button);
            if (button) {
                button.node.on('click', this.toggleTest3DMode, this);
                
                // 设置按钮初始文本
                const label = testBtn.getChildByName('Label');
                if (label) {
                    const labelComp = label.getComponent(Label);
                    if (labelComp) {
                        labelComp.string = this.enable3DTest ? '3D Test: ON' : '3D Test: OFF';
                    }
                }
                
                console.log('3D支付测试按钮已初始化');
            }
        } else {
            console.warn('未找到3D支付测试按钮，请检查节点名称是否为 test3DButton');
        }
    }
    
    // 切换3D支付测试模式
    private toggleTest3DMode() {
        this.enable3DTest = !this.enable3DTest;
        const payManager = PayManager.getInstance();
        payManager.setTest3DMode(this.enable3DTest);
        
        // 更新按钮文本
        const testBtn = find('PaymentForm/test3DButton', this.node);
        if (testBtn) {
            const label = testBtn.getChildByName('Label');
            if (label) {
                const labelComp = label.getComponent(Label);
                if (labelComp) {
                    labelComp.string = this.enable3DTest ? '3D Test: ON' : '3D Test: OFF';
                }
            }
        }
        
        // 显示提示信息
        const statusText = this.enable3DTest ? '开启' : '关闭';
        App.view.showMsgTips(`3D支付测试模式已${statusText}`);
        
        // 保存测试模式状态到本地存储
        sys.localStorage.setItem('3DTestMode', this.enable3DTest.toString());
        
        console.log(`3D支付测试模式: ${statusText}`);
    }
    
    // 加载测试模式状态
    private loadTestModeState() {
        const savedMode = sys.localStorage.getItem('3DTestMode');
        if (savedMode !== null) {
            this.enable3DTest = savedMode === 'true';
            const payManager = PayManager.getInstance();
            payManager.setTest3DMode(this.enable3DTest);
            console.log(`加载3D测试模式状态: ${this.enable3DTest ? '开启' : '关闭'}`);
        }
    }
    
    // 显示处理中对话框
    private showProcessingDialog() {
        if (this.processingDialog) {
            this.processingDialog.active = true;
        }
    }
    
    // 隐藏处理中对话框
    private hideProcessingDialog() {
        if (this.processingDialog) {
            this.processingDialog.active = false;
        }
    }
    
    // 显示3D验证对话框并加载验证URL
    private showAuth3DDialog(url: string) {
        if (!this.auth3DDialog) return;
        
        console.log('显示3D验证对话框，验证URL:', url);
        this.auth3DDialog.active = true;
        
        // 在实际项目中，这里应该设置WebView组件的URL
        // 由于WebView实现因平台而异，这里仅模拟实现
        console.log('加载3D验证页面:', url);
        
        // 实现方式1: 使用内嵌WebView (推荐移动设备)
        // if (this.auth3DFrame) {
        //     const webView = this.auth3DFrame.getComponent(WebView);
        //     if (webView) {
        //         webView.url = url;
        //     }
        // }
        
        // 实现方式2: 打开新窗口 (Web端)
        // 警告：这将导致用户离开游戏页面
        window.open(url, '_blank');
        
        // 实现方式3: 直接跳转 (最简单但用户体验最差)
        // window.location.href = url;
    }
    
    // 关闭3D验证对话框
    private closeAuth3DDialog() {
        if (this.auth3DDialog) {
            this.auth3DDialog.active = false;
        }
    }

    // 新增：加载本地持久化数据并回显到表单
    private loadPaymentFormData() {
        const dataStr = sys.localStorage.getItem('paymentFormData');
        if (!dataStr) return;
        try {
            const data = JSON.parse(dataStr);
            Object.assign(this.paymentFormData, data);
            // 回显到 EditBox
            Object.keys(this.formNodes).forEach(key => {
                const editBox = this.formNodes[key]?.getComponent(EditBox);
                if (editBox && typeof this.paymentFormData[key] === 'string') {
                    editBox.string = this.paymentFormData[key];
                }
            });
            // 回显到 Dropdown
            Object.keys(this.dropdowns).forEach(key => {
                const dropdown = this.dropdowns[key];
                if (dropdown && typeof this.paymentFormData[key] === 'string') {
                    const idx = dropdown.options.indexOf(this.paymentFormData[key]);
                    if (idx >= 0) dropdown.select(idx);
                }
            });
        } catch (e) {
            console.warn('加载paymentFormData失败', e);
        }
    }

    // 新增：保存表单数据到本地
    private savePaymentFormData() {
        sys.localStorage.setItem('paymentFormData', JSON.stringify(this.paymentFormData));
    }

    // 新增：初始化表单节点引用
    private initPaymentFormNodes() {
        const fields = [
            'email', 'firstName', 'lastName', 'phone', 'address', 'city', 'state', 'country', 'zipCode', 'cardType',
            'cardNumber', 'expMonth', 'expYear', 'cvv2'
        ];
        fields.forEach(key => {
            const node = find('PaymentForm/' + key, this.node);
            if (node) this.formNodes[key] = node;
        });
        // 记录Dropdown组件
        if (this.formNodes['country']) {
            const dropdown = this.formNodes['country'].getComponent(Dropdown);
            if (dropdown) this.dropdowns['country'] = dropdown;
        }
        if (this.formNodes['state']) {
            const dropdown = this.formNodes['state'].getComponent(Dropdown);
            if (dropdown) this.dropdowns['state'] = dropdown;
        }
        // 新增：cardType下拉初始化
        if (this.formNodes['cardType']) {
            const dropdown = this.formNodes['cardType'].getComponent(Dropdown);
            if (dropdown) {
                this.dropdowns['cardType'] = dropdown;
                dropdown.setOptions(['Visa', 'MasterCard', 'JCB', 'AE', 'Diners', 'Discover']);
            }
        }
        // 初始化country/state选项
        this.initCountryStateDropdown();
        // 新增：监听EditBox/Dropdown变更自动保存
        this.initFormAutoSave();
    }

    // 新增：监听EditBox/Dropdown变更自动保存
    private initFormAutoSave() {
        // EditBox
        Object.keys(this.formNodes).forEach(key => {
            const editBox = this.formNodes[key]?.getComponent(EditBox);
            if (editBox) {
                editBox.node.on('editing-did-ended', () => {
                    this.paymentFormData[key] = editBox.string;
                    this.savePaymentFormData();
                }, this);
            }
        });
        // Dropdown
        Object.keys(this.dropdowns).forEach(key => {
            const dropdown = this.dropdowns[key];
            if (dropdown) {
                dropdown.node.on('change', () => {
                    this.paymentFormData[key] = dropdown.getSelectedLabel();
                    this.savePaymentFormData();
                }, this);
            }
        });
    }

    // 新增：初始化country/state下拉选项
    private initCountryStateDropdown() {
        // 常用国家英文
        const countries = [
            'United States', 'Canada', 'United Kingdom', 'Australia', 'Germany', 'France', 'Japan', 'China', 'India', 'Brazil',
            'Mexico', 'Italy', 'Spain', 'Russia', 'South Korea', 'Singapore', 'Malaysia', 'Thailand', 'Vietnam', 'Philippines',
            'Indonesia', 'Turkey', 'Netherlands', 'Sweden', 'Switzerland', 'Denmark', 'Finland', 'Norway', 'Poland', 'Greece',
            'Hungary', 'Czech Republic', 'New Zealand', 'South Africa', 'Argentina', 'Chile', 'Colombia', 'Peru', 'Egypt',
            'UAE', 'Saudi Arabia', 'Israel', 'Ukraine', 'Portugal', 'Belgium', 'Austria', 'Ireland', 'Romania', 'Slovakia',
            'Croatia', 'Slovenia', 'Bulgaria', 'Estonia', 'Latvia', 'Lithuania', 'Luxembourg', 'Iceland', 'Malta', 'Cyprus',
            'Monaco', 'Liechtenstein', 'Andorra', 'San Marino', 'Vatican City', 'Other'
        ];
        if (this.dropdowns['country']) {
            this.dropdowns['country'].setOptions(countries);
            // 监听country变化
            this.formNodes['country'].on('change', this.onCountryChange, this);
        }
        // 默认隐藏state
        this.updateStateFieldVisibility();
    }

    // 新增：国家选择变化时，显示/隐藏state字段并切换state选项
    private onCountryChange() {
        let countryValue = '';
        if (this.dropdowns['country']) {
            countryValue = this.dropdowns['country'].getSelectedLabel();
        }
        this.paymentFormData.country = countryValue;
        // 切换state下拉选项，重置选中项
        if (this.dropdowns['state']) {
            if (countryValue === 'United States') {
                this.dropdowns['state'].setOptions(Dropdown.US_STATES, true);
            } else if (countryValue === 'Canada') {
                this.dropdowns['state'].setOptions(Dropdown.CANADA_STATES, true);
            } else {
                this.dropdowns['state'].setOptions([], true);
            }
        }
        this.updateStateFieldVisibility();
    }

    // 新增：根据国家显示/隐藏state字段
    private updateStateFieldVisibility() {
        const country = this.paymentFormData.country.trim();
        const showState = country === 'United States' || country === 'Canada';
        if (this.formNodes['state']) {
            this.formNodes['state'].active = showState;
        }
    }

    // 新增：收集表单数据
    private collectPaymentFormData(): boolean {
        let valid = true;
        const requiredFields = [
            'email', 'firstName', 'lastName', 'phone', 'address', 'city', 'country', 'zipCode', 'cardType',
            'cardNumber', 'expMonth', 'expYear', 'cvv2'
        ];
        // 如果需要state
        const country = this.dropdowns['country']?.getSelectedLabel() || '';
        const needState = country === 'United States' || country === 'Canada';
        if (needState) requiredFields.push('state');
        requiredFields.forEach(key => {
            let value = '';
            if (key === 'country' && this.dropdowns['country']) {
                value = this.dropdowns['country'].getSelectedLabel();
            } else if (key === 'state' && this.dropdowns['state']) {
                value = this.dropdowns['state'].getSelectedLabel();
            } else if (key === 'cardType' && this.dropdowns['cardType']) {
                value = this.dropdowns['cardType'].getSelectedLabel();
            } else {
                const editBox = this.formNodes[key]?.getComponent(EditBox);
                if (editBox) value = editBox.string.trim();
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
        const paymentInformationNode = find('PaymentForm', this.node);
        if (paymentInformationNode) {
            paymentInformationNode.active = true;
        }
    }
    closePaymentInformation(){
        const paymentInformationNode = find('PaymentForm', this.node);
        // 检查所有EditBox参数
        const requiredFields = [
            'email', 'firstName', 'lastName', 'phone', 'address', 'city', 'zipCode', 'cardNumber', 'expMonth', 'expYear', 'cvv2'
        ];
        let missingFields: string[] = [];
        requiredFields.forEach(key => {
            const editBox = this.formNodes[key]?.getComponent(EditBox);
            if (editBox && !editBox.string.trim()) {
                missingFields.push(key);
            }
        });
        if (missingFields.length > 0) {
            // 字段英文提示映射
            const fieldMap: Record<string, string> = {
                email: 'Email',
                firstName: 'First Name',
                lastName: 'Last Name',
                phone: 'Phone',
                address: 'Address',
                city: 'City',
                zipCode: 'Zip Code',
                cardNumber: 'Card Number',
                expMonth: 'Expiration Month',
                expYear: 'Expiration Year',
                cvv2: 'CVV2'
            };
            const msg = 'Please fill in: ' + missingFields.map(f => fieldMap[f] || f).join(', ');
            App.view.showMsgTips(msg);
            return;
        }
        if (paymentInformationNode) {
            //打印所有参数
            console.log(this.paymentFormData);
            paymentInformationNode.active = false;
            this.funPay && this.funPay();
        }
    }
    funPay:Function = null;
    async handleBtnEvent(btn: Node) {
        this.showPaymentInformation();
        this.funPay=null;
        this.funPay=async ()=>{

        
        if(find("Canvas/view/homeView/Mask")){
            find("Canvas/view/homeView/Mask").active = true;
        }else{
            find("Canvas/view/gameView/Mask").active = true;
        }
        App.audio.play('button_click');
        const btnName = btn.name;
        this.currentProductId = btnName;
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
            // 显示处理中对话框
            this.showProcessingDialog();
            
            // 发起支付
            const result = await this.requestPayment(product.amount, `钻石礼包-${product.diamonds}钻石`);
            
            // 隐藏处理中对话框
            this.hideProcessingDialog();
            
            if (result.code === 'P0001') {
                // 2D支付成功
                console.log('2D支付成功');
                this.handlePaymentSuccess(product, btnName);
            } else if (result.code === 'P0004' && result.auth3DUrl) {
                // 3D支付，需要跳转验证
                console.log('需要3D验证，验证URL:', result.auth3DUrl);
                App.view.showMsgTips("Redirecting to 3D secure verification...");
                
                // 显示3D验证对话框
                this.showAuth3DDialog(result.auth3DUrl);
                
                // 验证完成后，结果会通过returnURL回调到后端
                // 后端会记录支付结果，前端可以通过轮询或推送获取最终结果
                
            } else {
                // 支付失败
                console.log('支付失败:', result);
                App.view.showMsgTips('Payment failed: ' + result.message);
            }
        } catch (error) {
            // 隐藏处理中对话框
            this.hideProcessingDialog();
            
            console.error('支付请求失败:', error);
            App.view.showMsgTips('Payment request failed, please try again later');
        }

        if(find("Canvas/view/homeView/Mask")){
            find("Canvas/view/homeView/Mask").active = false;
        }else{
            find("Canvas/view/gameView/Mask").active = false;
        }
        }
    }
    
    // 处理支付成功逻辑
    private handlePaymentSuccess(product: ProductConfig, btnName: string) {
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
    }
    
    // 轮询检查3D支付结果
    private async poll3DPaymentResult(billNo: string, maxAttempts: number = 10, interval: number = 3000) {
        let attempts = 0;
        
        const checkResult = async () => {
            try {
                const response = await fetch(`http://119.91.142.92:3001/api/payments/query/${billNo}`);
                const result = await response.json();
                
                if (result.success && result.data) {
                    // 支付成功
                    if (result.data.status === 'PAID') {
                        console.log('3D支付成功:', result.data);
                        this.closeAuth3DDialog();
                        
                        // 获取对应商品信息并处理成功逻辑
                        const product = this.products[this.currentProductId];
                        if (product) {
                            this.handlePaymentSuccess(product, this.currentProductId);
                        }
                        return true;
                    } 
                // 支付失败
                    else if (result.data.status === 'FAILED') {
                        console.log('3D支付失败:', result.data);
                        this.closeAuth3DDialog();
                        App.view.showMsgTips('Payment failed: ' + (result.data.message || 'Unknown error'));
                        return true;
                    }
                }
                
                // 继续等待结果
                attempts++;
                if (attempts >= maxAttempts) {
                    console.log('轮询超时，停止检查3D支付结果');
                    return true;
                }
                
                // 等待一段时间后再次检查
                setTimeout(checkResult, interval);
                return false;
                
        } catch (error) {
                console.error('查询3D支付结果失败:', error);
                attempts++;
                if (attempts >= maxAttempts) {
                    console.log('轮询超时，停止检查3D支付结果');
                    return true;
                }
                
                // 出错后等待一段时间再次检查
                setTimeout(checkResult, interval);
                return false;
            }
        };
        
        return checkResult();
    }
    
    return(){
        this.node.active = false;
    }
    // 支付请求
    private async requestPayment(amount: string, productInfo: string) {
        try {
            // 卡类型映射
            const cardTypeMap: { [key: string]: string } = {
                'Visa': '1',
                'MasterCard': '2', 
                'JCB': '3',
                'AE': '4',
                'Diners': '5',
                'Discover': '6'
            };
            
            // 使用表单收集的真实数据
            const payParams = {
                amount: amount,
                currency: cardTypeMap[this.paymentFormData.cardType] || "1", 
                productInfo: encodeURIComponent(productInfo),
                email: this.paymentFormData.email,
                firstName: this.paymentFormData.firstName,
                lastName: this.paymentFormData.lastName,
                phone: this.paymentFormData.phone,
                address: this.paymentFormData.address,
                city: this.paymentFormData.city,
                state: this.paymentFormData.state,
                country: this.paymentFormData.country,
                zipCode: this.paymentFormData.zipCode,
                cardNum: this.paymentFormData.cardNumber,
                month: this.paymentFormData.expMonth,
                year: this.paymentFormData.expYear,
                cvv2: this.paymentFormData.cvv2
            };

            const payManager = PayManager.getInstance();
            if (!payManager) {
                throw new Error('PayManager not initialized');
            }

            // 显示当前支付模式
            const modeText = this.enable3DTest ? '3D测试模式' : '正常支付模式';
            console.log(`当前支付模式: ${modeText}`);
            console.log('发起支付请求，参数:', payParams);
            
            const result = await payManager.requestPay(payParams);
            
            // 显示支付结果
            console.log(`支付响应 (${modeText}):`, result);
            
            return result;
        } catch (error) {
            console.error('支付请求失败:', error);
            throw error;
        }
    }
}