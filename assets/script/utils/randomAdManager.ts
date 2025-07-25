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
        useGoogleAdPlacement: false
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
        // 检查是否在浏览器环境中运行
        if (!sys.isBrowser) {
            console.log("非浏览器环境，广告功能不可用");
            return;
        }
        
        // 检查window对象是否存在
        if (typeof window === 'undefined') {
            console.log("window对象不存在，无法初始化广告");
            return;
        }
        
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
        // 检查是否在浏览器环境中运行
        if (!sys.isBrowser) {
            console.log("非浏览器环境，无法加载广告脚本");
            return;
        }
        
        // 检查document对象是否存在
        if (typeof document === 'undefined' || !document.head) {
            console.log("document对象不存在，无法加载广告脚本");
            return;
        }
        
        console.log("尝试动态加载Google Ad Placement API脚本");
        
        try {
            const script = document.createElement('script');
            script.async = true;
            script.dataset.adFrequencyHint = "30s";
            script.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3940256099942544"; // 测试ID
            script.crossOrigin = "anonymous";
            script.onload = () => {
                // 初始化adBreak函数
                if (!window['adsbygoogle']) window['adsbygoogle'] = [];
                window['adBreak'] = window['adConfig'] = function(o) {window['adsbygoogle'].push(o)};
                this.adBreak = window['adBreak'];
                this.adReady = true;
                console.log("Google Ad Placement API脚本加载成功");
                
                // 预加载广告
                this.preloadAds();
            };
            script.onerror = () => {
                console.error("Google Ad Placement API脚本加载失败");
                this.adReady = false;
            };
            
            document.head.appendChild(script);
        } catch (e) {
            console.error("加载广告脚本时发生错误:", e);
        }
    }

    /**
     * 预加载广告
     */
    private preloadAds() {
        if (!this.adBreak) return;
        
        try {
            console.log("预加载广告...");
            this.adBreak({
                preloadAdBreaks: 'on',
                onReady: () => {
                    console.log('广告预加载完成，可以显示广告了');
                },
                onError: (e) => {
                    console.error('广告预加载失败', e);
                }
            });
        } catch (e) {
            console.error('预加载广告时发生错误', e);
        }
    }

    /**
     * 初始化通用广告
     */
    private initGenericAd() {
        // 检查是否在浏览器环境中运行
        if (!sys.isBrowser) {
            console.log("非浏览器环境，广告功能不可用");
            return;
        }
        
        // 检查window对象是否存在
        if (typeof window === 'undefined') {
            console.log("window对象不存在，无法初始化广告");
            return;
        }
        
        console.log("初始化通用广告SDK");
        
        try {
            // 示例：检查是否存在其他广告SDK
            if (window['gamebridge'] && typeof window['gamebridge'].showAd === 'function') {
                console.log("检测到gamebridge广告SDK");
                this.adReady = true;
            } else if (window['pyun'] && typeof window['pyun'].advertingPull === 'function') {
                console.log("检测到pyun广告SDK");
                this.adReady = true;
            } else {
                console.warn("未检测到支持的广告SDK，将使用模拟广告");
                // 即使没有广告SDK，也设置为可用，使用模拟广告
                this.adReady = true;
            }
        } catch (e) {
            console.error("初始化通用广告SDK时发生错误:", e);
            // 即使出错，也设置为可用，使用模拟广告
            this.adReady = true;
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
     * 强制显示广告（用于测试）
     * @param adType 广告类型：'next', 'reward', 'browse'
     */
    public forceShowAd(adType: 'next' | 'reward' | 'browse' = 'next') {
        console.log('[AdDebug] forceShowAd called, adType:', adType, 'adReady:', this.adReady, 'adShowing:', this.adShowing);
        // 重置上次显示时间，以便能立即显示
        this.lastAdTime = 0;
        
        if (this.adShowing) {
            console.log('[AdDebug] 广告正在显示中，请稍后再试');
            // 如果广告状态卡住，强制重置
            setTimeout(() => {
                this.resetAdState();
            }, 500);
            return;
        }
        
        console.log(`强制显示${adType}类型广告`);
        this.showAd();
    }

    /**
     * 重置广告状态
     * 用于解决广告状态卡住的问题
     */
    public resetAdState() {
        console.log('[AdDebug] 重置广告状态');
        this.adShowing = false;
        this.lastAdTime = 0;
    }

    /**
     * 显示广告
     */
    private showAd() {
        console.log('[AdDebug] showAd called, adReady:', this.adReady, 'adShowing:', this.adShowing);
        if (this.adShowing) {
            console.log('[AdDebug] 广告正在显示中，不重复触发');
            return;
        }
        this.adShowing = true;
        App.audio.stopMusic();
        // 只用模拟广告
        this.showGenericAd();
    }

    /**
     * 显示通用广告（优先穿山甲H5）
     */
    private showGenericAd() {
        console.log('[AdDebug] showGenericAd called, adShowing:', this.adShowing);
        if (!sys.isBrowser) {
            console.log('[AdDebug] 非浏览器环境，无法显示广告');
            this.adShowing = false;
            App.audio.resumeMusic();
            return;
        }
        try {
            // 优先检测穿山甲H5广告SDK
            if (window['tt'] && typeof window['tt'].showInterstitialAd === 'function') {
                console.log('[AdDebug] 使用穿山甲H5插屏广告SDK');
                this.showPangleAd();
                return;
            }
            // 其他国内SDK可在此扩展...
            // ...
            // 兜底：模拟广告
            console.log('[AdDebug] 使用模拟广告 showMockAd');
            this.showMockAd();
            setTimeout(() => {
                if (this.adShowing) {
                    console.log('[AdDebug] 广告显示超时，自动重置状态');
                    this.adShowing = false;
                    App.audio.resumeMusic();
                }
            }, 5000);
        } catch (e) {
            console.error('[AdDebug] showGenericAd异常:', e);
            this.adShowing = false;
            App.audio.resumeMusic();
        }
    }

    /**
     * 调用穿山甲H5插屏广告（测试参数）
     */
    private showPangleAd() {
        this.adShowing = true;
        try {
            window['tt'].showInterstitialAd({
                app_id: '5001121', // 官方测试app_id
                slot_id: '901121375', // 官方测试slot_id
                success: function() {
                    console.log('[AdDebug] 穿山甲插屏广告展示成功');
                },
                fail: (err) => {
                    console.error('[AdDebug] 穿山甲插屏广告展示失败', err);
                    this.adShowing = false;
                    this.showMockAd();
                },
                complete: () => {
                    this.adShowing = false;
                    App.audio.resumeMusic();
                }
            });
        } catch (e) {
            console.error('[AdDebug] showPangleAd异常:', e);
            this.adShowing = false;
            this.showMockAd();
        }
    }

    /**
     * 显示模拟广告
     */
    private showMockAd() {
        console.log('[AdDebug] showMockAd called, adShowing:', this.adShowing);
        this.adShowing = true;
        setTimeout(() => {
            this.adShowing = false;
            App.audio.resumeMusic();
        }, 8000); // 广告8秒后自动关闭

        // 广告图片和链接池
        const adLinks = [
            'https://sgzzlb.lingxigames.com/',
            'https://sgzzlb.lingxigames.com/',
            'https://sgzzlb.lingxigames.com/',
            'https://sgzzlb.lingxigames.com/',
            'https://sgzzlb.lingxigames.com/',
            'https://sgzzlb.lingxigames.com/'
        ];
        const adImgs = [
            'http://game-01-6goq2s6z60c83eb7-1308501080.tcloudbaseapp.com/ad/1.jpg',
            'http://game-01-6goq2s6z60c83eb7-1308501080.tcloudbaseapp.com/ad/2.jpg',
            'http://game-01-6goq2s6z60c83eb7-1308501080.tcloudbaseapp.com/ad/3.jpg',
            'http://game-01-6goq2s6z60c83eb7-1308501080.tcloudbaseapp.com/ad/4.jpg',
            'http://game-01-6goq2s6z60c83eb7-1308501080.tcloudbaseapp.com/ad/5.jpg',
            'http://game-01-6goq2s6z60c83eb7-1308501080.tcloudbaseapp.com/ad/6.jpg'
        ];
        // 随机选一个
        const idx = Math.floor(Math.random() * adLinks.length);
        const adLinkUrl = adLinks[idx];
        const adImgUrl = adImgs[idx];

        if (sys.isBrowser && typeof document !== 'undefined') {
            try {
                const adContainer = document.createElement('div');
                adContainer.id = 'mock-ad-container';
                adContainer.style.position = 'fixed';
                adContainer.style.top = '0';
                adContainer.style.left = '0';
                adContainer.style.width = '100vw';
                adContainer.style.height = '100vh';
                adContainer.style.backgroundColor = 'rgba(0,0,0,0.8)';
                adContainer.style.zIndex = '99999';
                adContainer.style.display = 'flex';
                adContainer.style.justifyContent = 'center';
                adContainer.style.alignItems = 'center';

                // 广告图片和跳转链接
                const adLink = document.createElement('a');
                adLink.href = adLinkUrl;
                adLink.target = '_blank';

                const adImg = document.createElement('img');
                adImg.src = adImgUrl;
                adImg.style.width = '320px';
                adImg.style.height = '240px';
                adImg.style.borderRadius = '12px';
                adImg.style.boxShadow = '0 4px 24px rgba(0,0,0,0.3)';
                adImg.style.cursor = 'pointer';
                adLink.appendChild(adImg);

                adContainer.appendChild(adLink);

                // 关闭按钮
                const closeBtn = document.createElement('div');
                closeBtn.innerText = '×';
                closeBtn.style.position = 'absolute';
                closeBtn.style.top = '30px';
                closeBtn.style.right = '40px';
                closeBtn.style.fontSize = '36px';
                closeBtn.style.color = '#fff';
                closeBtn.style.cursor = 'pointer';
                closeBtn.style.zIndex = '100000';
                adContainer.appendChild(closeBtn);

                closeBtn.onclick = () => {
                    if (document.body.contains(adContainer)) {
                        document.body.removeChild(adContainer);
                    }
                    this.adShowing = false;
                    App.audio.resumeMusic();
                };

                document.body.appendChild(adContainer);

                // 自动关闭
                setTimeout(() => {
                    if (document.body.contains(adContainer)) {
                        document.body.removeChild(adContainer);
                    }
                    this.adShowing = false;
                    App.audio.resumeMusic();
                }, 8000);
            } catch (e) {
                console.error('[AdDebug] 创建模拟广告UI失败:', e);
            }
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