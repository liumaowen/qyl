<template>
  <ion-app>
    <ion-router-outlet />
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
  </ion-app>
</template>

<script setup lang="ts">
import { IonApp, IonRouterOutlet } from '@ionic/vue';
import { useAppUpdate } from './composables/useAppUpdate';

const { showDownloadAlert, progress } = useAppUpdate();
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
