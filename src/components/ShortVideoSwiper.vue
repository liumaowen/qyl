<template>
    <swiper
      :modules="[Virtual]"
      direction="vertical"
      :slides-per-view="1"
      @slideChange="onSlideChange"
      @swiper="setSwiperRef"
      @transitionEnd="onSlideTransitionEnd"
      :virtual="true"
      :speed="200"
      :style="{ height: containerHeight + 'px' }"
    >
      <swiper-slide
        v-for="(video, index) in videoList"
        :key="index"
        :virtualIndex="index"
        class="slide-item"
        :style="{ width: containerWidth + 'px', height: containerHeight + 'px' }"
      >
        <ShortVideoItem
          :video="video"
          :index="index"
          :container-width="containerWidth"
          :container-height="containerHeight"
          :progress="progress[index] || 0"
          :is-playing="playingIndex === index"
          @play="handlePlay"
          @pause="handlePause"
          @progressChange="handleProgressChange"
        />
      </swiper-slide>
    </swiper>
  </template>
  
  <script setup lang="ts">
  import { ref, nextTick } from 'vue';
  import { Swiper, SwiperSlide } from 'swiper/vue';
  import { Virtual } from 'swiper/modules';
  import 'swiper/css';
  import ShortVideoItem from './ShortVideoItem.vue';
  import type { VideoItem } from '@/api/video';
  import type { Swiper as SwiperInstance } from 'swiper/types';
  
  const props = defineProps<{
    videoList: VideoItem[];
    containerWidth: number;
    containerHeight: number;
    progress: number[];
  }>();
  
  const emit = defineEmits(['loadMore']);
  
  const playingIndex = ref(0);
  const swiperRef = ref<SwiperInstance>();
  
  const setSwiperRef = (swiper: SwiperInstance) => {
    swiperRef.value = swiper;
  };
  
  const onSlideChange = (e: SwiperInstance) => {
    const currentIndex = e.activeIndex;
    playingIndex.value = currentIndex;
    // 滑到倒数第三个时加载更多
    if (currentIndex === props.videoList.length - 3) {
      emit('loadMore');
    }
  };
  
  const onSlideTransitionEnd = async (swiper: SwiperInstance) => {
    await nextTick();
    // 可在此处做播放器实例的销毁和初始化优化
  };
  
  const handlePlay = (index: number) => {
    playingIndex.value = index;
  };
  const handlePause = (index: number) => {
    if (playingIndex.value === index) playingIndex.value = -1;
  };
  const handleProgressChange = (index: number, value: number) => {
    // 可选：向父组件同步进度
  };
  
  </script>