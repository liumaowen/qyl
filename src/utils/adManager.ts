import { ref, reactive } from 'vue';
import { TradPlusAds, onInterstitialEvent as onTradPlusInterstitialEvent, onRewardedEvent as onTradPlusRewardedEvent, onDebugLog as onTradPlusDebugLog } from './tradplusAds';
import { StartioAds, onInterstitialEvent as onStartioInterstitialEvent, onRewardedEvent as onStartioRewardedEvent, onDebugLog as onStartioDebugLog } from './startioAds';

// 广告源枚举
export enum AdSource {
  TRADPLUS = 'tradplus',
  STARTIO = 'startio'
}

// 广告类型枚举
export enum AdType {
  INTERSTITIAL = 'interstitial',
  REWARDED = 'rewarded'
}

// 广告状态管理
export const adManagerState = reactive({
  isInitialized: false,
  tradPlusInitialized: false,
  currentInterstitialSource: AdSource.TRADPLUS,
  currentRewardedSource: AdSource.TRADPLUS,
  adLoadStatus: {
    interstitial: {
      tradplus: false,
      startio: false
    },
    rewarded: {
      tradplus: false,
      startio: false
    }
  }
});

// 调试日志
export const adDebugLogs = ref<string[]>([]);

const addDebugLog = (message: string) => {
  const timestamp = new Date().toLocaleTimeString();
  adDebugLogs.value.push(`[${timestamp}] ${message}`);
  // 限制日志数量
  if (adDebugLogs.value.length > 100) {
    adDebugLogs.value = adDebugLogs.value.slice(-50);
  }
};

// 初始化广告SDK
export const initializeAdSDKs = async (tradPlusAppId: string) => {
  try {
    // 初始化TradPlus
    if (tradPlusAppId) {
      await TradPlusAds.init({ appId: tradPlusAppId });
      adManagerState.tradPlusInitialized = true;
      addDebugLog('✅ TradPlus SDK 初始化成功');
    }
  } catch (error) {
    addDebugLog(`❌ TradPlus SDK 初始化失败: ${error}`);
  }

  try {
    // 初始化Startio
    await StartioAds.init();
    addDebugLog('✅ Startio SDK 初始化成功');
  } catch (error) {
    addDebugLog(`❌ Startio SDK 初始化失败: ${error}`);
  }

  adManagerState.isInitialized = true;
};

// 设置事件监听器
export const setupAdEventListeners = () => {
  // TradPlus 事件监听
  onTradPlusDebugLog((e: any) => {
    if (e?.message) {
      addDebugLog(`[TradPlus] ${e.message}`);
    }
  });

  onTradPlusInterstitialEvent((e: any) => {
    if (e?.event === 'loaded') {
      adManagerState.adLoadStatus.interstitial.tradplus = true;
      addDebugLog('✅ TradPlus 插屏广告加载成功');
    }
    if (e?.event === 'failed') {
      adManagerState.adLoadStatus.interstitial.tradplus = false;
      addDebugLog(`❌ TradPlus 插屏广告加载失败: ${e.error}`);
    }
    if (e?.event === 'shown') {
      addDebugLog('📺 TradPlus 插屏广告已显示');
    }
    if (e?.event === 'closed') {
      addDebugLog('⏹️ TradPlus 插屏广告已关闭');
    }
  });

  onTradPlusRewardedEvent((e: any) => {
    if (e?.event === 'loaded') {
      adManagerState.adLoadStatus.rewarded.tradplus = true;
      addDebugLog('✅ TradPlus 激励广告加载成功');
    }
    if (e?.event === 'failed') {
      adManagerState.adLoadStatus.rewarded.tradplus = false;
      addDebugLog(`❌ TradPlus 激励广告加载失败: ${e.error}`);
    }
    if (e?.event === 'shown') {
      addDebugLog('📺 TradPlus 激励广告已显示');
    }
    if (e?.event === 'closed') {
      addDebugLog('⏹️ TradPlus 激励广告已关闭');
    }
    if (e?.event === 'rewarded') {
      addDebugLog('🎁 TradPlus 激励广告奖励已发放');
    }
  });

  // Startio 事件监听
  onStartioDebugLog((e: any) => {
    if (e?.message) {
      addDebugLog(`[Startio] ${e.message}`);
    }
  });

  onStartioInterstitialEvent((e: any) => {
    if (e?.event === 'loaded') {
      adManagerState.adLoadStatus.interstitial.startio = true;
      addDebugLog('✅ Startio 插屏广告加载成功');
    }
    if (e?.event === 'failed') {
      adManagerState.adLoadStatus.interstitial.startio = false;
      addDebugLog('❌ Startio 插屏广告加载失败');
    }
  });

  onStartioRewardedEvent((e: any) => {
    if (e?.event === 'loaded') {
      adManagerState.adLoadStatus.rewarded.startio = true;
      addDebugLog('✅ Startio 激励广告加载成功');
    }
    if (e?.event === 'failed') {
      adManagerState.adLoadStatus.rewarded.startio = false;
      addDebugLog('❌ Startio 激励广告加载失败');
    }
  });
};

// 加载插屏广告
export const loadInterstitial = async (tradPlusUnitId: string, startio: boolean = true) => {
  try {
    // 优先加载 TradPlus
    if (adManagerState.tradPlusInitialized && tradPlusUnitId) {
      await TradPlusAds.loadInterstitial({ unitId: tradPlusUnitId });
      adManagerState.currentInterstitialSource = AdSource.TRADPLUS;
      return;
    }
  } catch (error) {
    addDebugLog(`TradPlus 插屏广告加载异常: ${error}`);
  }

  // 如果 TradPlus 失败且启用了 Startio，则加载 Startio
  if (startio) {
    try {
      await StartioAds.loadInterstitial();
      adManagerState.currentInterstitialSource = AdSource.STARTIO;
    } catch (error) {
      addDebugLog(`Startio 插屏广告加载异常: ${error}`);
    }
  }
};

// 显示插屏广告
export const showInterstitial = async () => {
  // 检查 TradPlus 是否就绪
  try {
    if (adManagerState.currentInterstitialSource === AdSource.TRADPLUS) {
      const result = await TradPlusAds.isInterstitialReady();
      if (result.ready) {
        await TradPlusAds.showInterstitial();
        return true;
      }
    }
  } catch (error) {
    addDebugLog(`TradPlus 插屏广告显示异常: ${error}`);
  }

  // 检查 Startio 是否就绪
  try {
    if (adManagerState.currentInterstitialSource === AdSource.STARTIO) {
      await StartioAds.showInterstitial();
      return true;
    }
  } catch (error) {
    addDebugLog(`Startio 插屏广告显示异常: ${error}`);
  }

  addDebugLog('⚠️ 没有可用的插屏广告');
  return false;
};

// 加载激励广告
export const loadRewarded = async (tradPlusUnitId: string, startio: boolean = true) => {
  try {
    // 优先加载 TradPlus
    if (adManagerState.tradPlusInitialized && tradPlusUnitId) {
      await TradPlusAds.loadRewarded({ unitId: tradPlusUnitId });
      adManagerState.currentRewardedSource = AdSource.TRADPLUS;
      return;
    }
  } catch (error) {
    addDebugLog(`TradPlus 激励广告加载异常: ${error}`);
  }

  // 如果 TradPlus 失败且启用了 Startio，则加载 Startio
  if (startio) {
    try {
      await StartioAds.loadRewarded();
      adManagerState.currentRewardedSource = AdSource.STARTIO;
    } catch (error) {
      addDebugLog(`Startio 激励广告加载异常: ${error}`);
    }
  }
};

// 显示激励广告
export const showRewarded = async () => {
  // 检查 TradPlus 是否就绪
  try {
    if (adManagerState.currentRewardedSource === AdSource.TRADPLUS) {
      const result = await TradPlusAds.isRewardedReady();
      if (result.ready) {
        await TradPlusAds.showRewarded();
        return true;
      }
    }
  } catch (error) {
    addDebugLog(`TradPlus 激励广告显示异常: ${error}`);
  }

  // 检查 Startio 是否就绪
  try {
    if (adManagerState.currentRewardedSource === AdSource.STARTIO) {
      await StartioAds.showRewarded();
      return true;
    }
  } catch (error) {
    addDebugLog(`Startio 激励广告显示异常: ${error}`);
  }

  addDebugLog('⚠️ 没有可用的激励广告');
  return false;
};

// 清空调试日志
export const clearAdDebugLogs = () => {
  adDebugLogs.value = [];
};