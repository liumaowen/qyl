<template>
  <ion-page>
    <ion-header >
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/tabs/ShortDramas"></ion-back-button>
        </ion-buttons>
        <ion-title class="title">第{{titlecount}}集</ion-title>
      </ion-toolbar>
    </ion-header>
    
    <ion-content :fullscreen="true" class="fullscreen-content">
        <ShortVideoSwiper ref="swiperRef" 
        :video-list="dramaDetails" 
        :container-width="containerWidth"
        :container-height="containerHeight" 
        :progress="progress" 
        @update:progress="onProgressUpdate"
        @update:swiperChange="onSwiperChange"
         />
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { 
  IonPage, 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent, 
  IonBackButton, 
  IonButtons
} from '@ionic/vue';
import { getShortdetail, type MovieDetail, type VideoItem,getAd,type AdItem } from '@/api/video';
import ShortVideoSwiper from '@/components/ShortVideoSwiper.vue';

const route = useRoute();
const dramaDetails = ref<MovieDetail[]>([]);
const progress = ref<number[]>([]);
const containerWidth = ref(window.innerWidth);
const containerHeight = ref(window.innerHeight - 50.8);
const titlecount = ref(1);
// 广告数据
let adData: VideoItem[] = [];

const onProgressUpdate = ({ index, value }: { index: number, value: number }) => {
  progress.value[index] = value;
};
const onSwiperChange = ({currentIndex}:{currentIndex: number}) => {
  titlecount.value = currentIndex + 1;
};
const updateSize = () => {
  containerWidth.value = window.innerWidth;
  containerHeight.value = window.innerHeight - 50.8;
};
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
  const id = route.params.id as string;
  const title = route.query.title as string;
  
  window.addEventListener('resize', updateSize);
  updateSize();
  if (id) {
    try {
      const details = await getShortdetail(id);
      // 将 MovieDetail[] 转换为 VideoItem[]
      dramaDetails.value = details.map((detail: MovieDetail) => ({
        src: detail.src,
        collectionIndex: detail.collectionIndex,
        poster: detail.poster,
        id: detail.id,
        title: title || '短剧',
        type: 'application/x-mpegURL'
      }));
      const ads = await getAd();
      if (ads.length > 0) {
        // 对新数据插入广告
        dramaDetails.value = insertAds(dramaDetails.value);
      }
    } catch (error) {
      console.error('获取短剧详情失败:', error);
    }
  }
});
// 在数据加载时插入广告
const insertAds = (videos: MovieDetail[]) => {
  // 每10个视频插入一个广告
  const result: Array<MovieDetail> = [];
  videos.forEach((video, index) => {
    result.push(video);

    // 每10个视频插入一个广告，且确保有广告可用
    if ((index + 1) % 10 === 0 && adData.length) {
      // 复制广告对象，避免重复使用同一个,插入完广告后，将广告对象push到adData数组中
      const adCopy = adData.shift() as MovieDetail;
      if (adCopy) {
        result.push(adCopy);
        adData.push(adCopy);
      }
    }
  });
  return result;
};
</script>

<style scoped>
ion-header {
  --background: rgba(0, 0, 0, 0);
}

ion-toolbar {
  --background: rgba(0, 0, 0, 0);
  --border-style: none;
  --color: #fff;
}
.title{
    padding-left: 0!important;
}
.header-md{
    box-shadow:none!important;
}
.fullscreen-content {
  --background: #000;
  --padding-top: 0;
  --padding-bottom: 0;
  --padding-start: 0;
  --padding-end: 0;
}

ion-content {
  --background: #000;
}

.drama-detail {
  padding: 16px;
}

.episode-item {
  margin-bottom: 24px;
}

.episode-item h3 {
  margin-bottom: 12px;
  color: #333;
  font-size: 18px;
  font-weight: bold;
}

.episode-video {
  width: 100%;
  height: 200px;
  border-radius: 8px;
  background: #000;
}
</style>