<template>
  <ion-page>
    <ion-content :fullscreen="true" class="video-container">
      <!-- 竖滑容器 -->
      <swiper :modules="[Virtual]" :direction="'vertical'" :slides-per-view="1" 
        @slideChange="onSlideChange"
        @beforeSlideChangeStart="onBeforeSlideChangeStart"
        @swiper="setSwiperRef" 
        @transitionEnd="onSlideTransitionEnd"
        :virtual="true" :speed="200"
        :style="{ height: containerHeight + 'px' }">
        <swiper-slide v-for="(video, index) in videoList" :key="index" :virtualIndex="index" class="slide-item"
          :style="{ width: containerWidth + 'px', height: containerHeight + 'px' }">
          <!-- 视频容器 -->
          <div v-if="video.type !== 'ad'" class="video-wrap" :style="{ width: containerWidth + 'px', height: containerHeight + 'px' }">
            <!-- 视频播放器 -->
            <video :class="'video-js vjs-big-play-button-hidden '" :poster="video.poster"
              :ref="el => setVideoRef(el, index)"></video>

            <!-- 暂停时显示的中心按钮 -->
            <div class="center-pause-btn" @click="togglePlay(index)">
              <ion-icon v-show="!isPlaying(index)" class="play" :icon="play" color="#fff"></ion-icon>
            </div>
            <!-- 进度条 -->
            <div class="my_progress_bar" @mousedown="startDrag($event, index)" @touchstart="startDrag($event, index)">
              <ion-progress-bar :value="progress[index]"
                :class="['custom-progress', { dragging: isDragging }]"></ion-progress-bar>
            </div>
            <!-- 标题说明 -->
            <div class="video-title-bar" v-if="video.title">
              <h6>{{ video.title }}</h6>
              <!-- <p v-if="video.description">{{ video.description }}</p> -->
            </div>
          </div>
          <!-- 广告内容 -->
          <div v-else class="ad-wrap">
            <div class="ad-container" @click="openAd(video.src)">
              <iframe 
                :src="video.src" 
                class="ad-iframe"
                frameborder="0"
                allowfullscreen
                @error="onAdIframeError">
              </iframe>
              <div class="ad-overlay">
                <div v-if="adCountdown > 0" class="ad-countdown">{{ adCountdown }}秒后跳过</div>
                <button v-else @click.stop ="skipAd" class="skip-btn">跳过广告</button>
              </div>
            </div>
          </div>
        </swiper-slide>
      </swiper>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Virtual } from 'swiper/modules';
import 'swiper/css';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import videoLanguage from 'video.js/dist/lang/zh-CN.json'
import { IonPage, IonContent, IonIcon, IonProgressBar, onIonViewWillLeave, onIonViewDidLeave } from '@ionic/vue';
import { play } from 'ionicons/icons';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';
import { fetchApiOpenTopVideos, fetchMGTVVideoList, fetchVideo1, fetchVideo2, fetchVideo3, VideoItem,fetchduanju } from '@/api/video';
import { shortVideoConfig,ShortVideoConfigType } from '@/store/state';
import { InAppBrowser } from '@capacitor/inappbrowser';

videojs.addLanguage('zh-CN', videoLanguage); // 添加中文语言包
// 模拟视频数据（实际项目中建议从接口获取）
const videoList = ref<VideoItem[]>([]);
type VideoJsPlayer = ReturnType<typeof videojs>;
import { Swiper as SwiperInstance } from 'swiper/types';
import type { ComponentPublicInstance } from 'vue';
// 当前播放的视频索引
const playingIndex = ref(-1);
// swiper实例引用
const swiperRef = ref<SwiperInstance>();
// 视频实例数组
const videoInstances = ref<Record<string, VideoJsPlayer>>({});;
// 声明对象类型的 ref
const videoRefs = ref<Record<string, HTMLVideoElement>>({});
let videoRefsOld: Record<string, HTMLVideoElement> = {}; // 用于存储旧的 videoRefs
// 当前播放的索引
const currentIndex1 = ref(0);
const shortPageIndex = ref(1);
const shortconfig: ShortVideoConfigType = {
  shortVideoRandomMax: 200,
  shortVideoRandomMin: 1
}
// 广告相关状态
const adCountdown = ref(5);
const currentAdIndex = ref(-1);
let adTimer: any = null;
// 广告数据
const adData: VideoItem[] = [
  {
  type: 'ad',
  duration: 10,
  src: 'https://wait-page.eu/a/5JBqI0nViO64J',
 },
  {
  type: 'ad',
  duration: 10,
  src: 'https://true-date.eu/a/Vgw8uZ6WFz3rx',
 },
  {
  type: 'ad',
  duration: 10,
  src: 'https://wait-page.eu/a/pr4OsxkZzuDKxB',
 },
  {
  type: 'ad',
  duration: 10,
  src: 'https://wait-page.eu/a/MOkYH6wjVckzO9',
 },
  {
  type: 'ad',
  duration: 10,
  src: 'https://true-date.eu/a/ErYNsjg7Hwgyy',
}
];

// 新增：进度相关状态
const progress = ref<number[]>([]); // 各视频的播放进度（0-1）
const isDragging = ref(false); // 是否正在拖动
const containerWidth = ref(window.innerWidth);
const containerHeight = ref(window.innerHeight - 50.8); // 50.8为Tab高度
let currentPage = Math.floor(Math.random() * (1600 - 0 + 1)) + 0; // 当前页码
const pageSize = 4;    // 每页数量
let isLoading = false; // 加载状态（防止重复请求）
let handleMouseMove: (e: MouseEvent) => void;
let handleMouseUp: () => void;
let handleTouchMove: (e: TouchEvent) => void
let handleTouchEnd: (e: TouchEvent) => void;
// 判断是否为手机端（屏幕宽度<768px）
const isMobile = () => window.innerWidth < 768;

// 监听窗口 resize 动态更新尺寸
const updateSize = () => {
  containerWidth.value = window.innerWidth;
  containerHeight.value = window.innerHeight - 50.8;
}

// watch(currentIndex1, (newIndex, oldIndex) => {
//   console.log('watch currentIndex', newIndex, oldIndex);
//   // 只初始化当前页和前后各一页
//   [newIndex - 1, newIndex, newIndex + 1].forEach(idx => {
//     if (idx >= 0 && idx < videoList.value.length) {
//       initVideo(idx);
//     }
//   });
//   // 销毁不在范围内的实例
//   Object.keys(videoInstances.value).forEach(key => {
//     const idx = parseInt(key.split('_')[1]);
//     if (Math.abs(idx - newIndex) > 1) {
//       videoInstances.value[key]?.dispose();
//       delete videoInstances.value[key];
//     }
//   });
//   console.log('watch currentIndex1', videoInstances.value);
// });

// watchEffect(() => {
//   // 检查是否有新增或删除的 videoRef
//   const newKeys = Object.keys(videoRefs.value);
//   const oldKeys = Object.keys(videoRefsOld);

//   // 检测新增的 videoRef
//   newKeys.forEach(key => {
//     if (!oldKeys.includes(key)) {
//       console.log(`New videoRef added: ${key}`);
//       initVideo(parseInt(key.split('_')[1])); // 初始化新添加的视频
//     }
//   });

//   // 检测删除的 videoRef
//   oldKeys.forEach(key => {
//     if (!newKeys.includes(key)) {
//       console.log(`videoRef removed: ${key}`);
//       videoInstances.value[key]?.dispose(); // 销毁已删除的视频实例
//       delete videoInstances.value[key]; // 从实例数组中删除
//     }
//   });

//   // 更新旧的 videoRefs
//   videoRefsOld = { ...videoRefs.value };
//   console.log('watchvideoInstance', videoInstances.value);
// });

const setVideoRef = (el: Element | ComponentPublicInstance | null, index: number) => {
  let dom: Element | null = null;
  if (el) {
    // If it's a Vue component instance, try to get the underlying DOM element
    dom = (el as any)?.$el ? (el as any).$el : el;
    videoRefs.value[`videoRef_${index}`] = dom as HTMLVideoElement;
  } else {
    // 组件卸载时清理
    delete videoRefs.value[`videoRef_${index}`];
  }
};

// 初始化视频播放器
const initVideo = (index: number) => {
  const key = `videoRef_${index}`;
  const videoElement = videoRefs.value[key];
  if (!videoElement) return;  // 防止元素未渲染时初始化
  if (videoInstances.value[key]) {
    return; // 如果播放器已存在则不重复初始化
  }
  const item = videoList.value[index];
  const player = videojs(videoElement as Element, {
    controls: false, // 隐藏原生控制条
    autoplay: false,
    preload: 'metadata',
    language: 'zh-CN', // 设置语言
    // width: containerWidth.value,
    height: containerHeight.value,
    loop: true,
    fluid: true,
    sources: [
      {
        src: item.src,//视频地址
        type: item.type ? item.type : 'video/mp4', // 视频类型
      }
    ],
  });

  // 监听播放时间更新进度（非拖动状态时）
  player.on('timeupdate', () => {
    if (!isDragging.value && player && player.currentTime()) {
      const duration = player?.duration() || 1;
      const currentTime = player?.currentTime() || 0;
      progress.value[index] = currentTime / duration;
    }
  });

  // 监听视频加载错误，自动跳到下一页
  player.on('error', () => {
    const error = player.error();
    console.log('视频播放出错:', error);
    // 跳到下一页（如果不是最后一页）
    if (swiperRef.value && index < videoList.value.length - 1) {
      swiperRef.value.slideTo(index + 1);
    }
  });

  videoInstances.value[key] = player;
  return player;
};


// 切换播放状态
const togglePlay = (index: number) => {
  const key = `videoRef_${index}`;
  const player = videoInstances.value[key];
  if (!player) return;
  console.log('player_paused', player.paused());
  if (player.paused()) {
    player.play();
    playingIndex.value = index;
  } else {
    player.pause();
    playingIndex.value = -1;
  }
};

// 检查是否正在播放
const isPlaying = (index: number) => {
  const key = `videoRef_${index}`;
  return playingIndex.value === index && !videoInstances.value[key]?.paused();
};
// 设置swiper实例引用
const setSwiperRef: (swiper: SwiperInstance) => void = (swiper: SwiperInstance) => {
  swiperRef.value = swiper;
};
// 添加滑动开始前的检查
const onBeforeSlideChangeStart = (swiper: SwiperInstance) => {
  const currentIndex = swiper.activeIndex;
  const video = videoList.value[currentIndex];
  
  // 如果当前是广告且未观看过，阻止滑动
  // if (video && video.type === 'ad' && !video.isAdlook) {
  //   // 阻止滑动
  //   swiper.allowTouchMove = false;
  //   swiper.allowSlideNext = false;
  //   swiper.allowSlidePrev = false;
  // }
};
// 滑动切换处理
const onSlideChange = async (e: SwiperInstance) => {
  const currentIndex = e.activeIndex;
  currentIndex1.value = e.activeIndex;
  const video = videoList.value[currentIndex];
  if (!video) return;
  // 检测当前视频能否播放
  // 检查是否是广告
  if (video.type === 'ad') {
    if(swiperRef.value) {
      swiperRef.value.allowTouchMove = false; // 禁止滑动
      swiperRef.value.update();
    }
    currentAdIndex.value = currentIndex;
    if(video.isAdlook) {
      adCountdown.value = 0;
    }else{
      adCountdown.value = video.duration || 5;
    }
    
    // 开始倒计时
    adTimer = window.setInterval(() => {
      adCountdown.value--;
      if (adCountdown.value <= 0) {
        clearInterval(adTimer);
        if(swiperRef.value) {
          swiperRef.value.allowTouchMove = true; // 滑动
          swiperRef.value.update();
        }
        video.isAdlook = true;
        // skipAd();
      }
    }, 1000);
    Object.keys(videoInstances.value).forEach(key => {
    const idx = parseInt(key.split('_')[1]);
    if (idx !== currentIndex && videoInstances.value[key] && !videoInstances.value[key].paused()) {
      videoInstances.value[key].pause();
    }
  });
    return;
  }
  // const canPlay = await checkVideoPlayable(video.src);
  // if (canPlay) {
    // 初始化并播放
    initVideo(currentIndex);
    const curKey1 = `videoRef_${currentIndex}`;
    if (videoInstances.value[curKey1]) {
      videoInstances.value[curKey1].play();
      playingIndex.value = currentIndex;
    }
  // } else {
  //   // 不能播放，自动跳到下一个
  //   if (swiperRef.value && currentIndex < videoList.value.length - 1) {
  //     swiperRef.value.slideTo(currentIndex + 1);
  //   }
  // }
  console.log('onSlideChange', currentIndex);
  // 暂停其他视频
  Object.keys(videoInstances.value).forEach(key => {
    const idx = parseInt(key.split('_')[1]);
    if (idx !== currentIndex && videoInstances.value[key] && !videoInstances.value[key].paused()) {
      videoInstances.value[key].pause();
    }
  });
  // 播放当前视频
  const curKey = `videoRef_${currentIndex}`;
  if (videoInstances.value[curKey]) {
    videoInstances.value[curKey].play();
    playingIndex.value = currentIndex;
  }
  // 新增：滚动到倒数第二个视频时加载下一页
  const isLastSecondSlide = currentIndex === videoList.value.length - 3;
  if (isLastSecondSlide && !isLoading) {
    currentPage = Math.floor(Math.random() * (1600 - 0 + 1)) + 0;
    loadMoreData(); // 触发加载更多
  }
};
const onAdIframeError = () => {
  console.log('广告加载失败');
  adCountdown.value = 0;
  if (adTimer) {
    clearInterval(adTimer);
    adTimer = null;
  }
};
// 跳过广告
const skipAd = () => {
  // 先保存当前广告索引
  const currentAdPosition = currentAdIndex.value;
  currentAdIndex.value = -1;
  // 自动跳到下一个非广告内容
  const nextIndex = findNextNonAdIndex(currentAdPosition);
  if (nextIndex !== -1 && swiperRef.value) {
    swiperRef.value.slideTo(nextIndex);
  }
};
// 查找下一个非广告索引
const findNextNonAdIndex = (currentIndex: number): number => {
  for (let i = currentIndex + 1; i < videoList.value.length; i++) {
    if (videoList.value[i].type !== 'ad') {
      return i;
    }
  }
  return -1;
};
// 在数据加载时插入广告
const insertAds = (videos: VideoItem[]) => {
  // 每10个视频插入一个广告
  const result: Array<VideoItem> = [];
  videos.forEach((video, index) => {
    result.push(video);
    
    // 每10个视频插入一个广告，且确保有广告可用
    if ((index + 1) % 10 === 0) {
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
const openAd = async (src: string) => {
  if (Capacitor.isNativePlatform()) {
    await InAppBrowser.openInExternalBrowser({
      url: src
    });
  }else{
    window.open(src, '_blank');
  }
};
const onSlideTransitionEnd = async (swiper: SwiperInstance) => {
  const newIndex = swiper.activeIndex;
  console.log('onSlideTransitionEnd', newIndex);
  await nextTick(); // 等待 DOM 更新
  // 只初始化当前页和前后各一页
  [newIndex - 1, newIndex, newIndex + 1].forEach(idx => {
    if (idx >= 0 && idx < videoList.value.length) {
      initVideo(idx);
    }
  });
  // 销毁不在范围内的实例
  Object.keys(videoInstances.value).forEach(key => {
    const idx = parseInt(key.split('_')[1]);
    if (Math.abs(idx - newIndex) > 1) {
      videoInstances.value[key]?.dispose();
      delete videoInstances.value[key];
    }
  });
  console.log('onSlideTransitionEnd1', videoInstances.value);
};

// 检查视频能否播放
function checkVideoPlayable(url: string, timeout = 8000): Promise<boolean> {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.src = url;
    video.preload = 'auto';
    video.muted = true;
    video.style.display = 'none';
    document.body.appendChild(video);

    let settled = false;
    const clear = () => {
      if (!settled) {
        settled = true;
        video.remove();
      }
    };

    video.addEventListener('canplay', () => {
      clear();
      resolve(true);
    });
    video.addEventListener('error', () => {
      clear();
      resolve(false);
    });

    setTimeout(() => {
      clear();
      resolve(false);
    }, timeout);
  });
}


// 加载更多数据
const loadMoreData = async () => {
  let newData = await fetchApiOpenTopVideos(currentPage, pageSize);
  const results = await Promise.allSettled([
    fetchVideo2(),
    fetchVideo3(),
    fetchVideo1()
  ]);
  // 只保留 fulfilled 的结果，并将 VideoItem[] 扁平化为 VideoItem[]
  const fulfilledVideos = results
    .filter((r): r is PromiseFulfilledResult<VideoItem[]> => r.status === 'fulfilled')
    .flatMap(r => r.value);
  newData = [...newData, ...fulfilledVideos]; // 合并新数据
  console.log('loadMoreData', newData);
  if (newData.length > 0) {
    // 对新数据插入广告
    const newDataWithAds = insertAds(newData);
    videoList.value = [...videoList.value, ...newDataWithAds]; // 合并新数据
    console.log('加载更多数据:', swiperRef.value);
    // swiperRef.value?.virtual.appendSlide(newData);
    console.log('swiperRef after append:', swiperRef.value);
    // 初始化新视频的进度和播放器
    await nextTick();
    newDataWithAds.forEach((_, index) => {
      const newIndex = videoList.value.length - newDataWithAds.length + index;
      progress.value[newIndex] = 0;
    });
  }
  // // 后台无感知地请求 fetchVideo1
  // fetchVideo1().then(videos => {
  //   if (videos.length > 0) {
  //     videoList.value = [...videoList.value, ...videos];
  //     videos.forEach((_, index) => {
  //       const newIndex = videoList.value.length - videos.length + index;
  //       progress.value[newIndex] = 0;
  //     });
  //   }
  // });
  const indd = Math.floor(Math.random() * (shortVideoConfig.shortVideoRandomMax - shortVideoConfig.shortVideoRandomMin + 1)) + shortVideoConfig.shortVideoRandomMin;
  const params = {
    PageIndex: indd + '',
    PageSize: pageSize + '',
    VideoType: "1",
    SortType: "7"
  };
  // fetchMGTVVideoList(params).then(videos => {
  //   console.log('fetchMGTVVideoList videos', videos);
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
const duanju = () => {
  const params = {
    PageIndex: currentPage + '',
    PageSize: 5 + '',
    ChannelId: "",
    GenderChannelType: ""
  }; 
  fetchduanju(params).then((res) => {
    console.log('duanjulist', res);
    if (res.length > 0) {
      videoList.value = [...videoList.value, ...res];
      res.forEach((_, index) => {
        const newIndex = videoList.value.length - res.length + index;
        progress.value[newIndex] = 0;
      });
    }
  });
};

// 拖动开始处理
const startDrag = (e: MouseEvent | TouchEvent, index: number) => {
  e.preventDefault();
  isDragging.value = true; // 标记为拖动状态
  const key = `videoRef_${index}`;
  const player = videoInstances.value[key];
  const progressBar = e.target as HTMLElement; // 获取进度条元素

  // 计算进度条宽度和位置（用于后续拖动位置计算）
  const rect = progressBar.getBoundingClientRect();
  const barWidth = rect.width;

  // 定义更新进度的函数（鼠标/触摸通用）
  const updateProgress = (clientX: number) => {
    // 计算拖动位置占进度条宽度的比例（0-1）
    const offsetX = clientX - rect.left;
    const ratio = Math.min(1, Math.max(0, offsetX / barWidth)); // 限制在0-1范围内
    // 更新进度条值
    progress.value[index] = ratio;
    // 更新视频播放时间（总时长 * 比例）
    const duration = player?.duration() || 0;
    player.currentTime(duration * ratio);
  };

  // 鼠标拖动处理
  handleMouseMove = (e: MouseEvent) => updateProgress(e.clientX);
  handleMouseUp = () => {
    isDragging.value = false; // 结束拖动状态
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  // 触摸拖动处理
  handleTouchMove = (e: TouchEvent) => updateProgress(e.touches[0].clientX);
  handleTouchEnd = () => {
    isDragging.value = false; // 结束拖动状态
    document.removeEventListener('touchmove', handleTouchMove);
    document.removeEventListener('touchend', handleTouchEnd);
  };

  // 绑定拖动和结束事件
  document.addEventListener('mousemove', handleMouseMove);
  document.addEventListener('mouseup', handleMouseUp);
  document.addEventListener('touchmove', handleTouchMove);
  document.addEventListener('touchend', handleTouchEnd);
};

// 生命周期：组件挂载时初始化
onMounted(async () => {
  if (Capacitor.isNativePlatform()) {
    await StatusBar.setStyle({ style: Style.Dark });
  }
  window.addEventListener('resize', updateSize);
  updateSize();
  // 初始化加载第一页数据
  const initialData = await fetchApiOpenTopVideos(currentPage, pageSize);
  console.log('initialData', initialData);
  videoList.value = [...initialData]; // 替换初始静态数据
  progress.value = initialData.map(() => 0); // 初始化进度数组
  console.log('videoRefs after mount:', videoRefs.value);
  await nextTick();
  // 初始化视频播放器（需等待数据加载完成）
  initialData.forEach((_, index) => {
    initVideo(index);
  });
  if (isMobile()) {
    // 移动端：自动播放第一页的第一个视频
    if (videoInstances.value['videoRef_0']) {
      videoInstances.value['videoRef_0'].play();
      playingIndex.value = 0;
    }
  }
});

// 生命周期：组件卸载时销毁播放器
onUnmounted(() => {
  Object.values(videoInstances.value).forEach(player => {
    if (player) player.dispose();
  });
  window.removeEventListener('resize', updateSize);
  document.removeEventListener('mousemove', handleMouseMove);
  document.removeEventListener('mouseup', handleMouseUp);
  document.removeEventListener('touchmove', handleTouchMove);
  document.removeEventListener('touchend', handleTouchEnd);
});
onIonViewWillLeave(() => {
  Object.values(videoInstances.value).forEach(player => {
    if (player) player.pause();
  });
})
onIonViewDidLeave(() => {
  Object.values(videoInstances.value).forEach(player => {
    if (player) player.pause();
  });
})
</script>

<style scoped>
.swiper {
  background: #000;
}

.video-container {
  padding: 0;
  margin: 0;
}


.video-wrap {
  position: relative;
  background: #000;
  overflow: hidden;
  /* 隐藏视频超出容器的部分 */
  width: 100%;
  height: 0;
}

/* 关键：设置视频播放器垂直居中 */
.video-js {
  position: absolute;
  top: 0;
  left: 0;
  height: 100% !important;
  /* 高度撑满容器 */
  max-width: 100% !important;
  /* 限制宽度不超过容器 */
  object-fit: cover;
  /* 覆盖容器避免黑边（可选，若需完整显示改为 contain） */
}

/* 自定义暂停按钮样式 */
.center-pause-btn {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  color: white;
  align-items: center;
  /* 子元素垂直居中 */
  justify-content: center;
  /* 子元素水平居中 */
  opacity: 0.5;
  cursor: pointer;
}

.play {
  font-size: 6rem !important;
}

.my_progress_bar {
  position: absolute;
  bottom: -1.5px;
  /* 距离底部 20px */
  left: 5%;
  /* 左右留边距 */
  width: 90%;
  /* 宽度占容器 90% */
  height: 20px;
  line-height: 20px;
  display: flex;
  align-items: center;
  /* 垂直居中 */
  cursor: pointer;
}

/* 进度条容器样式 */
.custom-progress {
  width: 100%;
  height: 1.5px;
  /* 默认细进度条 */
  transition: height 0.2s;
}

.custom-progress.dragging {
  height: 8px;
  /* 拖动时变粗 */
}

/* 覆盖 Ionic 默认样式（可选） */
ion-progress-bar {
  --background: rgba(255, 255, 255, 0.3);
  /* 未播放部分颜色 */
  --progress-background: #ffffff;
  /* 已播放部分颜色 */
}

/* 隐藏video.js默认的大播放按钮 */
.vjs-big-play-button {
  display: none !important;
}

.video-title-bar {
  position: absolute;
  bottom: 20px;
  /* 距离底部 20px */
  left: 5%;
  width: 80%;
  color: #fff;
  margin: 0 auto 8px auto;
  word-break: break-all;
  white-space: pre-line;
  text-align: left;
  margin: 0 !important;
  padding: 0 !important;
}

.video-title-bar h6 {
  font-size: 1rem;
  margin: 0 0 2px 0;
  font-weight: bold;
  line-height: 1.3;
}

.video-title-bar p {
  font-size: 0.95rem;
  margin: 0;
  line-height: 1.5;
}
/* 广告 */
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
  cursor: pointer; /* 显示点击手势 */
}

.ad-iframe {
  width: 100%;
  height: 100%;
  border: none;
  pointer-events: none; /* 禁止 iframe 内的点击事件 */
}

.ad-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none; /* 禁止覆盖层的点击事件 */
}

.ad-countdown {
  position: absolute;
  top: 20px;
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
  top: 20px;
  right: 20px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  cursor: pointer;
  pointer-events: auto; /* 允许跳过按钮的点击事件 */
}
</style>
