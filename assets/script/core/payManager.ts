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
    
    // 修改代理服务器地址逻辑，适配所有环境
    private readonly PROXY_URL = this.getProxyUrl();
        
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

    // 根据不同环境获取代理服务器地址
    private getProxyUrl(): string {
        // 开发环境
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            return 'http://localhost:3000/api/pay';
        }
        
        // 生产环境 - 使用相对路径，避免协议和域名问题
        return '/api/pay';
    }

    private generateOrderId(): string {
        const timestampPart = Date.now().toString().slice(-5);
        const randomPart = Math.floor(Math.random() * 10000).toString().padStart(5, '0');
        return (timestampPart + randomPart).substring(0, 10);
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
                // 统一使用XMLHttpRequest发送请求
                const xhr = new XMLHttpRequest();
                return new Promise((resolve, reject) => {
                    console.log('请求URL:', this.PROXY_URL);
                    console.log('请求参数:', data);

                    xhr.open('POST', this.PROXY_URL, true);
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