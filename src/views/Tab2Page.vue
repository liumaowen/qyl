<template>
  <ion-page>
    <ion-content ref="contentRef" :fullscreen="true" style="width:100%;height: 100%;">
      <swiper events-prefix="swiper-" noSwipingClass="swiper-no-swiping" :style="{ height: containerHeight + 'px' }"
        :modules="[Virtual]" :passiveListeners="true" :direction="'vertical'" :virtual="true" @swiper="setSwiperRef"
        @slideChange="onSlideChange">
        <swiper-slide v-for="(ele, index) in visibleList" :key="index" :virtualIndex="index">
          <div class="video-container swiper-no-swipe"
            :style="{ width: containerWidth + 'px', height: containerHeight + 'px' }">
            <video ref="videoPlayer" class="video-js vjs-show-big-play-button-on-pause" :src="ele.playurl" :id="'video_' + index"
              data-setup='{"controls": true, "preload": "auto"}'
              :style="{ width: containerWidth + 'px', height: containerHeight + 'px' }"></video>
          </div>
        </swiper-slide>
      </swiper>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonContent, onIonViewDidEnter, onIonViewWillLeave } from '@ionic/vue';
import { ref, shallowRef, ShallowRef, reactive, nextTick, onMounted, onBeforeUnmount } from 'vue';
import videojs from 'video.js';
import axios from 'axios';
import 'video.js/dist/video-js.css'
// Import Swiper Vue.js components
import { Swiper, SwiperSlide } from 'swiper/vue';
// Import Swiper instance type
import { Swiper as SwiperInstance } from 'swiper/types';
import { Virtual } from 'swiper/modules';
// Import Swiper styles
import 'swiper/css';
// import type { VideoJsPlayer } from '@/components/VideoPlayer.vue';
interface VideoPlayerExpose {
  playerInstance: ShallowRef<VideoJsPlayer | undefined>;
}
type VideoJsPlayer = ReturnType<typeof videojs>
let swiperRef: SwiperInstance;
let visibleList: any[] = reactive([
  // 示例数据
  { url: 'https://vjs.zencdn.net/v/oceans.mp4' },
  { url: 'https://vjs.zencdn.net/v/oceans.mp4' },
  { url: 'https://vjs.zencdn.net/v/oceans.mp4' }
]);

const videoPlayers = ref<VideoPlayerExpose[]>([]); // 明确类型
const activeIndex = ref(0);
const containerWidth = ref(window.innerWidth);
const containerHeight = ref(window.innerHeight - 50.8); // 50.8为Tab高度

const updateSize = () => {
  containerWidth.value = window.innerWidth;
  containerHeight.value = window.innerHeight - 50.8;
}
const videoPlayer = shallowRef<HTMLVideoElement[] | null>([]);
const playerInstance = shallowRef<VideoJsPlayer>();
let players = shallowRef<{ [key: string]: VideoJsPlayer }>();


onMounted(async () => {
  visibleList.length = 0; // 清空数组
  const response = await fetchData();
  console.log(response);
  for (let index = 0; index < response.length; index++) {
    const element = response[index];
    visibleList.push(element);
  }
  await nextTick();
      videojs(
      'video_0',
      {
        controls: true,
        loop: true,
      },
      () => {
        console.log('onPlayerReady', videojs.getPlayers());
      }
    );
  setTimeout(() => {
    players.value = getPlayers();
    console.log('videoPlayer', players.value);
    console.log('getAllPlayers', videojs.getAllPlayers());
  }, 3000);
  window.addEventListener('resize', updateSize);
  updateSize();
    console.log('onMounted');
});
onBeforeUnmount(() => {
  window.removeEventListener('resize', updateSize);
})

const setSwiperRef: (swiper: SwiperInstance) => void = (swiper: SwiperInstance) => {
  swiperRef = swiper;
  console.log('swiperRef', swiperRef.activeIndex)

};
/**
 * * 获取视频列表
 * @returns
 */
const fetchData = async () => {
  const response = await axios.get('https://api.apiopen.top/api/getMiniVideo?page=1&size=6');
  return response['data']['result']['list'];
}
const getPlayers = (): { [key: string]: VideoJsPlayer } => {
  return videojs.getPlayers();
}
const onSlideChange = async (e: SwiperInstance) => {
  console.log('onSlideChange', e.activeIndex);
  console.log({ end: e })

  // await nextTick();
  // 控制所有播放器
  // videoPlayers.value.forEach((playerComponent, idx) => {
  //   if (playerComponent && playerComponent.playerInstance) {
  //     if (idx === e.activeIndex) {
  //       playerComponent.playerInstance.play();
  //     } else {
  //       playerComponent.playerInstance.pause();
  //     }
  //   }
  // });
  console.log('videoPlayers', players.value);
  // players.value?.['video_' + e.previousIndex].pause();
  // players.value?.['video_' + e.activeIndex].play();
};
onIonViewDidEnter(async () => {
  console.log('onIonViewDidEnter');
  await nextTick();
  console.log('videoPlayers', videoPlayers.value);
});
onIonViewWillLeave(() => {
  console.log('onIonViewWillLeave');
  videoPlayers.value.forEach((playerComponent) => {
    if (playerComponent && playerComponent.playerInstance) {
      playerComponent.playerInstance.pause();
    }
  });
});

</script>
<style scoped>
.swiper {
  width: 100%;
}
</style>
