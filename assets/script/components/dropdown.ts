import { _decorator, Component, Node, Label, EventHandler, Button, Prefab, instantiate } from 'cc';
const { ccclass, property } = _decorator;

/**
 * 简易Dropdown组件：
 * - 支持设置选项
 * - 支持获取当前选中项
 * - 支持选中变化事件
 * - 依赖Label显示当前选中项，Button点击弹出下拉列表
 */
@ccclass('Dropdown')
export class Dropdown extends Component {
    @property({ type: [String] })
    public options: string[] = [];

    @property({ type: Label })
    public label: Label = null;

    @property({ type: Node })
    public optionsPanel: Node = null; // 下拉面板节点（ScrollView/view节点）

    @property({ type: Node })
    public content: Node = null; // ScrollView的content节点，所有选项都加到这里

    @property({ type: Prefab })
    public optionItemPrefab: Prefab = null; // 选项节点预制体

    @property
    public defaultIndex: number = 0;

    private _selectedIndex: number = 0;
    private _onChange: EventHandler[] = [];

    // 静态常用选项
    public static US_STATES = [
        'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia',
        'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland',
        'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey',
        'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina',
        'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'
    ];
    public static CANADA_STATES = [
        'Alberta', 'British Columbia', 'Manitoba', 'New Brunswick', 'Newfoundland and Labrador', 'Nova Scotia', 'Ontario',
        'Prince Edward Island', 'Quebec', 'Saskatchewan', 'Northwest Territories', 'Nunavut', 'Yukon'
    ];

    onLoad() {
        this.setOptions(this.options);
        this.select(this.defaultIndex);
        if (this.node.getComponent(Button)) {
            this.node.on(Button.EventType.CLICK, this.togglePanel, this);
        }
        if (this.optionsPanel) {
            this.optionsPanel.active = false;
        }
    }

    setOptions(options: string[]) {
        this.options = options;
        if (!this.content || !this.optionItemPrefab) return;
        // 清空旧选项
        this.content.removeAllChildren();
        // 动态生成新选项
        for (let i = 0; i < options.length; i++) {
            const item = instantiate(this.optionItemPrefab);
            const label = item.getComponent(Label) || item.getComponentInChildren(Label);
            if (label) label.string = options[i];
            item.active = true;
            item.on(Button.EventType.CLICK, () => this.select(i), this);
            this.content.addChild(item);
        }
    }

    select(index: number) {
        if (index < 0 || index >= this.options.length) return;
        this._selectedIndex = index;
        if (this.label) this.label.string = this.options[index];
        if (this.optionsPanel) this.optionsPanel.active = false;
        this.emitChange();
    }

    getSelectedLabel(): string {
        return this.options[this._selectedIndex] || '';
    }

    getSelectedIndex(): number {
        return this._selectedIndex;
    }

    togglePanel() {
        if (this.optionsPanel) {
            this.optionsPanel.active = !this.optionsPanel.active;
        }
    }

    onChange(handler: EventHandler) {
        this._onChange.push(handler);
    }

    emitChange() {
        for (const handler of this._onChange) {
            handler.emit([this.getSelectedLabel(), this.getSelectedIndex()]);
        }
        this.node.emit('change');
    }
} 