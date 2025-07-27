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
import { Color, Widget } from 'cc';
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
        
        // 添加自动检查未完成支付的逻辑
        // this.checkUnfinishedPayments();

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
        
        console.log(`【3D支付】显示3D验证对话框，验证URL: ${url}`);
        this.auth3DDialog.active = true;
        
        // 检查是否已经有订单号
        if (this.currentBillNo) {
            console.log(`【3D支付】使用已设置的订单号: ${this.currentBillNo}`);
            
            // 开始轮询查询支付结果
            console.log(`【3D支付】准备开始轮询查询支付结果`);
            this.startPollingPaymentResult();
        } else {
            console.error(`【3D支付错误】没有订单号，无法开始轮询`);
        }
        
        // 打开验证页面
        console.log(`【3D支付】打开3D验证页面: ${url}`);
        window.open(url, '_blank');
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
    noshowPaymentInformation(){
        const paymentInformationNode = find('PaymentForm', this.node);
        if (paymentInformationNode) {
            paymentInformationNode.active = false;
        }
    }
    showPaymentInformation(){
        const paymentInformationNode = find('PaymentForm', this.node);
        if (paymentInformationNode) {
            paymentInformationNode.active = true;
            
            // 更新金额标签
            this.updateAmountLabel();
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
        this.currentProductId = btn.name;
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
        
        // 更新金额标签
        this.updateAmountLabel();
        
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
                console.log('支付响应数据:', result.data);
                App.view.showMsgTips("Redirecting to 3D secure verification...");
                
                // 从支付响应中获取订单号
                const billNo = result.data?.billNo || result.data?.orderNo || '';
                if (billNo) {
                    console.log(`【3D支付】从支付响应获取订单号: ${billNo}`);
                    this.currentBillNo = billNo;
                    localStorage.setItem('lastBillNo', billNo);
                    localStorage.setItem('lastProductId', this.currentProductId);
                }
                
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
        console.log(`【3D支付成功】开始处理商品 ${btnName}，商品配置:`, JSON.stringify(product));
        
        // 发放钻石
        if (product.diamonds) {
            const oldGold = GlobalFuncHelper.getGold();
            GlobalFuncHelper.setGold(product.diamonds);
            const newGold = GlobalFuncHelper.getGold();
            console.log(`【3D支付成功】发放钻石: ${product.diamonds}，钻石变化: ${oldGold} -> ${newGold}`);
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
            console.log(`【3D支付成功】发放炸弹道具: ${product.bombBomb}，数量变化: ${currentBombBomb} -> ${currentBombBomb + product.bombBomb}`);
            rewardText.push(`${product.bombBomb} Bomb Blast`);
        }
        
        if (product.bombHor) {
            const currentBombHor = StorageHelper.getData(StorageHelperKey.BombHor, 0);
            StorageHelper.setData(StorageHelperKey.BombHor, currentBombHor + product.bombHor);
            console.log(`【3D支付成功】发放横向炸弹道具: ${product.bombHor}，数量变化: ${currentBombHor} -> ${currentBombHor + product.bombHor}`);
            rewardText.push(`${product.bombHor} Horizontal Bomb`);
        }
        
        if (product.bombVer) {
            const currentBombVer = StorageHelper.getData(StorageHelperKey.BombVer, 0);
            StorageHelper.setData(StorageHelperKey.BombVer, currentBombVer + product.bombVer);
            console.log(`【3D支付成功】发放竖向炸弹道具: ${product.bombVer}，数量变化: ${currentBombVer} -> ${currentBombVer + product.bombVer}`);
            rewardText.push(`${product.bombVer} Vertical Bomb`);
        }
        
        if (product.bombAllSame) {
            const currentBombAllSame = StorageHelper.getData(StorageHelperKey.BombAllSame, 0);
            StorageHelper.setData(StorageHelperKey.BombAllSame, currentBombAllSame + product.bombAllSame);
            console.log(`【3D支付成功】发放同类型炸弹道具: ${product.bombAllSame}，数量变化: ${currentBombAllSame} -> ${currentBombAllSame + product.bombAllSame}`);
            rewardText.push(`${product.bombAllSame} Color Bomb`);
        }
        
        // 如果是首充礼包，标记对应礼包已购买
        if (product.isFirstCharge) {
            const itemNumber = parseInt(btnName.replace('itemBtn', ''));
            const storageKey = StorageHelperKey[`FirstChargeItem${itemNumber}`];
            const oldValue = StorageHelper.getBooleanData(storageKey, false);
            StorageHelper.setBooleanData(storageKey, true);
            console.log(`【3D支付成功】标记首充礼包 ${itemNumber} 已购买，状态变化: ${oldValue} -> true`);
            this.updateItemStatus();
        }
        
        console.log(`【3D支付成功】奖励内容: ${rewardText.join(', ')}`);
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

    // 在类的属性部分添加这些新属性
    private currentBillNo: string = ''; // 当前订单号
    private pollingTimer: any = null;   // 轮询计时器
    private pollingAttempts: number = 0; // 轮询尝试次数
    private readonly MAX_POLLING_ATTEMPTS = 60; // 增加到60次
    private readonly POLLING_INTERVAL = 3000;   // 3秒一次

    // 添加开始轮询方法
    private startPollingPaymentResult() {
        // 先清除可能存在的轮询
        if (this.pollingTimer) {
            console.log(`【3D支付轮询】清除现有轮询定时器`);
            this.stopPolling();
        }
        
        console.log(`【3D支付轮询】开始轮询查询订单 ${this.currentBillNo} 的支付结果`);
        
        // 重置尝试次数
        this.pollingAttempts = 0;
        
        // 立即执行一次查询
        console.log(`【3D支付轮询】立即执行第一次查询`);
        this.queryPaymentResult();
        
        // 设置轮询间隔
        console.log(`【3D支付轮询】设置轮询间隔: ${this.POLLING_INTERVAL}ms, 最大尝试次数: ${this.MAX_POLLING_ATTEMPTS}`);
        this.pollingTimer = setInterval(() => {
            this.pollingAttempts++;
            
            console.log(`【3D支付轮询】执行第 ${this.pollingAttempts + 1} 次查询`);
            // 查询支付结果
            this.queryPaymentResult();
            
            // 如果超过最大尝试次数，停止轮询
            if (this.pollingAttempts >= this.MAX_POLLING_ATTEMPTS) {
                console.log(`【3D支付轮询】订单 ${this.currentBillNo} 轮询超时，已停止查询`);
                this.stopPolling();
                
                // 显示超时提示
                App.view.showMsgTips('支付查询超时，如已支付请稍后检查道具');
            }
        }, this.POLLING_INTERVAL);
        
        console.log(`【3D支付轮询】轮询定时器已设置，ID: ${this.pollingTimer}`);
    }

    // 添加停止轮询方法
    private stopPolling() {
        if (this.pollingTimer) {
            console.log(`【3D支付轮询】停止轮询，清除定时器 ID: ${this.pollingTimer}`);
            clearInterval(this.pollingTimer);
            this.pollingTimer = null;
        } else {
            console.log(`【3D支付轮询】没有活动的轮询定时器需要清除`);
        }
    }

    // 查询支付结果的方法 - 添加更多详细日志
    private async queryPaymentResult() {
        // 如果没有订单号，不进行查询
        if (!this.currentBillNo) {
            console.error('【3D支付错误】没有订单号，无法查询支付结果');
            return;
        }
        
        console.log(`【3D支付轮询】正在查询订单 ${this.currentBillNo} 的支付结果 (第${this.pollingAttempts + 1}次)`);
        
        try {
            // 构建查询URL
            const queryUrl = `http://119.91.142.92:5000/api/payment/status/${this.currentBillNo}`;
            console.log(`【3D支付轮询】查询URL: ${queryUrl}`);
            
            // 查询支付状态API
            console.log(`【3D支付轮询】开始发送请求...`);
            const response = await fetch(queryUrl);
            console.log(`【3D支付轮询】收到响应状态: ${response.status}`);
            
            // 解析响应
            const result = await response.json();
            console.log(`【3D支付轮询】响应数据:`, JSON.stringify(result));
            
            // 处理查询结果
            if (result.success && result.data) {
                console.log(`【3D支付轮询】支付状态: ${result.data.status}`);
                
                // 支付成功
                if (result.data.status === 'PAID') {
                    console.log(`【3D支付成功】订单 ${this.currentBillNo} 支付成功`);
                    
                    // 停止轮询
                    this.stopPolling();
                    
                    // 关闭3D验证对话框
                    this.closeAuth3DDialog();
                    
                    // 处理支付成功逻辑
                    const product = this.products[this.currentProductId];
                    if (product) {
                        console.log(`【3D支付成功】处理商品 ${this.currentProductId}，商品信息:`, JSON.stringify(product));
                        this.handlePaymentSuccess(product, this.currentProductId);
                        console.log(`【3D支付成功】商品处理完成: ${this.currentProductId}`);
                    } else {
                        console.error(`【3D支付错误】支付成功，但无法找到商品 ID: ${this.currentProductId}`);
                        App.view.showMsgTips('支付成功，但商品信息有误');
                    }
                }
                // 支付失败
                else if (result.data.status === 'FAILED') {
                    console.log(`【3D支付失败】订单 ${this.currentBillNo} 支付失败`);
                    
                    // 停止轮询
                    this.stopPolling();
                    
                    // 关闭3D验证对话框
                    this.closeAuth3DDialog();
                    
                    // 显示失败提示
                    App.view.showMsgTips('支付失败，请重试');
                }
                // 处理中状态，继续轮询
                else {
                    console.log(`【3D支付轮询】订单 ${this.currentBillNo} 处理中，继续轮询`);
                }
            } else {
                console.warn(`【3D支付轮询】未获取到有效支付状态，result.success: ${result.success}`);
            }
        } catch (error) {
            console.error(`【3D支付错误】查询支付结果失败:`, error);
            
            // 尝试打印更多错误信息
            if (error instanceof Error) {
                console.error(`【3D支付错误】错误名称: ${error.name}, 错误信息: ${error.message}, 错误堆栈: ${error.stack}`);
            }
        }
    }

    // 添加一个直接测试查询的方法
    public async testQueryPayment(billNo: string) {
        console.log(`【3D支付测试】开始测试查询订单: ${billNo}`);
        this.currentBillNo = billNo;
        
        try {
            const queryUrl = `http://119.91.142.92:5000/api/payment/status/${billNo}`;
            console.log(`【3D支付测试】查询URL: ${queryUrl}`);
            
            const response = await fetch(queryUrl);
            console.log(`【3D支付测试】响应状态: ${response.status}`);
            
            const result = await response.json();
            console.log(`【3D支付测试】响应数据:`, JSON.stringify(result));
            
            if (result.success && result.data) {
                console.log(`【3D支付测试】支付状态: ${result.data.status}`);
                
                if (result.data.status === 'PAID') {
                    console.log(`【3D支付测试】订单支付成功，准备处理商品`);
                    
                    // 停止轮询
                    this.stopPolling();
                    
                    // 关闭3D验证对话框
                    this.closeAuth3DDialog();
                    
                    // 处理支付成功逻辑
                    if (this.currentProductId) {
                        const product = this.products[this.currentProductId];
                        if (product) {
                            console.log(`【3D支付测试】处理商品 ${this.currentProductId}`);
                            this.handlePaymentSuccess(product, this.currentProductId);
                        } else {
                            console.error(`【3D支付测试】无法找到商品: ${this.currentProductId}`);
                        }
                    } else {
                        console.warn(`【3D支付测试】没有当前商品ID，尝试使用默认商品`);
                        // 尝试使用第一个商品作为默认
                        const firstProductId = Object.keys(this.products)[0];
                        if (firstProductId) {
                            const product = this.products[firstProductId];
                            this.handlePaymentSuccess(product, firstProductId);
                        }
                    }
                } else if (result.data.status === 'FAILED') {
                    console.log(`【3D支付测试】订单支付失败`);
                    App.view.showMsgTips('支付失败，请重试');
                } else {
                    console.log(`【3D支付测试】订单处理中: ${result.data.status}`);
                }
            } else {
                console.warn(`【3D支付测试】查询失败: ${result.message || '未知错误'}`);
            }
        } catch (error) {
            console.error(`【3D支付测试】查询异常:`, error);
        }
    }

    // 在组件销毁时清理资源
    onDestroy() {
        // 停止轮询
        this.stopPolling();
        
        // 调用父类方法
        super.onDestroy && super.onDestroy();
    }

    // 添加一个手动查询按钮的点击事件处理函数
    public addQueryButton() {
        console.log(`【3D支付】点击查询按钮，当前订单号: ${this.currentBillNo}`);
        if (this.currentBillNo) {
            this.testQueryPayment(this.currentBillNo);
        } else {
            // 尝试从本地存储获取最近的订单号
            const lastBillNo = localStorage.getItem('lastBillNo');
            if (lastBillNo) {
                console.log(`【3D支付测试】从本地存储获取订单号: ${lastBillNo}`);
                this.testQueryPayment(lastBillNo);
            } else {
                App.view.showMsgTips('没有可查询的订单号');
            }
        }
    }

    // 这个方法可以在浏览器控制台中手动调用
    public async manualTestQuery(billNo: string) {
        console.log(`【手动测试】开始查询订单: ${billNo}`);
        
        try {
            const queryUrl = `http://119.91.142.92:5000/api/payment/status/${billNo}`;
            console.log(`【手动测试】查询URL: ${queryUrl}`);
            
            const response = await fetch(queryUrl);
            console.log(`【手动测试】响应状态: ${response.status}`);
            
            const result = await response.json();
            console.log(`【手动测试】响应数据:`, result);
            
            if (result.success && result.data && result.data.status === 'PAID') {
                console.log(`【手动测试】订单支付成功`);
                
                // 如果需要，可以手动处理支付成功逻辑
                if (this.currentProductId) {
                    const product = this.products[this.currentProductId];
                    if (product) {
                        this.handlePaymentSuccess(product, this.currentProductId);
                    }
                }
            }
            
            return result;
        } catch (error) {
            console.error(`【手动测试】查询失败:`, error);
            return { success: false, error: error.message };
        }
    }
    
    // 手动设置订单号的方法（可在控制台调用）
    public setCurrentBillNo(billNo: string) {
        console.log(`【手动设置】设置当前订单号: ${billNo}`);
        this.currentBillNo = billNo;
        localStorage.setItem('lastBillNo', billNo);
        console.log(`【手动设置】订单号已保存到本地存储`);
    }
    
    // 获取当前订单号的方法（可在控制台调用）
    public getCurrentBillNo(): string {
        console.log(`【获取订单号】当前订单号: ${this.currentBillNo}`);
        const lastBillNo = localStorage.getItem('lastBillNo');
        console.log(`【获取订单号】本地存储订单号: ${lastBillNo}`);
        return this.currentBillNo || lastBillNo || '';
    }
    
    
    // 更新金额标签
    private updateAmountLabel() {
        if (!this.currentProductId) {
            console.warn('没有当前商品ID，无法更新金额标签');
            return;
        }
        
        const product = this.products[this.currentProductId];
        if (!product) {
            console.warn(`未找到商品配置: ${this.currentProductId}`);
            return;
        }
        
        // 查找金额标签节点
        const amountLabelNode = find('PaymentForm/amount', this.node);
        if (amountLabelNode) {
            const labelComp = amountLabelNode.getComponent(Label);
            if (labelComp) {
                labelComp.string = `Amount: $${product.amount}`;
                console.log(`【金额标签】已更新为: Amount: $${product.amount}`);
            } else {
                console.warn('金额标签节点没有Label组件');
            }
        } else {
            console.warn('未找到金额标签节点: PaymentForm/amount');
        }
    }
    payreturn(){

    }
}