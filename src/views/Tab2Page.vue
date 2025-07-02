<template>
  <ion-page>
    <ion-content :fullscreen="true" class="video-container">
      <ShortVideoSwiper
        ref="swiperRef"
        :video-list="videoList"
        :container-width="containerWidth"
        :container-height="containerHeight"
        :progress="progress"
        @loadMore="loadMoreData"
        @update:progress="onProgressUpdate"
      />
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted,onUnmounted, nextTick } from 'vue';
import { IonPage, IonContent,onIonViewDidEnter,onIonViewWillLeave,onIonViewDidLeave } from '@ionic/vue';
import { fetchApiOpenTopVideos,getAd,AdItem, fetchMGTVVideoList,fetchVideo1, fetchVideo2, fetchVideo3, fetchduanju, VideoItem } from '@/api/video';
import { shortVideoConfig, ShortVideoConfigType } from '@/store/state';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import ShortVideoSwiper from '@/components/ShortVideoSwiper.vue';

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

const loadMoreData = async () => {
  currentPage = Math.floor(Math.random() * (1600 - 0 + 1)) + 0;
  let newData = await fetchApiOpenTopVideos(currentPage, pageSize);
  const results = await Promise.allSettled([
    fetchVideo1()
  ]);
  const fulfilledVideos = results
    .filter((r): r is PromiseFulfilledResult<VideoItem[]> => r.status === 'fulfilled')
    .flatMap(r => r.value);
  newData = [...newData, ...fulfilledVideos];
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
  const indd = Math.floor(Math.random() * (shortVideoConfig.shortVideoRandomMax - shortVideoConfig.shortVideoRandomMin + 1)) + shortVideoConfig.shortVideoRandomMin;
  const params = {
    PageIndex: indd + '',
    PageSize: pageSize + '',
    VideoType: "1",
    SortType: "7"
  };
  // fetchMGTVVideoList(params).then(videos => {
  //   if (videos.length > 0) {
  //     videoList.value = [...videoList.value, ...videos];
  //     videos.forEach((_, index) => {
  //       const newIndex = videoList.value.length - videos.length + index;
  //       progress.value[newIndex] = 0;
  //     });
  //   }
  // });
  // duanju();
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

const duanju = () => {
  const params = {
    PageIndex: currentPage + '',
    PageSize: 5 + '',
    ChannelId: "",
    GenderChannelType: ""
  };
  fetchduanju(params).then((res) => {
    if (res.length > 0) {
      videoList.value = [...videoList.value, ...res];
      res.forEach((_, index) => {
        const newIndex = videoList.value.length - res.length + index;
        progress.value[newIndex] = 0;
      });
    }
  });
};

onMounted(async () => {
  if (Capacitor.isNativePlatform()) {
    await StatusBar.setStyle({ style: Style.Dark });
  }
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