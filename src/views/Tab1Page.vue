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

      <ExploreContainer name="头部 1 page" />
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/vue';
import ExploreContainer from '@/components/ExploreContainer.vue';
</script>
