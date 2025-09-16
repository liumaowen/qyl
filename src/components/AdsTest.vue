<template>
  <div class="ads-test">
    <ion-button size="small" @click="loadInterstitial">加载插屏</ion-button>
    <ion-button size="small" color="secondary" @click="showInterstitial">展示插屏</ion-button>
    <ion-button size="small" @click="loadRewarded">加载激励</ion-button>
    <ion-button size="small" color="tertiary" @click="showRewarded">展示激励</ion-button>
    
    <!-- 调试日志显示区域 -->
    <div class="debug-logs">
      <h4>调试日志：</h4>
      <div class="log-container">
        <div v-for="(log, index) in debugLogs" :key="index" class="log-item">
          {{ log }}
        </div>
      </div>
      <ion-button size="small" fill="outline" @click="clearLogs">清空日志</ion-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { IonButton, toastController } from '@ionic/vue'
import { StartioAds, onInterstitialEvent, onRewardedEvent } from '@/utils/startioAds'

// 调试日志
const debugLogs = ref<string[]>([])

const addLog = (message: string) => {
  const timestamp = new Date().toLocaleTimeString()
  debugLogs.value.push(`[${timestamp}] ${message}`)
  // 限制日志数量，避免内存过多
  if (debugLogs.value.length > 50) {
    debugLogs.value = debugLogs.value.slice(-30)
  }
}

const clearLogs = () => {
  debugLogs.value = []
}

const toast = async (message: string, color: any = 'primary') => {
  const t = await toastController.create({ message, duration: 1200, position: 'top', color })
  await t.present()
}

onMounted(async () => {
  try {
    await StartioAds.init()
    addLog('StartioAds 初始化成功')
  } catch (error) {
    addLog('StartioAds 初始化失败: ' + error)
  }

  // 监听调试日志事件
  // @ts-ignore
  StartioAds.addListener?.('debugLog', (e: any) => {
    if (e?.message) {
      addLog(e.message)
    }
  })

  onInterstitialEvent(async (e: any) => {
    if (e?.event === 'loaded') {
      await toast('插屏已加载', 'success')
      addLog('插屏广告加载成功')
    }
    if (e?.event === 'failed') {
      await toast('插屏加载失败'+JSON.stringify(e), 'danger')
      addLog('插屏广告加载失败: ' + JSON.stringify(e))
    }
  })
  onRewardedEvent(async (e: any) => {
    if (e?.event === 'loaded') {
      await toast('激励已加载', 'success')
      addLog('激励广告加载成功')
    }
    if (e?.event === 'failed') {
      await toast('激励加载失败'+JSON.stringify(e), 'danger')
      addLog('激励广告加载失败: ' + JSON.stringify(e))
    }
  })
})

const loadInterstitial = async () => {
  addLog('开始加载插屏广告...')
  try { 
    await StartioAds.loadInterstitial()
    addLog('插屏广告加载请求已发送')
  } catch (error) { 
    await toast('加载失败', 'danger')
    addLog('插屏广告加载请求失败: ' + error)
  }
}
const showInterstitial = async () => {
  addLog('尝试显示插屏广告...')
  try { 
    await StartioAds.showInterstitial()
    addLog('插屏广告显示请求已发送')
  } catch (error) { 
    await toast('未就绪', 'warning')
    addLog('插屏广告显示失败: ' + error)
  }
}
const loadRewarded = async () => {
  addLog('开始加载激励广告...')
  try { 
    await StartioAds.loadRewarded()
    addLog('激励广告加载请求已发送')
  } catch (error) { 
    await toast('加载失败', 'danger')
    addLog('激励广告加载请求失败: ' + error)
  }
}
const showRewarded = async () => {
  addLog('尝试显示激励广告...')
  try { 
    await StartioAds.showRewarded()
    addLog('激励广告显示请求已发送')
  } catch (error) { 
    await toast('未就绪', 'warning')
    addLog('激励广告显示失败: ' + error)
  }
}
</script>

<style scoped>
.ads-test {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  margin-top: 8px;
}

.debug-logs {
  grid-column: 1 / -1;
  margin-top: 16px;
  padding: 12px;
  background-color: #f5f5f5;
  border-radius: 8px;
  border: 1px solid #ddd;
}

.debug-logs h4 {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #333;
}

.log-container {
  max-height: 200px;
  overflow-y: auto;
  background-color: #fff;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 8px;
  margin-bottom: 8px;
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