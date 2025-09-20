<template>
  <swiper :modules="[Virtual]" direction="vertical" :slides-per-view="1" @slideChange="onSlideChange"
    @swiper="setSwiperRef" @transitionEnd="onSlideTransitionEnd" :virtual="true" :speed="200"
    :style="{ height: containerHeight + 'px' }">
    <swiper-slide v-for="(video, index) in videoList" :key="index" :virtualIndex="index" class="slide-item"
      :style="{ width: containerWidth + 'px', height: containerHeight + 'px' }">
      <!-- 视频内容 -->
      <ShortVideoItem v-if="video.type !== 'ad'" :video="video" :index="index" :container-width="containerWidth"
        :container-height="containerHeight" :progress="progress[index] || 0" :is-playing="playingIndex === index"
        @play="handlePlay" @pause="handlePause" @progressChange="handleProgressChange" />
      <!-- 广告内容 -->
      <div v-else class="ad-wrap">
        <div class="ad-container">
          <!-- <iframe :src="video.src" class="ad-iframe" frameborder="0" allowfullscreen @error="onAdIframeError">
          </iframe> -->
          <div class="ad-overlay">
            <div v-if="adCountdown > 0 && currentAdIndex === index" class="ad-countdown">{{ $t('ad.skipAfter', {
              seconds: adCountdown
            }) }}</div>
            <button v-else-if="currentAdIndex === index" @click.stop="skipAd" class="skip-btn">{{ $t('ad.skipAd')
            }}</button>
          </div>
        </div>
      </div>
    </swiper-slide>
  </swiper>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted, onUnmounted } from 'vue';
import { onIonViewWillLeave, onIonViewDidLeave } from '@ionic/vue';
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Virtual } from 'swiper/modules';
import 'swiper/css';
import ShortVideoItem from './ShortVideoItem.vue';
import { Capacitor } from '@capacitor/core';
import { InAppBrowser } from '@capacitor/inappbrowser';
import { VideoItem, getShortdetail } from '@/api/video';
import eventBus from '@/eventBus';
import { StartioAds } from '@/utils/startioAds';

const props = defineProps<{
  videoList: any[];
  containerWidth: number;
  containerHeight: number;
  progress: number[];
}>();

const emit = defineEmits(['update:progress', 'loadMore', 'update:swiperChange', 'slideChange']);

const playingIndex = ref(0);
const swiperRef = ref<any>();
const adCountdown = ref(0);
const currentAdIndex = ref(-1);
let adTimer: any = null;
const isFullscreen = ref<boolean>(false);
let isAdLoaded = false; // 广告是否已加载

const setSwiperRef = (swiper: any) => {
  swiperRef.value = swiper;
};

const onSlideChange = async (e: any) => {
  const currentIndex = e.activeIndex;
  playingIndex.value = currentIndex;
  const video = props.videoList[currentIndex];
  console.log('播放短剧', video)
  if (video && video.type === 'ad') {
    currentAdIndex.value = currentIndex;

    if (video.isAdlook) {
      adCountdown.value = 0;
    } else {
      if (isAdLoaded) {
        console.log('准备显示全屏广告');
        await showFullscreenAd();
      }
      if (swiperRef.value) {
        swiperRef.value.allowTouchMove = false; // 禁止滑动
        swiperRef.value.update();
      }
      adCountdown.value = video.duration || 6; // 广告倒计时，默认6秒
    }
    if (adTimer) clearInterval(adTimer);
    adTimer = setInterval(() => {
      adCountdown.value--;
      if (adCountdown.value <= 0) {
        clearInterval(adTimer);
        adTimer = null;
        if (swiperRef.value) {
          swiperRef.value.allowTouchMove = true; // 滑动
          swiperRef.value.update();
        }
        video.isAdlook = true;
      }
    }, 1000);
    if (swiperRef.value) {
      swiperRef.value.allowTouchMove = false;
      swiperRef.value.update();
    }
  } else {
    emit('update:swiperChange', { currentIndex });
    currentAdIndex.value = -1;
    if (adTimer) {
      clearInterval(adTimer);
      adTimer = null;
    }
    if (swiperRef.value) {
      swiperRef.value.allowTouchMove = true;
      swiperRef.value.update();
    }
    if (video && video.videotype === 'dm' && video.id) {
      console.log('播放短剧', video)
      const infos = await getShortdetail(video.id);
      video.info = { count: infos.length };
    }
  }
  // 滑到倒数第三个时加载更多
  if (currentIndex === props.videoList.length - 3) {
    emit('loadMore');
  }
};

const onSlideTransitionEnd = async (swiper: any) => {
  await nextTick();
};

const handlePlay = (index: number) => {
  playingIndex.value = index;
};
const handlePause = (index: number) => {
  if (playingIndex.value === index) playingIndex.value = -1;
};
const handleProgressChange = (index: number, value: number) => {
  emit('update:progress', { index, value });
};

// const onAdIframeError = () => {
//   adCountdown.value = 0;
//   if (adTimer) {
//     clearInterval(adTimer);
//     adTimer = null;
//   }
// };
const skipAd = () => {
  const currentAdPosition = currentAdIndex.value;
  currentAdIndex.value = -1;
  // 跳到下一个非广告slide
  for (let i = currentAdPosition + 1; i < props.videoList.length; i++) {
    if (props.videoList[i].type !== 'ad') {
      swiperRef.value.slideTo(i);
      break;
    }
  }
};
const openAd = async (src: string) => {
  if (Capacitor.isNativePlatform()) {
    await InAppBrowser.openInExternalBrowser({ url: src });
  } else {
    window.open(src, '_blank');
  }
};
const pauseAll = () => {
  playingIndex.value = -1;
};
defineExpose({ pauseAll });

onUnmounted(() => {
  // 暂停所有视频
  playingIndex.value = -1;
});
onMounted(async () => {
  // 初始化广告
  await initAds();
});
// 初始化广告
const initAds = async () => {
  try {
    await StartioAds.init();
    console.log('StartioAds 初始化成功');
    // 预加载插屏广告
    await StartioAds.loadInterstitial();
    isAdLoaded = true;
  } catch (error) {
    console.error('StartioAds 初始化失败:', error);
  }
};
// 显示全屏广告
const showFullscreenAd = async () => {
  if (!isAdLoaded) {
    console.log('广告未加载完成');
    return;
  }
  try {
    await StartioAds.showInterstitial();
    console.log('全屏广告显示成功');
    // 重新加载广告以备下次使用
    await StartioAds.loadInterstitial();
  } catch (error) {
    console.error('显示全屏广告失败:', error);
  }
};

onIonViewWillLeave(() => {
  playingIndex.value = -1;
});
onIonViewDidLeave(() => {
  playingIndex.value = -1;
});
</script>

<style scoped>
.swiper {
  background: #000;
}

.ad-wrap {
  position: relative;
  width: 100%;
  height: 100%;
  background: #000;
}

.ad-container {
  position: relative;
  width: 100%;
  height: 100%;
  cursor: pointer;
}

.ad-iframe {
  width: 100%;
  height: 100%;
  border: none;
  pointer-events: none;
}

.ad-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.ad-countdown {
  position: absolute;
  top: 30px;
  right: 20px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 8px 12px;
  border-radius: 20px;
  font-size: 14px;
  pointer-events: none;
}

.skip-btn {
  position: absolute;
  top: 30px;
  right: 20px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  cursor: pointer;
  pointer-events: auto;
}
</style>