import { _decorator, Component, EditBox, Button, Label, Node, Prefab, instantiate, ScrollView } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('AdminViewCmpt')
export class AdminViewCmpt extends Component {
    @property(EditBox)
    inputUserId: EditBox = null;

    @property(Button)
    queryBtn: Button = null;

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
    }

    async onQuery() {
        const pid = this.inputUserId.string.trim();
        if (!pid) {
            this.userInfoLabel.string = 'Please enter User ID';
            this.clearPayList();
            return;
        }
        // 查询用户信息
        const userResp = await fetch(`http://119.91.142.92:3001/api/users/${pid}`);
        const user = await userResp.json();
        if (!user.success) {
            this.userInfoLabel.string = 'User not found';
            this.clearPayList();
            return;
        }
        // this.userInfoLabel.string = `UserID: ${user.data.pid}\nName: ${user.data.name}\nLevel: ${user.data.level}\nGold: ${user.data.gold}\nCreated: ${user.data.created_at}`;
        this.userInfoLabel.string = `UserID: ${user.data.pid}\nName: ${user.data.name}\nCreated: ${user.data.created_at}`;
        // 查询支付记录
        const payResp = await fetch(`http://119.91.142.92:3001/api/payments/user/${pid}`);
        const pay = await payResp.json();
        this.updatePayList(pay.success ? pay.data : []);
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
                `Order No: ${item.order_no}  Amount: ${item.amount}  Pay Time: ${item.pay_time}`;
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