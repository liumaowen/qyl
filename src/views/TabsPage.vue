<template>
  <ion-page>
    <ion-tabs ref="tabsRef">
      <ion-router-outlet></ion-router-outlet>
      <ion-tab-bar slot="bottom">
        <!-- <ion-tab-button tab="tab1" href="/tabs/tab1">
          <ion-icon aria-hidden="true" :icon="videocam" />
          <ion-label>推荐</ion-label>
        </ion-tab-button> -->

        <ion-tab-button tab="tab2" href="/tabs/tab2">
          <ion-icon aria-hidden="true" :icon="videocam" />
          <ion-label>{{ $t('nav.recommend') }}</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="tab4" href="/tabs/shortDramas">
          <ion-icon aria-hidden="true" :icon="tv" />
          <ion-label>{{ $t('nav.shortDrama') }}</ion-label>
        </ion-tab-button>
        <ion-tab-button tab="tab3" href="/tabs/my">
          <ion-icon aria-hidden="true" :icon="square" />
          <ion-label>{{ $t('nav.my') }}</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  </ion-page>
</template>

<script setup lang="ts">
import { IonTabBar, IonTabButton, IonTabs, IonLabel, IonIcon, IonPage, IonRouterOutlet,onIonViewWillEnter,onIonViewDidEnter } from '@ionic/vue';
import { tv, square, videocam } from 'ionicons/icons';

</script>
<style lang="css" scoped>
ion-tab-bar {
  border-top:none!important;
}
</style>
