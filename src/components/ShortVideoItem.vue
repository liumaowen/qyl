<template>
  <div class="video-wrap" :class="{ 'portrait-video': isPortrait }" :style="{
    width: containerWidth + 'px',
    height: containerHeight + 'px',
  }">
    <video :class="'video-js vjs-big-play-button-hidden'" :poster="video.poster" ref="videoRef"></video>
    <!-- 自定义全屏按钮 -->
    <button v-show="!isPlaying && showRotateBtn" class="fullscreen-btn" @click.stop="toggleFullscreen" title="全屏">
      <ion-icon class="fullscreen-icon" :icon="isFullscreen ? contractOutline : expandOutline" />
    </button>
    <div class="center-pause-btn" @click="togglePlay">
      <ion-icon v-show="!isPlaying" class="play" :icon="play" color="#fff"></ion-icon>
    </div>
    <div class="my_progress_bar" @mousedown="startDrag" @touchstart="startDrag">
      <ion-progress-bar :value="progress" :class="['custom-progress', { dragging: isDragging }]"></ion-progress-bar>
    </div>
    <div class="video-title-bar" v-if="video.title && !isFullscreen">
      <h6>{{ video.title }}</h6>
      <div v-if="video.info?.count && video.info?.count > 1">
        <p style="margin: 0;font-size: 13px;">{{ $t('video.firstEpisode') }}</p>
        <div class="video-info-bar" @click="goShortdetail(video.id)">
          <div>{{ $t('video.watchFullDrama', { count: video.info?.count }) }}</div>
          <!-- <div class="video-info-bar-icon"></div> -->
          <ion-icon class="video-info-bar-icon" :icon="chevronForwardOutline" color="#fff"></ion-icon>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import videoLanguage from 'video.js/dist/lang/zh-CN.json';
import { IonIcon, IonProgressBar } from '@ionic/vue';
import { play, chevronForwardOutline, contractOutline, expandOutline } from 'ionicons/icons';
import { type VideoItem } from '@/api/video';
import { useIonRouter } from '@ionic/vue';
import { useRouter } from 'vue-router';
import { ScreenOrientation } from '@capacitor/screen-orientation';
import { Capacitor } from '@capacitor/core';
import { StatusBar } from '@capacitor/status-bar';
import eventBus from '@/eventBus';

videojs.addLanguage('zh-CN', videoLanguage);

const props = defineProps<{
  video: VideoItem;
  index: number;
  containerWidth: number;
  containerHeight: number;
  progress: number;
  isPlaying: boolean;
}>();

const emit = defineEmits(['play', 'pause', 'progressChange']);

const ionRouter = useIonRouter();
const router = useRouter();
const videoRef = ref<HTMLVideoElement | null>(null);
const player = ref<any>(null);
const isDragging = ref(false);
const showRotateBtn = ref(false);
const isPortrait = ref(false);
const isFullscreen = ref<boolean>(false);

const toggleFullscreen = async () => {
  if (player.value) {
    if (!isFullscreen.value) {
      // 先锁定横屏
      try {
        await ScreenOrientation.lock({ orientation: 'landscape' });
      } catch (e) {
        console.warn('横屏锁定失败', e);
      }
      // 隐藏状态栏
      try {
        await StatusBar.hide();
      } catch (e) {
        console.warn('状态栏隐藏失败', e);
      }
      // if (wrap?.requestFullscreen) {
      //   await wrap.requestFullscreen();
      // }
      isFullscreen.value = true;
      // player.value.requestFullscreen();
    } else {
      // 退出全屏时恢复竖屏
      try {
        await ScreenOrientation.lock({ orientation: 'portrait' });
      } catch (e) {
        console.warn('竖屏锁定失败', e);
      }
      // 显示状态栏
      try {
        await StatusBar.show();
      } catch (e) {
        console.warn('状态栏显示失败', e);
      }
      // if (document.fullscreenElement) {
      //   await document.exitFullscreen();
      // }
      isFullscreen.value = false;
      // player.value.exitFullscreen();
    }
    eventBus.emit('fullscreen-change', isFullscreen.value);
    eventBus.emit('fullscreen-change-swiper', isFullscreen.value);
  }
};
// 判断是否为手机端（屏幕宽度<768px）
const isMobile = () => window.innerWidth < 768;

onMounted(() => {
  if (videoRef.value) {
    videoRef.value.onloadedmetadata = () => {
      const w = videoRef.value?.videoWidth || 0;
      const h = videoRef.value?.videoHeight || 1;
      // 判断宽高比，宽屏时显示旋转按钮
      showRotateBtn.value = w / h > 1.1 && Capacitor.getPlatform() !== 'web';
      isPortrait.value = h > w; // 竖屏
    };
    player.value = videojs(videoRef.value, {
      controls: Capacitor.getPlatform() === 'web' ? true : false,
      controlBar: {
        children: [
          'fullscreenToggle'
        ]
      },
      autoplay: false,
      preload: 'metadata',
      language: 'zh-CN',
      height: props.containerHeight,
      loop: true,
      fluid: isMobile(),
      sources: [
        {
          src: props.video.src,
          type: props.video.type ? props.video.type : 'video/mp4',
        }
      ],
    });
    player.value.on('timeupdate', () => {
      if (!isDragging.value && player.value && player.value.currentTime()) {
        const duration = player.value.duration() || 1;
        const currentTime = player.value.currentTime() || 0;
        emit('progressChange', props.index, currentTime / duration);
      }
    });
    if (player.value) {
      player.value.on('fullscreenchange', async () => {
        isFullscreen.value = player.value.isFullscreen();
        if (!isFullscreen.value) {
          // 退出全屏自动恢复竖屏
          try {
            await ScreenOrientation.lock({ orientation: 'portrait' });
          } catch (e) {
            console.warn('竖屏锁定失败', e);
          }
        }
      });
    }
    player.value.on('error', () => {
      // 错误处理
    });
  }
  if (props.isPlaying) {
    player.value?.play();
  }
});

onUnmounted(() => {
  player.value?.dispose();
});

watch(() => props.isPlaying, (val) => {
  if (val) {
    player.value?.play();
    emit('play', props.index);
  } else {
    player.value?.pause();
    emit('pause', props.index);
  }
});

const togglePlay = () => {
  if (player.value.paused()) {
    player.value.play();
    emit('play', props.index);
  } else {
    player.value.pause();
    emit('pause', props.index);
  }
};

const goShortdetail = (id?: string) => {
  if (id) {
    try {
      console.log(props.video.title);
      // 优先使用 ionRouter，提供更好的移动端体验
      ionRouter.push(`/dramasDetail/${id}?title=${encodeURIComponent(props.video.title || '短剧')}`);
      player.value?.pause();
    } catch (error) {
      console.error('ionRouter 跳转失败，尝试使用 router:', error);
      try {
        // 备用方案：使用 router
        router.push({
          name: 'DramasDetail',
          params: {
            id: id,
            title: props.video.title || '短剧'
          },
          query: {
            count: props.video.info?.count || 0,
            videotype: props.video.videotype || 'dm'
          }
        });
      } catch (routerError) {
        console.error('router 跳转也失败:', routerError);
      }
    }
  } else {
    console.log('id 为空，无法跳转');
  }
};

const startDrag = (e: MouseEvent | TouchEvent) => {
  e.preventDefault();
  isDragging.value = true;
  const progressBar = e.target as HTMLElement;
  const rect = progressBar.getBoundingClientRect();
  const barWidth = rect.width;
  const updateProgress = (clientX: number) => {
    const offsetX = clientX - rect.left;
    const ratio = Math.min(1, Math.max(0, offsetX / barWidth));
    const duration = player.value?.duration() || 0;
    player.value.currentTime(duration * ratio);
    emit('progressChange', props.index, ratio);
  };
  const handleMouseMove = (e: MouseEvent) => updateProgress(e.clientX);
  const handleMouseUp = () => {
    isDragging.value = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };
  const handleTouchMove = (e: TouchEvent) => updateProgress(e.touches[0].clientX);
  const handleTouchEnd = () => {
    isDragging.value = false;
    document.removeEventListener('touchmove', handleTouchMove);
    document.removeEventListener('touchend', handleTouchEnd);
  };
  document.addEventListener('mousemove', handleMouseMove);
  document.addEventListener('mouseup', handleMouseUp);
  document.addEventListener('touchmove', handleTouchMove);
  document.addEventListener('touchend', handleTouchEnd);
};

</script>

<style scoped>
.video-wrap {
  position: relative;
  background: #000;
  overflow: hidden;
  width: 100%;
  height: 0;
}

.video-js {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  height: 100% !important;
  max-width: 100% !important;
  object-fit: cover;
}

/* .portrait-video .video-js .vjs-tech {
  object-fit: cover;
} */

.center-pause-btn {
  position: absolute;
  bottom: 5%;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  color: white;
  align-items: center;
  justify-content: center;
  opacity: 0.5;
  cursor: pointer;
}

.play {
  font-size: 6rem !important;
}

.my_progress_bar {
  position: absolute;
  bottom: -1.5px;
  left: 10%;
  width: 80%;
  height: 20px;
  line-height: 20px;
  display: flex;
  align-items: center;
  cursor: pointer;
}

.custom-progress {
  width: 100%;
  height: 1.5px;
  transition: height 0.2s;
}

.custom-progress.dragging {
  height: 8px;
}

ion-progress-bar {
  --background: rgba(255, 255, 255, 0.3);
  --progress-background: #ffffff;
}

.vjs-big-play-button {
  display: none !important;
}


.video-title-bar {
  position: absolute;
  bottom: 20px;
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

.video-info-bar {
  padding: 6px 10px;
  background: rgb(110 104 104 / 70%);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  font-size: 14px;
}

.video-info-bar-icon {
  width: 16px;
  height: 16px;
  position: relative;
  flex-shrink: 0;
}

.fullscreen-btn {
  position: absolute;
  bottom: 20%;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  background: rgba(0, 0, 0, 0.5);
  border: none;
  color: #fff;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0.7;
}

.fullscreen-icon {
  font-size: 24px;
}
.hide-tab-bar {
  display: none !important;
}
</style>