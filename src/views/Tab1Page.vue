<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <swiper style="border: 1px solid red;" :modules="[Virtual]" :direction="'vertical'" :virtual="true"
        @swiper="setSwiperRef" @slideChange="onSlideChange">
        <swiper-slide v-for="(slideContent, index) in visibleList" :key="index" :virtualIndex="index">
          <div :id="'fullscreen'"></div>
        </swiper-slide>
      </swiper>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import axios from 'axios';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, onIonViewWillEnter } from '@ionic/vue';
import ExploreContainer from '@/components/ExploreContainer.vue';
// Import Swiper Vue.js components
import { Swiper, SwiperSlide } from 'swiper/vue';
// Import Swiper instance type
import { Swiper as SwiperInstance } from 'swiper/types';
import { Virtual } from 'swiper/modules';
// Import Swiper styles
import 'swiper/css';
import { useVideoPlayer, VideoPlayerHook, VideoPlayerProps, VideoPlayerOuput } from '../composables/videoplayer';

let swiperRef: SwiperInstance;
let visibleList: any[] = reactive([]);
let ind = ref(0);
let appendNumber = 0;
const onVPEvents: VideoPlayerProps = {} as VideoPlayerProps;
let vpHook: VideoPlayerHook = useVideoPlayer(onVPEvents);

onIonViewWillEnter(async () => {
  visibleList.length = 0; // 清空数组
  const response = await fetchData();
  console.log(response);
  for (let index = 0; index < response.length; index++) {
    const element = response[index];
    visibleList.push(element);
  }
  // visibleList.push(...Array.from({ length: 3 }).map((_, index) => `Slide ${index + 1}`));
  appendNumber = visibleList.length;
  console.log(visibleList)
  playVideo(response[0],'fullscreen')
});
const playerLeave = async () => {
  await vpHook.removeListeners();
  await vpHook.stopAllPlayers();
}
onVPEvents.onPlay = async (fromPlayerId: string, currentTime: number | undefined) => {
  console.log(`<<<< onPlay in ViewVideo ${fromPlayerId} ct: ${currentTime}`);
}
onVPEvents.onPause = async (fromPlayerId: string, currentTime: number | undefined) => {
  console.log(`<<<< onPause in ViewVideo ${fromPlayerId} ct: ${currentTime}`)
}
onVPEvents.onEnded = async (fromPlayerId: string, currentTime: number | undefined) => {
  console.log(`<<<< onEnded in ViewVideo ${fromPlayerId} ct: ${currentTime}`)
  await playerLeave();
}
onVPEvents.onExit = async (dismiss: boolean) => {
  console.log(`<<<< onExit in ViewVideo ${dismiss}`)
  await playerLeave();
}
onVPEvents.onReady = async (fromPlayerId: string, currentTime: number | undefined) => {
  console.log(`<<<< onReady in ViewVideo ${fromPlayerId} ct: ${currentTime}`)
}
const setSwiperRef: (swiper: SwiperInstance) => void = (swiper: SwiperInstance) => {
  swiperRef = swiper;
  console.log('swiperRef', swiperRef.activeIndex)
};
const onProgress = (e: any) => {
  const [swiper, progress] = e.detail;
  console.log(progress)
};

const onSlideChange = (e: SwiperInstance) => {
  console.log('onSlideChange', e.activeIndex);
  console.log({ end: e.isEnd })
  // if (e.isEnd) {
  //   append();
  // }
};
const append = () => {
  visibleList.push(...Array.from({ length: 1 }).map((_, index) => `Slide ${appendNumber + 1}`));
  appendNumber++;
};
const fetchData = async () => {
  const response = await axios.get('https://api.apiopen.top/api/getMiniVideo?page=1&size=3');
  return response['data']['result']['list'];
}
    let ret: any = {};
    const playVideo = async (videoData:any,id:string) => {
      var params = ["fullscreen",videoData['playurl'],id,"div"];
      ret = await vpHook.initPlayer(params[0], params[1], params[2], params[3]);
      console.log(`ret : ${JSON.stringify(ret)}`)
    } 
</script>
<style lang="css" scoped>
.swiper {
  width: 100%;
  height: 100%;
}

.swiper-slide {
  text-align: center;
  font-size: 18px;
  background: #fff;

  /* Center slide text vertically */
  display: flex;
  justify-content: center;
  align-items: center;
}

.swiper-slide img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>