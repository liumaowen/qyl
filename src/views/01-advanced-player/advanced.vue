<template>
  <div class="custom-controls">
    <!-- <span class="item">🔊 {{ volume }}</span> -->
    <!-- <button class="item button" @click="state.playing ? player.pause() : player.play()">
      {{ state.playing ? '⏸ Pause' : '▶️ Play' }}
    </button> -->
    <button @click.stop="toggle" class="vjs-big-play-button1" type="button" title="Play Video" aria-disabled="false"
      data-eusoft-scrollable-element="1">
      <span class="vjs-icon-placeholder" v-if="!state.playing" aria-hidden="true"></span>
    </button>
    <!-- <button class="item button" @click="player.muted(!state.muted)">
      {{ state.muted ? '🔇 Unmuted' : '🔈 Mute' }}
    </button> -->
    <span>{{ state.currentTime }}</span>
    <!-- <span v-if="state.isLive" class="item live">🔴 LIVE {{ state.currentTime }}</span>
    <progress v-else class="item progress" :max="duration" :value="state.currentTime"></progress> -->
    <!-- <select
      class="item select"
      :value="config.playbackRate"
      @change="player.playbackRate(Number(($event.target as HTMLSelectElement)?.value))"
    >
      <option :key="index" :value="option" v-for="(option, index) in state.playbackRates">{{ option }}x</option>
    </select>
    <button class="item button" @click="state.isFullscreen ? player.exitFullscreen() : player.requestFullscreen()">
      {{ state.isFullscreen ? '🖥 Exit' : '💻 Enter' }} FS
    </button>
    <button
      class="item button"
      @click="state.isInPictureInPicture ? player.exitPictureInPicture() : player.requestPictureInPicture()"
    >
      📺 {{ state.isInPictureInPicture ? 'Exit' : 'Enter' }} PIP
    </button> -->
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, PropType } from 'vue'
import { VideoPlayerState } from '@videojs-player/vue'
import videojs from 'video.js'
import { toggle } from 'ionicons/icons'

type VideoJsPlayer = ReturnType<typeof videojs>

export default defineComponent({
  props: {
    player: {
      type: Object as PropType<VideoJsPlayer>,
      required: true
    },
    state: {
      type: Object as PropType<VideoPlayerState>,
      required: true
    },
    config: {
      type: Object as PropType<any>,
      required: true
    }
  },
  setup(props) {
    const volume = computed(() => Number(props.state.volume).toFixed(2))
    const duration = computed(() => {
      const duration = props.state.duration
      if (!duration || isNaN(duration) || duration === Infinity) {
        return 0
      } else {
        return duration
      }
    })
    const toggle = () => {
      console.log('toggle', props.state.playing)
      if (props.state.playing) {
        props.player.pause()
      } else {
        props.player.play()
      }
    }
    return {
      volume,
      duration,
      toggle
    }
  }
})
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.custom-controls {
  height: 2.6rem;
  background-color: rgb(63 73 88 / 60%);
  padding-right: 1rem;
  color: white;
  font-size: 13px;
  display: flex;
  align-items: center;
  opacity: 0.7;
  transition: opacity 180ms;
  // &:hover {
  //   opacity: 1;
  // }

  .item {
    margin-left: 1rem;

    &.button {
      cursor: pointer;
    }

    &.live {
      flex: 1;
    }

    &.progress {
      flex: 1;
      border-radius: 0px;
      box-shadow: 1px 1px 4px rgba(0, 0, 0, 0.2);

      &::-webkit-progress-bar {
        background-color: #fff;
        border-radius: 2px;
      }

      &::-webkit-progress-value {
        background-color: $widget-primary;
      }
    }

    &.select {
      color: white;
      border-color: white;
    }
  }
}

.vjs-big-play-button1 {
  width: 100%;
  height: 100%;
  background: none;
  // line-height: 70px;
  font-size: 80px;
  border: none;
  top: 0;
  left: 0;
  color: #fff;
  position: absolute;
}

.vjs-big-play-button1 .vjs-icon-placeholder:before {
  content: "\f101";
  font-family: VideoJS;
  font-weight: normal;
  font-style: normal;
  text-align: center;
  position: absolute;
  top: 50%;
  left: 50%;
  margin-top: -35px;
  margin-left: -35px;
  width: 70px;
  height: 70px;
}
</style>
