import { _decorator, sys } from 'cc';
import { MD5 } from '../utils/md5';
import { App } from './app';

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
    auth3DUrl?: string; // 添加3D验证URL字段
}

export class PayManager {
    private static instance: PayManager = null;
    
    // 修改代理服务器地址逻辑，适配所有环境
    private readonly PROXY_URL = this.getProxyUrl();
        
    // 支付参数配置
    private readonly merNo = '100140'; // 正常支付商户号
    private readonly md5Key = '^Qdb}Kzy'; // 正常支付密钥
    
    // 3D支付测试参数
    private readonly test3DMerNo = '100204'; // 3D支付测试商户号
    private readonly test3DMd5Key = 'Dp}MwSfW'; // 3D支付测试密钥
    
    // 是否开启3D支付测试模式
    private enableTest3D = false;

    // 3D支付回调URL
    private readonly returnURL = 'http://119.91.142.92:5001/api/get3DResult';
    
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
    
    // 设置是否开启3D支付测试
    public setTest3DMode(enable: boolean): void {
        this.enableTest3D = enable;
        console.log(`3D支付测试模式: ${enable ? '开启' : '关闭'}`);
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
            
            // 根据3D测试模式选择使用的商户号和密钥
            const currentMerNo = this.enableTest3D ? this.test3DMerNo : this.merNo;
            const currentMd5Key = this.enableTest3D ? this.test3DMd5Key : this.md5Key;
            
            const billNo = currentMerNo + this.generateOrderId();
            // 使用3D支付回调URL
            const signStr = currentMerNo + billNo + params.currency + params.amount + this.returnURL + currentMd5Key;
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
                md5_key: currentMd5Key,
                currency: params.currency,
                language: "en",
                merNo: currentMerNo,
                returnURL: this.returnURL,  // 使用3D支付回调URL
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
                                
                                if (response.code === 'P0001') {
                                    // 2D支付成功时，自动上传支付记录
                                    this.handlePaymentSuccess(response, data);
                                    resolve({
                                        code: response.code,
                                        message: response.message || '支付成功',
                                        data: response
                                    });
                                } else if (response.code === 'P0004' && response.auth3DUrl) {
                                    // 3D支付处理
                                    console.log('需要3D验证，验证URL:', response.auth3DUrl);
                                    resolve({
                                        code: response.code,
                                        message: '需要3D验证',
                                        data: response,
                                        auth3DUrl: response.auth3DUrl  // 返回3D验证URL
                                    });
                                } else {
                                    // 其他情况，返回错误信息
                                    resolve({
                                        code: response.code || 'ERROR',
                                        message: response.message || '支付失败',
                                        data: response
                                    });
                                }
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

    // 处理支付成功逻辑
    private handlePaymentSuccess(response: any, requestData: any) {
        // 获取当前用户信息
        const user = (typeof App !== 'undefined' && App.user && App.user.currentUser) ? App.user.currentUser : { pid: '', name: '' };
        
        // 解析商品信息
        const productInfo = decodeURIComponent(requestData.productInfo || '');
        
        // 尝试获取商品ID和商品详情
        let productId = '';
        let productDetails = {};
        
        // 从productInfo中提取商品ID (例如：钻石礼包-12钻石)
        if (productInfo.includes('钻石礼包-')) {
            const diamondsMatch = productInfo.match(/钻石礼包-(\d+)钻石/);
            if (diamondsMatch && diamondsMatch[1]) {
                // 根据钻石数量和金额查找对应的商品ID
                const diamonds = parseInt(diamondsMatch[1]);
                const amount = requestData.amount;
                
                // 遍历商品配置查找匹配的商品
                for (let i = 1; i <= 14; i++) {
                    if (
                        (i <= 5 && amount === '8' && diamonds === 12) ||
                        (i <= 5 && amount === '20' && diamonds === 40) ||
                        (i <= 5 && amount === '40' && diamonds === 70) ||
                        (i <= 5 && amount === '80' && diamonds === 140) ||
                        (i <= 5 && amount === '100' && diamonds === 180) ||
                        (i === 6 && amount === '8' && diamonds === 24) ||
                        (i === 7 && amount === '20' && diamonds === 80) ||
                        (i === 8 && amount === '40' && diamonds === 140) ||
                        (i === 9 && amount === '80' && diamonds === 280) ||
                        (i === 10 && amount === '100' && diamonds === 360) ||
                        (i === 11 && amount === '200' && diamonds === 50) ||
                        (i === 12 && amount === '500' && diamonds === 200) ||
                        (i === 13 && amount === '1000') ||
                        (i === 14 && amount === '1500' && diamonds === 1000)
                    ) {
                        productId = `itemBtn${i}`;
                        break;
                    }
                }
                
                // 根据商品ID设置商品详情
                if (productId) {
                    if (productId === 'itemBtn11') {
                        productDetails = {
                            diamonds: 50,
                            bombBomb: 3,
                            bombHor: 3,
                            bombVer: 5,
                            bombAllSame: 2
                        };
                    } else if (productId === 'itemBtn12') {
                        productDetails = {
                            diamonds: 200,
                            bombBomb: 5,
                            bombHor: 5,
                            bombVer: 10,
                            bombAllSame: 3
                        };
                    } else if (productId === 'itemBtn13') {
                        productDetails = {
                            bombBomb: 10,
                            bombHor: 10,
                            bombVer: 20,
                            bombAllSame: 5
                        };
                    } else if (productId === 'itemBtn14') {
                        productDetails = {
                            diamonds: 1000,
                            bombBomb: 20,
                            bombHor: 20,
                            bombAllSame: 10
                        };
                    } else if (parseInt(productId.replace('itemBtn', '')) <= 10) {
                        // 普通钻石礼包或首充礼包
                        productDetails = {
                            diamonds: diamonds,
                            isFirstCharge: parseInt(productId.replace('itemBtn', '')) >= 6
                        };
                    }
                }
            }
        }
        
        // 组装支付记录数据
        const recordData = {
            user_id: user.pid || '',
            user_name: user.name || '',
            amount: parseFloat(response.amount || response.data?.amount || 0),
            order_no: response.orderNo || response.data?.orderNo || '',
            pay_time: new Date().toISOString().replace('T', ' ').substring(0, 19),
            raw_response: response,
            product_id: productId,
            product_info: productInfo,
            product_details: productDetails
        };
        // 上传到后端
        fetch('http://119.91.142.92:3001/api/payments/record', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(recordData)
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                console.log('支付记录已上传');
            } else {
                console.error('支付记录上传失败', data.message);
            }
        })
        .catch(err => {
            console.error('支付记录上传异常', err);
        });
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