<template>
  <div class="ads-test">
    <ion-button size="small" @click="loadInterstitial">加载插屏</ion-button>
    <ion-button size="small" color="secondary" @click="showInterstitial">展示插屏</ion-button>
    <ion-button size="small" @click="loadRewarded">加载激励</ion-button>
    <ion-button size="small" color="tertiary" @click="showRewarded">展示激励</ion-button>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { IonButton, toastController } from '@ionic/vue'
import { StartioAds, onInterstitialEvent, onRewardedEvent } from '@/utils/startioAds'

const toast = async (message: string, color: any = 'primary') => {
  const t = await toastController.create({ message, duration: 1200, position: 'top', color })
  await t.present()
}

onMounted(async () => {
  try {
    await StartioAds.init()
  } catch {}

  onInterstitialEvent(async (e: any) => {
    if (e?.event === 'loaded') await toast('插屏已加载', 'success')
    if (e?.event === 'failed') await toast('插屏加载失败', 'danger')
  })
  onRewardedEvent(async (e: any) => {
    if (e?.event === 'loaded') await toast('激励已加载', 'success')
    if (e?.event === 'failed') await toast('激励加载失败', 'danger')
  })
})

const loadInterstitial = async () => {
  try { await StartioAds.loadInterstitial(); } catch { await toast('加载失败', 'danger') }
}
const showInterstitial = async () => {
  try { await StartioAds.showInterstitial(); } catch { await toast('未就绪', 'warning') }
}
const loadRewarded = async () => {
  try { await StartioAds.loadRewarded(); } catch { await toast('加载失败', 'danger') }
}
const showRewarded = async () => {
  try { await StartioAds.showRewarded(); } catch { await toast('未就绪', 'warning') }
}
</script>

<style scoped>
.ads-test {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  margin-top: 8px;
}
</style> 