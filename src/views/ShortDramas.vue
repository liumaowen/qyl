<template>
  <ion-page>
    <ion-content :fullscreen="true" class="video-container">
      <div class="tabs-wrapper" :class="{ 'hide-tab-bar': isFullscreen }">
        <ion-segment v-model="activeCategory" scrollable class="category-tabs">
          <ion-segment-button v-for="cat in categories" :key="cat.id" :value="cat.id" @click="changecat(cat.name)">
            {{ cat.name }}
          </ion-segment-button>
        </ion-segment>
      </div>
      <ShortVideoSwiper ref="swiperRef" :video-list="videoList" :container-width="containerWidth"
        :container-height="containerHeight" :progress="progress" @loadMore="loadMoreData"
        @update:progress="onProgressUpdate" />
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue';
import { IonPage, IonContent, onIonViewWillEnter, onIonViewWillLeave, onIonViewDidLeave, IonSegment, IonSegmentButton } from '@ionic/vue';
import { getAd, AdItem, FormType, MovieFormType, fetchduanju, VideoItem, getShortdetail, MovieDetail, fetchMGTVVideoList } from '@/api/video';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import ShortVideoSwiper from '@/components/ShortVideoSwiper.vue';
import { useUserAnalytics } from '@/composables/useUserAnalytics';
import eventBus from '@/eventBus';

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
const isFullscreen = ref<boolean>(false);

// 广告数据
let adData: VideoItem[] = [];
const swiperRef = ref();
const categories = ref([
  { id: 0, name: '黑料', PageIndex: 1 },
  { id: 1, name: '麻豆', PageIndex: 1 },
  { id: 2, name: '绿帽', PageIndex: 1 },
  { id: 3, name: '萝莉', PageIndex: 1 },
  { id: 4, name: '深喉', PageIndex: 1 },
  { id: 5, name: '泄密', PageIndex: 1 },
  // ...更多分类
]);
const activeCategory = ref(categories.value[0].id);

const updateSize = () => {
  containerWidth.value = window.innerWidth;
  if (isFullscreen.value) {
    containerHeight.value = window.innerHeight;
  } else {
    containerHeight.value = window.innerHeight - 50.8;
  }
};

// 监听分类变化，重新加载数据
watch(activeCategory, async (newCat: number) => {
  console.log('Category changed to:', newCat);
  swiperRef.value?.pauseAll();
  videoList.value = [];
  let data: VideoItem[] = [];
  params.value.PageIndex = categories.value[newCat].PageIndex;
  switch (newCat) {
    case 0: // 黑料
      data = await fetchduanju(params.value);
      break;
    case 1: // 麻豆
      const params1 = {
        PageIndex: params.value.PageIndex + '',
        PageSize: 5 + '',
        VideoType: "",
        CollectionId: "152",
        SortType: "0"
      };
      data = await getmadou(params1);
      break;
    case 2: // 绿帽
      const params2 = {
        PageIndex: params.value.PageIndex + '',
        PageSize: 5 + '',
        VideoType: "",
        CollectionId: "25",
        SortType: "2"
      };
      data = await getmadou(params2);
      break;
    case 3: // 萝莉
      const params3 = {
        PageIndex: params.value.PageIndex + '',
        PageSize: 5 + '',
        VideoType: "",
        CollectionId: "31",
        SortType: "0"
      };
      data = await getmadou(params3);
      break;
    case 4:
      const params4 = {
        PageIndex: params.value.PageIndex + '',
        PageSize: 5 + '',
        VideoType: "",
        CollectionId: "11",
        SortType: "2"
      };
      data = await getmadou(params4);
      break;
    case 5:
      const params5 = {
        PageIndex: params.value.PageIndex + '',
        PageSize: 5 + '',
        VideoType: "",
        CollectionId: "8",
        SortType: "2"
      };
      data = await getmadou(params5);
      break;
    // 添加更多分类的处理逻辑
    default:
      params.value.ChannelId = "";
      params.value.GenderChannelType = "";
  }
  videoList.value = [...data];
  progress.value = data.map(() => 0);
});
const changecat = async (name: string) => {
  await trackPageView(name);
}

const getmadou = async (params: FormType): Promise<VideoItem[]> => {
  return await fetchMGTVVideoList(params);
}

const loadMoreData = async () => {
  params.value.PageIndex = categories.value[activeCategory.value].PageIndex;
  params.value.PageIndex = params.value.PageIndex + 1;
  categories.value[activeCategory.value].PageIndex = params.value.PageIndex;
  let newData: VideoItem[] = [];
  switch (activeCategory.value) {
    case 0: // 黑料
      newData = await fetchduanju(params.value);
      break;
    case 1: // 麻豆
      const params1 = {
        PageIndex: params.value.PageIndex + '',
        PageSize: 5 + '',
        VideoType: "",
        CollectionId: "152",
        SortType: "0"
      };
      newData = await getmadou(params1);
      break;
    case 2: // 绿帽
      const params2 = {
        PageIndex: params.value.PageIndex + '',
        PageSize: 5 + '',
        VideoType: "",
        CollectionId: "25",
        SortType: "2"
      };
      newData = await getmadou(params2);
      break;
    case 3: // 萝莉
      const params3 = {
        PageIndex: params.value.PageIndex + '',
        PageSize: 5 + '',
        VideoType: "",
        CollectionId: "31",
        SortType: "0"
      };
      newData = await getmadou(params3);
    case 4:
      const params4 = {
        PageIndex: params.value.PageIndex + '',
        PageSize: 5 + '',
        VideoType: "",
        CollectionId: "11",
        SortType: "2"
      };
      newData = await getmadou(params4);
      break;
    case 5:
      const params5 = {
        PageIndex: params.value.PageIndex + '',
        PageSize: 5 + '',
        VideoType: "",
        CollectionId: "8",
        SortType: "2"
      };
      newData = await getmadou(params5);
      break;
    // 添加更多分类的处理逻辑
    default:
      params.value.ChannelId = "";
      params.value.GenderChannelType = "";
  }
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
    videoList.value[0].info = { count: infos.length };
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
  eventBus.off('fullscreen-change');
});

</script>

<style scoped>
.video-container {
  padding: 0;
  margin: 0;
}

.tabs-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 9999;
  width: 100vw;
  background: transparent !important;
  pointer-events: auto;
  /* 保证可以点击 */
  /* 添加安全区域适配 */
  padding-top: env(safe-area-inset-top);
}

.category-tabs {
  --background: transparent !important;
  --indicator-color: red !important;
  --color: #fff !important;
  border: none;
  box-shadow: none;
  padding: 8px 8px;
  margin-top: 8px;
  background: transparent !important;
}

ion-segment-button {
  --background: transparent;
  --color: #efefef;
  border: none;
  box-shadow: none;
  font-size: 16px;
  font-weight: 500;
  min-width: unset;
  /* padding: 0 12px;
  margin: 0 2px; */
  transition: color 0.2s, border-bottom 0.2s;
  /* 去除安卓水波纹效果 */
  --ripple-color: transparent;
  outline: none;
  /* 移动端优化 */
  touch-action: manipulation;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}

.segment-button-checked {
  color: #fff !important;
  --indicator-color: transparent !important;
  border-bottom: 2px solid #fff !important;
  border-radius: 0;
  /* 加强选中状态的可见性 */
  font-weight: 600;
  text-shadow: 0 0 1px rgba(255, 255, 255, 0.5);
}
.hide-tab-bar {
  display: none !important;
}
</style>