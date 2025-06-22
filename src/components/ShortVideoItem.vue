<template>
    <div class="video-wrap" :style="{ width: containerWidth + 'px', height: containerHeight + 'px' }">
      <video
        :class="'video-js vjs-big-play-button-hidden'"
        :poster="video.poster"
        ref="videoRef"
      ></video>
      <div class="center-pause-btn" @click="togglePlay">
        <ion-icon v-show="!isPlaying" class="play" :icon="play" color="#fff"></ion-icon>
      </div>
      <div class="my_progress_bar" @mousedown="startDrag" @touchstart="startDrag">
        <ion-progress-bar :value="progress" :class="['custom-progress', { dragging: isDragging }]"></ion-progress-bar>
      </div>
      <div class="video-title-bar" v-if="video.title">
        <h6>{{ video.title }}</h6>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted, onUnmounted, watch } from 'vue';
  import videojs from 'video.js';
  import 'video.js/dist/video-js.css';
  import videoLanguage from 'video.js/dist/lang/zh-CN.json';
  import { IonIcon, IonProgressBar } from '@ionic/vue';
  import { play } from 'ionicons/icons';
  import type { VideoItem } from '@/api/video';
  
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
  
  const videoRef = ref<HTMLVideoElement | null>(null);
  const player = ref<any>(null);
  const isDragging = ref(false);
  
  onMounted(() => {
    if (videoRef.value) {
      player.value = videojs(videoRef.value, {
        controls: false,
        autoplay: false,
        preload: 'metadata',
        language: 'zh-CN',
        height: props.containerHeight,
        loop: true,
        fluid: true,
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
  /* 复制原有的 .video-wrap、.center-pause-btn、.my_progress_bar、.custom-progress、.video-title-bar 等样式 */
  .video-wrap {
    position: relative;
    background: #000;
    overflow: hidden;
    width: 100%;
    height: 0;
  }
  .video-js {
    position: absolute;
    top: 0;
    left: 0;
    height: 100% !important;
    max-width: 100% !important;
    object-fit: cover;
  }
  .center-pause-btn {
    position: absolute;
    top: 0;
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
    left: 5%;
    width: 90%;
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
  </style>