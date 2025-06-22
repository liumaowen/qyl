<template>
  <ion-page>
    <ion-content :fullscreen="true" class="video-container">
      <ShortVideoSwiper
        :video-list="videoList"
        :container-width="containerWidth"
        :container-height="containerHeight"
        :progress="progress"
        @loadMore="loadMoreData"
      />
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue';
import { IonPage, IonContent } from '@ionic/vue';
import { fetchApiOpenTopVideos, fetchMGTVVideoList, fetchVideo2, fetchVideo3, fetchConfig, fetchduanju, VideoItem } from '@/api/video';
import { shortVideoConfig, ShortVideoConfigType } from '@/store/state';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import ShortVideoSwiper from '@/components/ShortVideoSwiper.vue';

const videoList = ref<VideoItem[]>([]);
const progress = ref<number[]>([]);
const containerWidth = ref(window.innerWidth);
const containerHeight = ref(window.innerHeight - 50.8);
let currentPage = 1;
const pageSize = 4;
let isLoading = false;

const updateSize = () => {
  containerWidth.value = window.innerWidth;
  containerHeight.value = window.innerHeight - 50.8;
};

const loadMoreData = async () => {
  isLoading = true;
  let newData = await fetchApiOpenTopVideos(currentPage, pageSize);
  const results = await Promise.allSettled([
    fetchVideo2(),
    fetchVideo3()
  ]);
  const fulfilledVideos = results
    .filter((r): r is PromiseFulfilledResult<VideoItem[]> => r.status === 'fulfilled')
    .flatMap(r => r.value);
  newData = [...newData, ...fulfilledVideos];
  if (newData.length > 0) {
    videoList.value = [...videoList.value, ...newData];
    await nextTick();
    newData.forEach((_, index) => {
      const newIndex = videoList.value.length + index;
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
  fetchMGTVVideoList(params).then(videos => {
    if (videos.length > 0) {
      videoList.value = [...videoList.value, ...videos];
      videos.forEach((_, index) => {
        const newIndex = videoList.value.length - videos.length + index;
        progress.value[newIndex] = 0;
      });
    }
  });
  duanju();
  isLoading = false;
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
  await fetchConfig();
});

</script>

<style scoped>
.video-container {
  padding: 0;
  margin: 0;
}
</style>