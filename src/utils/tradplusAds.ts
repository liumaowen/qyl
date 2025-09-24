import { registerPlugin } from '@capacitor/core';

export interface TradPlusAdsPlugin {
  init(options?: { appId?: string }): Promise<{ success: boolean; message?: string }>
  loadInterstitial(options?: { unitId?: string }): Promise<void>
  showInterstitial(): Promise<void>
  loadRewarded(options?: { unitId?: string }): Promise<void>
  showRewarded(): Promise<void>
  isInterstitialReady(): Promise<{ ready: boolean }>
  isRewardedReady(): Promise<{ ready: boolean }>
   // 添加GAID方法定义
  getGAID(): Promise<{ success: boolean; gaid?: string; error?: string }>
}

export const TradPlusAds = registerPlugin<TradPlusAdsPlugin>('TradPlusAds');

// 广告事件类型定义
export interface AdEvent {
  event: 'loaded' | 'failed' | 'shown' | 'clicked' | 'closed' | 'rewarded';
  source: 'tradplus';
  error?: string;
  currency?: string;
  amount?: number;
}

// 调试日志事件类型定义
export interface DebugLogEvent {
  message: string;
}

export function onInterstitialEvent(cb: (e: AdEvent) => void) {
  // @ts-ignore
  return TradPlusAds.addListener?.('interstitialEvent', cb);
}

export function onRewardedEvent(cb: (e: AdEvent) => void) {
  // @ts-ignore
  return TradPlusAds.addListener?.('rewardedEvent', cb);
}

// 添加调试日志事件监听器
export function onDebugLog(cb: (e: DebugLogEvent) => void) {
  // @ts-ignore
  return TradPlusAds.addListener?.('debugLog', cb);
}

// TradPlus管理类 - 基于官方demo最佳实践
export class TradPlusManager {
  private static instance: TradPlusManager;
  private isInitialized = false;
  private debugLogs: string[] = [];

  // TradPlus测试广告位ID (来自官方demo)
  static readonly CONSTANTS = {
    APPID: "CE48DA41B98CF7C37A3D02EFDAC3A011",
    REWARDED_ADUNITID: "7B35AB6673DC0B0AB745291343296912",
    INTERSTITIAL_ADUNITID: "38FF0240F0D7460BA7953AD828F44512",
    BANNER_ADUNITID: "",
    NATIVE_ADUNITID: "",
    SPLASH_ADUNITID: ""
  };

  static getInstance(): TradPlusManager {
    if (!TradPlusManager.instance) {
      TradPlusManager.instance = new TradPlusManager();
    }
    return TradPlusManager.instance;
  }

  constructor() {
    this.setupEventListeners();
  }

  private setupEventListeners() {
    // 监听调试日志
    onDebugLog((event) => {
      console.log('[TradPlus Debug]', event.message);
      this.debugLogs.push(`${new Date().toLocaleTimeString()}: ${event.message}`);
      // 只保留最近100条日志
      if (this.debugLogs.length > 100) {
        this.debugLogs = this.debugLogs.slice(-100);
      }
    });

    // 监听插屏广告事件
    onInterstitialEvent((event) => {
      console.log('[TradPlus Interstitial]', event);
    });

    // 监听激励广告事件
    onRewardedEvent((event) => {
      console.log('[TradPlus Rewarded]', event);
    });
  }

  async initialize(): Promise<boolean> {
    if (this.isInitialized) {
      console.log('TradPlus already initialized');
      return true;
    }

    try {
      console.log('Initializing TradPlus with App ID:', TradPlusManager.CONSTANTS.APPID);
      const result = await TradPlusAds.init({
        appId: TradPlusManager.CONSTANTS.APPID
      });

      this.isInitialized = result.success;

      if (this.isInitialized) {
        console.log('✅ TradPlus SDK initialized successfully');
      } else {
        console.error('❌ TradPlus SDK initialization failed');
      }

      return this.isInitialized;
    } catch (error) {
      console.error('Error initializing TradPlus:', error);
      return false;
    }
  }

  async loadInterstitial(): Promise<boolean> {
    try {
      console.log('Loading TradPlus interstitial ad...');
      await TradPlusAds.loadInterstitial({
        unitId: TradPlusManager.CONSTANTS.INTERSTITIAL_ADUNITID
      });
      return true;
    } catch (error) {
      console.error('Failed to load TradPlus interstitial ad:', error);
      return false;
    }
  }

  async showInterstitial(): Promise<boolean> {
    try {
      const readyResult = await TradPlusAds.isInterstitialReady();
      if (!readyResult.ready) {
        console.warn('TradPlus interstitial ad not ready');
        return false;
      }

      console.log('Showing TradPlus interstitial ad...');
      await TradPlusAds.showInterstitial();
      return true;
    } catch (error) {
      console.error('Failed to show TradPlus interstitial ad:', error);
      return false;
    }
  }

  async loadRewarded(): Promise<boolean> {
    try {
      console.log('Loading TradPlus rewarded ad...');
      await TradPlusAds.loadRewarded({
        unitId: TradPlusManager.CONSTANTS.REWARDED_ADUNITID
      });
      return true;
    } catch (error) {
      console.error('Failed to load TradPlus rewarded ad:', error);
      return false;
    }
  }

  async showRewarded(): Promise<boolean> {
    try {
      const readyResult = await TradPlusAds.isRewardedReady();
      if (!readyResult.ready) {
        console.warn('TradPlus rewarded ad not ready');
        return false;
      }

      console.log('Showing TradPlus rewarded ad...');
      await TradPlusAds.showRewarded();
      return true;
    } catch (error) {
      console.error('Failed to show TradPlus rewarded ad:', error);
      return false;
    }
  }

  async isInterstitialReady(): Promise<boolean> {
    try {
      const result = await TradPlusAds.isInterstitialReady();
      return result.ready;
    } catch (error) {
      console.error('Error checking interstitial ready status:', error);
      return false;
    }
  }

  async isRewardedReady(): Promise<boolean> {
    try {
      const result = await TradPlusAds.isRewardedReady();
      return result.ready;
    } catch (error) {
      console.error('Error checking rewarded ready status:', error);
      return false;
    }
  }

  getDebugLogs(): string[] {
    return [...this.debugLogs];
  }

  clearDebugLogs(): void {
    this.debugLogs = [];
  }

    async getGAID(): Promise<{ success: boolean; gaid?: string; error?: string }> {
    try {
      const result = await TradPlusAds.getGAID();
      return result;
    } catch (error) {
      console.error('Error getting GAID:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }
}

// 导出单例实例
export const tradPlusManager = TradPlusManager.getInstance();