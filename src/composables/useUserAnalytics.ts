import { ref, onMounted } from 'vue';
import UserAnalytics,{type AnalyticsData} from '@/utils/userAnalytics';
import { isInitialized, analyticsInitState } from '@/store/state';

export function useUserAnalytics() {
  const userInfo = ref<AnalyticsData | null>(null);
  const analytics = UserAnalytics.getInstance();

  /**
   * 初始化用户分析
   */
  const initialize = async () => {
    // 如果已经初始化，直接返回
    if (isInitialized.value) {
      console.log('用户分析已初始化，跳过重复初始化');
      return;
    }

    // 如果正在初始化，等待初始化完成
    if (analyticsInitState.isInitializing && analyticsInitState.initPromise) {
      console.log('用户分析正在初始化中，等待完成...');
      await analyticsInitState.initPromise;
      return;
    }

    // 防止短时间内重复初始化（5秒内）
    const now = Date.now();
    if (now - analyticsInitState.lastInitTime < 5000) {
      console.log('距离上次初始化时间过短，跳过重复初始化');
      return;
    }

    // 创建新的初始化 Promise
    analyticsInitState.isInitializing = true;
    analyticsInitState.lastInitTime = now;
    
    analyticsInitState.initPromise = (async () => {
      try {
        await analytics.initialize();
        userInfo.value = analytics.getUserInfo();
        isInitialized.value = true;
      } catch (error) {
        console.error('初始化用户分析失败:', error);
        // 重置状态，允许重试
        isInitialized.value = false;
        throw error;
      } finally {
        // 清理状态
        analyticsInitState.isInitializing = false;
        analyticsInitState.initPromise = null;
      }
    })();

    await analyticsInitState.initPromise;
  };

  /**
   * 记录自定义事件
   */
  const trackEvent = async (eventName: string, additionalData?: Record<string, any>) => {
    if (!isInitialized.value) {
      await initialize();
    }
    await analytics.trackEvent(eventName, additionalData);
  };

  /**
   * 记录页面访问事件
   */
  const trackPageView = async (pageName: string) => {
    await trackEvent('page_view', { page: pageName });
  };

  /**
   * 记录功能使用事件
   */
  const trackFeatureUsage = async (featureName: string, additionalData?: Record<string, any>) => {
    await trackEvent('feature_usage', { 
      feature: featureName,
      ...additionalData 
    });
  };

  /**
   * 记录错误事件
   */
  const trackError = async (errorMessage: string, errorCode?: string) => {
    await trackEvent('error', { 
      message: errorMessage,
      code: errorCode 
    });
  };

  /**
   * 重试失败的分析数据
   */
  const retryFailedAnalytics = async () => {
    await analytics.retryFailedAnalytics();
  };

  /**
   * 获取用户信息
   */
  const getUserInfo = () => {
    return analytics.getUserInfo();
  };

  return {
    userInfo,
    initialize,
    trackEvent,
    trackPageView,
    trackFeatureUsage,
    trackError,
    retryFailedAnalytics,
    getUserInfo
  };
} 