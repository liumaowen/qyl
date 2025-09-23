<template>
  <div class="ads-test">
    <div class="section">
      <h3>TradPlus 广告测试 (基于官方Demo)</h3>
      <div class="status-info">
        <p><strong>应用ID:</strong> {{ defaultAppId }}</p>
        <p><strong>插屏广告位:</strong> {{ defaultInterstitialId }}</p>
        <p><strong>激励广告位:</strong> {{ defaultRewardedId }}</p>
      </div>
      <div class="button-group">
        <ion-button @click="initTradPlus" expand="block" fill="solid" :disabled="initializing">
          {{ initializing ? '初始化中...' : '初始化 TradPlus' }}
        </ion-button>
      </div>
      <div class="status-item">
        <span>SDK状态: </span>
        <span :class="sdkStatus.class">{{ sdkStatus.text }}</span>
      </div>
    </div>

    <div class="section" v-if="isInitialized">
      <h3>插屏广告</h3>
      <div class="button-group">
        <ion-button @click="loadInterstitial" expand="block" fill="outline" :disabled="loadingInterstitial">
          {{ loadingInterstitial ? '加载中...' : '加载插屏广告' }}
        </ion-button>
        <ion-button @click="showInterstitial" expand="block" fill="solid" color="primary" :disabled="!interstitialReady">
          {{ interstitialReady ? '显示插屏广告' : '插屏广告未准备好' }}
        </ion-button>
      </div>
      <div class="status-item">
        <span>插屏状态: </span>
        <span :class="interstitialStatus.class">{{ interstitialStatus.text }}</span>
      </div>
    </div>

    <div class="section" v-if="isInitialized">
      <h3>激励广告</h3>
      <div class="button-group">
        <ion-button @click="loadRewarded" expand="block" fill="outline" :disabled="loadingRewarded">
          {{ loadingRewarded ? '加载中...' : '加载激励广告' }}
        </ion-button>
        <ion-button @click="showRewarded" expand="block" fill="solid" color="secondary" :disabled="!rewardedReady">
          {{ rewardedReady ? '显示激励广告' : '激励广告未准备好' }}
        </ion-button>
      </div>
      <div class="status-item">
        <span>激励状态: </span>
        <span :class="rewardedStatus.class">{{ rewardedStatus.text }}</span>
      </div>
    </div>

    <!-- 调试日志显示区域 -->
    <div class="debug-logs">
      <h4>TradPlus 调试日志：</h4>
      <div class="log-controls">
        <ion-button size="small" fill="outline" @click="refreshLogs">刷新日志</ion-button>
        <ion-button size="small" fill="outline" @click="clearLogs">清空日志</ion-button>
      </div>
      <div class="log-container">
        <div v-for="(log, index) in debugLogs" :key="index" class="log-item">
          {{ log }}
        </div>
        <div v-if="debugLogs.length === 0" class="no-logs">
          暂无日志
        </div>
      </div>
    </div>
        <!-- 添加GAID显示区域 -->
    <div class="section" v-if="isInitialized">
      <h3>设备信息</h3>
      <div class="button-group">
        <ion-button @click="getGAID" expand="block" fill="outline">
          获取设备GAID
        </ion-button>
      </div>
      <div class="status-item" v-if="gaid">
        <span>设备GAID: </span>
        <span class="status-success">{{ gaid }}</span>
      </div>
      <div class="status-item" v-if="gaidError">
        <span>获取失败: </span>
        <span class="status-error">{{ gaidError }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, onUnmounted } from 'vue'
import { IonButton, toastController } from '@ionic/vue'
import { tradPlusManager, onInterstitialEvent, onRewardedEvent, onDebugLog } from '@/utils/tradplusAds'

// 使用官方demo的测试广告位ID
const defaultAppId = "CE48DA41B98CF7C37A3D02EFDAC3A011"
const defaultInterstitialId = "38FF0240F0D7460BA7953AD828F44512"
const defaultRewardedId = "7B35AB6673DC0B0AB745291343296912"

// 状态管理
const isInitialized = ref(false)
const initializing = ref(false)
const loadingInterstitial = ref(false)
const loadingRewarded = ref(false)
const interstitialReady = ref(false)
const rewardedReady = ref(false)
const debugLogs = ref<string[]>([])

// 添加GAID相关状态
const gaid = ref('')
const gaidError = ref('')

// 事件监听器引用
let interstitialListener: any
let rewardedListener: any
let debugListener: any

// 计算状态显示
const sdkStatus = computed(() => {
  if (initializing.value) {
    return { text: '初始化中...', class: 'status-warning' }
  }
  if (isInitialized.value) {
    return { text: '✅ 已初始化', class: 'status-success' }
  }
  return { text: '❌ 未初始化', class: 'status-error' }
})

const interstitialStatus = computed(() => {
  if (loadingInterstitial.value) {
    return { text: '⏳ 加载中...', class: 'status-warning' }
  }
  if (interstitialReady.value) {
    return { text: '✅ 已准备好', class: 'status-success' }
  }
  return { text: '❌ 未准备好', class: 'status-error' }
})

const rewardedStatus = computed(() => {
  if (loadingRewarded.value) {
    return { text: '⏳ 加载中...', class: 'status-warning' }
  }
  if (rewardedReady.value) {
    return { text: '✅ 已准备好', class: 'status-success' }
  }
  return { text: '❌ 未准备好', class: 'status-error' }
})

const toast = async (message: string, color: any = 'primary') => {
  const t = await toastController.create({
    message,
    duration: 2000,
    position: 'top',
    color
  })
  await t.present()
}

// 添加获取GAID的方法
const getGAID = async () => {
  try {
    const result = await tradPlusManager.getGAID()
    if (result.success && result.gaid) {
      gaid.value = result.gaid
      gaidError.value = ''
      await toast('成功获取GAID', 'success')
    } else {
      gaidError.value = result.error || '未知错误'
      gaid.value = ''
    }
  } catch (error) {
    gaidError.value = error instanceof Error ? error.message : '获取GAID时发生错误'
    gaid.value = ''
    console.error('获取GAID失败:', error)
  }
}

onMounted(() => {
  setupEventListeners()
  refreshLogs()

  // 自动初始化 (因为MainActivity已经处理了隐私合规)
  setTimeout(() => {
    if (!isInitialized.value) {
      initTradPlus()
    }
  }, 1000)
})

onUnmounted(() => {
  // 清理事件监听器
  if (interstitialListener) interstitialListener.remove?.()
  if (rewardedListener) rewardedListener.remove?.()
  if (debugListener) debugListener.remove?.()
})

function setupEventListeners() {
  // 监听调试日志
  debugListener = onDebugLog((event) => {
    const logMessage = `${new Date().toLocaleTimeString()}: ${event.message}`
    debugLogs.value.push(logMessage)
    // 只保留最近50条日志
    if (debugLogs.value.length > 50) {
      debugLogs.value = debugLogs.value.slice(-50)
    }
  })

  // 监听插屏广告事件
  interstitialListener = onInterstitialEvent(async (event) => {
    console.log('[TradPlus Interstitial Event]', event)

    switch (event.event) {
      case 'loaded':
        loadingInterstitial.value = false
        await checkInterstitialReady()
        await toast('插屏广告加载成功', 'success')
        break
      case 'failed':
        loadingInterstitial.value = false
        interstitialReady.value = false
        await toast(`插屏广告加载失败: ${event.error}`, 'danger')
        break
      case 'shown':
        await toast('插屏广告已展示', 'primary')
        break
      case 'clicked':
        await toast('插屏广告被点击', 'primary')
        break
      case 'closed':
        await toast('插屏广告已关闭', 'primary')
        await checkInterstitialReady() // 重新检查状态
        break
    }
  })

  // 监听激励广告事件
  rewardedListener = onRewardedEvent(async (event) => {
    console.log('[TradPlus Rewarded Event]', event)

    switch (event.event) {
      case 'loaded':
        loadingRewarded.value = false
        await checkRewardedReady()
        await toast('激励广告加载成功', 'success')
        break
      case 'failed':
        loadingRewarded.value = false
        rewardedReady.value = false
        await toast(`激励广告加载失败: ${event.error}`, 'danger')
        break
      case 'shown':
        await toast('激励广告已展示', 'primary')
        break
      case 'clicked':
        await toast('激励广告被点击', 'primary')
        break
      case 'rewarded':
        await toast(`🎁 奖励已发放: ${event.currency} x ${event.amount}`, 'success')
        break
      case 'closed':
        await toast('激励广告已关闭', 'primary')
        await checkRewardedReady() // 重新检查状态
        break
    }
  })
}

async function initTradPlus() {
  initializing.value = true
  try {
    const success = await tradPlusManager.initialize()
    isInitialized.value = success

    if (success) {
      await toast('TradPlus SDK 初始化成功', 'success')
    } else {
      await toast('TradPlus SDK 初始化失败', 'danger')
    }
  } catch (error) {
    console.error('初始化 TradPlus 时出错:', error)
    await toast('初始化失败', 'danger')
  } finally {
    initializing.value = false
  }
}

async function loadInterstitial() {
  if (!isInitialized.value) {
    await toast('请先初始化SDK', 'warning')
    return
  }

  loadingInterstitial.value = true
  try {
    const success = await tradPlusManager.loadInterstitial()
    if (!success) {
      loadingInterstitial.value = false
      await toast('插屏广告加载失败', 'danger')
    }
  } catch (error) {
    console.error('加载插屏广告时出错:', error)
    loadingInterstitial.value = false
    await toast('加载失败', 'danger')
  }
}

async function showInterstitial() {
  if (!interstitialReady.value) {
    await toast('插屏广告未准备好', 'warning')
    return
  }

  try {
    const success = await tradPlusManager.showInterstitial()
    if (!success) {
      await toast('插屏广告展示失败', 'danger')
    }
  } catch (error) {
    console.error('展示插屏广告时出错:', error)
    await toast('展示失败', 'danger')
  }
}

async function loadRewarded() {
  if (!isInitialized.value) {
    await toast('请先初始化SDK', 'warning')
    return
  }

  loadingRewarded.value = true
  try {
    const success = await tradPlusManager.loadRewarded()
    if (!success) {
      loadingRewarded.value = false
      await toast('激励广告加载失败', 'danger')
    }
  } catch (error) {
    console.error('加载激励广告时出错:', error)
    loadingRewarded.value = false
    await toast('加载失败', 'danger')
  }
}

async function showRewarded() {
  if (!rewardedReady.value) {
    await toast('激励广告未准备好', 'warning')
    return
  }

  try {
    const success = await tradPlusManager.showRewarded()
    if (!success) {
      await toast('激励广告展示失败', 'danger')
    }
  } catch (error) {
    console.error('展示激励广告时出错:', error)
    await toast('展示失败', 'danger')
  }
}

async function checkInterstitialReady() {
  interstitialReady.value = await tradPlusManager.isInterstitialReady()
}

async function checkRewardedReady() {
  rewardedReady.value = await tradPlusManager.isRewardedReady()
}

function refreshLogs() {
  debugLogs.value = tradPlusManager.getDebugLogs()
}

function clearLogs() {
  tradPlusManager.clearDebugLogs()
  debugLogs.value = []
}
</script>

<style scoped>
.ads-test {
  width: 100%;
  padding: 16px;
}

.section {
  margin-bottom: 24px;
  padding: 16px;
  border-radius: 8px;
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
}

.section h3 {
  margin-top: 0;
  margin-bottom: 16px;
  color: #495057;
}

.status-info {
  margin-bottom: 16px;
  padding: 12px;
  background-color: #e3f2fd;
  border-radius: 4px;
  font-size: 14px;
  line-height: 1.6;
}

.status-info p {
  margin: 4px 0;
}

.status-item {
  margin-top: 12px;
  font-size: 14px;
  font-weight: 500;
}

.status-success {
  color: #28a745;
}

.status-error {
  color: #dc3545;
}

.status-warning {
  color: #ffc107;
}

.button-group {
  margin-bottom: 12px;
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

.debug-logs h4 {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #333;
}

.log-controls {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.log-container {
  max-height: 300px;
  overflow-y: auto;
  background-color: #1a1a1a;
  border: 1px solid #333;
  border-radius: 4px;
  padding: 8px;
  margin-bottom: 8px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 12px;
  color: #f8f8f2;
}

.log-item {
  margin-bottom: 4px;
  padding: 2px 4px;
  border-radius: 2px;
  word-break: break-all;
  line-height: 1.4;
  color: #a6e22e;
}

.no-logs {
  text-align: center;
  color: #666;
  padding: 20px;
  font-style: italic;
}
</style>