<template>
  <div class="video-container swiper-no-swipe" :style="{ width: width + 'px', height: height + 'px' }">
    <video ref="videoPlayer" 
    class="video-js video-full" 
    :id="id"
    :width="width"
    :height="height"
    :style="{ width: width + 'px', height: height + 'px' }"
    ></video>
  </div>
</template>

<script setup lang="ts">
import 'swiper/css';
const emit = defineEmits(['_virtualUpdated']);
const props = defineProps({
  options: {
      type: Object,
      default() {
        return {};
      }
    },
    id: {
      type: String,
      default: 'video_0'
    },
    width: {
      type: Number,
      default: window.innerWidth
    },
    height: {
      type: Number,
      default: window.innerHeight - 50.8
    },
    autoplay: Boolean
});
import videojs from 'video.js';
import 'video.js/dist/video-js.css'
import { ref, shallowRef, onMounted, onBeforeUnmount } from 'vue';
export type VideoJsPlayer = ReturnType<typeof videojs>
const videoPlayer = shallowRef<HTMLVideoElement | null>(null);
const playerInstance = shallowRef<VideoJsPlayer>();


onMounted(() => {
    if (!videoPlayer.value) return; // 非空判断，防止传入 null
    playerInstance.value = videojs(
      videoPlayer.value,
      {
        ...props.options,
        controls: true,
        loop: true,
      },
      () => {
        console.log('onPlayerReady', playerInstance.value);
        if (props.autoplay) {
        playerInstance.value?.play();
      }
      }
    );
    // this.player = videojs(this.$refs.videoPlayer, this.options, () => {
    //   this.player.log('onPlayerReady', this);
    // });
  })
  onBeforeUnmount(() => {
    // if (this.player) {
    //   this.player.dispose();
    // }
  })

  defineExpose({
   playerInstance
 });
</script>
<style scoped>
.video-container {
  background: #000;
  overflow: hidden;
}
.video-full {
  height: auto;
  object-fit: contain; /* 保证视频完整显示且居中 */
  display: block;
}
</style>