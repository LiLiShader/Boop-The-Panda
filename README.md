# H5网页游戏插屏广告接入指南

本项目实现了在H5网页游戏中随机显示插屏广告的功能，支持多种广告平台，包括Google Ad Placement API和其他通用广告SDK。

## 功能特点

- 支持在游戏关键时刻随机触发插屏广告
- 智能控制广告展示频率，避免过度打扰用户
- 支持多种广告平台，包括Google Ad Placement API
- 自动检测并使用已加载的广告SDK
- 在广告显示期间自动暂停游戏音乐，广告结束后恢复

## 接入步骤

### 1. HTML页面配置

在游戏的HTML页面中添加广告SDK脚本，例如Google Ad Placement API：

```html
<!-- Google Ad Placement API -->
<script async
  data-ad-frequency-hint="30s"
  src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX"
  crossorigin="anonymous">
</script>
<script>
  window.adsbygoogle = window.adsbygoogle || [];
  var adBreak = adConfig = function(o) {adsbygoogle.push(o);}
</script>
```

### 2. 初始化广告管理器

在游戏初始化时，初始化随机广告管理器：

```typescript
// 初始化随机广告管理器
randomAd.init();
```

### 3. 在关键时刻触发广告

在游戏的关键时刻尝试触发广告，例如：

```typescript
// 尝试触发随机广告
randomAd.tryShowRandomAd();
```

建议在以下时刻尝试触发广告：
- 游戏开始时
- 关卡完成时
- 游戏失败时
- 使用特殊道具时
- 玩家点击关键按钮时

### 4. 广告配置

可以根据需要调整广告配置参数：

```typescript
randomAd.setConfig({
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
});
```

## 支持的广告平台

### 1. Google Ad Placement API

Google的广告投放API，适用于H5游戏。需要在HTML页面中引入相应脚本。

### 2. 通用广告SDK

本项目还支持其他常见的广告SDK，如：
- gamebridge广告SDK
- pyun广告SDK
- 其他支持H5游戏的广告SDK

## 注意事项

1. **广告频率控制**：避免过度展示广告，建议最小间隔时间不少于30秒
2. **用户体验**：在合适的游戏节点展示广告，避免打断游戏流程
3. **音频处理**：广告显示期间应暂停游戏音乐，广告结束后恢复
4. **测试**：在发布前充分测试广告展示逻辑，确保不影响游戏正常运行

## 示例代码

```typescript
// 游戏开始时
async loadExtraData(lv: number) {
  // 游戏开始时尝试触发广告
  randomAd.tryShowRandomAd();
  
  // 其他初始化代码...
}

// 游戏结束时
checkResult() {
  if (this.isWin) {
    // 游戏胜利时尝试触发广告
    randomAd.tryShowRandomAd();
    
    // 显示胜利界面...
  } else {
    // 游戏失败时尝试触发广告
    randomAd.tryShowRandomAd();
    
    // 显示失败界面...
  }
}

// 使用道具时
onClickToolButton(btnNode: Node) {
  // 使用道具时尝试触发广告
  randomAd.tryShowRandomAd();
  
  // 道具使用逻辑...
}
```

## 常见问题

### Q: 广告无法显示怎么办？
A: 检查HTML页面是否正确引入了广告SDK脚本，以及是否有正确的发布商ID。

### Q: 如何控制广告显示频率？
A: 通过配置`minIntervalTime`和`triggerProbability`参数来控制广告显示频率。

### Q: 如何在不同平台上测试广告？
A: 可以使用浏览器的开发者工具模拟不同设备，或者在实际设备上进行测试。

### Q: 广告显示时游戏卡顿怎么办？
A: 确保在广告显示前暂停游戏逻辑，广告关闭后再恢复游戏逻辑。