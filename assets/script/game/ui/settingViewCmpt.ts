import { _decorator, Component, find, instantiate, Node, RichText } from 'cc';
import { BaseViewCmpt } from '../../components/baseViewCmpt';
import { PageIndex } from '../../const/enumConst';
import { EventName } from '../../const/eventName';
import { LevelConfig } from '../../const/levelConfig';
import { App } from '../../core/app';
import { ServerConfig } from '../../config/serverConfig';
import { CocosHelper } from '../../utils/cocosHelper';
import { GlobalFuncHelper } from '../../utils/globalFuncHelper';
import { StorageHelper, StorageHelperKey } from '../../utils/storageHelper';
import { ToolsHelper } from '../../utils/toolsHelper';
import { WxManager, WxMgr } from '../../wx/wxManager';
import { Label, Prefab, Button } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('settingViewCmpt')
export class settingViewCmpt extends BaseViewCmpt {
    private lbName: Node = null;
    private lbHeart: Node = null;
    private head: Node = null;
    private content: Node = null;
    
    // 支付记录详情面板相关
    private infoBG: Node = null;
    private infoMask: Node = null;
    private infoContent: Node = null;
    private infoTitle: Node = null;
    private infoContentLabel: RichText = null;
    private infoClose: Node = null;
    
    onLoad() {
        for (let i = 1; i < 10; i++) {
            this[`onClick_head${i}`] = this.onClickHead.bind(this);
        }
        super.onLoad();
        this.lbName = this.viewList.get('lbName');
        this.lbHeart = this.viewList.get('animNode/content/p/lbHeart');
        this.content = this.viewList.get('scrollview/view/content');
        this.head = this.viewList.get('bg/head');
        
        // 获取InfoBG面板相关节点
        this.infoBG = find('InfoBG', this.node);
        this.infoMask = find('InfoBG/InfoMask', this.node);
        this.infoContent = find('InfoBG/InfoContent', this.node);
        this.infoTitle = find('InfoBG/InfoContent/Title', this.node);
        this.infoContentLabel = find('InfoBG/InfoContent/Content', this.node).getComponent(RichText)
        
        this.infoClose = this.viewList.get('InfoBG/InfoContent/Close');
        
        // 绑定关闭事件
        if (this.infoClose) {
            this.infoClose.on('click', this.hideInfoDetail, this);
        }
        if (this.infoMask) {
            this.infoMask.on('click', this.hideInfoDetail, this);
        }
        
        this.updateOperateStatus();
        
        // 默认隐藏详情面板
        this.hideInfoDetail();

        find("bg/ID",this.node).getComponent(Label).string = "👤 UserID:"+ App.user.currentUser.pid;
    }

    // 显示详情面板
    private showInfoDetail(content: string) {
        if (this.infoBG) {
            this.infoBG.active = true;
        }
        if (this.infoContentLabel) {
            this.infoContentLabel.string = content;
        }
    }

    // 隐藏详情面板
    private hideInfoDetail() {
        if (this.infoBG) {
            this.infoBG.active = false;
        }
    }

    updateOperateStatus() {
        if (this.viewList.get('bg/btnSound/off')) {
            this.viewList.get('bg/btnSound/off').active = !StorageHelper.getBooleanData(StorageHelperKey.Music_Eff_Status);
            this.viewList.get('bg/btnMusic/off').active = !StorageHelper.getBooleanData(StorageHelperKey.Music_Status);
        } else {
            this.viewList.get('animNode/content/btnSound/off').active = !StorageHelper.getBooleanData(StorageHelperKey.Music_Eff_Status);
            this.viewList.get('animNode/content/btnMusic/off').active = !StorageHelper.getBooleanData(StorageHelperKey.Music_Status);
        }
        if (this.lbHeart) {
            CocosHelper.updateLabelText(this.lbHeart, "x" + GlobalFuncHelper.getHeart());
        }
        if (!this.lbName) return;
        CocosHelper.updateLabelText(this.lbName, App.user.rankData.name);
        this.updateHead();
        this.updateHeadInfo(`head${App.user.rankData.icon}`)
    }

    loadExtraData() {
        App.audio.play('UI_PopUp');
    }

    updateHead() {
        if (this.head) {
            CocosHelper.updateUserHeadSpriteAsync(this.head, App.user.rankData.icon);
        }
    }

    onClick_btnSound() {
        App.audio.play('button_click');
        StorageHelper.setBooleanData(StorageHelperKey.Music_Eff_Status, !StorageHelper.getBooleanData(StorageHelperKey.Music_Eff_Status))
        this.updateOperateStatus();
    }

    onClick_btnMusic() {
        App.audio.play('button_click');
        StorageHelper.setBooleanData(StorageHelperKey.Music_Status, !StorageHelper.getBooleanData(StorageHelperKey.Music_Status))
        this.updateOperateStatus();
    }

    onClickHead(btn: Node) {
        App.audio.play('button_click');
        this.updateHeadInfo(btn.name);
        let icon = +btn.name.substring(btn.name.length - 1, btn.name.length);
        App.user.rankData.icon = icon;
        GlobalFuncHelper.setIcon(icon);
        this.updateHead();
    }

    updateHeadInfo(name: string) {
        if (!this.head) return;
        this.content.children.forEach(item => {
            item.getChildByName('s').active = item.name == name;
        });
    }

    onClick_replayBtn() {
        this.onClick_closeBtn();
        App.audio.play('button_click');
        let heart = GlobalFuncHelper.getHeart();
        if (heart == 0) {
            App.view.showMsgTips("生命值不足")
            App.backHome(false, PageIndex.shop);
            return;
        }
        App.event.emit(EventName.Game.Restart);
        GlobalFuncHelper.setHeart(-1)
    }

    onClick_homeBtn() {
        App.audio.play('button_click');
        this.onClick_closeBtn();
        App.backHome();
    }

    async showPayInfo() {
        // 获取当前用户ID
        const user = App.user.currentUser;
        if (!user || !user.pid) {
            console.warn('未登录，无法查询支付记录');
            // App.view.showMsgTips('请先登录后再查看支付记录');
            return;
        }
        // 请求后端API - 使用统一配置
        const resp = await fetch(`${ServerConfig.getMainServerAPI()}/users/${user.pid}/payments`);
        const result = await resp.json();
        if (result.success) {
            console.log('支付记录：', result.data);
            // 更新UI并显示提示
            this.updatePayInfoUI(result.data);
            if (result.data && result.data.length > 0) {
                // App.view.showMsgTips('点击任意支付记录可查看详细信息');
            }
        } else {
            console.error('查询支付记录失败', result.message);
            // App.view.showMsgTips('查询支付记录失败，请稍后重试');
        }
    }
    
    @property(Node)
    payContent: Node = null;
    @property(Prefab)
    PayInfoItem: Prefab = null;

    /**
     * 格式化支付时间，参照运维后台格式
     * @param dateString 时间字符串
     * @returns 格式化后的时间字符串
     */
    formatPayTime(dateString: string): string {
        if (!dateString) return '未知';
        
        try {
            const date = new Date(dateString);
            
            // 检查日期是否有效
            if (isNaN(date.getTime())) {
                console.warn('无效的日期字符串:', dateString);
                return dateString;
            }
            
            // 使用中国时区格式化，参照运维后台格式
            return date.toLocaleString('zh-CN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                timeZone: 'Asia/Shanghai'
            });
        } catch (error) {
            console.error('格式化支付时间出错:', error, dateString);
            return dateString;
        }
    }

    updatePayInfoUI(payList: any[]) {
        // 清空原有内容
        this.payContent.removeAllChildren();
        if (!payList || payList.length === 0) {
            // 没有支付记录
            const node = instantiate(this.PayInfoItem);
            node.getChildByName("info").getComponent(Label).string = `No payment records.`;
            this.payContent.addChild(node);
            return;
        }
        // 遍历支付记录，生成条目
        payList.forEach((item, index) => {
            const node = instantiate(this.PayInfoItem);
            const formattedTime = this.formatPayTime(item.pay_time);
            node.getChildByName("info").getComponent(Label).string = `Order No: ${item.order_no}  Amount: ${item.amount}  Pay Time: ${formattedTime}`;
            
            // 为每个条目添加点击事件
            const button = node.addComponent(Button);
            button.node.on('click', () => {
                this.showPaymentDetail(item);
            });
            
            this.payContent.addChild(node);
        });
    }

    // 显示支付记录详情
    private showPaymentDetail(paymentData: any) {
        // 解析商品详情
        let productDetails = '';
        console.log(paymentData.product_details);
        try {
            if (paymentData.product_details) {
                const details = typeof paymentData.product_details === 'string' 
                    ? JSON.parse(paymentData.product_details) 
                    : paymentData.product_details;
                
                const items = [];
                if (details.diamonds) {
                    items.push(`💎 Diamonds: ${details.diamonds}`);
                }
                if (details.bombBomb) {
                    items.push(`💣 Bombs: ${details.bombBomb}`);
                }
                if (details.bombHor) {
                    items.push(`➡️ Horizontal Bombs: ${details.bombHor}`);
                }
                if (details.bombVer) {
                    items.push(`⬇️ Vertical Bombs: ${details.bombVer}`);
                }
                if (details.bombAllSame) {
                    items.push(`🎯 Same Type Bombs: ${details.bombAllSame}`);
                }
                if (details.isFirstCharge) {
                    items.push(`🎁 First Charge Gift: Yes`);
                }
                
                productDetails = items.length > 0 ? items.join('\n') : 'No product details';
            }
        } catch (e) {
            console.error('Failed to parse product details:', e);
            productDetails = 'Failed to parse product details';
        }
        
        // 解析原始响应
        let rawResponseText = '';
        try {
            if (paymentData.raw_response) {
                const rawResponse = typeof paymentData.raw_response === 'string' 
                    ? JSON.parse(paymentData.raw_response) 
                    : paymentData.raw_response;
                // 格式化JSON，使其更易读
                const formattedResponse = JSON.stringify(rawResponse, null, 2);
                // 限制显示长度，避免过长
                rawResponseText = formattedResponse.length > 500 ? 
                    formattedResponse.substring(0, 500) + '...' : 
                    formattedResponse;
            }
        } catch (e) {
            console.error('Failed to parse raw response:', e);
            rawResponseText = 'Failed to parse raw response';
        }
        
        // 从product_info中提取数字
        let extractedNumbers = '';
        if (paymentData.product_info) {
            // 提取所有数字
            const numbers = paymentData.product_info.match(/\d+/g);
            if (numbers && numbers.length > 0) {
                extractedNumbers = `${numbers.join(', ')}`;
            }
        }
        console.log(extractedNumbers);
        // 组装详情内容
        const detailContent = `👤 User Information
User ID: ${paymentData.user_id || 'Unknown'}
Username: ${paymentData.user_name || 'Unknown'}

📋 Order Information
Order No: ${paymentData.order_no || 'Unknown'}
Amount: $${paymentData.amount || 0}
Pay Time: ${this.formatPayTime(paymentData.pay_time) || 'Unknown'}

🎮 Product Details
${"diamonds:"+extractedNumbers }


`;
        console.log(detailContent);
        // 显示详情面板
        this.showInfoDetail(detailContent);
    }

    clickPaymentPolicy() {
        App.audio.play('button_click');
        //跳转到网页
        window.open('https://game-yjps-5gspem0v9bdab6ef-1308501080.tcloudbaseapp.com/wd/PAYMENT%20POLICY.html', '_blank');
    }
    //https://game-yjps-5gspem0v9bdab6ef-1308501080.tcloudbaseapp.com/wd/PRIVACY%20POLICY.html
    clickPrivacyPolicy() {
        App.audio.play('button_click');
        //跳转到网页
        window.open('https://game-yjps-5gspem0v9bdab6ef-1308501080.tcloudbaseapp.com/wd/PRIVACY%20POLICY.html', '_blank');
    }
    //https://game-yjps-5gspem0v9bdab6ef-1308501080.tcloudbaseapp.com/wd/terms-of-use.html
    clickTermsOfUse() {
        App.audio.play('button_click');
        //跳转到网页
        window.open('https://game-yjps-5gspem0v9bdab6ef-1308501080.tcloudbaseapp.com/wd/terms-of-use.html', '_blank');
    }
}