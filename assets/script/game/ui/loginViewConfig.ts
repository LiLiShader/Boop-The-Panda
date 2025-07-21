/**
 * 登录界面配置
 * 用于管理UI组件引用和布局
 */
export class LoginViewConfig {
    // UI组件名称映射
    public static readonly UI_COMPONENTS = {
        // 输入框
        PID_INPUT: 'pidInput',
        NAME_INPUT: 'nameInput', 
        PASSWORD_INPUT: 'passwordInput',
        
        // 按钮
        LOGIN_BTN: 'loginBtn',
        REGISTER_BTN: 'registerBtn',
        SWITCH_TO_REGISTER_BTN: 'switchToRegisterBtn',
        SWITCH_TO_LOGIN_BTN: 'switchToLoginBtn',
        
        // 其他
        STATUS_LABEL: 'statusLabel',
        TITLE_LABEL: 'titleLabel',
        BACKGROUND: 'background',
        CONTENT: 'content'
    };

    // 默认文本
    public static readonly DEFAULT_TEXTS = {
        TITLE: '游戏登录',
        PID_PLACEHOLDER: '请输入玩家ID',
        NAME_PLACEHOLDER: '请输入昵称',
        PASSWORD_PLACEHOLDER: '请输入密码',
        LOGIN_BTN: '登录',
        REGISTER_BTN: '注册',
        SWITCH_TO_REGISTER: '注册新账号',
        SWITCH_TO_LOGIN: '已有账号',
        STATUS_EMPTY: '',
        STATUS_LOADING: '处理中...',
        STATUS_SUCCESS: '操作成功！',
        STATUS_ERROR: '操作失败，请重试'
    };

    // 颜色配置
    public static readonly COLORS = {
        PRIMARY: '#4CAF50',      // 主色调（绿色）
        SECONDARY: '#2196F3',    // 次要色（蓝色）
        ERROR: '#FF5722',        // 错误色（红色）
        SUCCESS: '#4CAF50',      // 成功色（绿色）
        BACKGROUND: '#FFFFFF',    // 背景色（白色）
        INPUT_BG: '#F5F5F5',     // 输入框背景（浅灰）
        TEXT_PRIMARY: '#333333', // 主文字色（深灰）
        TEXT_SECONDARY: '#666666', // 次要文字色（中灰）
        WHITE: '#FFFFFF'         // 白色
    };

    // 尺寸配置
    public static readonly SIZES = {
        CONTENT_WIDTH: 400,
        CONTENT_HEIGHT: 500,
        INPUT_WIDTH: 300,
        INPUT_HEIGHT: 40,
        BUTTON_WIDTH: 140,
        BUTTON_HEIGHT: 40,
        SWITCH_BUTTON_WIDTH: 120,
        SWITCH_BUTTON_HEIGHT: 30
    };

    // 间距配置
    public static readonly SPACING = {
        CONTAINER_PADDING: 20,
        COMPONENT_MARGIN: 15,
        BUTTON_MARGIN: 20
    };

    // 字体大小配置
    public static readonly FONT_SIZES = {
        TITLE: 24,
        BUTTON: 16,
        INPUT: 14,
        STATUS: 14,
        SWITCH: 12
    };

    // 验证规则
    public static readonly VALIDATION = {
        MIN_PASSWORD_LENGTH: 6,
        MAX_PID_LENGTH: 20,
        MAX_NAME_LENGTH: 30
    };

    // 动画配置
    public static readonly ANIMATION = {
        FADE_DURATION: 0.3,
        BUTTON_SCALE: 0.95,
        BUTTON_DURATION: 0.1,
        BORDER_DURATION: 0.2
    };

    // 获取输入验证错误信息
    public static getValidationError(field: string, value: string): string {
        switch (field) {
            case 'pid':
                if (!value || value.trim() === '') {
                    return '请输入玩家ID';
                }
                if (value.length > this.VALIDATION.MAX_PID_LENGTH) {
                    return `玩家ID不能超过${this.VALIDATION.MAX_PID_LENGTH}个字符`;
                }
                break;
            case 'name':
                if (!value || value.trim() === '') {
                    return '请输入昵称';
                }
                if (value.length > this.VALIDATION.MAX_NAME_LENGTH) {
                    return `昵称不能超过${this.VALIDATION.MAX_NAME_LENGTH}个字符`;
                }
                break;
            case 'password':
                if (!value || value.trim() === '') {
                    return '请输入密码';
                }
                if (value.length < this.VALIDATION.MIN_PASSWORD_LENGTH) {
                    return `密码至少${this.VALIDATION.MIN_PASSWORD_LENGTH}位`;
                }
                break;
        }
        return '';
    }

    // 获取状态文本颜色
    public static getStatusColor(type: 'success' | 'error' | 'info'): string {
        switch (type) {
            case 'success':
                return this.COLORS.SUCCESS;
            case 'error':
                return this.COLORS.ERROR;
            case 'info':
            default:
                return this.COLORS.TEXT_SECONDARY;
        }
    }
} 