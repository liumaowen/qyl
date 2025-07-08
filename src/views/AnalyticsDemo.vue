<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/tabs/tab1"></ion-back-button>
        </ion-buttons>
        <ion-title>用户分析演示</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div>
        <!-- 用户信息展示 -->
        <ion-card v-if="userInfo">
          <ion-card-header>
            <ion-card-title>用户信息</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <ion-list>
              <ion-item>
                <ion-label>
                  <h3>设备ID</h3>
                  <p>{{ userInfo.deviceId }}</p>
                </ion-label>
              </ion-item>
              <ion-item>
                <ion-label>
                  <h3>设备型号</h3>
                  <p>{{ userInfo.deviceModel }}</p>
                </ion-label>
              </ion-item>
              <ion-item>
                <ion-label>
                  <h3>平台</h3>
                  <p>{{ userInfo.platform }}</p>
                </ion-label>
              </ion-item>
              <ion-item>
                <ion-label>
                  <h3>应用版本</h3>
                  <p>{{ userInfo.appVersion }}</p>
                </ion-label>
              </ion-item>
              <ion-item>
                <ion-label>
                  <h3>系统版本</h3>
                  <p>{{ userInfo.osVersion }}</p>
                </ion-label>
              </ion-item>
              <ion-item>
                <ion-label>
                  <h3>首次使用时间</h3>
                  <p>{{ formatDate(userInfo.firstUseTime) }}</p>
                </ion-label>
              </ion-item>
              <ion-item>
                <ion-label>
                  <h3>最后使用时间</h3>
                  <p>{{ formatDate(userInfo.lastUseTime) }}</p>
                </ion-label>
              </ion-item>
              <ion-item>
                <ion-label>
                  <h3>使用次数</h3>
                  <p>{{ userInfo.useCount }}</p>
                </ion-label>
              </ion-item>
              <ion-item v-if="userInfo.ipAddress">
                <ion-label>
                  <h3>IP地址</h3>
                  <p>{{ userInfo.ipAddress }}</p>
                </ion-label>
              </ion-item>
            </ion-list>
          </ion-card-content>
        </ion-card>

        <!-- 测试按钮 -->
        <ion-card>
          <ion-card-header>
            <ion-card-title>测试功能</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <ion-button expand="block" @click="testPageView" class="ion-margin-bottom">
              测试页面访问事件
            </ion-button>
            
            <ion-button expand="block" @click="testFeatureUsage" class="ion-margin-bottom">
              测试功能使用事件
            </ion-button>
            
            <ion-button expand="block" @click="testErrorEvent" class="ion-margin-bottom">
              测试错误事件
            </ion-button>
            
            <ion-button expand="block" @click="testCustomEvent" class="ion-margin-bottom">
              测试自定义事件
            </ion-button>
            
            <ion-button expand="block" @click="retryFailedData" class="ion-margin-bottom">
              重试失败数据
            </ion-button>
          </ion-card-content>
        </ion-card>

        <!-- 状态信息 -->
        <ion-card>
          <ion-card-header>
            <ion-card-title>状态信息</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <ion-list>
              <ion-item>
                <ion-label>
                  <h3>分析功能状态</h3>
                  <p>{{ isInitialized ? '已初始化' : '未初始化' }}</p>
                </ion-label>
              </ion-item>
              <ion-item>
                <ion-label>
                  <h3>环境</h3>
                  <p>{{ isDevelopment ? '开发环境' : '生产环境' }}</p>
                </ion-label>
              </ion-item>
            </ion-list>
          </ion-card-content>
        </ion-card>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { 
  IonPage, 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent, 
  IonCard, 
  IonCardHeader, 
  IonCardTitle, 
  IonCardContent,
  IonList,
  IonItem,
  IonLabel,
  IonButton,
  IonSpinner,
  IonBackButton,
  IonButtons,
  toastController
} from '@ionic/vue';
import { useUserAnalytics } from '@/composables/useUserAnalytics';

const { 
  userInfo, 
  isInitialized, 
  trackEvent, 
  trackPageView, 
  trackFeatureUsage, 
  trackError, 
  retryFailedAnalytics 
} = useUserAnalytics();

const isDevelopment = computed(() => process.env.NODE_ENV === 'development');

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('zh-CN');
};

const showToast = async (message: string) => {
  const toast = await toastController.create({
    message,
    duration: 2000,
    position: 'top'
  });
  await toast.present();
};

const testPageView = async () => {
  await trackPageView('analytics_demo');
  await showToast('页面访问事件已记录');
};

const testFeatureUsage = async () => {
  await trackFeatureUsage('demo_feature', { 
    action: 'test_click',
    timestamp: Date.now()
  });
  await showToast('功能使用事件已记录');
};

const testErrorEvent = async () => {
  await trackError('测试错误事件', 'TEST_ERROR_001');
  await showToast('错误事件已记录');
};

const testCustomEvent = async () => {
  await trackEvent('custom_demo_event', {
    category: 'demo',
    action: 'button_click',
    label: 'test_button',
    value: 1
  });
  await showToast('自定义事件已记录');
};

const retryFailedData = async () => {
  await retryFailedAnalytics();
  await showToast('重试失败数据完成');
};
</script>

<style scoped>
.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
}

.loading p {
  margin-top: 16px;
  color: var(--ion-color-medium);
}
</style> 