<template>
  <ion-page>
    <ion-content ref="contentRef" :fullscreen="true" style="width:100%;height: 100%;">
      <!-- <swiper style="" :modules="[Virtual]" :preventClicksPropagation="true" :preventClicks="true" :direction="'vertical'" :virtual="true" @swiper="setSwiperRef"
        @slideChange="onSlideChange">
        <swiper-slide v-for="(ele, index) in visibleList" :key="index" :virtualIndex="index">
          <video-player :id="'video_' + index" class="video-player vjs-theme-fantasy" :src="ele.playurl"
            :options="options" :poster="ele.picurl" crossorigin="anonymous" :width="contentWidth"
            :height="contentHeight" webkit-playsinline="true" x5-video-player-type="h5"
            x5-video-player-fullscreen="portraint" x-webkit-airplay="true" x5-playsinline="" @mounted="handleMounted"
            @ready="handleEvent($event)" @play="handleEvent($event)" @pause="handleEvent($event)"
            @ended="handleEvent($event)" @loadeddata="loadeddata($event)" @waiting="handleEvent($event)"
            @playing="playingEvent($event)" @canplay="handleEvent($event)" @canplaythrough="handleEvent($event)"
            @timeupdate="timeupdateEvent($event)" data-setup="{}" >
            <template v-slot="{ player, state }">
              <div class="player-custom-controls">
                <player-custom-controls :player="player" :state="state" :config="config" />
              </div>
            </template>
          </video-player>
        </swiper-slide>
      </swiper> -->
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, reactive, shallowRef, shallowReactive, onMounted,computed } from 'vue';
import axios from 'axios';
import { IonPage, IonTabs, IonHeader, IonToolbar, IonTitle, IonContent, onIonViewWillEnter, onIonViewDidEnter, onIonViewWillLeave } from '@ionic/vue';
import ExploreContainer from '@/components/ExploreContainer.vue';
// Import Swiper Vue.js components
import { Swiper, SwiperSlide } from 'swiper/vue';
// Import Swiper instance type
import { Swiper as SwiperInstance } from 'swiper/types';
import { Virtual } from 'swiper/modules';
// Import Swiper styles
import 'swiper/css';
// import { VideoPlayer, VideoPlayerProps, VideoPlayerState } from '@videojs-player/vue'
import videojs from 'video.js'
import 'video.js/dist/video-js.css'
// Fantasy
// import '@videojs/themes/dist/fantasy/index.css';

//       const config = shallowReactive<VideoPlayerProps>({
//         // autoplay: false,
//         height:  380,
//         // volume: 0.8,
//         // playbackRate: 1,
//         // playbackRates: playbackRatesOptions[0],
//         controls: false,
//         // fluid: false,
//         // muted: false,
//         // loop: false
//       })
// let swiperRef: SwiperInstance;
// let visibleList: any[] = reactive([]);
// let ind = ref(0);
// let appendNumber = 0;
// type VideoJsPlayer = ReturnType<typeof videojs>  // ReturnType 函数的返回值
// // 新增：定义 contentRef 和尺寸变量
// // 调整 contentRef 的类型为 Ionic 组件实例或 null
// const contentRef = ref<InstanceType<typeof IonContent> | null>(null);
// const contentWidth = ref(0);
// const contentHeight = ref(0);
// let player = shallowRef<VideoJsPlayer>()
// let state = shallowRef<VideoPlayerState>()
// let players = shallowRef<{ [key: string]: VideoJsPlayer }>();
// const options = shallowReactive<VideoPlayerProps>({
//   autoplay: false,
//   volume: 0.8,
//   controls: false,
//   fluid: false,
//   muted: false,
//   loop: true,
//   playsinline: true,
//   crossorigin: "anonymous",
//   controlBar: {
//     children: [
//       // 'playToggle',
//       // 'volumePanel',
//       'progressControl'
//       // 'currentTimeDisplay',
//       // 'durationDisplay',
//       // 'fullscreenToggle'
//     ]
//   }
// })

// onMounted(async () => {
//   console.log('第一次进入');
//   visibleList.length = 0; // 清空数组
//   const response = await fetchData();
//   console.log(response);
//   for (let index = 0; index < response.length; index++) {
//     const element = response[index];
//     visibleList.push(element);
//   }
//   players.value = getPlayers();
//   appendNumber = visibleList.length;
// });
// onIonViewWillEnter(() => {
// });
// onIonViewDidEnter(async () => {
//   setTimeout(() => {
//     getContentSize();
//     // 预加载第一个视频
//     if (player.value) {
//       player.value?.play();
//     }
//   }, 0);
//   // 监听窗口 resize 动态更新尺寸
//   window.addEventListener('resize', getContentSize);
// });
// // Ionic 视图即将离开时：移除 resize 监听（避免内存泄漏）
// onIonViewWillLeave(() => {
//   window.removeEventListener('resize', getContentSize);
//   if (player.value) {
//     // 释放所有视频播放器实例
//     player.value?.pause();
//   }
// });
// // 新增：获取 ion-content 尺寸的方法
// const getContentSize = () => {
//   // 1. 处理 Ionic 组件实例（通过 $el 获取实际 DOM 元素）
//   const domElement = contentRef.value?.$el ?? contentRef.value;

//   // 2. 类型断言：明确 domElement 为 HTMLElement（或 null）
//   const htmlElement = domElement as HTMLElement | null;
//   // 3. 检查元素存在且方法存在
//   if (htmlElement && typeof htmlElement.getBoundingClientRect === 'function') {
//     // 4. 调用方法并获取尺寸（TypeScript 会自动推断 rect 类型为 DOMRect）
//     const rect = htmlElement.getBoundingClientRect();
//     contentWidth.value = rect.width;
//     contentHeight.value = rect.height;
//     console.log('ion-content 高度:', contentHeight.value);
//   } else {
//     console.warn('未找到有效的 ion-content DOM 元素');
//   }
// };
// const setSwiperRef: (swiper: SwiperInstance) => void = (swiper: SwiperInstance) => {
//   swiperRef = swiper;
//   console.log('swiperRef', swiperRef.activeIndex)
// };
// const onProgress = (e: any) => {
//   const [swiper, progress] = e.detail;
//   console.log(progress)
// };

// const onSlideChange = (e: SwiperInstance) => {
//   console.log('onSlideChange', e.activeIndex);
//   console.log({ end: e })
//   // if (e.isEnd) {
//   //   append();
//   // }
//   players.value?.['video_' + e.previousIndex].pause();
//   // players.value?.['video_' + e.activeIndex].src('https://vjs.zencdn.net/v/oceans.mp4')
//   players.value?.['video_' + e.activeIndex].play();
// };
// const append = () => {
//   visibleList.push(...Array.from({ length: 1 }).map((_, index) => `Slide ${appendNumber + 1}`));
//   appendNumber++;
// };
// const fetchData = async () => {
//   const response = await axios.get('https://api.apiopen.top/api/getMiniVideo?page=1&size=6');
//   return response['data']['result']['list'];
// }
// const handleMounted = (payload: any) => {
//   console.log('handleMounted', payload)
//   player.value = payload.player
//   state.value = payload.state
//   console.log('player', player)
//   console.log('Basic player mounted', payload)
//   const all = videojs.getAllPlayers();
//   console.log('all', all)
//   const Players = videojs.getPlayers();
//   console.log('Players', Players)
// }
// const getPlayers = (): { [key: string]: VideoJsPlayer } => {
//   return videojs.getPlayers();
// }

// const handleEvent = (log: any) => {
//   console.log('Basic player event', log)
// }
// const playingEvent = (log: any) => {
//   console.log('playing', log)
//   console.log('player.value', player.value)
//   console.log('state.value', state.value)
// }
// const loadeddata = (log: any) => {
//   console.log('loadeddata', getPlayers())
// }
// const timeupdateEvent = (log: any) => {
//   // console.log('timeupdate', log)
//   // console.log('player.value', player.value)
//   // console.log('state.value', state.value)
//   // console.log('state.value?.currentTime', state.value?.currentTime)
//   // console.log('state.value?.duration', state.value?.duration)
// }
// const remainingTime = computed(() => {
//   console.log('remainingTime', state.value)
//   console.log('remainingTime', state.value?.duration)
//   console.log('remainingTime', state.value?.currentTime)
//   return state.value
//     ? state.value.duration - state.value.currentTime
//     : 0
// })
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