<template>
  <ion-page>
    <ion-content :fullscreen="true" class="video-container">
      <!-- 竖滑容器 -->
      <swiper :modules="[Virtual]" :direction="'vertical'" :slides-per-view="1" @slideChange="onSlideChange"
        ref="swiperRef" :style="{ height: containerHeight + 'px' }">
        <swiper-slide v-for="(video, index) in videoList" :key="index" class="slide-item"
          :style="{ width: containerWidth + 'px', height: containerHeight + 'px' }">
          <!-- 视频容器 -->
          <div class="video-wrap" :style="{ width: containerWidth + 'px', height: containerHeight + 'px' }">
            <!-- 视频播放器 -->
            <video :class="'video-js vjs-big-play-button-hidden '" :id="'my-video-' + index" :src="video.src"
              :poster="video.poster" :ref="el => setVideoRef(el, index)"></video>

            <!-- 暂停时显示的中心按钮 -->
            <div class="center-pause-btn" @click="togglePlay(index)">
              <ion-icon v-show="!isPlaying(index)" class="play" :icon="play" color="#fff"></ion-icon>
            </div>
            <!-- 进度条 -->
            <div class="my_progress_bar" @mousedown="startDrag($event, index)" @touchstart="startDrag($event, index)">
              <ion-progress-bar :value="progress[index]"
                :class="['custom-progress', { dragging: isDragging }]"></ion-progress-bar>
            </div>
          </div>
        </swiper-slide>
      </swiper>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import axios from 'axios';
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Virtual } from 'swiper/modules';
import 'swiper/css';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import { IonPage, IonContent, IonIcon, IonProgressBar,onIonViewWillLeave,onIonViewDidLeave } from '@ionic/vue';
import { play } from 'ionicons/icons';
import { StatusBar, Style } from '@capacitor/status-bar';

interface VideoItem {
  src: string;
  poster: string;
}
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
const videoInstances = ref<VideoJsPlayer[]>([]);
// 声明对象类型的 ref
const videoRefs = ref<Record<string, HTMLVideoElement>>({});

// 新增：进度相关状态
const progress = ref<number[]>([]); // 各视频的播放进度（0-1）
const isDragging = ref(false); // 是否正在拖动
const containerWidth = ref(window.innerWidth);
const containerHeight = ref(window.innerHeight - 50.8); // 50.8为Tab高度
let currentPage = 1; // 当前页码
const pageSize = 6;    // 每页数量
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
  const videoElement = videoRefs.value[`videoRef_${index}`];
  if (!videoElement) return;  // 防止元素未渲染时初始化
  const player = videojs(videoElement as Element, {
    controls: false, // 隐藏原生控制条
    autoplay: false,
    preload: 'auto',
    // width: containerWidth.value,
    height: containerHeight.value,
    loop: true,
    fluid: true,
    fullscreen: {
      enabled: true, // 显式启用全屏功能
      options: { native: true } // 使用浏览器原生全屏（可选）
    }
  });

  // 监听播放时间更新进度（非拖动状态时）
  player.on('timeupdate', () => {
    if (!isDragging.value && player && player.currentTime()) {
      const duration = player?.duration() || 1;
      const currentTime = player?.currentTime() || 0;
      progress.value[index] = currentTime / duration;
    }
  });

  videoInstances.value[index] = player;
  return player;
};


// 切换播放状态
const togglePlay = (index: number) => {
  console.log('togglePlay', index);
  const player = videoInstances.value[index];
  console.log('player', player.paused());
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
  return playingIndex.value === index && !videoInstances.value[index]?.paused();
};

// 滑动切换处理
const onSlideChange = (e: SwiperInstance) => {
  const currentIndex = e.activeIndex;
  // 暂停其他视频
  videoInstances.value.forEach((player, index) => {
    if (index !== currentIndex && !player.paused()) {
      player.pause();
    }
  });
  // 播放当前视频
  if (videoInstances.value[currentIndex]) {
    videoInstances.value[currentIndex].play();
    playingIndex.value = currentIndex;
  }
  // 新增：滚动到倒数第二个视频时加载下一页
  const isLastSecondSlide = currentIndex === videoList.value.length - 2;
  if (isLastSecondSlide && !isLoading) {
    currentPage++; // 页码+1
    loadMoreData(); // 触发加载更多
  }
};

// 加载更多数据
const loadMoreData = async () => {
  const newData = await fetchData(currentPage, pageSize);
  if (newData.length > 0) {
    videoList.value = [...videoList.value, ...newData]; // 合并新数据
    // 初始化新视频的进度和播放器
    await nextTick();
    newData.forEach((_, index) => {
      const newIndex = videoList.value.length - newData.length + index;
      progress.value[newIndex] = 0;
      initVideo(newIndex);
    });
  }
};

// 拖动开始处理
const startDrag = (e: MouseEvent | TouchEvent, index: number) => {
  e.preventDefault();
  isDragging.value = true; // 标记为拖动状态
  const player = videoInstances.value[index];
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
/**
 * 获取视频列表（支持分页）
 * @param page 当前页码
 * @param size 每页数量
 * @returns 视频列表
 */
const fetchData = async (page: number, size: number) => {
  let list: any[] = [];
  if (isLoading) return []; // 防止重复请求
  isLoading = true;
  try {
    const response = await axios.get('https://api.apiopen.top/api/getMiniVideo', {
      params: { page, size } // 传递分页参数
    });
    response.data.result.list.forEach((item: any) => {
      list.push({
        src: item.playurl,
        poster: item.picurl
      });
    });
    const initialData = await fetchData_pe(currentPage, 3);
    list = [...list, ...initialData];
    return list || [];
  } finally {
    isLoading = false; // 无论成功/失败都重置加载状态
  }
};
/**
 * pexels 视频列表
 * @param page 当前页码
 * @param size 每页数量
 * @returns
 */
const fetchData_pe = async (page: number, per_page: number) => {
  let list: any[] = [];
  if (isLoading) return []; // 防止重复请求
  isLoading = true;
  try {
    const response = await axios.get('https://api.pexels.com/videos/search', {
      params: { query: 'popular', orientation: 'portrait', size: 'medium', page, per_page }, // 传递分页参数
      headers: {
        Authorization: 'I4w6vXKeN6fO5Zo4w1AK232oIN4pPs0MjCfgxnGRMxWTRmGc7eePdOAL'
      }
    });
    response.data.videos.forEach((item: any) => {
      let targetVideo = item.video_files.find((file: any) => {
        return file.quality === 'hd';
      });
      if (targetVideo) {
        list.push({
          src: targetVideo.link,
          poster: item.image
        });
      }
    });
    return list || [];
  } finally {
    isLoading = false; // 无论成功/失败都重置加载状态
  }
};

// 生命周期：组件挂载时初始化
onMounted(async () => {
  await StatusBar.setStyle({ style: Style.Light });
  window.addEventListener('resize', updateSize);
  updateSize();
  // 初始化加载第一页数据
  const initialData = await fetchData(currentPage, pageSize);
  console.log('initialData', initialData);
  videoList.value = initialData; // 替换初始静态数据
  progress.value = initialData.map(() => 0); // 初始化进度数组
  console.log('videoRefs after mount:', videoRefs.value);
  await nextTick();
  // 初始化视频播放器（需等待数据加载完成）
  initialData.forEach((_, index) => {
    initVideo(index);
  });
  if (isMobile()) {
    // 移动端：自动播放第一页的第一个视频
    if (videoInstances.value[0]) {
      videoInstances.value[0].play();
      playingIndex.value = 0;
    }
  }
});

// 生命周期：组件卸载时销毁播放器
onUnmounted(() => {
  videoInstances.value.forEach(player => {
    if (player) player.dispose();
  });
  window.removeEventListener('resize', updateSize);
  document.removeEventListener('mousemove', handleMouseMove);
  document.removeEventListener('mouseup', handleMouseUp);
  document.removeEventListener('touchmove', handleTouchMove);
  document.removeEventListener('touchend', handleTouchEnd);
});
onIonViewWillLeave(() => {
  console.log('onIonViewWillLeave');
  videoInstances.value.forEach(player => {
    if (player) player.pause();
  });
})
onIonViewDidLeave(() => {
  console.log('onIonViewWillLeave');
  videoInstances.value.forEach(player => {
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
  overflow: hidden; /* 隐藏视频超出容器的部分 */
  width: 100%;
  height: 0;
}

/* 关键：设置视频播放器垂直居中 */
.video-js {
  position: absolute;
  top: 0;
  left: 0;
  height: 100% !important; /* 高度撑满容器 */
  max-width: 100% !important; /* 限制宽度不超过容器 */
  object-fit: cover; /* 覆盖容器避免黑边（可选，若需完整显示改为 contain） */
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
</style>
