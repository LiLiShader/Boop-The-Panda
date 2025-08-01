import { _decorator, Node, tween, v3 } from 'cc';
import { BaseViewCmpt } from '../../components/baseViewCmpt';
import { EventName } from '../../const/eventName';
import { LevelConfig } from '../../const/levelConfig';
import { ViewName } from '../../const/viewNameConst';
import { App } from '../../core/app';
import { GlobalFuncHelper } from '../../utils/globalFuncHelper';
import { Advertise } from '../../wx/advertise';
import { gridCmpt } from './item/gridCmpt';
import { randomAd } from "../../utils/randomAdManager";
import { ServerConfig } from "../../config/serverConfig";
const { ccclass, property } = _decorator;

@ccclass('resultViewCmpt')
export class ResultViewCmpt extends BaseViewCmpt {
    private isWin: boolean = false;
    private level: number = 0;
    private starCount: number = 0;
    private star: Node = null;
    private coutArr: any[] = [];

    onLoad() {
        super.onLoad();
        this.star = this.viewList.get('animNode/win/star');
    }

    /** 初始化 */
    async loadExtraData(lv: number, isWin: boolean, coutArr = [], starCount: number = 0) {
        // 游戏结束时强制弹出广告
        if (randomAd && typeof randomAd.forceShowAd === 'function') {
            randomAd.resetAdState();
            randomAd.forceShowAd('next');
        }
        
        this.level = lv;
        this.isWin = isWin;
        this.coutArr = coutArr;
        this.starCount = starCount;
        
        if (isWin) {
            App.audio.play('win');
        }
        else {
            App.audio.play('lose');
        }
        this.viewList.get('animNode/win').active = isWin;
        this.viewList.get('animNode/lose').active = !isWin;
        if (isWin) {
            LevelConfig.setLevelStar(lv, starCount);
            this.handleWin(coutArr);
        }
        else {
            this.handleLose();
        }
    }

    handleLose() {

    }

    handleWin(coutArr: any[]) {
        let target = this.viewList.get('animNode/win/target');
        target.children.forEach((item, idx) => {
            if (!coutArr) return;
            item.active = idx < coutArr.length;
            if (idx < coutArr.length) {
                item.getComponent(gridCmpt).setType(coutArr[idx][0]);
                let count = coutArr[idx][1]
                if (count == 0) {
                    item.getComponent(gridCmpt).showGou(true);
                }
                else {
                    item.getComponent(gridCmpt).setCount(count);
                }
            }
        });
        this.playStarAnim();
    }

    playStarAnim() {
        this.star.active = this.isWin;
        let count = this.starCount;
        if (this.isWin) {
            this.star.children.forEach((item, idx) => {
                item.getChildByName('s').active = idx + 1 <= count;
                item.setScale(0, 0, 0);
                tween(item).to(0.3 * (idx + 1), { scale: v3(1, 1, 1) }, { easing: 'backOut' }).start();
            });
        }
    }
    /** 下一关 */
    onClick_nextBtn() {
        App.audio.play('button_click');
        GlobalFuncHelper.setGold(App.gameLogic.rewardGold);
        if (this.level == LevelConfig.getCurLevel()) {
            LevelConfig.nextLevel();
        }
        App.view.closeView(ViewName.Single.eGameView);
        App.view.openView(ViewName.Single.eHomeView, true);
        this.onClick_closeBtn();
    }
    /** 分享 */
    onClick_shareBtn() {
        App.audio.play('button_click');
        App.event.emit(EventName.Game.Share, App.gameLogic.curLevel);
        Advertise.showVideoAds();
        App.backHome();
    }
    /** 购买次数继续游戏 */
    onClick_continueBtn() {
        App.audio.play('button_click');
        let count = +GlobalFuncHelper.getGold();
        if (count < 10) {
            let lv = LevelConfig.getCurLevel();
            App.event.emit(EventName.Game.Share, lv);
            App.view.showMsgTips("Diamond shortage")
            Advertise.showVideoAds();
            return;
        }
        GlobalFuncHelper.setGold(-10);
        App.event.emit(EventName.Game.UpdataGold);
        
        // 同步金币数据到服务器
        this.syncGoldDataToServer();
        
        App.event.emit(EventName.Game.ContinueGame);
        this.onClick_closeBtn();
    }

    onClick_guanbiBtn() {
        if (this.isWin) {
            if (this.level == LevelConfig.getCurLevel()) {
                LevelConfig.nextLevel();
            }
        }
        App.backHome(true);
        super.onClick_closeBtn()
    }

    /** 点击下一关 */
    onClickNextLevel() {
        App.audio.play('button_click');
        
        // 点击下一关时尝试触发广告
        randomAd.tryShowRandomAd();
        
        App.view.closeView(ViewName.Single.eResultView);
        App.view.openView(ViewName.Single.eGameView, this.level + 1);
    }

    /** 点击重玩 */
    onClickReplay() {
        App.audio.play('button_click');
        
        // 点击重玩时尝试触发广告
        randomAd.tryShowRandomAd();
        
        App.view.closeView(ViewName.Single.eResultView);
        App.view.openView(ViewName.Single.eGameView, this.level);
    }
    
    /**
     * 同步金币数据到服务器
     */
    private syncGoldDataToServer() {
        try {
            // 检查数据同步管理器是否可用
            if (window['dataSyncManager']) {
                console.log('[ResultView] 开始同步金币数据到服务器');
                window['dataSyncManager'].forceSyncAllData().then(success => {
                    if (success) {
                        console.log('[ResultView] 金币数据同步成功');
                    } else {
                        console.error('[ResultView] 金币数据同步失败');
                    }
                }).catch(error => {
                    console.error('[ResultView] 金币数据同步异常:', error);
                });
            } else {
                console.warn('[ResultView] 数据同步管理器未初始化，尝试手动同步');
                this.manualSyncGoldData();
            }
        } catch (error) {
            console.error('[ResultView] 同步金币数据失败:', error);
            // 如果数据同步管理器不可用，尝试手动同步
            this.manualSyncGoldData();
        }
    }
    
    /**
     * 手动同步金币数据到服务器
     */
    private manualSyncGoldData() {
        try {
            // 获取当前用户信息
            const user = (typeof App !== 'undefined' && App.user && App.user.currentUser);
            if (!user || !user.id) {
                console.warn('[ResultView] 用户未登录，跳过金币同步');
                return;
            }
            
            // 获取当前金币数量
            const currentGold = GlobalFuncHelper.getGold();
            
            // 构造同步数据
            const syncData = {
                userId: user.id,
                data: [
                    {
                        key: 'Gold',
                        value: currentGold.toString(),
                        type: 'string'
                    }
                ]
            };
            
            console.log('[ResultView] 准备同步金币数据:', syncData);
            
            // 调用后端同步API
            fetch(ServerConfig.getMainServerURL() + '/api/user/sync-data', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(syncData)
            })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    console.log('[ResultView] 金币数据同步成功');
                } else {
                    console.error('[ResultView] 金币数据同步失败:', data.message);
                }
            })
            .catch(err => {
                console.error('[ResultView] 金币数据同步异常:', err);
            });
        } catch (error) {
            console.error('[ResultView] 手动同步金币数据失败:', error);
        }
    }
}