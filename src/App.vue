<template>
  <ion-app>
    <ion-router-outlet />
    <div v-if="showDownloadAlert" class="download-pop-mask">
      <div class="download-pop">
        <div class="download-title">{{ $t('update.updateProgress') }}</div>
        <div class="download-bar">
          <div class="progress-bar">
            <div class="progress-inner" :style="{ width: Math.round(progress * 100) + '%' }"></div>
          </div>
        </div>
        <div class="download-text">{{ $t('update.updateCompleted', { percent: Math.round(progress * 100) }) }}</div>
      </div>
    </div>
  </ion-app>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { IonApp, IonRouterOutlet } from '@ionic/vue';
import { useAppUpdate } from './composables/useAppUpdate';
import { useUserAnalytics } from './composables/useUserAnalytics';
import { fetchConfig,getConfig } from '@/api/video';
import { isadlook,ismgtv } from '@/store/state';
import { initializeAdSDKs, setupAdEventListeners } from '@/utils/adManager';

const { showDownloadAlert, progress, checkUpdate } = useAppUpdate();
const { initialize: initializeAnalytics } = useUserAnalytics();

onMounted(async () => {
  // 初始化用户分析
  await initializeAnalytics();

  // 初始化广告SDK
  setupAdEventListeners();
  await initializeAdSDKs('44273068BFF4D8A8AFF3D5B11CBA3ADE');

  // 获取配置和检查更新
  fetchConfig();
  checkUpdate(false);
  const configs = await getConfig();
  const adConfig = configs.find((item: any) => item.key === 'isadlook');
  if (adConfig) {
    isadlook.value = JSON.parse(adConfig.value);
  }
  const mgConfig = configs.find((item: any) => item.key === 'ismgtv');
  if (mgConfig) {
    ismgtv.value = JSON.parse(mgConfig.value);
  }
});
</script>

<style scoped>
.download-pop-mask {
  position: fixed;
  z-index: 9999;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
}

.download-pop {
  background: #222;
  color: #fff;
  border-radius: 10px;
  padding: 24px 32px;
  min-width: 260px;
  text-align: center;
}

.progress-bar {
  width: 80%;
  height: 10px;
  background: #444;
  border-radius: 5px;
  margin: 16px auto 8px auto;
  overflow: hidden;
}

.progress-inner {
  height: 100%;
  background: #3880ff;
  transition: width 0.3s;
}

.download-title {
  font-size: 18px;
  margin-bottom: 12px;
}

.download-text {
  margin-top: 8px;
  font-size: 15px;
}

.update-pop .alert-message {
  text-align: center;
  margin-top: 12px;
  font-size: 16px;
  line-height: 1.6;
}

.update-pop .versions {
  margin-bottom: 4px;
}
</style>
