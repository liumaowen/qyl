<template>
  <ion-page>
    <ion-content :fullscreen="true" class="video-container">
      <ion-button @click="testAdInit" style="position: absolute; top: 10px; right: 10px; z-index: 1000;">测试广告</ion-button>
      <ShortVideoSwiper ref="swiperRef" :video-list="videoList" :container-width="containerWidth"
        :container-height="containerHeight" :progress="progress" @loadMore="loadMoreData"
        @update:progress="onProgressUpdate" />

      <!-- 广告调试日志显示区域 -->
      <div v-if="showDebugLogs" style="position: fixed; bottom: 0; left: 0; right: 0; background: rgba(0,0,0,0.8); color: white; padding: 10px; max-height: 200px; overflow-y: auto; z-index: 1000;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
          <h4 style="margin: 0; font-size: 14px;">广告调试日志:</h4>
          <ion-button size="small" @click="clearDebugLogs" style="font-size: 12px;">清空</ion-button>
        </div>
        <div v-for="(log, index) in debugLogs" :key="index" style="font-size: 12px; margin-bottom: 2px;">
          {{ log }}
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import { IonPage, IonContent, IonButton, onIonViewDidEnter, onIonViewWillEnter, onIonViewWillLeave, onIonViewDidLeave } from '@ionic/vue';
import { fetchApiOpenTopVideos, fetchMGTVVideoList, fetchVideo1, fetchVideo2, fetchVideo3, getConfig, VideoItem } from '@/api/video';
import { shortVideoConfig, ShortVideoConfigType, isadlook, ismgtv } from '@/store/state';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import ShortVideoSwiper from '@/components/ShortVideoSwiper.vue';
import { isContentUnlocked } from '@/utils/unlock';
import { useUserAnalytics } from '@/composables/useUserAnalytics';
import { StartioAds, onDebugLog } from '@/utils/startioAds';

const videoList = ref<VideoItem[]>([]);
const progress = ref<number[]>([]);
const containerWidth = ref(window.innerWidth);
const containerHeight = ref(window.innerHeight - 50.8);
let currentPage = Math.floor(Math.random() * (1600 - 0 + 1)) + 0;
const pageSize = 4;
// 广告数据
let adData: VideoItem[] = [];
const swiperRef = ref();

// 调试日志相关
const debugLogs = ref<string[]>([]);
const showDebugLogs = ref(true);

// 添加调试日志
const addDebugLog = (message: string) => {
  const timestamp = new Date().toLocaleTimeString();
  debugLogs.value.push(`[${timestamp}] ${message}`);
  // 限制日志数量
  if (debugLogs.value.length > 50) {
    debugLogs.value = debugLogs.value.slice(-30);
  }
};

// 清空调试日志
const clearDebugLogs = () => {
  debugLogs.value = [];
};

const updateSize = () => {
  containerWidth.value = window.innerWidth;
  containerHeight.value = window.innerHeight - 50.8;
};
const {
  trackPageView
} = useUserAnalytics();

const loadMoreData = async () => {
  currentPage = Math.floor(Math.random() * (1600 - 0 + 1)) + 0;
  let newData: VideoItem[] = [];
  if (ismgtv.value) {
    const indd = Math.floor(Math.random() * (shortVideoConfig.shortVideoRandomMax - shortVideoConfig.shortVideoRandomMin + 1)) + shortVideoConfig.shortVideoRandomMin;
    const params = {
      PageIndex: indd + '',
      PageSize: 5 + '',
      VideoType: "1",
      SortType: "7"
    };
    let mgtvlist = await fetchMGTVVideoList(params);
    if (!mgtvlist.length) {
      mgtvlist = await fetchVideo1();
    }
    newData = [...newData, ...mgtvlist];
  } else {
    newData = await fetchApiOpenTopVideos(currentPage, pageSize);
    if (!isContentUnlocked()) {
      const fulfilledVideos = await fetchVideo1();
      newData = [...newData, ...fulfilledVideos];
    } else {
      const indd = Math.floor(Math.random() * (shortVideoConfig.shortVideoRandomMax - shortVideoConfig.shortVideoRandomMin + 1)) + shortVideoConfig.shortVideoRandomMin;
      const params = {
        PageIndex: indd + '',
        PageSize: 5 + '',
        VideoType: "1",
        SortType: "7"
      };
      let mgtvlist = await fetchMGTVVideoList(params);
      if (!mgtvlist.length) {
        mgtvlist = await fetchVideo1();
      }
      newData = [...newData, ...mgtvlist];
    }
  }
  if (newData.length > 0) {
    // 对新数据插入广告
    const newDataWithAds = insertAds(newData);
    videoList.value = [...videoList.value, ...newDataWithAds];
    await nextTick();
    newDataWithAds.forEach((_, index) => {
      const newIndex = videoList.value.length - newDataWithAds.length + index;
      progress.value[newIndex] = 0;
    });
  }
};
// 在数据加载时插入广告
const insertAds = (videos: VideoItem[]) => {
  // 每10个视频插入一个广告
  const result: Array<VideoItem> = [];
  videos.forEach((video, index) => {
    result.push(video);

    // 每10个视频插入一个广告，且确保有广告可用
    if ((index + 1) % 10 === 0 && adData.length) {
      // 复制广告对象，避免重复使用同一个,插入完广告后，将广告对象push到adData数组中
      const adCopy = adData.shift() as VideoItem;
      if (adCopy) {
        result.push(adCopy);
        adData.push(adCopy);
      }
    }
  });

  return result;
};
const onProgressUpdate = ({ index, value }: { index: number, value: number }) => {
  progress.value[index] = value;
};

onMounted(async () => {
  window.addEventListener('resize', updateSize);
  updateSize();
  await getConfig();
  const initialData = await fetchApiOpenTopVideos(currentPage, pageSize);
  let mgtvlist: VideoItem[] = [];
  if (ismgtv.value) {
    const indd = Math.floor(Math.random() * (shortVideoConfig.shortVideoRandomMax - shortVideoConfig.shortVideoRandomMin + 1)) + shortVideoConfig.shortVideoRandomMin;
    const params = {
      PageIndex: indd + '',
      PageSize: 5 + '',
      VideoType: "1",
      SortType: "7"
    };
    mgtvlist = await fetchMGTVVideoList(params);
  }
  videoList.value = [...initialData, ...mgtvlist];
  progress.value = initialData.map(() => 0);
  await nextTick();
  await trackPageView('Tab2Page');

  // 监听调试日志事件
  onDebugLog((e: any) => {
    if (e?.message) {
      addDebugLog(e.message);
    }
  });

  // 初始化广告
  try {
    addDebugLog('开始初始化广告...');
    await StartioAds.init();
    addDebugLog('✅ 广告初始化成功');
    console.log('Tab2Page 广告初始化成功');
    // 预加载插屏广告
    addDebugLog('🚀 开始预加载插屏广告...');
    await StartioAds.loadInterstitial();
    addDebugLog('🎉 插屏广告预加载成功');
    console.log('Tab2Page 插屏广告预加载成功');
  } catch (error) {
    addDebugLog('❌ 广告初始化失败: ' + error);
    console.error('Tab2Page 广告初始化失败:', error);
  }
});
onIonViewDidEnter(async () => {
  if (isadlook.value) {
    let i = 0;
    do {
      adData.push({
        src: '',
        type: 'ad'
      });
      i++;
    } while (i < 10);
  }
})
onIonViewWillEnter(async () => {
  if (Capacitor.isNativePlatform()) {
    await StatusBar.setStyle({ style: Style.Dark });
  }
})
onIonViewWillLeave(() => {
  swiperRef.value?.pauseAll();
});
onIonViewDidLeave(() => {
  swiperRef.value?.pauseAll();
});
onUnmounted(() => {
  swiperRef.value?.pauseAll();
});

// 测试广告初始化
const testAdInit = async () => {
  try {
    addDebugLog('开始测试广告初始化...');
    console.log('开始测试广告初始化...');
    await StartioAds.init();
    addDebugLog('✅ 广告初始化成功');
    console.log('广告初始化成功');

    // 预加载插屏广告
    addDebugLog('🚀 开始预加载插屏广告...');
    await StartioAds.loadInterstitial();
    addDebugLog('🎉 插屏广告预加载成功');
    console.log('插屏广告预加载成功');
  } catch (error) {
    addDebugLog('❌ 广告初始化失败: ' + error);
    console.error('广告初始化失败:', error);
  }
};

</script>

<style scoped>
.video-container {
  padding: 0;
  margin: 0;
}
</style>