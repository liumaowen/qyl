<template>
  <ion-page>
    <div v-if="showDownloadAlert" class="download-pop-mask">
      <div class="download-pop">
        <div class="download-title">正在下载更新，请稍等...</div>
        <div class="download-bar">
          <div class="progress-bar">
            <div class="progress-inner" :style="{ width: Math.round(progress * 100) + '%' }"></div>
          </div>
        </div>
        <div class="download-text">已完成：{{ Math.round(progress * 100) }}%</div>
      </div>
    </div>
    <ion-content class="fullscreen-content">
      <div class="my-container">
        <!-- 用户信息区域 -->
        <div class="user-section">
          <div class="avatar">
            <ion-icon :icon="person" size="large" color="primary"></ion-icon>
          </div>
          <h2 class="username">VIP</h2>
        </div>

        <!-- 功能按钮区域 -->
        <div class="function-section">
          <ion-button 
            expand="block" 
            fill="clear" 
            class="function-btn"
            @click="openWebsite">
            <ion-icon :icon="globe" slot="start"></ion-icon>
            查看官网
          </ion-button>
          
          <ion-button 
            expand="block" 
            fill="clear" 
            class="function-btn"
            @click="checkUpdate">
            <ion-icon :icon="refresh" slot="start"></ion-icon>
            检查更新
          </ion-button>
        </div>

        <!-- 底部信息 -->
        <div class="footer-info">
          <p class="year">© {{ currentYear }} 短剧应用</p>
          <p class="version">版本 {{ appVersion }}</p>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { 
  IonPage, 
  IonContent, 
  IonButton,
  IonIcon
} from '@ionic/vue';
import { person, globe, refresh } from 'ionicons/icons';
import { Capacitor } from '@capacitor/core';
import { InAppBrowser } from '@capacitor/inappbrowser';
import { useAppUpdate } from '@/composables/useAppUpdate';
const { showDownloadAlert, progress, checkUpdate } = useAppUpdate();

// 自动获取当前年度
const currentYear = ref(new Date().getFullYear());

// 自动获取应用版本
const appVersion = ref('v1.0.0'); // 默认版本

// 获取应用版本信息
const getAppVersion = async () => {
  try {
    // 如果使用 Capacitor，可以获取原生版本信息
    if (Capacitor.isNativePlatform()) {
      // 这里可以调用原生API获取版本
      // 例如：const version = await App.getInfo();
      appVersion.value = 'v1.0.0'; // 暂时使用默认值
    } else {
      // Web环境，尝试从环境变量获取版本
      const version = import.meta.env.VITE_APP_VERSION || 'v1.0.0';
      appVersion.value = version;
    }
  } catch (error) {
    console.error('获取版本信息失败:', error);
    appVersion.value = 'v1.0.0'; // 失败时使用默认值
  }
};

// 打开官网
const openWebsite = async () => {
  const websiteUrl = 'https://www.qylapi.top';
  try {
    if (Capacitor.isNativePlatform()) {
      await InAppBrowser.openInExternalBrowser({ url: websiteUrl });
    } else {
      window.open(websiteUrl, '_blank');
    }
  } catch (error) {
    console.error('打开官网失败:', error);
  }
};

onMounted(async () => {
  // 获取应用版本信息
  await getAppVersion();
});

</script>

<style scoped>
ion-header {
  --background: rgba(0, 0, 0, 0);
}

ion-toolbar {
  --background: rgba(0, 0, 0, 0);
  --border-style: none;
  --color: #fff;
}
.title{
    padding-left: 0!important;
}
.header-md{
    box-shadow:none!important;
}
.fullscreen-content {
  --background: #000;
  --padding-top: 0;
  --padding-bottom: 0;
  --padding-start: 0;
  --padding-end: 0;
}

ion-content {
  --background: #f5f5f5;
}

.my-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 20px;
}

.user-section {
  text-align: center;
  margin-bottom: 40px;
  padding: 20px 0;
}

.avatar {
  margin-bottom: 16px;
}

.username {
  margin: 0;
  color: #333;
  font-size: 18px;
  font-weight: 500;
}

.function-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.function-btn {
  --background: #fff;
  --color: #333;
  --border-radius: 8px;
  --box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin: 0;
  height: 56px;
}

.function-btn:hover {
  --background: #f8f9fa;
}

.footer-info {
  text-align: center;
  padding: 20px 0;
  color: #666;
  font-size: 14px;
}

.year, .version {
  margin: 4px 0;
}
</style>