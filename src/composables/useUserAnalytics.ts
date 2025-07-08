import { ref, onMounted } from 'vue';
import UserAnalytics,{type AnalyticsData} from '@/utils/userAnalytics';

export function useUserAnalytics() {
  const userInfo = ref<AnalyticsData | null>(null);
  const isInitialized = ref(false);

  const analytics = UserAnalytics.getInstance();

  /**
   * 初始化用户分析
   */
  const initialize = async () => {
    if (isInitialized.value) return;
    try {
      await analytics.initialize();
      userInfo.value = analytics.getUserInfo();
      isInitialized.value = true;
    } catch (error) {
      console.error('初始化用户分析失败:', error);
    } finally {
    }
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
    isInitialized,
    initialize,
    trackEvent,
    trackPageView,
    trackFeatureUsage,
    trackError,
    retryFailedAnalytics,
    getUserInfo
  };
} 