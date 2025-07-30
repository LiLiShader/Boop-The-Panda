import { _decorator, Component, EditBox, Button, Label, Node, Prefab, instantiate, ScrollView } from 'cc';
import { ServerConfig } from '../../config/serverConfig';
const { ccclass, property } = _decorator;

@ccclass('AdminViewCmpt')
export class AdminViewCmpt extends Component {
    @property(EditBox)
    inputUserId: EditBox = null;

    @property(Button)
    queryBtn: Button = null;

    @property(Button)
    queryAllBtn: Button = null;

    @property(Label)
    userInfoLabel: Label = null;

    @property(ScrollView)
    scrollView: ScrollView = null;

    @property(Prefab)
    payOrderItemPrefab: Prefab = null;

    @property(Node)
    content: Node = null;

    onLoad() {
        this.queryBtn.node.on(Button.EventType.CLICK, this.onQuery, this);
        this.queryAllBtn.node.on(Button.EventType.CLICK, this.onQueryAll, this);
    }

    async onQuery() {
        const pid = this.inputUserId.string.trim();
        if (!pid) {
            this.userInfoLabel.string = 'Please enter User ID';
            this.clearPayList();
            return;
        }
        // 查询用户信息 - 使用统一配置
        const userResp = await fetch(`${ServerConfig.getMainServerAPI()}/users/${pid}`);
        const user = await userResp.json();
        if (!user.success) {
            this.userInfoLabel.string = 'User not found';
            this.clearPayList();
            return;
        }
        // this.userInfoLabel.string = `UserID: ${user.data.pid}\nName: ${user.data.name}\nLevel: ${user.data.level}\nGold: ${user.data.gold}\nCreated: ${user.data.created_at}`;
        this.userInfoLabel.string = `UserID: ${user.data.pid}\nName: ${user.data.name}\nCreated: ${user.data.created_at}`;
        // 查询支付记录 - 使用统一配置
        const payResp = await fetch(`${ServerConfig.getMainServerAPI()}/payments/user/${pid}`);
        const pay = await payResp.json();
        this.updatePayList(pay.success ? pay.data : []);
    }

    async onQueryAll() {
        // 查询所有支付订单 - 使用统一配置
        const resp = await fetch(`${ServerConfig.getMainServerAPI()}/payments/all`);
        const result = await resp.json();
        if (!result.success) {
            this.userInfoLabel.string = 'Query failed';
            this.clearPayList();
            return;
        }
        this.userInfoLabel.string = 'All payment records:';
        this.updatePayList(result.data);
    }

    updatePayList(payList: any[]) {
        this.content.removeAllChildren();
        if (!payList || payList.length === 0) {
            const node = instantiate(this.payOrderItemPrefab);
            node.getChildByName('info').getComponent(Label).string = 'No payment records.';
            this.content.addChild(node);
            return;
        }
        payList.forEach(item => {
            const node = instantiate(this.payOrderItemPrefab);
            node.getChildByName('info').getComponent(Label).string =
                `UserID: ${item.user_id}  Name: ${item.user_name}\nOrder No: ${item.order_no}  Amount: ${item.amount}  Pay Time: ${item.pay_time}`;
            this.content.addChild(node);
        });
    }

    clearPayList() {
        this.content.removeAllChildren();
        const node = instantiate(this.payOrderItemPrefab);
        node.getChildByName('info').getComponent(Label).string = 'No payment records.';
        this.content.addChild(node);
    }
} 