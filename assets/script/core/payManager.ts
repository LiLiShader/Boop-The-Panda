import { _decorator, sys } from 'cc';
import { MD5 } from '../utils/md5';

export interface PayParams {
    amount: string;
    currency: string;
    productInfo: string;
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
}

export interface PayResult {
    code: string;
    message: string;
    data?: any;
}

export class PayManager {
    private static instance: PayManager = null;
    private readonly API_URL = 'https://testurl.carespay.com:28081/carespay/pay';
    private readonly PROXY_URL = 'http://localhost:3000/api/pay'; // 代理服务器地址
    private readonly merNo = '100140';
    private readonly md5Key = '^Qdb}Kzy';

    private constructor() {
        // 私有构造函数，防止直接实例化
    }

    public static getInstance(): PayManager {
        if (!PayManager.instance) {
            PayManager.instance = new PayManager();
        }
        return PayManager.instance;
    }

    private generateOrderId(): string {
        const timestampPart = Date.now().toString().slice(-5);
        const randomPart = Math.floor(Math.random() * 10000).toString().padStart(5, '0');
        return (timestampPart + randomPart).substring(0, 10);
    }

    // 判断是否为开发环境
    private isDevelopment(): boolean {
        const currentUrl = window.location.href;
        return currentUrl.includes('localhost') || currentUrl.includes('127.0.0.1');
    }

    public async requestPay(params: PayParams): Promise<PayResult> {
        try {
            const billNo = this.merNo + this.generateOrderId();
            const signStr = this.merNo + billNo + params.currency + params.amount + "123" + this.md5Key;
            const sign = MD5.hex_md5(signStr);

            const data = {
                shippingEmail: params.email,
                shippingPhone: params.phone,
                shippingCountry: params.country,
                shippingState: params.state,
                shippingFirstName: params.firstName,
                shippingLastName: params.lastName,
                shippingAddress: params.address,
                apartment: "",
                shippingZipCode: params.zipCode,
                shippingCity: params.city,
                billNo: billNo,
                md5_key: this.md5Key,
                currency: params.currency,
                language: "en",
                merNo: this.merNo,
                returnURL: "123",
                noticeUrl: "aaa",
                tradeUrl: "bbb",
                lastName: params.lastName,
                firstName: params.firstName,
                country: params.country,
                state: params.state,
                city: params.city,
                address: params.address,
                zipCode: params.zipCode,
                email: params.email,
                ip: "127.0.0.1",
                cookie: "123",
                phone: params.phone,
                cardBank: "sdfdghdh",
                productInfo: params.productInfo,
                nationalCode: "us",
                cardTypeId: "1",
                cardNum: "4111111111111111",
                month: "09",
                year: "2029",
                cvv2: "123",
                amount: params.amount,
                md5Info: sign
            };

            try {
                // 使用原生平台的网络请求来避免跨域问题
                if (sys.platform === sys.Platform.ANDROID) {
                    // Android平台使用JSB调用原生网络请求
                    // @ts-ignore
                    return jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "sendPayRequest", "(Ljava/lang/String;Ljava/lang/String;)V", this.API_URL, JSON.stringify(data));
                } else if (sys.platform === sys.Platform.IOS) {
                    // iOS平台使用JSB调用原生网络请求
                    // @ts-ignore
                    return jsb.reflection.callStaticMethod("AppController", "sendPayRequest:withData:", this.API_URL, JSON.stringify(data));
                } else if (sys.platform === sys.Platform.WECHAT_GAME) {
                    // 微信小游戏平台使用wx.request
                    return new Promise((resolve, reject) => {
                        // @ts-ignore
                        wx.request({
                            url: this.API_URL,
                            method: 'POST',
                            data: data,
                            header: {
                                'content-type': 'application/x-www-form-urlencoded'
                            },
                            success: (res) => {
                                resolve({
                                    code: res.data.code || 'ERROR',
                                    message: res.data.message || '支付失败',
                                    data: res.data
                                });
                            },
                            fail: (err) => {
                                reject({
                                    code: 'ERROR',
                                    message: err.errMsg || '支付请求失败'
                                });
                            }
                        });
                    });
                } else {
                    // Web平台
                    const xhr = new XMLHttpRequest();
                    return new Promise((resolve, reject) => {
                        // 根据环境选择请求URL
                        const requestUrl = this.isDevelopment() ? this.PROXY_URL : this.API_URL;
                        console.log('当前环境:', this.isDevelopment() ? '开发环境' : '生产环境');
                        console.log('请求URL:', requestUrl);

                        xhr.open('POST', requestUrl, true);
                        // 统一使用URL编码格式
                        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
                        xhr.onreadystatechange = () => {
                            if (xhr.readyState === 4) {
                                if (xhr.status === 200) {
                                    const response = JSON.parse(xhr.responseText);
                                    resolve({
                                        code: response.code || 'ERROR',
                                        message: response.message || '支付失败',
                                        data: response
                                    });
                                } else {
                                    reject({
                                        code: 'ERROR',
                                        message: xhr.statusText || '网络错误'
                                    });
                                }
                            }
                        };
                        xhr.onerror = () => reject({
                            code: 'ERROR',
                            message: '网络错误'
                        });
                        
                        // 统一使用URL编码格式发送数据
                        xhr.send(this.objectToQueryString(data));
                    });
                }
            } catch (error) {
                console.error('支付请求失败:', error);
                return {
                    code: 'ERROR',
                    message: error.message || '支付请求失败'
                };
            }
        } catch (error) {
            console.error('支付参数处理失败:', error);
            return {
                code: 'ERROR',
                message: error.message || '支付参数处理失败'
            };
        }
    }

    private objectToQueryString(obj: any): string {
        const parts = [];
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                const value = obj[key];
                if (value !== null && value !== undefined) {
                    parts.push(encodeURIComponent(key) + '=' + encodeURIComponent(value));
                }
            }
        }
        return parts.join('&');
    }
} 