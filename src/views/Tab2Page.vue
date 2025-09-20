<template>
  <ion-page>
    <ion-content :fullscreen="true" class="video-container">
      <ShortVideoSwiper ref="swiperRef" :video-list="videoList" :container-width="containerWidth"
        :container-height="containerHeight" :progress="progress" @loadMore="loadMoreData"
        @update:progress="onProgressUpdate" />
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import { IonPage, IonContent, onIonViewDidEnter, onIonViewWillEnter, onIonViewWillLeave, onIonViewDidLeave } from '@ionic/vue';
import { fetchApiOpenTopVideos, fetchMGTVVideoList, fetchVideo1, fetchVideo2, fetchVideo3, getConfig, VideoItem } from '@/api/video';
import { shortVideoConfig, ShortVideoConfigType, isadlook, ismgtv } from '@/store/state';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import ShortVideoSwiper from '@/components/ShortVideoSwiper.vue';
import { isContentUnlocked } from '@/utils/unlock';
import { useUserAnalytics } from '@/composables/useUserAnalytics';

const videoList = ref<VideoItem[]>([]);
const progress = ref<number[]>([]);
const containerWidth = ref(window.innerWidth);
const containerHeight = ref(window.innerHeight - 50.8);
let currentPage = Math.floor(Math.random() * (1600 - 0 + 1)) + 0;
const pageSize = 4;
// 广告数据
let adData: VideoItem[] = [];
const swiperRef = ref();

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

</script>

<style scoped>
.video-container {
  padding: 0;
  margin: 0;
}
</style>