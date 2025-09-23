<template>
  <div class="ad-manager-demo">
    <ion-header>
      <ion-toolbar>
        <ion-title>广告管理器演示</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <div class="container">
        <div class="section">
          <h2>广告状态</h2>
          <div class="status-grid">
            <div class="status-item">
              <div class="status-label">TradPlus 插屏</div>
              <div class="status-value" :class="{ 'loaded': adManagerState.adLoadStatus.interstitial.tradplus }">
                {{ adManagerState.adLoadStatus.interstitial.tradplus ? '已加载' : '未加载' }}
              </div>
            </div>
            <div class="status-item">
              <div class="status-label">Startio 插屏</div>
              <div class="status-value" :class="{ 'loaded': adManagerState.adLoadStatus.interstitial.startio }">
                {{ adManagerState.adLoadStatus.interstitial.startio ? '已加载' : '未加载' }}
              </div>
            </div>
            <div class="status-item">
              <div class="status-label">TradPlus 激励</div>
              <div class="status-value" :class="{ 'loaded': adManagerState.adLoadStatus.rewarded.tradplus }">
                {{ adManagerState.adLoadStatus.rewarded.tradplus ? '已加载' : '未加载' }}
              </div>
            </div>
            <div class="status-item">
              <div class="status-label">Startio 激励</div>
              <div class="status-value" :class="{ 'loaded': adManagerState.adLoadStatus.rewarded.startio }">
                {{ adManagerState.adLoadStatus.rewarded.startio ? '已加载' : '未加载' }}
              </div>
            </div>
          </div>
        </div>

        <div class="section">
          <h2>广告操作</h2>
          <div class="button-group">
            <ion-button @click="loadInterstitialAd" expand="block" fill="outline">
              加载插屏广告 (优先 TradPlus)
            </ion-button>
            <ion-button @click="showInterstitialAd" expand="block" fill="solid" color="primary">
              显示插屏广告
            </ion-button>
          </div>
          <div class="button-group">
            <ion-button @click="loadRewardedAd" expand="block" fill="outline">
              加载激励广告 (优先 TradPlus)
            </ion-button>
            <ion-button @click="showRewardedAd" expand="block" fill="solid" color="secondary">
              显示激励广告
            </ion-button>
          </div>
        </div>

        <!-- 调试日志显示区域 -->
        <div class="debug-logs">
          <div class="logs-header">
            <h3>广告调试日志</h3>
            <ion-button size="small" fill="outline" @click="clearAdDebugLogs">清空日志</ion-button>
          </div>
          <div class="log-container">
            <div v-for="(log, index) in adDebugLogs" :key="index" class="log-item">
              {{ log }}
            </div>
          </div>
        </div>
      </div>
    </ion-content>
  </div>
</template>

<script setup lang="ts">
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButton, toastController } from '@ionic/vue';
import { adManagerState, adDebugLogs, loadInterstitial, showInterstitial, loadRewarded, showRewarded, clearAdDebugLogs } from '@/utils/adManager';

const toast = async (message: string, color: any = 'primary') => {
  const t = await toastController.create({ message, duration: 1500, position: 'top', color });
  await t.present();
};

const loadInterstitialAd = async () => {
  try {
    await loadInterstitial('YOUR_TRADPLUS_INTERSTITIAL_ID', true);
    await toast('插屏广告加载请求已发送', 'success');
  } catch (error) {
    await toast('插屏广告加载失败', 'danger');
  }
};

const showInterstitialAd = async () => {
  try {
    const success = await showInterstitial();
    if (success) {
      await toast('插屏广告显示请求已发送', 'success');
    } else {
      await toast('没有可用的插屏广告', 'warning');
    }
  } catch (error) {
    await toast('插屏广告显示失败', 'danger');
  }
};

const loadRewardedAd = async () => {
  try {
    await loadRewarded('YOUR_TRADPLUS_REWARDED_ID', true);
    await toast('激励广告加载请求已发送', 'success');
  } catch (error) {
    await toast('激励广告加载失败', 'danger');
  }
};

const showRewardedAd = async () => {
  try {
    const success = await showRewarded();
    if (success) {
      await toast('激励广告显示请求已发送', 'success');
    } else {
      await toast('没有可用的激励广告', 'warning');
    }
  } catch (error) {
    await toast('激励广告显示失败', 'danger');
  }
};
</script>

<style scoped>
.ad-manager-demo {
  height: 100%;
}

.container {
  padding: 16px;
}

.section {
  margin-bottom: 24px;
  padding: 16px;
  border-radius: 8px;
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
}

.section h2 {
  margin-top: 0;
  margin-bottom: 16px;
  color: #495057;
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.status-item {
  padding: 12px;
  background: white;
  border-radius: 6px;
  border: 1px solid #dee2e6;
  text-align: center;
}

.status-label {
  font-size: 14px;
  color: #6c757d;
  margin-bottom: 4px;
}

.status-value {
  font-size: 16px;
  font-weight: 500;
  color: #6c757d;
}

.status-value.loaded {
  color: #28a745;
  font-weight: 600;
}

.button-group {
  margin-bottom: 16px;
}

.button-group:last-child {
  margin-bottom: 0;
}

.debug-logs {
  padding: 12px;
  background-color: #f5f5f5;
  border-radius: 8px;
  border: 1px solid #ddd;
}

.logs-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.logs-header h3 {
  margin: 0;
  font-size: 16px;
  color: #333;
}

.log-container {
  max-height: 300px;
  overflow-y: auto;
  background-color: #fff;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 8px;
  font-family: monospace;
  font-size: 12px;
}

.log-item {
  margin-bottom: 4px;
  padding: 2px 4px;
  border-radius: 2px;
  word-break: break-all;
}

.log-item:nth-child(even) {
  background-color: #f9f9f9;
}
</style>