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
import { IonPage, IonContent, onIonViewWillEnter, onIonViewWillLeave, onIonViewDidLeave } from '@ionic/vue';
import { getAd, AdItem, MovieFormType, fetchduanju, VideoItem,getShortdetail,MovieDetail } from '@/api/video';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import ShortVideoSwiper from '@/components/ShortVideoSwiper.vue';
import { useUserAnalytics } from '@/composables/useUserAnalytics';

const videoList = ref<VideoItem[]>([]);
const progress = ref<number[]>([]);
const containerWidth = ref(window.innerWidth);
const containerHeight = ref(window.innerHeight - 50.8);
const params = ref<MovieFormType>({
  PageIndex: 1,
  PageSize: 5,
  ChannelId: "",
  GenderChannelType: ""
})
const { 
  trackPageView
} = useUserAnalytics();

// 广告数据
let adData: VideoItem[] = [];
const swiperRef = ref();

const updateSize = () => {
  containerWidth.value = window.innerWidth;
  containerHeight.value = window.innerHeight - 50.8;
};

const loadMoreData = async () => {
  params.value.PageIndex = params.value.PageIndex + 1;
  let newData = await fetchduanju(params.value);
  if (newData.length > 0) {
    // 对新数据插入广告
    const newDataWithAds = insertAds(newData);
    videoList.value = [...videoList.value, ...newDataWithAds];
    await nextTick();
    newDataWithAds.forEach((_, index) => {
      const newIndex = videoList.value.length - newDataWithAds.length + index;
      progress.value[newIndex] = 0;
    })
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

// const duanju = () => {
//   const params = {
//     PageIndex: currentPage + '',
//     PageSize: 5 + '',
//     ChannelId: "",
//     GenderChannelType: ""
//   };
//   fetchduanju(parmas.value).then((res) => {
//     if (res.length > 0) {
//       videoList.value = [...videoList.value, ...res];
//       res.forEach((_, index) => {
//         const newIndex = videoList.value.length - res.length + index;
//         progress.value[newIndex] = 0;
//       });
//     }
//   });
// };

const getAds = async () => {
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
}

onMounted(async () => {
  window.addEventListener('resize', updateSize);
  updateSize();
  const initialData = await fetchduanju(params.value);
  videoList.value = [...initialData];
  progress.value = initialData.map(() => 0);
  await nextTick();
  getAds();
  if (videoList.value.length && videoList.value[0].id) {
    const infos = await getShortdetail(videoList.value[0].id);
    videoList.value[0].info = {count:infos.length};
  }
  await trackPageView('ShortDramas');
});
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
  window.removeEventListener('resize', updateSize);
  swiperRef.value?.pauseAll();
});

</script>

<style scoped>
.video-container {
  padding: 0;
  margin: 0;
}
</style>