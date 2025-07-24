import { sys } from "cc";
import { App } from "../core/app";

/**
 * H5网页游戏插屏广告管理器
 * 用于在游戏中随机显示插屏广告
 */
export class RandomAdManager {
    private static _instance: RandomAdManager = null;

    // 广告配置
    private config = {
        // 是否启用随机广告
        enabled: true,
        // 两次广告之间的最小间隔时间(秒)
        minIntervalTime: 60,
        // 随机触发概率 (0-1)
        triggerProbability: 0.3,
        // 游戏开始后多久才能显示第一个广告(秒)
        initialDelay: 30,
        // 是否使用Google Ad Placement API
        useGoogleAdPlacement: true
    };

    // 上次显示广告的时间
    private lastAdTime: number = 0;
    // 游戏开始时间
    private gameStartTime: number = 0;
    // 是否已初始化
    private initialized: boolean = false;
    // 广告是否准备好
    private adReady: boolean = false;
    // 广告是否正在显示
    private adShowing: boolean = false;
    // Google Ad Placement API的adBreak函数
    private adBreak: Function = null;

    public static get instance() {
        if (null == this._instance) {
            this._instance = new RandomAdManager();
        }
        return this._instance;
    }

    constructor() {
        this.gameStartTime = Date.now();
    }

    /**
     * 初始化广告
     */
    public init() {
        if (this.initialized) return;
        
        console.log("初始化H5随机广告管理器");
        
        // 检查是否在浏览器环境中运行
        if (!sys.isBrowser) {
            console.log("非浏览器环境，广告功能不可用");
            return;
        }
        
        if (this.config.useGoogleAdPlacement) {
            this.initGoogleAdPlacement();
        } else {
            this.initGenericAd();
        }
        
        this.initialized = true;
        this.lastAdTime = Date.now();
    }

    /**
     * 初始化Google Ad Placement API
     */
    private initGoogleAdPlacement() {
        // 检查全局window对象是否存在adBreak函数
        if (window['adBreak']) {
            this.adBreak = window['adBreak'];
            this.adReady = true;
            console.log("Google Ad Placement API已就绪");
        } else {
            console.warn("Google Ad Placement API未找到，请确保在HTML中正确引入了广告脚本");
            // 尝试加载Google Ad Placement API
            this.loadGoogleAdPlacementScript();
        }
    }

    /**
     * 加载Google Ad Placement API脚本
     */
    private loadGoogleAdPlacementScript() {
        // 这里应该由游戏开发者在HTML中提前加载广告脚本
        // 这里只是提供一个动态加载的示例
        console.log("尝试动态加载Google Ad Placement API脚本");
        
        const script = document.createElement('script');
        script.async = true;
        script.dataset.adFrequencyHint = "30s";
        script.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX"; // 替换为你的发布商ID
        script.crossOrigin = "anonymous";
        script.onload = () => {
            // 初始化adBreak函数
            if (!window['adsbygoogle']) window['adsbygoogle'] = [];
            window['adBreak'] = window['adConfig'] = function(o) {window['adsbygoogle'].push(o)};
            this.adBreak = window['adBreak'];
            this.adReady = true;
            console.log("Google Ad Placement API脚本加载成功");
        };
        script.onerror = () => {
            console.error("Google Ad Placement API脚本加载失败");
            this.adReady = false;
        };
        
        document.head.appendChild(script);
    }

    /**
     * 初始化通用广告
     */
    private initGenericAd() {
        // 这里可以实现其他广告SDK的初始化逻辑
        console.log("初始化通用广告SDK");
        
        // 示例：检查是否存在其他广告SDK
        if (window['gamebridge'] && window['gamebridge'].showAd) {
            console.log("检测到gamebridge广告SDK");
            this.adReady = true;
        } else if (window['pyun'] && window['pyun'].advertingPull) {
            console.log("检测到pyun广告SDK");
            this.adReady = true;
        } else {
            console.warn("未检测到支持的广告SDK");
            this.adReady = false;
        }
    }

    /**
     * 尝试随机显示广告
     * @returns 是否显示了广告
     */
    public tryShowRandomAd(): boolean {
        if (!this.config.enabled) return false;
        
        // 检查是否已初始化
        if (!this.initialized) {
            this.init();
        }
        
        // 检查广告是否准备好
        if (!this.adReady) {
            console.log("广告未准备好，无法显示");
            return false;
        }
        
        // 检查是否正在显示广告
        if (this.adShowing) {
            console.log("广告正在显示中，不重复触发");
            return false;
        }
        
        const currentTime = Date.now();
        
        // 检查是否满足初始延迟
        if (currentTime - this.gameStartTime < this.config.initialDelay * 1000) {
            return false;
        }
        
        // 检查是否满足最小间隔时间
        if (currentTime - this.lastAdTime < this.config.minIntervalTime * 1000) {
            return false;
        }
        
        // 根据概率决定是否显示广告
        if (Math.random() > this.config.triggerProbability) {
            return false;
        }
        
        // 显示广告
        this.showAd();
        this.lastAdTime = currentTime;
        return true;
    }

    /**
     * 显示广告
     */
    private showAd() {
        console.log("显示H5插屏广告");
        this.adShowing = true;
        
        // 暂停游戏音频
        App.audio.stopMusic();
        
        if (this.config.useGoogleAdPlacement && this.adBreak) {
            // 使用Google Ad Placement API显示广告
            this.adBreak({
                type: 'next', // 可选值: 'next', 'reward', 'browse'
                name: 'level-complete',
                beforeAd: () => {
                    // 广告显示前的回调
                    console.log("广告即将显示");
                },
                afterAd: () => {
                    // 广告显示后的回调
                    console.log("广告显示完成");
                    this.adShowing = false;
                    App.audio.resumeMusic();
                },
                adBreakDone: (placementInfo) => {
                    // 广告显示完成的回调，包含广告信息
                    console.log("广告显示完成，状态:", placementInfo.breakStatus);
                    this.adShowing = false;
                    App.audio.resumeMusic();
                }
            });
        } else {
            // 使用通用广告SDK显示广告
            this.showGenericAd();
        }
    }

    /**
     * 显示通用广告
     */
    private showGenericAd() {
        // 根据检测到的广告SDK选择合适的实现
        if (window['gamebridge'] && window['gamebridge'].showAd) {
            // gamebridge广告SDK
            window['gamebridge'].showAd('next', {
                beforeAd: () => {
                    console.log("广告即将显示");
                },
                afterAd: () => {
                    console.log("广告显示完成");
                    this.adShowing = false;
                    App.audio.resumeMusic();
                }
            });
        } else if (window['pyun'] && window['pyun'].advertingPull) {
            // 创建广告容器
            let adContainer = document.createElement('div');
            adContainer.id = 'ad-container';
            adContainer.style.position = 'fixed';
            adContainer.style.top = '0';
            adContainer.style.left = '0';
            adContainer.style.width = '100%';
            adContainer.style.height = '100%';
            adContainer.style.zIndex = '9999';
            adContainer.style.display = 'none';
            document.body.appendChild(adContainer);
            
            // 创建广告元素
            let adElement = document.createElement('div');
            adElement.id = 'ad-element';
            adContainer.appendChild(adElement);
            
            // 显示广告容器
            adContainer.style.display = 'block';
            
            // 使用pyun广告SDK
            window['pyun'].advertingPull({
                el: 'ad-element',
                app_id: 'your_app_id', // 替换为实际的应用ID
                space_id: 'your_space_id', // 替换为实际的广告位ID
                displayed: 1,
                provider_code: 'your_provider_code', // 替换为实际的流量主编号
                external: 1,
                success: (data) => {
                    console.log('广告加载成功');
                },
                failure: (cause) => {
                    console.warn('广告加载失败:', cause);
                    this.adShowing = false;
                    App.audio.resumeMusic();
                    adContainer.style.display = 'none';
                }
            });
            
            // 添加关闭按钮
            let closeButton = document.createElement('div');
            closeButton.style.position = 'absolute';
            closeButton.style.top = '10px';
            closeButton.style.right = '10px';
            closeButton.style.width = '30px';
            closeButton.style.height = '30px';
            closeButton.style.background = 'rgba(0,0,0,0.5)';
            closeButton.style.color = '#fff';
            closeButton.style.borderRadius = '15px';
            closeButton.style.textAlign = 'center';
            closeButton.style.lineHeight = '30px';
            closeButton.style.cursor = 'pointer';
            closeButton.innerText = 'X';
            adContainer.appendChild(closeButton);
            
            // 添加关闭事件
            closeButton.addEventListener('click', () => {
                adContainer.style.display = 'none';
                this.adShowing = false;
                App.audio.resumeMusic();
            });
            
            // 5秒后自动添加关闭按钮
            setTimeout(() => {
                closeButton.style.display = 'block';
            }, 5000);
        } else {
            // 模拟广告行为
            console.log("【模拟】显示插屏广告");
            setTimeout(() => {
                console.log("【模拟】广告显示完成");
                this.adShowing = false;
                App.audio.resumeMusic();
            }, 2000);
        }
    }

    /**
     * 设置广告配置
     * @param config 配置对象
     */
    public setConfig(config: Partial<typeof RandomAdManager.prototype.config>) {
        this.config = {...this.config, ...config};
    }
}

// 导出单例实例
export const randomAd = RandomAdManager.instance; 