import { Capacitor } from '@capacitor/core';
import { Device } from '@capacitor/device';
import { Preferences } from '@capacitor/preferences';
import { App } from '@capacitor/app';
import { ANALYTICS_CONFIG } from '@/config/analytics';
import { savedevice } from '@/api/video';
import axios from 'axios';
import {formatDate} from '@/utils/crypto';

export interface AnalyticsData {
  id?: number;
  event?: string;
  deviceId: string;
  deviceModel: string;
  platform: string;
  appVersion: string;
  osVersion: string;
  firstUseTime: string;
  lastUseTime: string;
  useCount: number;
  ipAddress?: string;
  address?: string;
  userAgent?: string;
  additionalData?: Record<string, any>;
}

class UserAnalytics {
  private static instance: UserAnalytics;
  private userInfo: AnalyticsData | null = null;
  private readonly STORAGE_KEY = 'user_analytics_info';

  private constructor() {}

  public static getInstance(): UserAnalytics {
    if (!UserAnalytics.instance) {
      UserAnalytics.instance = new UserAnalytics();
    }
    return UserAnalytics.instance;
  }

  /**
   * 初始化用户信息收集
   */
  async initialize(): Promise<void> {
    // 检查是否启用分析功能
    if (!ANALYTICS_CONFIG.ENABLED) {
      console.log('用户分析功能已禁用');
      return;
    }

    // 在开发环境下是否启用
    if (process.env.NODE_ENV === 'development' && !ANALYTICS_CONFIG.ENABLE_IN_DEV) {
      console.log('开发环境下用户分析功能已禁用');
      return;
    }

    try {
      // 获取或创建用户信息
      await this.loadOrCreateUserInfo();
      
      // 更新使用时间
      await this.updateUsageTime();
      
      // 获取IP地址（如果可能）
      if (ANALYTICS_CONFIG.COLLECT_IP) {
        await this.getIpAddress();
      }
      
      // 上报用户信息
      await this.reportUserInfo();
      
      console.log('用户分析初始化完成');
    } catch (error) {
      console.error('用户分析初始化失败:', error);
    }
  }

  /**
   * 加载或创建用户信息
   */
  private async loadOrCreateUserInfo(): Promise<void> {
    try {
      const stored = await Preferences.get({ key: this.STORAGE_KEY });
      
      if (stored.value) {
        this.userInfo = JSON.parse(stored.value);
      } else {
        // 创建新的用户信息
        this.userInfo = await this.createUserInfo();
        await this.saveUserInfo();
      }
    } catch (error) {
      console.error('加载用户信息失败:', error);
      // 如果加载失败，创建新的用户信息
      this.userInfo = await this.createUserInfo();
      await this.saveUserInfo();
    }
  }

  /**
   * 创建新的用户信息
   */
  private async createUserInfo(): Promise<AnalyticsData> {
    const deviceInfo = await Device.getInfo();
    const appInfo = await App.getInfo();
    const now = formatDate(new Date());
    return {
      deviceId: await this.generateDeviceId(),
      deviceModel: deviceInfo.model || 'Unknown',
      platform: Capacitor.getPlatform(),
      appVersion: appInfo.version,
      osVersion: deviceInfo.osVersion || 'Unknown',
      firstUseTime: now,
      lastUseTime: now,
      useCount: 1
    };
  }

  /**
   * 生成设备唯一ID
   */
  private async generateDeviceId(): Promise<string> {
    try {
      const deviceInfo = await Device.getId();
      return deviceInfo.identifier || this.generateFallbackId();
    } catch (error) {
      console.warn('无法获取设备ID，使用备用方案:', error);
      return this.generateFallbackId();
    }
  }

  /**
   * 生成备用设备ID
   */
  private generateFallbackId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    return `device_${timestamp}_${random}`;
  }

  /**
   * 保存用户信息到本地存储
   */
  private async saveUserInfo(): Promise<void> {
    if (this.userInfo) {
      await Preferences.set({
        key: this.STORAGE_KEY,
        value: JSON.stringify(this.userInfo)
      });
    }
  }

  /**
   * 更新使用时间
   */
  private async updateUsageTime(): Promise<void> {
    if (this.userInfo) {
      this.userInfo.lastUseTime = formatDate(new Date());
      this.userInfo.useCount += 1;
      await this.saveUserInfo();
    }
  }

  /**
   * 获取IP地址
   */
  private async getIpAddress(): Promise<void> {
    try {
      // 使用免费的IP查询服务
      const response = await axios.get('https://my.ip.cn/json');
      const d = response.data;
      const data = d.data;
      
      if (this.userInfo && d.code === 0 && data.ip) {
        this.userInfo.ipAddress = data.ip;
        this.userInfo.address = data.country && data.province && data.district && data.isp;
        await this.saveUserInfo();
      }
    } catch (error) {
      console.warn('无法获取IP地址:', error);
    }
  }

  /**
   * 上报用户信息
   */
  private async reportUserInfo(): Promise<void> {
    if (!this.userInfo) return;
    try {
      const analyticsData: AnalyticsData = {
        ...this.userInfo,
        event: 'user_info'
      };

      await this.sendAnalytics(analyticsData);
    } catch (error) {
      console.error('上报用户信息失败:', error);
    }
  }

  /**
   * 发送分析数据
   */
  private async sendAnalytics(data: AnalyticsData): Promise<void> {
    try {
        console.log('data',data)
      await savedevice(data,ANALYTICS_CONFIG.TIMEOUT);
      console.log('分析数据发送成功');
    } catch (error) {
      console.error('发送分析数据失败:', error);
      // 可以将失败的数据存储到本地，稍后重试
      await this.storeFailedAnalytics(data);
    }
  }

  /**
   * 存储失败的分析数据
   */
  private async storeFailedAnalytics(data: AnalyticsData): Promise<void> {
    try {
      const failedKey = 'failed_analytics';
      const existing = await Preferences.get({ key: failedKey });
      const failedData = existing.value ? JSON.parse(existing.value) : [];
      
      failedData.push({
        ...data,
        retryCount: 0,
        timestamp: new Date().toISOString()
      });

      await Preferences.set({
        key: failedKey,
        value: JSON.stringify(failedData.slice(-ANALYTICS_CONFIG.MAX_FAILED_DATA_COUNT))
      });
    } catch (error) {
      console.error('存储失败的分析数据时出错:', error);
    }
  }

  /**
   * 记录自定义事件
   */
  async trackEvent(eventName: string, additionalData?: Record<string, any>): Promise<void> {
    if (!this.userInfo) return;

    try {
      const analyticsData: AnalyticsData = {
        ...this.userInfo,
        event: eventName,
        additionalData
      };

      await this.sendAnalytics(analyticsData);
    } catch (error) {
      console.error('记录事件失败:', error);
    }
  }

  /**
   * 获取当前用户信息
   */
  getUserInfo(): AnalyticsData | null {
    return this.userInfo;
  }

  /**
   * 重试发送失败的分析数据
   */
  async retryFailedAnalytics(): Promise<void> {
    try {
      const failedKey = 'failed_analytics';
      const existing = await Preferences.get({ key: failedKey });
      
      if (!existing.value) return;

      const failedData = JSON.parse(existing.value);
      const successfulData: any[] = [];

      for (const data of failedData) {
        try {
          await this.sendAnalytics(data);
          successfulData.push(data);
        } catch (error) {
          console.error('重试发送分析数据失败:', error);
        }
      }

      // 移除成功发送的数据
      const remainingData = failedData.filter((data: any) => 
        !successfulData.some(success => success.timestamp === data.timestamp)
      );

      await Preferences.set({
        key: failedKey,
        value: JSON.stringify(remainingData)
      });
    } catch (error) {
      console.error('重试失败的分析数据时出错:', error);
    }
  }
}

export default UserAnalytics; 