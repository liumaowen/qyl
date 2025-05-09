<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>头部1</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">还是头部1</ion-title>
        </ion-toolbar>
      </ion-header>
      <swiper-container style="border: 2px solid red; height: 100%;" direction="vertical" :loop="true"
      :slides-per-view="1"
        @swiperprogress="onProgress" @swiperslidechange="onSlideChange">
        <swiper-slide style="height: 100%;background-color: aquamarine;">Slide 1</swiper-slide>
        <swiper-slide>Slide 2</swiper-slide>
        <swiper-slide>Slide 3</swiper-slide>
      </swiper-container>
      <!-- <ExploreContainer name="头部 1 page" /> -->
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/vue';
import ExploreContainer from '@/components/ExploreContainer.vue';
import { SwiperContainer, SwiperSlide } from 'swiper/element/bundle';

const onProgress = (e:any) => {
  const [swiper, progress] = e.detail;
  console.log(progress)
};

const onSlideChange = (e:any) => {
  console.log('onSlideChange',e);
  console.log('slide changed')
}
</script>
