import { registerPlugin } from '@capacitor/core';

export interface StartioAdsPlugin {
  init(): Promise<{ ok: boolean }>
  loadInterstitial(): Promise<void>
  showInterstitial(): Promise<void>
  loadRewarded(): Promise<void>
  showRewarded(): Promise<void>
  // 确保 notifyListeners 方法声明正确
  notifyListeners(eventName: string, data: any): void
}

export const StartioAds = registerPlugin<StartioAdsPlugin>('StartioAds');

export function onInterstitialEvent(cb: (e: any) => void) {
  // @ts-ignore
  StartioAds.addListener?.('interstitialEvent', cb);
}

export function onRewardedEvent(cb: (e: any) => void) {
  // @ts-ignore
  StartioAds.addListener?.('rewardedEvent', cb);
}

// 添加调试日志事件监听器
export function onDebugLog(cb: (e: any) => void) {
  // @ts-ignore
  StartioAds.addListener?.('debugLog', cb);
} 