<template>
  <ion-page>
    <ion-content :fullscreen="true" class="video-container">
      <ShortVideoSwiper ref="swiperRef" 
      :video-list="videoList" 
      :container-width="containerWidth"
      :container-height="containerHeight" 
      :progress="progress" 
      @loadMore="loadMoreData"
      @update:progress="onProgressUpdate" />
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import { IonPage, IonContent, onIonViewDidEnter,onIonViewWillEnter, onIonViewWillLeave, onIonViewDidLeave } from '@ionic/vue';
import { fetchApiOpenTopVideos, getAd, AdItem, fetchMGTVVideoList, fetchVideo1, fetchVideo2, fetchVideo3, fetchduanju, VideoItem } from '@/api/video';
import { shortVideoConfig, ShortVideoConfigType } from '@/store/state';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import ShortVideoSwiper from '@/components/ShortVideoSwiper.vue';
import { isContentUnlocked } from '@/utils/unlock';

const videoList = ref<VideoItem[]>([]);
const progress = ref<number[]>([]);
const containerWidth = ref(window.innerWidth);
const containerHeight = ref(window.innerHeight - 50.8);
let currentPage = Math.floor(Math.random() * (1600 - 0 + 1)) + 0;
const pageSize = 4;
// 广告数据
let adData: VideoItem[] = [];
const swiperRef = ref();
const unlocked = ref(isContentUnlocked());

const updateSize = () => {
  containerWidth.value = window.innerWidth;
  containerHeight.value = window.innerHeight - 50.8;
};

const loadMoreData = async () => {
  currentPage = Math.floor(Math.random() * (1600 - 0 + 1)) + 0;
  let newData = await fetchApiOpenTopVideos(currentPage, pageSize);
  if(!unlocked.value) {
    const fulfilledVideos = await fetchVideo1();
    newData = [...newData, ...fulfilledVideos];
  }else{
    const indd = Math.floor(Math.random() * (shortVideoConfig.shortVideoRandomMax - shortVideoConfig.shortVideoRandomMin + 1)) + shortVideoConfig.shortVideoRandomMin;
    const params = {
      PageIndex: indd + '',
      PageSize: 10 + '',
      VideoType: "1",
      SortType: "7"
    };
    const mgtvlist = await fetchMGTVVideoList(params);
    newData = [...newData, ...mgtvlist];
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
  if(unlocked.value) {

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
  const initialData = await fetchApiOpenTopVideos(currentPage, pageSize);
  videoList.value = [...initialData];
  progress.value = initialData.map(() => 0);
  await nextTick();
});
onIonViewDidEnter(async () => {
  const ads = await getAd();
  if (ads.length > 0) {
    adData = [];
    ads.forEach((item: AdItem) => {
      adData.push({
        src: item.link,
        type: 'ad'
      });
    });
  }
  unlocked.value = isContentUnlocked();
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