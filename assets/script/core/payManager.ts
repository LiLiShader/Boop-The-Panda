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
    cardNum: string;
    month: string;
    year: string;
    cvv2: string;
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
    
    // 存储获取到的真实IP
    private realIp: string = null;

    private constructor() {
        // 私有构造函数，防止直接实例化
    }

    public static getInstance(): PayManager {
        if (!PayManager.instance) {
            PayManager.instance = new PayManager();
        }
        return PayManager.instance;
    }
    
    // 获取真实IP地址
    private async getRealIp(): Promise<string> {
        if (this.realIp) {
            return this.realIp;
        }
        
        try {
            const xhr = new XMLHttpRequest();
            return new Promise((resolve, reject) => {
                xhr.open('GET', 'https://api.ipify.org?format=json', true);
                xhr.onreadystatechange = () => {
                    if (xhr.readyState === 4) {
                        if (xhr.status === 200) {
                            try {
                                const response = JSON.parse(xhr.responseText);
                                this.realIp = response.ip;
                                console.log('获取到真实IP:', this.realIp);
                                resolve(this.realIp);
                            } catch (error) {
                                console.warn('解析IP响应失败，使用默认IP');
                                resolve('127.0.0.1');
                            }
                        } else {
                            console.warn('获取IP失败，使用默认IP');
                            resolve('127.0.0.1');
                        }
                    }
                };
                xhr.onerror = () => {
                    console.warn('获取IP网络错误，使用默认IP');
                    resolve('127.0.0.1');
                };
                xhr.timeout = 5000; // 5秒超时
                xhr.ontimeout = () => {
                    console.warn('获取IP超时，使用默认IP');
                    resolve('127.0.0.1');
                };
                xhr.send();
            });
        } catch (error) {
            console.warn('获取IP异常，使用默认IP:', error);
            return '127.0.0.1';
        }
    }

    // 根据不同环境获取代理服务器地址
    private getProxyUrl(): string {
        return 'http://119.91.142.92:5000/api/pay';
    }

    private generateOrderId(): string {
        const timestampPart = Date.now().toString().slice(-5);
        const randomPart = Math.floor(Math.random() * 10000).toString().padStart(5, '0');
        return (timestampPart + randomPart).substring(0, 10);
    }

    public async requestPay(params: PayParams): Promise<PayResult> {
        try {
            // 获取真实IP地址
            const realIp = await this.getRealIp();
            
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
                ip: realIp,
                cookie: "123",
                phone: params.phone,
                cardBank: "sdfdghdh",
                productInfo: params.productInfo,
                nationalCode: "us",
                cardTypeId: "1",
                cardNum: params.cardNum,
                month: params.month,
                year: params.year,
                cvv2: params.cvv2,
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
                                console.log('支付响应:', response);
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